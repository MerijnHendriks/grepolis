/*globals GameDataCrm, Timestamp, Game, GrepoApiHelper, us */

(function() {

	var GrepolisModel = window.GrepolisModel;
	var DISPLAY_POINTS = require('features/crm_campaign/display_points.js');
	var CRM_TRACKING = require('enums/crm_tracking_enums');
	var CRM_SCREEN_COMPONENT_TYPES = require('enums/crm_screen_component_types');
	var CrmScreenComponents = require('features/crm_campaign/enums/crm_screen_components');

	function CrmCampaign() {}

	CrmCampaign.urlRoot = 'CrmCampaign';

	GrepolisModel.addAttributeReader(CrmCampaign, 'campaign_data');

	// base interface
	CrmCampaign.getPriority = function() {
		// we multiply by ten since crm campaigns have a priority between 0 and 10
		// but our game has 0 to 100
		return this.getCampaignData().priority * 10;
	};

	/**
	 *  If this returns true, it will open an interstitial on add of the collection
	 * @return {Boolean}
	 */
	CrmCampaign.isValid = function() {
		return this._isInValidTimeFrame() && this._isInValidChannel() && this._isOnValidDevice();
	};

	/**
	 * Checks whether the campaign time frame allows to display it right now.
	 *
	 * @return {Boolean}
	 */
	CrmCampaign._isInValidTimeFrame = function() {
		var ts_now = Timestamp.now();

		return this.getStartDate() < ts_now && this.getEndDate() > ts_now;
	};

	/**
	 * Checks whether the channel that the window came from is whitelisted
	 *
	 * @return {Boolean}
	 */
	CrmCampaign._isInValidChannel = function() {
		var campaign_channel_id = this.getChannel(),
			valid_channels = GameDataCrm.getValidChannels();

		for (var channel_id in valid_channels) {
			if (valid_channels.hasOwnProperty(channel_id)) {
				if (campaign_channel_id === channel_id) {
					return true;
				}
			}
		}

		return false;
	};

	/**
	 * Checks whether the campaign is valid for the current device (browser)
	 *
	 * @return {Boolean}
	 */
	CrmCampaign._isOnValidDevice = function() {
		var valid_devices = this.getValidDevices();
		return valid_devices.indexOf("browser") >= 0;
	};

	// in CRM3 this is the target_id
	CrmCampaign.getCampaignId = function() {
		return this.getCampaignData().campaign_id;
	};

	CrmCampaign.getStartDate = function() {
		return this.getCampaignData().start_date;
	};

	CrmCampaign.getEndDate = function() {
		return this.getCampaignData().end_date;
	};

	CrmCampaign.getChannel = function() {
		return this.getCampaignData().channel;
	};

	CrmCampaign.getContent = function() {
		return this.getCampaignData().content;
	};

	CrmCampaign.getItemName = function() {
		return this.getCampaignData().item_name;
	};

	CrmCampaign.isInterstitial = function() {
		return this.getChannel() === CRM_TRACKING.TYPE_INTERSTITIAL;
	};

	CrmCampaign.isScreen = function() {
		return this.getChannel() === CRM_TRACKING.TYPE_SCREEN;
	};

	/**
	 *
	 * @return {*}
	 */
	CrmCampaign.getDisplayPoints = function() {
		// if no display point defined, show anytime (for CRM2)
		return this.getCampaignData().content_display_points || [DISPLAY_POINTS.ANYTIME];
	};

	CrmCampaign.getValidDevices = function() {
		return this.getCampaignData().valid_devices;
	};

	/**
	 *
	 * @param {string} display_point
	 * @return {boolean}
	 */
	CrmCampaign.shouldDisplayAt = function(display_point) {
		var valid_display_points = this.getDisplayPoints();

		return us.contains(valid_display_points, DISPLAY_POINTS.ANYTIME) ||
			us.contains(valid_display_points, display_point);
	};

	/**
	 * picks desktop cdn image
	 *
	 * @returns {String}
	 */
	CrmCampaign.getCdnImage = function() {
		if (this.isInterstitial()) {
			var content = this.getContent();
			return content.desktop;
		}

		return '';
	};

	CrmCampaign.getCallToActionValue = function() {
		var cta = this.getCampaignData().call_to_action;
		if (cta) {
			return cta.value;
		}

		return '';
	};

	CrmCampaign.getCallToAction = function() {
		return this.isScreen() ? this.getCallToActionForScreen() : this.getCallToActionForInterstitial();
	};

	CrmCampaign.getCallToActionForScreen = function() {
		var component = this.getScreenComponentById(CrmScreenComponents.CONFIRM_BUTTON);

		if (component && component.cta) {
			return Game.constants.crm.call_to_action[component.cta.id];
		}

		return '';
	};

	CrmCampaign.getCallToActionForInterstitial = function() {
		var cta = this.getCampaignData().call_to_action;
		if (cta) {
			var action_name = cta.type;
			return Game.constants.crm.call_to_action[action_name];
		}

		return '';
	};

	CrmCampaign.getScreenComponentById = function(id) {
		if (this.isScreen()) {
			return this.getContent().find(function(component) {
				return component.id === id;
			});
		}
	};

	CrmCampaign._getScreenComponents = function(screen_component_type) {
		if (this.isScreen()) {
			return this.getContent().filter(function(component) {
				return component.type === screen_component_type;
			});
		}

		return {};
	};

	CrmCampaign.getTextScreenComponents = function() {
		return this._getScreenComponents(CRM_SCREEN_COMPONENT_TYPES.TYPE_TEXT);
	};

	CrmCampaign.getButtonScreenComponents = function() {
		return this._getScreenComponents(CRM_SCREEN_COMPONENT_TYPES.TYPE_BUTTON);
	};

	CrmCampaign.getImageScreenComponents = function() {
		return this._getScreenComponents(CRM_SCREEN_COMPONENT_TYPES.TYPE_IMAGE);
	};

	CrmCampaign.getOfferScreenComponents = function() {
		return this._getScreenComponents(CRM_SCREEN_COMPONENT_TYPES.TYPE_OFFER);
	};

	CrmCampaign.getEnumScreenComponents = function() {
		return this._getScreenComponents(CRM_SCREEN_COMPONENT_TYPES.TYPE_ENUM);
	};

	// actions

	/**
	 * Accept the campaign
	 *
	 * @param callback
	 * @param display_points
	 */
	CrmCampaign.accept = function(callback, display_points) {
		GrepoApiHelper.execute.call(this, 'Crm', 'accept',
			{
				model_id: this.id,
				target_id: this.getCampaignId(),
				display_points: display_points,
				device_size: 'desktop'
			}, callback);
	};

	/**
	 * reject the campaign
	 *
	 * @param callback
	 */
	CrmCampaign.reject = function(callback) {
		if (typeof(callback) === 'function') {
			callback();
		}
	};

	window.GameModels.CrmCampaign = GrepolisModel.extend(CrmCampaign);
}());
