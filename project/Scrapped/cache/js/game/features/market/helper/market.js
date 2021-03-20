/* global MM, Game, gpAjax, DM */

define('market/helper/market', function() {

    var GameDataFeatureFlags = require('data/features'),
        DateHelper = require('helpers/date'),
		Tabs = require('game/windows/tabs');

	var MarketHelper = {

		hasMarket: function() {
			if (this.getMarketLevel()) {
				return true;
			}

			return false;
		},

		getMarketLevel: function () {
            var current_town = MM.getCollections().Town[0].getCurrentTown(),
                buildings = current_town.getBuildings(),
                market_level = buildings.getBuildingLevel('market');

            return market_level;
		},

        hasNeededLevelForPremiumExchange: function () {
		    return this.getMarketLevel() >= Game.constants.market.needed_market_level_for_premium_exchange;
        },

		showMarketTabs: function (controller) {
			if (!GameDataFeatureFlags.isPremiumExchangeEnabled()) {
				controller.showAllTabs();
				return;
			}

			var tabs_collection = controller.tabs_collection,
				active_page_nr = controller.getActivePageNr();

			if (this.hasNeededLevelForPremiumExchange()) {
				controller.showAllTabs();
			} else {
                tabs_collection.models.forEach(function (tab) {
                	if (tab.getType() === Tabs.PREMIUM_EXCHANGE) {
						tab.hide();
                    } else {
						tab.show();
                    }
                });

                if (tabs_collection.getTabByNumber(active_page_nr).isHidden()) {
                    controller.switchTab(tabs_collection.getTabByType(Tabs.ALL_OFFERS).getIndex());
                }
			}
		},

		requestPremiumExchangeOffer: function (order, callback) {
			var params = {
				model_url: 'PremiumExchange',
				action_name: 'requestOffer',
				'arguments': {
					type: order.type,
					gold: order.gold
				}
			};

			params['arguments'][order.resource_type] = order.resource_amount;

			gpAjax.ajaxPost('frontend_bridge', 'execute', params, true, callback);
		},

		openWindowConfirmOrder: function (window_controller, order, data, models, handleExchangeData) {
			var l10n = DM.getl10n('market', 'confirm_order'),
				ConfirmOrderController = require('market/controllers/sub_windows/confirm_order');

			var controller = new ConfirmOrderController({
				l10n: l10n,
				window_controller: window_controller,
				templates: {
					confirm_order: window_controller.getTemplate('confirm_order')
				},
				cm_context: {
					main: window_controller.getMainContext(),
					sub: 'sub_window_confirm_order'
				},
				models: models,
				order: order,
				matching_offer: data.offer,
				mac: data.mac,
				handleExchangeData: handleExchangeData
			});

			window_controller.openSubWindow({
				title: l10n.title,
				controller: controller,
				skin_class_names: 'classic_sub_window'
			});

			return controller;
		},

		getPremiumExchangeTradeDuration: function () {
			var trade_duration = Game.constants.market.premium_exchange_trade_duration;
			return DateHelper.readableSeconds(trade_duration);
		}
	};

	return MarketHelper;
});
