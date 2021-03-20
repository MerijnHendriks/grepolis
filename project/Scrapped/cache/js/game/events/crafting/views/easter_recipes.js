/*global us, BuyForGoldWindowFactory, GameData, GameDataEaster, EasterWindowFactory, TooltipFactory, HelperEaster, HumanMessage */

define('events/crafting/views/easter_recipes', function(require) {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var EasterRecipes = BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = HelperEaster.getEasterl10nForSkin().recipes;

			this.render();
		},

		/**
		 * Renders tab
		 */
		render : function() {
			this.renderMainView();
			this.renderList();
		},

		/**
		 * Renders part of the tab which does not change
		 */
		renderMainView : function() {
			var controller = this.controller;

			this.$el.html(us.template(controller.getTemplate('tab_recipes'), {
				l10n : this.l10n,
				ingredients : controller.getIngredients()
			}));

			this.registerMainViewComponents();
		},

		/**
		 * Renders list of recipes
		 */
		renderList : function() {
			var controller = this.controller;

			this.renderTemplate(this.$el.find('.recipes_list'), 'recipes_list', {
				l10n : this.l10n,
				rewards : controller.getRewards(),
				controller : controller
			});

			this.registerListViewComponents();
		},

		handleIngredientsChange : function(ingredient_model) {
			this.reRenderList();

			//Update amount of ingredinets on the filters list
			this.$el.find('.filter.' + ingredient_model.getIngredientType() + ' .amount').html(ingredient_model.getAmount());
		},

		/**
		 * Rerenderes list of ingredients
		 */
		reRenderList : function() {
			var controller = this.controller, sub_context = controller.getSubContextForList(),
				scrollbar = controller.getComponent('recipes_scrollbar', sub_context);

			controller.setScrollPosition(scrollbar.getSliderPosition());
			controller.unregisterComponents(sub_context);

			this.renderList();
		},

		/**
		 * Registers components for the main view
		 */
		registerMainViewComponents : function() {
			this.initializeFilterBox();
			this.initializeTopFilter();
			this.initializeGoToAlchemyTabButton();
		},

		/**
		 * Registers components for the list view
		 */
		registerListViewComponents : function() {
			this.initializeScrollbar();
			this.initializeBuyReceipe();
			this.initializePutOnTheTableButtons();
			this.initializeTooltips();
			this.initializeBuyIngredientButtons();
		},

		initializeBuyIngredientButtons : function() {
			var controller = this.controller, sub_context = controller.getSubContextForList();

			var onClick = function(ingredient, e, _btn) {
				BuyForGoldWindowFactory.openBuyEasterIngredientForGoldWindow(_btn, ingredient, function() {
					controller.buyIngredient(ingredient.getIngredientType());
				});
			};

			this.$el.find('.btn_buy_ingredient').each(function(idx, el) {
				var $el = $(el),
					ingredient_type = $el.data('ingredient_type'),
					index = $el.data('index'),
					reward_id = $el.data('reward_id'),
					ingredient = controller.getIngredient(ingredient_type);

				controller.registerComponent('btn_buy_ingredient_' + reward_id + '_' + index, $el.button({
					template : 'tpl_simplebutton_borders',
					caption : ingredient.getCost(),
					icon: true,
					icon_type: 'gold',
					icon_position: 'right',
					tooltips : controller.getBuyForGoldIngredientButtonTooltips(ingredient_type)
				}).on('btn:click', onClick.bind(null, ingredient)), sub_context);
			});
		},

		initializePutOnTheTableButtons : function() {
			var controller = this.controller,
				l10n = this.l10n;

			// tooltips
			this.$el.find('.btn_brew').each(function(i, el) {
				var $el = $(el),
					has_all_ingredients = $el.data('has_all_ingredients'),
					text = has_all_ingredients ? l10n.prepare_receipt : l10n.cant_prepare_receipt;

				$el.tooltip(text, {width: 400});
			});

			// move stuff on table if all ingredients available
			this.$el.off('click.btn_brew').on('click.btn_brew', '.btn_brew', function(e) {
				var $el = $(e.currentTarget),
					reward_id = $el.data('reward_id'),
					recipe_id = $el.data('recipe_id'),
					reward = controller.getReward(reward_id),
					recipe = reward.getRecipe(recipe_id),
					ingredients = recipe.getIngredients(),
					has_all_ingredients = $el.data('has_all_ingredients');

				if (has_all_ingredients) {
					EasterWindowFactory.openEasterAlchemyWindow(ingredients);
					e.stopPropagation();
				}

			});
		},

		/**
		 * Initializes buy receipe buttons
		 */
		initializeBuyReceipe : function() {
			var controller = this.controller, sub_context = controller.getSubContextForList(),
				l10n = this.l10n;

			var onClick = function(reward, cost, e, _btn) {
				BuyForGoldWindowFactory.openBuyEasterRecipeWindow(_btn, reward, cost, function() {
					controller.buyRecipe(reward.getType(), reward.getSubtype());
				});
			};

			//Buy by gold buttons
			this.$el.find('.btn_buy_recipe').each(function(index, el) {
				var $el = $(el),
					reward_id = $el.data('reward_id'),
					reward = controller.getReward(reward_id),
					cost = controller.getCurrentRecipeCost(),
					max_recipes = reward.data.recipe_count,
					purchased_recipes_count = controller.getPurchasedRecipeCount(reward);

				if(!reward.containsAllRecipes() && purchased_recipes_count < max_recipes) {
					controller.registerComponent('btn_buy_recipe_' + reward_id, $el.button({
						template : 'tpl_simplebutton_borders',
						caption : l10n.buy_recipe + '  ' + cost,
						icon: true,
						icon_type: 'gold',
						icon_position: 'right',
						tooltips : controller.getBuyRecipeTooltips(cost)
					}).on('btn:click', onClick.bind(null, reward, cost)), sub_context);
				}

			});
		},

		/**
		 * Initializes 'Go to' alchemy tab button
		 */
		initializeGoToAlchemyTabButton : function() {
			var l10n = HelperEaster.getEasterl10nForSkin().common;

			//btn_goto_alchemy_tab
			this.controller.registerComponent('btn_goto_alchemy_tab', this.$el.find('.btn_goto_alchemy_tab').button({
				template : 'empty',
				tooltips : [
					{title : l10n.btn_caption}
				]
			}).on('btn:click', function() {
				EasterWindowFactory.openEasterAlchemyWindow();
			}));
		},

		/**
		 * Initializes checkboxes in the filter box
		 */
		initializeFilterBox : function() {
			var _self = this,
				l10n = this.l10n,
				controller = this.controller,
				checkboxes = [],
				sub_context = controller.getSubContextForFilters(),
				isChecked = function(sum, cbx) {
					return cbx.isChecked() ? sum + 1 : sum;
				},
				getCheckedBoxes = function() {
					return checkboxes.reduce(isChecked, 0);
				},
				reRenderOrErr = function(ev, cbx) {
					var num_selected = getCheckedBoxes();
					if (num_selected > 3) {
						cbx.check(false);
						HumanMessage.error(l10n.only_three);
					} else {
						_self.reRenderList();
						_self.$el.find('.filters_box .lbl_selected').text(num_selected);
					}
				};

			//Initialize filter checkboxes
			this.$el.find('.filters_box .filter').each(function(index, el) {
				var $el = $(el), $checkbox = $el.find('.checkbox_new'), $icon = $el.find('.icon'),
					ingredient_type = $el.data('type'),
					ingredient = GameDataEaster.getIngredient(ingredient_type);

				//Register checkbox component
				checkboxes.push(
					controller.registerComponent('cbx_filter_' + ingredient_type, $checkbox.checkbox({
						caption : '', checked : false, cid : ingredient_type
					}).on('cbx:check', reRenderOrErr), sub_context)
				);

				//Add ingredient tooltip
				$icon.tooltip(ingredient.name);
			});
		},

		initializeTopFilter : function() {
			var _self = this, l10n = this.l10n;

			this.controller.registerComponent('rbtn_show_all', this.$el.find('.rbtn_show_all').radiobutton({
				value : this.controller.getDefaultRecipeFilter(), template : 'tpl_radiobutton', options : [
					{value : 'all', name : l10n.filter_show_all},
					{value : 'available', name : l10n.filter_show_available}
				]
			}).on('rb:change:value', function(e, value) {
				_self.reRenderList();
			}));
		},

		/**
		 * Initializes scrollbar component
		 */
		initializeScrollbar : function() {
			var sub_context = this.controller.getSubContextForList(),
				$list = this.$el.find('.recipes_list'),
				$viewport = this.$el.find('.recipes_list_viewport');

			//Initialize list
			this.controller.registerComponent('recipes_scrollbar', $viewport.skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'narrow',
				disabled: false,
				elements_to_scroll: $list,
				element_viewport: $viewport,
				scroll_position: this.controller.getScrollPosition(),
				min_slider_size : 16
			}), sub_context);
		},

		/**
		 * Initializes tooltips
		 */
		initializeTooltips : function() {
			//Tolltips for ingredients
			var ingredient, ingredients = GameDataEaster.getAllIngredients(), i, l = ingredients.length;

			for (i = 0; i < l; i++) {
				ingredient = ingredients[i];

				this.$el.find('.full .easter_ingredient.' + ingredient.id).tooltip(ingredient.name);
			}

			//Register all power tooltips
			this.$el.find('.recipes_group .header .power_icon60x60').each(function(index, el) {
				var $power = $(el),
					power_id = $power.data('power-id'),
					configuration = $power.data('power-configuration'), gd_powers = GameData.powers;

				// header reward should show no level
				if (configuration && configuration.level) {
					configuration.level = 0;
				}

				if (gd_powers.hasOwnProperty(power_id)) {
					$power.tooltip(TooltipFactory.createPowerTooltip(power_id, {show_extended_data : false}, configuration));
				}
			});

			this.$el.find('.recipes_group .single_recipe_box .power_icon60x60').each(function(index, el) {
				var $power = $(el),
					power_id = $power.data('power-id'),
					configuration = $power.data('power-configuration'), gd_powers = GameData.powers;

				if (gd_powers.hasOwnProperty(power_id)) {
					$power.tooltip(TooltipFactory.createPowerTooltip(power_id, {}, configuration));
				}
			});
		},

		destroy : function() {

		}
	});

	window.GameViews.EasterRecipes = EasterRecipes;
	return EasterRecipes;
});
