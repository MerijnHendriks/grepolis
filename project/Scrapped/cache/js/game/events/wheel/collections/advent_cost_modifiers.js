/*globals us, GrepolisCollection */

 (function() {
	'use strict';

	var AdventCostModifier = window.GameModels.AdventCostModifier;

	var AdventCostModifiers = function() {}; // never use this, because it will be overwritten

	AdventCostModifiers.model = AdventCostModifier;
	AdventCostModifiers.model_class = 'AdventCostModifier';

	/**
	 * Returns all active blocks
	 *
	 * @param {String} type
	 * @param {String} subtype
	 * @returns {Array}
	 */
	AdventCostModifiers.getCostModifierForTypeAndSubtype = function(type, subtype) {
		return us.find(this.models, function(model) {
			return model.getType() === type && model.getSubtype() === subtype;
		});
	};

	AdventCostModifiers.onCostModifiersCountChange = function(obj, callback) {
		obj.listenTo(this, 'add remove', callback);
	};

	window.GameCollections.AdventCostModifiers = GrepolisCollection.extend(AdventCostModifiers);
}());
