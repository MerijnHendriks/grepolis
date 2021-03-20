define('features/surveys/factories/survey', function() {
    'use strict';

    var WF = require_legacy('WF');
    var WQM = require_legacy('WQM');
    var windows = require('game/windows/ids');
    var priorities = require('game/windows/priorities');

    return {
        openWindow : function() {
            var window_type = windows.SURVEY;
            WQM.addQueuedWindow({
                type : window_type,
                priority : priorities.getPriority(window_type),
                open_function : function() {
                    window.WM.closeWindowsByType (window_type);
                    return WF.open(window_type, {});
                }
            });
        }
    };
});
