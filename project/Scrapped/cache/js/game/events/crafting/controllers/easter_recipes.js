/*global HelperEaster*/
define('events/crafting/controllers/easter_recipes', function(require) {
	'use strict';

	var Controller = window.GameControllers.EasterController;
	var GameDataEaster = window.GameDataEaster;
	var EasterReward = window.EasterReward;
	var TooltipFactory = window.TooltipFactory;
	var GameControllers = window.GameControllers;
	var GameDataHeroes = window.GameDataHeroes;
	var GameModels = window.GameModels;

	var FILTER = {
		ALL: 'all',
		AVAILABLE: 'available'
	};

	var EasterRecipesController = Controller.extend({
		sub_context_checkboxes : 'filter_checkboxes',
		sub_context_list : 'recipes_list',
		scroll_position : 0,

		default_recipe_filter : FILTER.ALL,

		getDefaultRecipeFilter : function() {
			return this.default_recipe_filter;
		},

		renderPage : function(data) {
			Controller.prototype.renderPage.apply(this, arguments);

			this.recipes_collection = this.getCollection('easter_recipes');
			this.ingredients_collection = this.getCollection('easter_ingredients');
			this.cost_modifiers_collection = this.getCollection('easter_cost_modifiers');

			this.view = new window.GameViews.EasterRecipes({
				controller : this,
				el : this.$el
			});

			//Rerender list when recipe has been bought
			this.recipes_collection.on('add', this.view.reRenderList, this.view);
			this.cost_modifiers_collection.onCostModifiersCountChange(this, this.view.reRenderList.bind(this.view));
			this.ingredients_collection.on('add change', this.view.handleIngredientsChange, this.view);

			return this;
		},

		getScrollPosition : function() {
			return this.scroll_position;
		},

		setScrollPosition : function(value) {
			this.scroll_position = value;
		},

		/**
		 * Returns rewards wrapped in the prototype. Results are also filtered
		 *
		 * @returns {Array}
		 */
		getRewards : function() {
			var all_reward_names = this.getModel('easter').getAllRewards(),
				top_filter = this.getRecipeFilter(),
				left_filter = this.getFilters(),
				ordered_reward_ids = this.getPredefinedOrder(),
				toRewards = function(r_id) {
					return this.getReward(r_id);
				}.bind(this),
				selected = function(reward) {
					return (top_filter === FILTER.ALL &&
						(left_filter.length === 0 || reward.hasRecipes())) ||
						(top_filter === FILTER.AVAILABLE && reward.hasRecipes());
				},
				predefinedOrder = function(a, b) {
					var getIndex = function(reward) {
						var index = ordered_reward_ids.indexOf(reward.getId());
						return index === -1 ? Number.MAX_VALUE : index;
					};

					return getIndex(a) - getIndex(b);
				};

			return Object.keys(all_reward_names)
				.map(toRewards)
				.filter(selected)
				.sort(predefinedOrder);
		},

		getPredefinedOrder : function() {
			var are_heroes_enabled = GameDataHeroes.areHeroesEnabled();

			//Put rewards in specific order defined by Game Designers
			var predefined_order = [
				'big_population_boost', 'small_population_boost', 'harpy_generation', 'fury_generation', 'attack_ship_generation', 'bireme_generation', 'acumen', 'chain_lightning',
				'demoralizing_plague', 'sudden_aid', 'wedding_of_the_aristocrats', 'summoning_of_the_nereids', 'longterm_attack_boost', 'longterm_defense_boost'
			];

			if (are_heroes_enabled) {
				predefined_order.push('luxurious_residence');
			}

			predefined_order.push('longterm_festival_resource_boost', 'longterm_unit_order_boost', 'longterm_wood_boost', 'longterm_stone_boost', 'longterm_iron_boost');

			if (are_heroes_enabled) {
				predefined_order.push('coins_of_war_generation', 'coins_of_wisdom_generation');
			}

			predefined_order.push('slinger_generation', 'hoplite_generation', 'rider_generation', 'instant_favor', 'instant_resources_all', 'unit_movement_boost');

			return predefined_order;
		},

		getReward : function(reward_id) {
			var rewards = this.getModel('easter').getAllRewards(),
				recipes = this.getGroupedAndFilteredRecipes(),
				reward = new EasterReward(reward_id, rewards[reward_id]),
				reward_recipes = recipes[reward.getHash()];

			if (reward_recipes) {
				reward.setRecipes(reward_recipes);
			}

			return reward;
		},

		/**
		 * Returns object of arrays which contains recipes which are grouped by the reward
		 *
		 * @returns {Object}
		 */
		getGroupedAndFilteredRecipes : function() {
			var ingredients_collection = this.ingredients_collection,
				filter_ingredients = this.getFilters(),
				radiobutton_value = this.getRecipeFilter();

			return this.recipes_collection.reduce(function(grouped, recipe) {
				var reward = recipe.getRewardItem(),
					reward_hash = reward.getPowerId() + '_' + reward.getSubtype();


				if ( radiobutton_value === FILTER.ALL || (
						radiobutton_value === FILTER.AVAILABLE &&
						ingredients_collection.hasIngredients(recipe.getGroupedIngredients()) )
					) {

					if (!grouped[reward_hash]) {
						grouped[reward_hash] = [];
					}

					if (recipe.containsAll(filter_ingredients) ) {
						grouped[reward_hash].push(recipe);
					}

					if ( filter_ingredients !== [] ) {
						// remove rewards without known recipes if ingredient filtered
						Object.keys(grouped).forEach(function (reward_hash) {
							if (grouped[reward_hash].length === 0) {
                                delete grouped[reward_hash];
                            }
						});
					}

				}

				return grouped;
			}, {});

		},

		buyRecipe : function(reward_type, reward_subtype) {
			var recipe = new GameModels.EasterRecipe();
			recipe.buyRecipeForReward(reward_type, reward_subtype, {
				success : function() {
				}
			});
		},

		/**
		 * Returns array of the ingredient names which represents checked filter checkboxes
		 * e.g. ['ingredient1', 'ingredient6']
		 * @returns {Array}
		 */
		getFilters : function() {
			var sub_context = this.getSubContextForFilters(), filters = [],
				checkbox, checkboxes = this.getComponents(sub_context), checkbox_id;

			for (checkbox_id in checkboxes) {
				if (checkboxes.hasOwnProperty(checkbox_id)) {
					checkbox = checkboxes[checkbox_id];

					if (checkbox.isChecked()) {
						filters.push(checkbox.getCid());
					}
				}
			}

			return filters;
		},

		/**
		 *
		 * @return {String} FILTER.ALL or FILTER.AVAILABLE
		 */
		getRecipeFilter : function() {
			var radiobutton = this.getComponent('rbtn_show_all');
			return radiobutton ? radiobutton.getValue() : this.getDefaultRecipeFilter();
		},

		/**
		 * Returns sub context name for the checkboxes components
		 *
		 * @returns {String}
		 */
		getSubContextForFilters : function() {
			return this.sub_context_checkboxes;
		},

		getBuyRecipeTooltips : function(cost) {
			var l10n = HelperEaster.getEasterl10nForSkin().recipes,
				idle_button_tooltip = l10n.buy_recipe_tooltip +
					'<br /><div style="margin-top:5px;">' +
					l10n.price + ': ' +
					'<span style="margin-right:3px;">' + cost + '</span>' +
					TooltipFactory.getIcon('gold_14x14') +
					'</div>';

			return [
				{title : idle_button_tooltip},
				{title : l10n.buy_recipe_tooltip_disabled}
			];
		},

		/**
		 * Returns sub context name for the list
		 *
		 * @returns {Integer}
		 */
		getCurrentRecipeCost : function () {
			var base_cost = GameDataEaster.getRandomRecipeBaseCost(),
				current_recipe_cost_modifier = this.cost_modifiers_collection.getCostModifierForTypeAndSubtype('easter', 'recipes');

			if (current_recipe_cost_modifier) {
				base_cost *= current_recipe_cost_modifier.getModifier();
			}

			return base_cost;
		},

		/**
		 * Returns sub context name for the list
		 *
		 * @returns {String}
		 */
		getSubContextForList : function() {
			return this.sub_context_list;
		},

		getPurchasedRecipeCount : function(reward) {
			var type = reward.data.reward_type,
				subtype = reward.data.reward_subtype;

			return this.getCollection('easter_recipes').getRecipesByReward(type, subtype).length;
		},

		destroy : function() {
			GameControllers.EasterController.prototype.destroy.call(this);

			this.getCollection('easter_recipes').off(null, null, this.view);
			this.getCollection('easter_ingredients').off(null, null, this.view);
		}
	});

	window.GameControllers.EasterRecipesController = EasterRecipesController;
	return EasterRecipesController;
});
