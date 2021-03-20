define('events/missions/factories/window_factory', function (require) {
    'use strict';

    var windows = require('game/windows/ids'),
        WF = window.WF;

    var MissionsWindowFactory = {
        openWindow : function () {
            return WF.open(windows.MISSIONS);
        }
    };

    window.MissionsWindowFactory = MissionsWindowFactory;

    return MissionsWindowFactory;
});
