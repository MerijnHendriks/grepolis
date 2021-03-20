/*globals GameData */

define('events/crafting/data/easter', function(require) {
	'use strict';

	var GameDataEaster = {


		groupIngredients: function(ingredients) {
			return ingredients.reduce(function(grouped, ingredient) {
				grouped[ingredient] = (grouped[ingredient] || 0) + 1;
				return grouped;
			}, {});
		},

		/**
		 * get all ingredients for easter 2013
		 *
		 * @returns {Array}
		 */
		getAllIngredients : function() {
			var ingredient_id, ingredients = [], all_ingredients = GameData.easterIngredients;

			for (ingredient_id in all_ingredients) {
				if (all_ingredients.hasOwnProperty(ingredient_id)) {
					ingredients.push(all_ingredients[ingredient_id]);
				}
			}

			return ingredients;
		},

		/**
		 * get all ingredients for easter 2013
		 *
		 * @return {Array}
		 */
		getAllIngredientTypes : function() {
			var i, ingredients = [], all_ingredients = this.getAllIngredients(), l = all_ingredients.length;

			for (i = 0; i < l; i++) {
				ingredients.push(all_ingredients[i].id);
			}

			return ingredients;
		},

		/**
		 * get single ingredient for easter 2013
		 *
		 * @returns {Array}
		 */
		getIngredient : function(ingredient_type) {
			var i, ingredient, all_ingredients = this.getAllIngredients(), l = all_ingredients.length;

			for (i = 0; i < l; i++) {
				ingredient = all_ingredients[i];

				if (ingredient.id === ingredient_type) {
					return ingredient;
				}
			}
		},

		/**
		 * get commonness of a certain ingredient type
		 * @param ingredient_type
		 * @returns {string} 'rare', 'uncommon' or 'common
		 */
		getCommonness : function(ingredient_type) {
			var ingredient = this.getIngredient(ingredient_type);
			switch (ingredient.drop_chance) {
				case 15:
					return 'rare';
				case 35:
					return 'uncommon';
				default:
					return 'common';
			}
		},

		/**
		 * get default cost factor for an ingredient (should be 1)
		 *
		 * @returns integer
		 */
		getDefaultCostFactor : function() {
			return GameData.crafting_meta.default_cost_factor;
		},

		/**
		 * Returns the cost of the random recipe
		 */
		getRandomRecipeBaseCost : function() {
			return GameData.crafting_meta.easter.recipe_cost;
		},

		/**
		 * Returns the cost of the random recipe
		 */
		getDailyIngredientLimit : function() {
			return GameData.crafting_meta.easter.daily_ingredient_limit;
		},

		/**
		 * Returns default amount of ingredients for specific type
		 *
		 * @param ingredient_type
		 *
		 * @returns {Number}
		 */
		getDefaultIngredientAmount : function(ingredient_type) {
			var ingredient = GameDataEaster.getIngredient(ingredient_type);

			return ingredient.default_amount;
		}

	};

	window.GameDataEaster = GameDataEaster;
	return GameDataEaster;
});
