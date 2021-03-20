/* globals GameEvents */

define('features/god_selection/factories/window_factory', function (require) {
    'use strict';

    var windows = require('game/windows/ids'),
        Buildings = require('enums/buildings'),
        WF = window.WF;

    var GodSelectionWindowFactory = {
        openWindow: function () {
            $.Observer(GameEvents.window.building.open).publish({building_id: Buildings.TEMPLE});
            return WF.open(windows.GOD_SELECTION);
        }
    };

    window.GodSelectionWindowFactory = GodSelectionWindowFactory;
    return GodSelectionWindowFactory;
});
