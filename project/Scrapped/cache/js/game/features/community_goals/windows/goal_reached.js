/* global DM, us */

(function (controllers, collections, models, settings, identifiers) {
    'use strict';

    var windows = require('game/windows/ids');
    var tabs = require('game/windows/tabs');
    var GoalReachedController = require('features/community_goals/controllers/goal_reached');
    var BenefitHelper = require('helpers/benefit');

    var type = windows.COMMUNITY_GOAL_REACHED;

    settings[type] = function (props) {
        props = props || {};

        var l10n = DM.getl10n(type);
        l10n = BenefitHelper.getl10nForSkin(l10n, type);

        return us.extend({
            window_type: type,
            minheight: 370,
            width: 520,
            tabs: [
                {type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: GoalReachedController, hidden: true}
            ],
            max_instances: 1,
            activepagenr: 0,
            title: l10n.window_title,
            special_buttons : {
            }
        }, props);
    };
}(window.GameControllers, window.GameCollections, window.GameModels, window.WindowFactorySettings));
