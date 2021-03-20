// Factory for opening the notification popup
define('features/notification_popup/factories/notification_popup', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        WF = require_legacy('WF'),
        window_type = windows.NOTIFICATION_POPUP;

    return {
        openWindow : function (notification_type, additional_data) {
            WF.open(window_type, {
                args: {
                    notification_type: notification_type,
                    additional_data: additional_data
                }
            });
        }
    };
});