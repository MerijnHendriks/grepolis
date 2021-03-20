define('events/crafting/data/easter_reward', function(require) {
	'use strict';

	/**
	 *
	 * @param reward_id
	 * @param data
	 * @constructor
	 */

	function EasterReward(reward_id, data) {
		this.reward_id = reward_id;
		this.data = data;
		this.recipes = [];
	}

	EasterReward.prototype.getId = function() {
		return this.reward_id;
	};

	EasterReward.prototype.getRecipeCount = function() {
		return this.data.recipe_count;
	};

	EasterReward.prototype.getName = function() {
		return this.data.reward_name;
	};

	EasterReward.prototype.getSubtype = function() {
		return this.data.reward_subtype;
	};

	EasterReward.prototype.getType = function() {
		return this.data.reward_type;
	};

	EasterReward.prototype.getConfiguration = function() {
		return this.data.configuration;
	};

	EasterReward.prototype.getHash = function() {
		return this.getType() + '_' + this.getSubtype();
	};

	// if the list is filtered then this.recipes is a string which is "has_recipes_but_are_filtered_out"
	EasterReward.prototype.getRecipes = function() {
		if (typeof this.recipes === 'string') {
			 return [];
		}

		return this.recipes.sort(function(a, b) {
			var level_a = a.getRewardItem().getLevel(),
				level_b = b.getRewardItem().getLevel();

            return level_a - level_b;
		});
	};

	EasterReward.prototype.getRecipe = function(id) {
		if (typeof this.recipes === 'string') {
			 return null;
		}
		return this.recipes.find(function (recipe) {
			return recipe.getId() === id;
		});
	};

	EasterReward.prototype.hasRecipes = function() {
		if (typeof this.recipes === 'string' && this.recipes === 'has_recipes_but_are_filtered_out') {
			 return true;
		}

		return this.recipes.length > 0;
	};

	EasterReward.prototype.hasLevel = function() {
		return typeof this.data.configuration.level !== 'undefined';
	};

	EasterReward.prototype.containsAllRecipes = function() {
		var max_count = this.getRecipeCount(), current_count = this.getRecipes().length;

		if (typeof this.recipes === 'string' && this.recipes === 'has_recipes_but_are_filtered_out') {
			 return true;
		}

		return max_count === current_count;
	};

	EasterReward.prototype.setRecipes = function(recipes) {
		this.recipes = recipes;
	};

	window.EasterReward = EasterReward;
	return EasterReward;
});
