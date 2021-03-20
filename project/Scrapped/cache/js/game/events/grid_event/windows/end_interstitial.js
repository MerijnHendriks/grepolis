/* globals DM */

define('events/grid_event/windows/end_interstitial', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        BenefitHelper = require('helpers/benefit'),
        WindowFactorySettings = require_legacy('WindowFactorySettings'),
        GRID_EVENT_END_INTERSTITIAL = windows.GRID_EVENT_END_INTERSTITIAL,
        l10n = DM.getl10n(GRID_EVENT_END_INTERSTITIAL);

    WindowFactorySettings[GRID_EVENT_END_INTERSTITIAL] = function(props) {
        props = props || {};

        return us.extend({
            execute: window.GridEventWindowFactory.openWindow,
            l10n: BenefitHelper.getl10nForSkin(l10n, GRID_EVENT_END_INTERSTITIAL).welcome_screen
        }, props);
    };
});