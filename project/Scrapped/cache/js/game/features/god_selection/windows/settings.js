define('features/god_selection/windows/settings.js', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        tabs = require('game/windows/tabs'),
        GOD_SELECTION = windows.GOD_SELECTION,
        DM = require_legacy('DM'),
        WindowFactorySettings = require_legacy('WindowFactorySettings'),
        GodSelectionController = require('features/god_selection/controllers/god_selection'),
        ArtifactsController = require('features/god_selection/controllers/artifacts'),
        l10n = DM.getl10n(GOD_SELECTION);

    var defaults = {
        window_type: GOD_SELECTION,
        height: 570,
        width: 820,
        tabs: [
            // This represents the tab models
            {type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: GodSelectionController, hidden: false},
            {type: tabs.ARTIFACTS, title: l10n.tabs[1], content_view_constructor: ArtifactsController, hidden: false}
        ],
        max_instances : 1,
        title: l10n.window_title
    };

    WindowFactorySettings[GOD_SELECTION] = function(props) {
        props = props || {};
        return us.extend({}, defaults, props);
    };

    return WindowFactorySettings[GOD_SELECTION];
});