// Settings for the Grepolis Score window
define('path/to/window/settings', function() {
    'use strict';

    var windows = require('game/windows/ids');
    var tabs = require('game/windows/tabs');
    var TabOneController = require('features/grepolis_score/controllers/grepolis_score');
    var window_type = windows.GREPOLIS_SCORE;
    var WindowFactorySettings = require_legacy('WindowFactorySettings');
    var DM = require_legacy('DM');

    WindowFactorySettings[window_type] = function (props) {
        props = props || {};

        var l10n = DM.getl10n(window_type);

        return us.extend({
            window_type: window_type,
            height: 570,
            width: 763,
            tabs: [
                {type: tabs.INDEX, title: l10n.tabs[0], content_view_constructor: TabOneController, hidden: false},
				/*
				 * a hidden tab without controller used to to de-select the INDEX tab even if it is the only tab visible.
				 * @see features/grepolis_score/controllers/grepolis_score.js
				 */
                {type: tabs.HIDDEN, title: '', content_view_constructor: null, hidden: true}
			],
			max_instances: 1,
			activepagenr: 0,
			title: l10n.window_title
		}, props);
	};

return WindowFactorySettings[window_type];
});
