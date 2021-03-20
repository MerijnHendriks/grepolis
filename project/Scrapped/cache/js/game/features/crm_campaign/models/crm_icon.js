/*globals PremiumWindowFactory, Timestamp */

define('features/crm_campaign/models/crm_icon', function() {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var ICON_TYPES = require('features/crm_campaign/enums/crm_icon_types');

	var CrmIcon = GrepolisModel.extend({
		urlRoot: 'CrmIcon',

		getOpenFunction: function () {
			var tab_id = this.getTabId();

			return function() {
				return PremiumWindowFactory.openBuyGoldWindow(tab_id);
			};
		},

		isValid: function () {
			return this.getValidUntil() > Timestamp.now();
		},
		getStartDate: function () {
			return Timestamp.now() - 1;
		},

		onChange: function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},

		hasTimer: function () {
			return !!this.getTimer();

		},
		getTimer: function () {
			return this.getValidUntil();
		},
		isCrmPackage : function() {
			return this.get('icon_type') === ICON_TYPES.PACKAGE_OFFER_ICON;
		},
		getTooltip : function() {
			return this.get('tooltip');
		},
        getTabId : function() {
            return this.get('tab_id');
        }
	});

	GrepolisModel.addAttributeReader(CrmIcon.prototype,
		'id',
		'bonus',
		'valid_until',
		'icon_type',
		'tab_id',
		'tooltip'
	);

	window.GameModels.CrmIcon = CrmIcon;

	return CrmIcon;
});
