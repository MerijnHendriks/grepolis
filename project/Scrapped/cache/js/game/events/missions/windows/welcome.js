define('events/missions/windows/welcome', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        type = windows.MISSIONS_WELCOME,
        WindowFactorySettings = require_legacy('WindowFactorySettings');

    WindowFactorySettings[type] = function(props) {
        props = props || {};

        var MissionHelper = require('events/missions/helpers/missions'),
            l10n = MissionHelper.getl10nForMissionSkin();

        return us.extend({
            execute: window.MissionsWindowFactory.openWindow,
            l10n: l10n[type].welcome_screen
        }, props);
    };

    return WindowFactorySettings[type];

});