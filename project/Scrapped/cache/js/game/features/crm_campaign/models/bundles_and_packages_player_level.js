/* global Timestamp */
define('features/crm_campaign/collections/bundles_and_packages_player_level', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');
    var PremiumWindowFactory = window.PremiumWindowFactory;

    var CRM = require('enums/crm_bundles_packages');
    var ICON_TYPES = require('features/crm_campaign/enums/crm_icon_types');

    var MyModel = GrepolisModel.extend({
        urlRoot: 'BundlesAndPackagesPlayerLevel',

        onValidUntilChange: function (callback) {
            this.on('change:valid_until', callback);
        },

        getOnClickFunction: function () {
            var open_second_tab = this.isCrmPackage();

            return function () {
                return PremiumWindowFactory.openBuyGoldWindow(open_second_tab);
            };
        },

        getOpenFunction: function () {
            return this.getOnClickFunction();
        },

        isCrmPackage: function () {
            return this.getType() === CRM.CRM_TYPES.PACKAGE;
        },

        getPriority: function () {
            return 50;
        },

        isValid: function () {
            return this.getValidUntil() >= Timestamp.now();
        },

        hasIcon: function () {
            return true;
        },

        hasTimer: function () {
            return true;
        },

        getTimer: function () {
            return this.get('valid_until');
        },

        getIconType: function () {
            return this.get('icon_type') || ICON_TYPES.PACKAGE_OFFER_ICON;
        },

        getCssTheme: function () {
            return 'crm_' + this.getIconType() + '_icon';
        }
    });

    GrepolisModel.addAttributeReader(MyModel.prototype,
        'id',
        'player_id',
        'created_at',
        'valid_until',
        'type'
    );

    window.GameModels.BundlesAndPackagesPlayerLevel = MyModel;

    return MyModel;
});
