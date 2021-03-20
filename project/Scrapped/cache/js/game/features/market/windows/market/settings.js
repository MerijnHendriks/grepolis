/*globals us, DM */

(function (controllers, collections, models, settings) {
	'use strict';

	var windows = require('game/windows/ids');
	var tabs = require('game/windows/tabs');
	var MarketOwnOffersController = require('market/controllers/own_offers'),
		MarketAllOffersController = require('market/controllers/all_offers'),
        MarketCreateOffersController = require('market/controllers/create_offers'),
        PremiumExchangeController = require('market/controllers/premium_exchange'),
    	GameDataFeatureFlags = require('data/features'),
		MarketHelper = require('market/helper/market');

	var type = windows.MARKET;

	settings[type] = function (props) {
		props = props || {};

		var l10n = DM.getl10n(type),
			window_settings = us.extend({
				window_type: type,
				height: 570,
				width: 800,
				tabs: [
					{type: tabs.ALL_OFFERS, title: l10n.tabs[1], content_view_constructor: MarketAllOffersController, hidden: false},
					{type: tabs.OWN_OFFERS, title: l10n.tabs[2], content_view_constructor: MarketOwnOffersController, hidden: false},
					{type: tabs.CREATE, title: l10n.tabs[3], content_view_constructor: MarketCreateOffersController, hidden: false}
				],
				max_instances: 1,
				activepagenr: 0,
				title: l10n.window_title
			}, props);

		if (GameDataFeatureFlags.isPremiumExchangeEnabled()) {
            window_settings.tabs.unshift({
                type: tabs.PREMIUM_EXCHANGE,
                title: l10n.tabs[0],
                content_view_constructor: PremiumExchangeController,
                hidden: !MarketHelper.hasNeededLevelForPremiumExchange()
            });
        }

        return window_settings;
	};
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
