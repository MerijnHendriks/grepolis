/* globals WM */
// Factory for the Grepolis Score window
define('features/grepolis_score/factories/grepolis_score', function() {
    'use strict';

    var WF = require_legacy('WF');
    var WQM = require_legacy('WQM');
    var windows = require('game/windows/ids');
    var priorities = require('game/windows/priorities');
    var window_type = windows.GREPOLIS_SCORE;

    return {
        openWindow : function (award_id) {
            var open_window = WM.getWindowByType(window_type)[0];
            if (open_window) {
                // hack around the fake tab handling in grepolis_score
                open_window.setActivePageNr(0, {silent: true});
            }
            WQM.addQueuedWindow({
                type : window_type,
                priority : priorities.getPriority(window_type),
                open_function : function() {
                    return WF.open(window_type, {
                        args : {
                            award_id: award_id
                        }
                    });
                }
            });
        }
    };
});