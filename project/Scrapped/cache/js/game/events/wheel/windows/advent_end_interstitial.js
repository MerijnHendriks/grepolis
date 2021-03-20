/*globals AdventWindowFactory */

/**
 * @package calendar
 * @subpackage advent_interstitial
 */
(function (settings) {
	'use strict';

	var windows = require('game/windows/ids');
    var BenefitHelper = require('helpers/benefit');

	var type = windows.ADVENT_END_INTERSTITIAL;

    settings[type] = function(props) {
        props = props || {};
        var l10n = BenefitHelper.getl10nForSkin({}, type);

        return us.extend({
            execute: AdventWindowFactory.openAdventWindow,
            l10n : l10n.welcome_screen
        }, props);
    };

}(window.WindowFactorySettings));
