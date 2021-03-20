/* global GameModels, GrepolisModel, GameDataEaster */

define('events/crafting/models/easter_recipe', function(require) {
	'use strict';

	var EasterRecipe = function () {}; // never use this, because it will be overwritten
	EasterRecipe.urlRoot = 'EasterRecipe';

	EasterRecipe.getId = function() {
		return this.get('id');
	};

	EasterRecipe.getRecipeHash = function() {
		return this.get('recipe_hash');
	};

	EasterRecipe.getCrafted = function() {
		return this.getCraftedCount();
	};

	EasterRecipe.getCraftedCount = function() {
		return this.get('crafted');
	};

	EasterRecipe.isRewardActive = function() {
		return this.get('is_reward_active');
	};

	EasterRecipe.getRewardItem = function() {
		return new GameModels.RewardItem(this.get('reward'));
	};

	EasterRecipe.getIngredient = function(index) {
		return this.get('ingredients')[index];
	};

	EasterRecipe.getIngredients = function() {
		return this.get('ingredients');
	};

	EasterRecipe.getGroupedIngredients = function() {
		return GameDataEaster.groupIngredients(this.getIngredients());
	};

	EasterRecipe.containsAll = function(included_ingredient_types) {
		var no_filter = included_ingredient_types.length === 0,
			recipe_ingredients = this.get('ingredients'),
			areInRecipe = function(ingredient) {
				return us.contains(recipe_ingredients, ingredient);
			};

		return no_filter || included_ingredient_types.every(areInRecipe);
	};

	EasterRecipe.getRewardLevel = function() {
		return this.get('reward_level');
	};

	EasterRecipe.buyRecipeForReward = function(reward_type, reward_subtype, callbacks) {
		this.execute('buyRecipeForReward', {reward_type: reward_type, reward_subtype: reward_subtype}, callbacks);
	};

	EasterRecipe.useReward = function(callbacks) {
		this.execute('useReward', {}, callbacks);
	};

	EasterRecipe.stashReward = function(callbacks) {
		this.execute('stashReward', {}, callbacks);
	};

	EasterRecipe.trashReward = function(callbacks) {
		this.execute('trashReward', {}, callbacks);
	};

	EasterRecipe.getReward = function() {
		return this.get('reward');
	};


	window.GameModels.EasterRecipe = GrepolisModel.extend(EasterRecipe);
	return EasterRecipe;
});
