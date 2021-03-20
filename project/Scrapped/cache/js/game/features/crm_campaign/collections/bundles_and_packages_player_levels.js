define('features/crm_campaign/collections/bundles_and_packages_player_levels', function() {
    'use strict';

    var Collection = require_legacy('GrepolisCollection');
	var Model = require('features/crm_campaign/collections/bundles_and_packages_player_level');
	var CRM = require('enums/crm_bundles_packages');

    var col = Collection.extend({
		model : Model,
		model_class : 'BundlesAndPackagesPlayerLevel',

		getBeginnersAidPackage: function() {
			return this.findWhere({
				type : CRM.CRM_TYPES.PACKAGE,
				icon_type : CRM.ICON_TYPES.BEGINNER_PACKAGE
			});
		},

		hasBeginnersAidPackage: function() {
			return this.getBeginnersAidPackage() !== undefined;
		},

		getGenericSale: function() {
			return this.findWhere({
				icon_type : null
			});
		},

		hasGenericSalesIcon : function() {
			return this.getGenericSale() !== undefined;
		},

		onAdd : function(obj, callback) {
			obj.listenTo(this, 'add', callback);
		}
	});

	window.GameCollections.BundlesAndPackagesPlayerLevels = col;

	return col;
});
