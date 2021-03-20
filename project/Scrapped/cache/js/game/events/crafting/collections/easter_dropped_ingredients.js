/*global window */

/**
 * collections of all gained ingredients so far
 */
define('events/crafting/collections/easter_dropped_ingredients', function(require) {
	"use strict";

	var GrepolisCollection = window.GrepolisCollection;
	var DroppedIngredient = window.GameModels.EasterDroppedIngredient;
	var GameDataEaster = window.GameDataEaster;

	var DroppedIngredients = function() {}; // never use this, because it will be overwritten

	DroppedIngredients.model = DroppedIngredient;
	DroppedIngredients.model_class = 'EasterDroppedIngredient';

	/**
	 * iterate over each model and sum up the number of gained ingredients
	 *
	 * @returns {Object} type => amount
	 */
	DroppedIngredients.getSum = function() {
		var summed_up_data = {},
			types = GameDataEaster.getAllIngredientTypes(),
			l = types.length,
			i;

		for (i = 0; i < l; i++) {
			summed_up_data[types[i]] = 0;
		}

		this.each(function(model) {
			var type, ingredients = model.getIngredients();

			for (type in ingredients) {
				if (ingredients.hasOwnProperty(type)) {
					summed_up_data[type] += ingredients[type];
				}
			}
		});

		return summed_up_data;
	};

	window.GameCollections.EasterDroppedIngredients = GrepolisCollection.extend(DroppedIngredients);
	return DroppedIngredients;
});
