/* globals DM */

define('events/rota/windows/end_interstitial', function() {
    'use strict';

    var windows = require('game/windows/ids'),
        BenefitHelper = require('helpers/benefit'),
        WindowFactorySettings = require_legacy('WindowFactorySettings'),
        ROTA_EVENT_END_INTERSTITIAL = windows.ROTA_EVENT_END_INTERSTITIAL,
        l10n = DM.getl10n(ROTA_EVENT_END_INTERSTITIAL);

    WindowFactorySettings[ROTA_EVENT_END_INTERSTITIAL] = function(props) {
        props = props || {};

        return us.extend({
            execute: window.RotaWindowFactory.openWindow,
            l10n: BenefitHelper.getl10nForSkin(l10n, ROTA_EVENT_END_INTERSTITIAL).welcome_screen
        }, props);
    };
});