/* global WQM, Timestamp, Backbone, us, $, Logger, GameEvents, GameDataQuests, WndHandlerBuilding, CrmWindowFactory */
define('features/crm_campaign/listeners/crm_interstitials', function(require) {
	'use strict';

	/**
	 * This file is for listening on specific in-game events to check if there is a valid CRM campaign to be shown.
	 * For debugging you can type `Logger.on('CRM3')` in the console.
	 */
	var DISPLAY_POINTS = require('features/crm_campaign/display_points.js'),
		windows = require('game/windows/ids'),
		eventTracking = window.eventTracking,
		CRM_RESPONSE = require('enums/json_tracking').CRM_RESPONSE,
		CRM_TRACKING = require('enums/crm_tracking_enums');

	var logger = Logger.get('CRM3');
	var EVENT_NAMESPACE = 'crm_listener';

	var Listener = {

		collection: null,

		/**
		 * register all game events that trigger a display point
 		 */
		initialize: function(models, collections) {
			this.collection = collections.crm_campaigns;

			// anytime (immediately)
			this.collection.onAdd(
				this,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.ANYTIME)
			);

			$.Observer(GameEvents.quest.tutorial_dead_zone_finished).subscribe(
				EVENT_NAMESPACE,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.ANYTIME)
			);

			// login
			$.Observer(GameEvents.game.load).subscribe(
				EVENT_NAMESPACE,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.LOGIN)
			);

			$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).subscribe(
				EVENT_NAMESPACE,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.ENTER_ISLAND)
			);

			$.Observer(GameEvents.ui.bull_eye.radiobutton.city_overview.click).subscribe(
				EVENT_NAMESPACE,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.ENTER_CITY)
			);

			$.Observer(GameEvents.ui.bull_eye.radiobutton.strategic_map.click).subscribe(
				EVENT_NAMESPACE,
				this._showCampaignsForDisplayPoints.bind(this, DISPLAY_POINTS.ENTER_WORLD)
			);

			// generic opening window handler. only handles backbone windows
			$.Observer(GameEvents.window.open).subscribe(
				EVENT_NAMESPACE,
				function(e, data) {
					if (data instanceof Backbone.Model) {
						this._showCampaignsForDisplayPoints(
							this.mapWindowIdToDisplayPoint(data.attributes.window_type)
						);
					}
				}.bind(this)
			);

			// generic opening building handler. Includes old and new buildings
			$.Observer(GameEvents.window.building.open).subscribe(
				EVENT_NAMESPACE,
				function(e, data) {
					this._showCampaignsForDisplayPoints(
						this.mapBuildingTypeToDisplayPoint(data.building_id)
					);
				}.bind(this)
			);

			// generic closing window handler.Handles old and new windows.
			$.Observer(GameEvents.window.close).subscribe(
				EVENT_NAMESPACE,
				function(e, data) {
					var window_type = null;
					if (data.window_obj instanceof Backbone.Model) {
						window_type = data.window_obj.attributes.window_type;
					} else if (data.window_obj instanceof WndHandlerBuilding) {
						window_type = data.window_obj.currentBuilding;
					}
					// Old windows are always buildings, but for new windows we don't know if it's some generic window or a building.
					// That's why we send the window_type through both functions: generic windows and buildings mapping
					this._showCampaignsForDisplayPoints(
						this.mapBuildingTypeToDisplayPoint(window_type, true) ||
						this.mapWindowIdToDisplayPoint(window_type, true)
					);
				}.bind(this)
			);
		},

		/**
		 * Show the highest priority interstitial (if any valid present) for a given display point
		 * @param current_display_point
		 * @private
		 */
		_showCampaignsForDisplayPoints: function(current_display_point) {

			if (!current_display_point) {
				// empty display points should be skipped.
				// They are triggered on any window opening/closing without mapping
				return;
			}

			var validDevice = function(crm_campaign) {
				return crm_campaign._isOnValidDevice();
			};

			var validTimeStamp = function(crm_campaign) {
				// check if campaign is in valid time frame
				return crm_campaign._isInValidTimeFrame();
			};

			var validDisplayPoint = function(crm_campaign) {
				// check if campaign is in valid display point
				return crm_campaign.shouldDisplayAt(current_display_point) && !GameDataQuests.isInTutorialDeadZone();
			};

			var byHighestPriority = function(crm_campaign_1, crm_campaign_2) {
				// sort campaigns by priority
				return crm_campaign_2.getPriority() - crm_campaign_1.getPriority();
			};

			var showInterstitial = function(crm_campaign) {
				// check start and end date of campaign
				if (crm_campaign.isValid()) {
					logger.log('Campaign valid:', crm_campaign);
					this._showCampaign(crm_campaign, current_display_point);
				} else {
					this._logInvalidCampaign(crm_campaign);
				}
			}.bind(this);

			logger.log(
				'Reached display point:',
				current_display_point,
				(current_display_point === DISPLAY_POINTS.ANYTIME) ?
					'(or new campaign has been pushed / tutorial dead-zone left)' : ''
			);
			logger.log('Checking all and showing highest priority valid interstitial');

			// show only the highest-priority interstitial per instance of the user performing the Content Display Point action
			var valid_campaigns = this.collection
				.filter(validDevice)
				.filter(validTimeStamp)
				.filter(validDisplayPoint)
				.sort(byHighestPriority);

			if (valid_campaigns.length > 0) {
				showInterstitial(valid_campaigns[0]);
				// remaining valid campaigns will be triggered next time the display point is reached
			}
		},

		/**
		 * Log invalidity reason for a given campaign.
		 * @param crm_campaign
		 * @private
		 */
		_logInvalidCampaign: function(crm_campaign) {
			// check if campaign expired or in future (only for logging)
			var start_date = crm_campaign.getStartDate(),
				is_in_future = start_date > Timestamp.now();

			if (is_in_future) {
				logger.log(
					'Campaign not yet valid. Starts at ' + Timestamp.toDate(start_date).toString(),
					crm_campaign
				);
			} else {
				logger.log(
					'Campaign expired at ' + Timestamp.toDate(crm_campaign.getEndDate()).toString() + ' not showing',
					crm_campaign
				);
			}
		},

		/**
		 * Does event tracking and opens the interstitial from a given model.
		 * @param model instanceof {window.GameModels.CrmCampaign}
		 * @param {string} current_display_point
		 * @private
		 */
		_showCampaign: function(model, current_display_point) {

			var campaign_data = model.getCampaignData(),
				window_type = model.isScreen() ? windows.CRM_SCREEN : windows.CRM_INTERSTITIAL;

			eventTracking.logJsonEvent(CRM_RESPONSE, {
				'content_id'  : campaign_data.content_id,
				'target_id' : campaign_data.campaign_id,
				'content_type' : CRM_TRACKING.TYPE_INTERSTITIAL,
				'content_display_point' : current_display_point,
				'device_size' : CRM_TRACKING.DEVICE_DESKTOP,
				'action' : CRM_TRACKING.ACTION_INTERSTITIAL_OPEN,
				'additional_data' : campaign_data.additional_data
			});

			WQM.addQueuedWindow({
				type : window_type,
				priority : model.getPriority(),
				open_function : function () {
					CrmWindowFactory.openWindow(window_type, model, current_display_point);
				}
			});
		},

		destroy: function() {

		},

		/**
		 * Takes a window id (from game/windows/ids) and translates it to a display point
		 * @param {string} window_id
		 * @param {boolean} [closing] indicates that the display point for exiting the window is wanted
		 * @return {string|undefined}
		 */
		mapWindowIdToDisplayPoint: function(window_id, closing) {
			var mapping = {};
			mapping[windows.QUESTLOG] = !closing ? DISPLAY_POINTS.ENTER_QUESTLOG : null;
			mapping[windows.INVENTORY] = !closing ? DISPLAY_POINTS.ENTER_INVENTORY : DISPLAY_POINTS.LEAVE_INVENTORY;

			return mapping[window_id];
		},

		/**
		 * Takes a building name and translates it to a display point
		 * @param building_type
		 * @param {boolean} [closing] indicates that the display point for exiting the building is wanted
		 * @return {string|undefined}
		 */
		mapBuildingTypeToDisplayPoint: function(building_type, closing) {
			var mapping = {};
			mapping.main = !closing ? DISPLAY_POINTS.ENTER_SENATE : DISPLAY_POINTS.LEAVE_SENATE;
			mapping.academy = !closing ? DISPLAY_POINTS.ENTER_ACADEMY : DISPLAY_POINTS.LEAVE_ACADEMY;
			mapping.barracks = !closing ? DISPLAY_POINTS.ENTER_BARRACKS : DISPLAY_POINTS.LEAVE_BARRACKS;
			mapping.docks = !closing ? DISPLAY_POINTS.ENTER_DOCKS : DISPLAY_POINTS.LEAVE_DOCKS;

			return mapping[building_type];
		}
	};

	us.extend(Listener, Backbone.Events);

	// Export needed to make listeners work -> see listeners_manager.js
	window.GameListeners.CrmInterstitials = Listener;
	return Listener;
});
