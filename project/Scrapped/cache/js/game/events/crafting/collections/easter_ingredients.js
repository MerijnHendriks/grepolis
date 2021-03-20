define('events/crafting/collections/easter_ingredients', function(require) {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var EasterIngredient = window.GameModels.EasterIngredient;

	var EasterIngredients = function() {}; // never use this, because it will be overwritten

	EasterIngredients.model = EasterIngredient;
	EasterIngredients.model_class = 'EasterIngredient';

	/**
	 * get ingredient by type
	 *
	 * @param {String} ingredient_type
	 * @returns {window.GameModels.EasterIngredient} or null
	 */
	EasterIngredients.getIngredient = function(ingredient_type) {
		var ingredient = this.where({ingredient_type : ingredient_type});

		return ingredient.length ? ingredient[0] : null;
	};

	/**
	 * @todo direct access to .models must be avoided
	 * @returns {Array}
	 */
	EasterIngredients.getIngredients = function() {
		return this.models;
	};

	/**
	 * Checks if player has enough ingredients to buy a recipe
	 *
	 * @param {Object} ingredients
	 * @returns {Boolean}
	 */
	EasterIngredients.hasIngredients = function(ingredients) {
		var ingredient_type, amount, ingredient_model;

		for (ingredient_type in ingredients) {
			if (ingredients.hasOwnProperty(ingredient_type)) {
				amount = ingredients[ingredient_type];
				ingredient_model = this.getIngredient(ingredient_type);

				if (!ingredient_model || ingredient_model.getAmount() < amount) {
					return false;
				}
			}
		}

		return true;
	};

	EasterIngredients.getTotalCollectedAmountToday = function() {
		var sum = function(sum, el) {
			return sum += el.getCollectedAmountToday();
		};
		return this.models.reduce(sum,0);
	};

	EasterIngredients.getTotalCollectedTimesToday = function() {
		var sum = function(sum, el) {
			return sum += el.getCollectedTimesToday();
		};
		return this.models.reduce(sum, 0);
	};

	EasterIngredients.onCollectedAmountChange = function(obj, callback) {
		obj.listenTo(this, 'change:collected_amount', callback);
	};

	EasterIngredients.onCollectedTimesChange = function(obj, callback) {
		obj.listenTo(this, 'change:collected_times', callback);
	};

	EasterIngredients.onChangeOrAdd = function(obj, callback) {
		obj.listenTo(this, 'add change', callback);
	};

	window.GameCollections.EasterIngredients = GrepolisCollection.extend(EasterIngredients);
	return EasterIngredients;
});
