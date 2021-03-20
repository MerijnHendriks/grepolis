define('events/crafting/collections/easter_cost_modifiers', function(require) {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var EasterCostModifier = window.GameModels.EasterCostModifier;

	function EasterCostModifiers() {}

	EasterCostModifiers.model = EasterCostModifier;
	EasterCostModifiers.model_class = 'EasterCostModifier';

	/**
	 * Returns all active blocks
	 *
	 * @param {String} type
	 * @param {String} subtype
	 * @returns {Array}
	 */
	EasterCostModifiers.getCostModifierForTypeAndSubtype = function(type, subtype) {
		return us.find(this.models, function(model) {
			return model.getType() === type && model.getSubType() === subtype;
		});
	};

	EasterCostModifiers.onCostModifiersCountChange = function(obj, callback) {
		obj.listenTo(this, 'add remove', callback);
	};

	window.GameCollections.EasterCostModifiers = GrepolisCollection.extend(EasterCostModifiers);
	return EasterCostModifiers;
});
