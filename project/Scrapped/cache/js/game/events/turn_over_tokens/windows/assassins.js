(function (controllers, collections, models, settings, identifiers) {
    'use strict';

    var windows = require('game/windows/ids'),
        tabs = require('game/windows/tabs'),
        FightController = require('events/turn_over_tokens/controllers/fight'),
        SanctuaryController = require('events/turn_over_tokens/controllers/sanctuary'),
        ShopController = require('events/turn_over_tokens/controllers/shop'),
        WindowSettingsHelper = require('helpers/event_window_settings');

    var ASSASSINS = windows.ASSASSINS,
        ASSASSINS_SHOP = windows.ASSASSINS_SHOP;

    settings[ASSASSINS] = function (props) {
        var options = {
                tabs: [
                    // This represents the tab models
                    {type: tabs.INDEX, content_view_constructor: FightController},
                    {type: tabs.SANCTUARY, content_view_constructor: SanctuaryController},
                    {type: tabs.SHOP, content_view_constructor: ShopController}
                ]
            };


        return WindowSettingsHelper.getEventWindowSettings(ASSASSINS, options, props);
    };


    settings[ASSASSINS_SHOP] = function (props) {
        var options = {
            tabs: [
                {type: tabs.SHOP, content_view_constructor: ShopController}
            ]
        };

        return WindowSettingsHelper.getEventWindowSettings(ASSASSINS, options, props);
    };

}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
