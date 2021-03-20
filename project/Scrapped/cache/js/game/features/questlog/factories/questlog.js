/* global WM */
define('features/questlog/factories/questlog', function () {
    'use strict';

    var WF = require_legacy('WF');
    var WQM = require_legacy('WQM');
    var windows = require('game/windows/ids');
    var priorities = require('game/windows/priorities');
    var window_type = windows.QUESTLOG;
    var QUESTS = require('enums/quests');

    return {
        /**
         * @param quest_id
         * @param quest_type default: tutorial quest
         */
        openWindow: function (quest_id, quest_type) {
            quest_type = quest_type || QUESTS.QUEST;

            WQM.addQueuedWindow({
                type: window_type,
                priority: priorities.getPriority(window_type),
                open_function: function () {
                    return WF.open(window_type, {
                        args: {
                            quest_id: quest_id,
                            quest_type: quest_type
                        }
                    });
                }
            });
        },

        closeWindow: function () {
            WM.closeWindowsByType(window_type);
        }
    };
});
