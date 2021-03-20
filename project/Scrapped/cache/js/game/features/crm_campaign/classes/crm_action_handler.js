/*global define, WQM, MM, WF, Game */

define('classes/crm_action_handler', function() {

	var BenefitHelper = require('helpers/benefit'),
		CallToAction = Game.constants.crm.call_to_action;

	var CrmActionHandler = {

		openWindow : function(call_to_action, immediate_open) {
			//Force add new window to queue
			var window_type = call_to_action,
				props = {};

			if (call_to_action === CallToAction.event) {
				window_type = BenefitHelper.getWindowType();
				props.args = {
					window_skin: BenefitHelper.getBenefitSkin()
				};
			}

			if (immediate_open) {
				WF.open(window_type, props);
			} else {
				WQM.forceAddQueuedWindow({
					type : window_type,
					// force highest priority
					priority : WQM.getHighestPriority(),
					open_function : function() {
						return WF.open(window_type, props);
					}.bind(this)
				});
			}
		},

		/**
		 * @param {CrmCampaign} model_campaign
		 */
		handleReject  : function(model_campaign) {
			if (model_campaign) {
				model_campaign.reject();
			}
		},

		/**
		 * @param {Number} model_id
		 * @param {Boolean} immediate_open skip interstitial queue
		 */
		handleAcceptByModelId : function(model_id, immediate_open) {
			var model_campaign;

			if (MM.getModels() && MM.getModels().CrmCampaign) {
				model_campaign = MM.getModels().CrmCampaign[model_id];
			}

			this.handleAccept(model_campaign, immediate_open, true);
		},

		/**
		 * handle accepting a CRM offer.
		 *
		 * The result returned from the model's accept function is expected to be an object like:
		 * 	[
		 * 		'is_package_offer' => string,
		 * 		'tab_ids' => string[]
		 * 	]
		 *
		 * @param {CrmCampaign} model_campaign
		 * @param {Boolean} immediate_open skip interstitial queue
		 * @param {Boolean} call_to_action set to false to only grant the award but not perform the CRM action (e.g. open external page)
		 * @param {String} display_points for which the campaign was send
		 * @param {Function} callback called on request returns
		 */
		handleAccept: function(model_campaign, immediate_open, call_to_action, display_points, callback) {
			var action_name;

			if (!call_to_action) {
				model_campaign.accept(function(result) {
					if (typeof callback === 'function') {
						callback();
					}
				}, display_points);
				return;
			}

			if (model_campaign) {
				action_name = model_campaign.getCallToAction();
				model_campaign.accept(function(result) {
					var last_open_window;

					/*
					*	CallToAction.uri will be handled as link tag inside the template
					*	so no action is needed here
					*/
					switch (action_name) {
						case CallToAction.cashShop:
						case CallToAction.cashShopPackageTab:
							window.PremiumWindowFactory.openBuyGoldWindow(result.tab_ids[0]);
							break;
						case CallToAction.event:
						case CallToAction.inventory:
							this.openWindow(action_name, immediate_open);
							break;
						default:
							break;
					}

					if (model_campaign._isInValidChannel()) {
						last_open_window = WQM.getLastOpenedWindow();
						if (last_open_window) {
							last_open_window.close();
						}
					}

				    if (typeof callback === 'function') {
						callback();
					}
				}.bind(this), display_points);
			}
		}
	};

	return CrmActionHandler;
});
