/* globals WindowFactorySettings */
define('events/town_overlay/windows/town_overlay', function (settings) {
    'use strict';

    var windows = require('game/windows/ids'),
        tabs = require('game/windows/tabs'),
        BenefitTypes = require('enums/benefit_types'),
        WindowSettingsHelper = require('helpers/event_window_settings'),
        TownOverlayController = window.GameControllers.TownOverlayController,
        type = windows.TOWN_OVERLAY;

    WindowFactorySettings[type] = function (props) {
        var window_settings = {
            width: 820,
            minheight: 466,
            tabs: [
                { type: tabs.INDEX, content_view_constructor: TownOverlayController, hidden: true }
            ],
            minimizable: false,
            modal: false,
            skin: 'wnd_skin_column',
            closable: true
        };

        return WindowSettingsHelper.getEventWindowSettings(type, {
            window_settings: window_settings,
            benefit_type: BenefitTypes.TOWN_OVERLAY
        }, props);
    };

    return WindowFactorySettings[type];
});