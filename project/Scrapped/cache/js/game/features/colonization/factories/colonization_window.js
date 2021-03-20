define('features/colonization/factories/colonization_window', function () {
    'use strict';

    var WF = require_legacy('WF');
    var windows = require('game/windows/ids');
    var window_type = windows.COLONIZATION;

    return {
        openWindow: function (spot_info) {
            var WM = require_legacy('WM');
            WM.closeWindowsByType(window_type);
            WF.open(window_type, {
                args: {
                    spot_info: spot_info,
                    target_x: spot_info.target_x,
                    target_y: spot_info.target_y,
                    target_number_on_island: spot_info.target_number_on_island
                }
            });
        }
    };
});
