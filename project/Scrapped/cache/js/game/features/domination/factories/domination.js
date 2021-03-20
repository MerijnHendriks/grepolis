// Factory for the Domination window
define('features/domination/factories/domination', function () {
    'use strict';

    var windows = require('game/windows/ids'),
        priorities = require('game/windows/priorities'),
        WF = require_legacy('WF'),
        WQM = require_legacy('WQM'),
        window_type = windows.DOMINATION;

    return {
        openWindow: function () {
            WQM.addQueuedWindow({
                type: window_type,
                priority: priorities.getPriority(window_type),
                open_function: function () {
                    return WF.open(window_type);
                }
            });
        }
    };
});