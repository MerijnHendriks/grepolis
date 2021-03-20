/*global window, GrepolisModel */

/**
 * model that contains the gained ingredients of one gift
 */
define('events/crafting/models/easter_dropped_ingredient', function(require) {
	"use strict";

	var DroppedIngredient = function () {}; // never use this, because it will be overwritten
	DroppedIngredient.urlRoot = 'EasterDroppedIngredient';

	/**
	 * get model id
	 *
	 * @returns {Integer}
	 */
	DroppedIngredient.getId = function() {
		return this.get('id');
	};

	/**
	 * get list of gained ingredients
	 *
	 * @returns {Object} type => amount
	 */
	DroppedIngredient.getIngredients = function() {
		return this.get('ingredients');
	};

	/**
	 * get source of gained ingredients
	 *
	 * @returns {String}
	 */
	DroppedIngredient.getIngredientsSource = function() {
		return this.get('ingredients_source');
	};

	window.GameModels.EasterDroppedIngredient = GrepolisModel.extend(DroppedIngredient);
	return DroppedIngredient;
});
