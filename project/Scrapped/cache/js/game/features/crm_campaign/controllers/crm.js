/*global GameViews*/

(function() {
	'use strict';

	var GameControllers = window.GameControllers,
		eventTracking = window.eventTracking,
		CRM_RESPONSE = require('enums/json_tracking').CRM_RESPONSE,
		CRM_TRACKING = require('enums/crm_tracking_enums');

	var CrmController = GameControllers.TabController.extend({
		initialize : function(/* options */) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);

			this.setOnManualClose(this.onManualWindowClose.bind(this));

			// if true, no other request will be sent
			this.request_active = false;
		},

		renderPage : function() {
			this.setModelsFromWindowArguments();
			this.view = new GameViews.CrmView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		setModelsFromWindowArguments: function () {
			this.models = this.getWindowModel().getArguments().active_crm_campaign;
			this.current_display_point = this.getWindowModel().getArguments().current_display_points;
			this.crm_campaign = this.getModel('crm_campaign');
		},

		/**
		 * Returns url to the image which should be displayed
		 *
		 * @return {String}
		 */
		getCdnImage : function() {
			return this.crm_campaign.getCdnImage();
		},

		getCtaType : function() {
			return this.crm_campaign.getCallToAction();
		},

		getCtaValue : function() {
			return this.crm_campaign.getCallToActionValue();
		},

		/**
		 * get Campaing id from model
		 *
		 * @return {Number} id
		 */
		getCampaignId : function() {
			return this.crm_campaign.getCampaignId();
		},

		getItemName : function() {
			return this.crm_campaign.getItemName();
		},

		onManualWindowClose : function() {
			this.handleCrm(false, CRM_TRACKING.ACTION_INTERSTITIAL_DISMISS);
		},

		onClickEvent : function() {
			this.handleCrm(true, CRM_TRACKING.ACTION_INTERSTITIAL_ALLOW);
		},

		getCurrentDisplayPoint : function() {
			return this.current_display_point;
		},

		getContent: function () {
			return this.crm_campaign.getContent();
		},

		handleCrm : function(call_to_action, tracking_action) {
			var model_campaign = this.getModel('crm_campaign'),
				crm_action_handler = require('classes/crm_action_handler'),
				display_point = this.getCurrentDisplayPoint();

			var campaign_data = model_campaign.getCampaignData();
			eventTracking.logJsonEvent(CRM_RESPONSE, {
				'content_id'  : campaign_data.content_id,
				'target_id' : campaign_data.campaign_id,
				'content_type' : model_campaign.getChannel(),
				'content_display_point' : display_point,
				'device_size' : CRM_TRACKING.DEVICE_DESKTOP,
				'action' : tracking_action,
				'additional_data' : campaign_data.additional_data
			});

			// there can only be one request active at the same time
			if (!this.request_active) {
                this.request_active = true;
				crm_action_handler.handleAccept(model_campaign,
												true,
												call_to_action,
												display_point,
												function() {
													this.request_active = false;
												}.bind(this));
			}
		},

		destroy : function() {

		}
	});

	window.GameControllers.CrmController = CrmController;
}());
