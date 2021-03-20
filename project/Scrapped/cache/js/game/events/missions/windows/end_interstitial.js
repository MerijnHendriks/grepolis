define('events/missions/windows/end_interstitial', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        type = windows.MISSIONS_END_INTERSTITIAL,
        WindowFactorySettings = require_legacy('WindowFactorySettings');

    WindowFactorySettings[type] = function(props) {
        props = props || {};

        var MissionHelper = require('events/missions/helpers/missions'),
            l10n = MissionHelper.getl10nForMissionSkin();

        return us.extend({
            execute: window.MissionsWindowFactory.openWindow.bind(null, true),
            l10n: l10n[type].welcome_screen
        }, props);
    };

    return WindowFactorySettings[type];

});