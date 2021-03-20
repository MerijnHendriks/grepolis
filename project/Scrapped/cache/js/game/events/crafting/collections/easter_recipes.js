/*global window, us */
define('events/crafting/collections/easter_recipes', function(require) {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var EasterRecipe = window.GameModels.EasterRecipe;

	var EasterRecipes = function() {}; // never use this, because it will be overwritten

	EasterRecipes.model = EasterRecipe;
	EasterRecipes.model_class = 'EasterRecipe';

	EasterRecipes.getRecipes = function() {
		return this.models;
	};

	EasterRecipes.getProcessCount = function() {
		var i, process_count, recipe, recipes = this.models, l = recipes.length;

		process_count = 0;
		for (i = 0; i < l; i++) {
			recipe = recipes[i];
			if (recipe) {
				process_count += recipe.getCrafted();
			}
		}
		return process_count;
	};

	EasterRecipes.getActiveRewardRecipe = function() {
		var i, recipe, recipes = this.models, l = recipes.length;

		for (i = 0; i < l; i++) {
			recipe = recipes[i];
			if (recipe && recipe.isRewardActive()) {
				return recipe;
			}
		}

		return null;
	};

	EasterRecipes.getRecipeByIngredients = function(ingredients) {
		var recipes = this.getRecipes();
		var groupBy = function(item) {
			return item;
		};

		//Group by type
		var groupped_ingredients = us.groupBy(ingredients, groupBy);

		for (var i = 0, l = recipes.length; i < l; i++) {
			var recipe = recipes[i];
			var found = true;

			//Group by type
			var groupped_recipe_ingredients = us.groupBy(recipe.getIngredients(), groupBy);

			for (var ingredient_type in groupped_recipe_ingredients) {
				if (groupped_recipe_ingredients.hasOwnProperty(ingredient_type)) {
					//Compare amount of necessary ingredients and ingredients on the table
					if (groupped_recipe_ingredients[ingredient_type].length !== (groupped_ingredients[ingredient_type] || []).length) {
						found = false;
						break;
					}
				}
			}

			if (found === true) {
				return recipe;
			}
			else {
				//Reset and start looking for another one
				found = true;
			}
		}

		return null;
	};

	EasterRecipes.getCraftedRecipesCount = function() {
		return us.reduce(this.getRecipes(), function(memo, model) {
			return memo + model.getCraftedCount();
		}, 0);
	};

	EasterRecipes.onCraftCountChanged = function(obj, callback) {
		obj.listenTo(this, 'change:crafted', callback);
		obj.listenTo(this, 'add', callback);
	};

	EasterRecipes.getRecipesByReward = function(reward_type, reward_subtype) {
		return this.filter(function(recipe) {
			var reward = recipe.getRewardItem();
			return reward.getPowerId() === reward_type && reward.getSubtype() === reward_subtype;
		});
	};

	window.GameCollections.EasterRecipes = GrepolisCollection.extend(EasterRecipes);
	return EasterRecipes;
});
