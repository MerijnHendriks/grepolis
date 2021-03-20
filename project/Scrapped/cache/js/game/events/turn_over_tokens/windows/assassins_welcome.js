/*globals us, DM */
(function (settings) {
    "use strict";

    var windows = require('game/windows/ids'),
        BenefitHelper = require('helpers/benefit');

    var type = windows.ASSASSINS_WELCOME,
        l10n = DM.getl10n(type);

    settings[type] = function (props) {
        props = props || {};

		return us.extend({
			execute: window.AssassinsWindowFactory.openWindow,
            l10n: BenefitHelper.getl10nForSkin(l10n, type).welcome_screen
		}, props);
    };
}(window.WindowFactorySettings));