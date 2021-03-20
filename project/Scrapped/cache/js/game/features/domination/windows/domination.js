// Settings for the Domination Window
define('features/domination/windows/domination', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        tabs = require('game/windows/tabs'),
        DominationInfoController = require('features/domination/controllers/domination_info'),
        DominationStatusController = require('features/domination/controllers/domination_status'),
        DominationRankingController = require('features/domination/controllers/domination_ranking'),
        WindowFactorySettings = require_legacy('WindowFactorySettings'),
        DM = require_legacy('DM'),
        window_type = windows.DOMINATION;

    WindowFactorySettings[window_type] = function (props) {
        props = props || {};

        var l10n = DM.getl10n(window_type);

        return us.extend({
            window_type: window_type,
            height: 570,
            width: 770,
            tabs: [
                {type: tabs.INFO, title: l10n.tabs[0], content_view_constructor: DominationInfoController, hidden: false},
                {type: tabs.STATUS, title: l10n.tabs[1], content_view_constructor: DominationStatusController, hidden: false},
                {type: tabs.RANKING, title: l10n.tabs[2], content_view_constructor: DominationRankingController, hidden: false}
            ],
            max_instances: 1,
            activepagenr: 0,
            title: l10n.window_title
        }, props);
    };

    return WindowFactorySettings[window_type];
});
