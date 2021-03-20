/*global us, HelperBrowserEvents, GameDataEaster, DM, GameDataPowers, TooltipFactory, EasterWindowFactory,
 Timestamp,GameEvents, BuyForGoldWindowFactory, HelperEaster, Promise, JSON */

define('events/crafting/views/easter_alchemy', function(require) {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		EVENT_SKINS = require('enums/event_skins'),
		DISABLED_CSS_CLASS = 'disabled',
    	ContextMenuHelper = require('helpers/context_menu');

	var EASTER_RECIPE_MAX = 120;

	var EasterAlchemy = BaseView.extend({
		$brew_box : null,
		$reward_box : null,
		$harmony_box : null,
		$drag : null,
		$drop : null,
		btn_brew : null,
		effect_promise: Promise.resolve(),

		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n =  $.extend({}, HelperEaster.getEasterl10nForSkin().alchemy, {time : DM.getl10n('COMMON', 'time')});

			this.render();
			window.easterView = this;
		},

		rerender: function(){
			this.controller.unregisterComponents();
			this.render();
		},

		/**
		 * Render main layout
		 */
		render : function() {
			var controller = this.controller,
				active_reward_recipe = controller.getActiveRewardRecipe();

			this.$el.html(us.template(controller.getTemplate('tab_alchemy'), {
				l10n : this.l10n,
				guest_id: this.controller.getCurrentGuestId() || 1
			}));

			this.renderIngredientsList();

			this.$brew_box = this.$el.find('.brew_box');
			this.$reward_box = this.$el.find('.reward_box');
			this.$harmony_box = this.$el.find('.harmony_box');
			this.$drop = $('.easter_alchemy .base');

			this.registerViewComponents();
			this.updateProgressBar();

			this.updateRewardAndBrewBoxes();
			this.renderDailyProgress();
			this.updateRecipeCount();

			if (active_reward_recipe !== null) {
				this.showRewardAvailableState(active_reward_recipe);
			}
		},

		renderDailyProgress: function () {
			// GP-22130: This is coming from the ingredients table in the back end but the tooltip data comes
			// from the daily stats table in the database. This should all be consolidated to the daily stats table.
			var $daily_progress = this.$el.find('.daily_progress'),
				steps = this.controller.getDailyProgress();

			$daily_progress.empty();

			for (var i = 0; i < steps; i++) {
				var step = $('<div>').addClass('step');
				$daily_progress.append(step);
			}

			$daily_progress.tooltip(us.template(this.controller.getTemplate('tooltip_daily_progress'), {
				l10n : this.l10n,
				ingredients : this.controller.getIngredientsCollectedToday(),
				skin : this.getWindowSkin()
			}));
		},

		/**
		 * Manages 'Revard' and 'Brew' boxes
		 */
		updateRewardAndBrewBoxes : function() {
			var controller = this.controller,
				active_reward_recipe = controller.getActiveRewardRecipe(),
				css_power_class,
				reward,
				harmony_points;


			this.hideBrewButton();
			this.hideRewardBox();

			if (active_reward_recipe !== null) {
				reward = active_reward_recipe.getRewardItem();
				css_power_class = GameDataPowers.getRewardCssClassIdWithLevel(reward);
				harmony_points = controller.getActiveRewardHarmonyPoints();

				this.effect_promise.then(function() {
					this.showRewardBox();
                    this.initializeRewardButton();
					this.$harmony_box.toggle(harmony_points !== 0);
				}.bind(this));

				this.$reward_box.find('.icon').removeClass().addClass('icon power_icon60x60 ' + css_power_class);

				this.$reward_box.find('.btn_reward').tooltip(TooltipFactory.createPowerTooltip(reward.getPowerId(), {}, reward.getConfiguration()));

				this.$harmony_box.find('.points').html(harmony_points);

			}
			else if (controller.isTableFull()) {
				this.showBrewButton();
			}
		},

		waitForBrewEffectEnd: function() {
			return this.effect_promise;
		},

		showGuest: function(id) {
			var $overlay = this.$el.find('.guest_overlay');

			$overlay.transition({
				opacity: 0,
				duration: 1000,
				complete: function() {
					$overlay.attr('data-id', id);
					$overlay.transition({opacity: 1});
				}
			});

		},

		showBrewEffect : function(args) {
			if (this.getWindowSkin() === EVENT_SKINS.EASTER_SKIN_EASTER_HEN) {
				return this.showEasterBrewEffect(args);
			} else {
				return this.showIncantationBrewEffect();
			}
		},

		hideBrewEffect : function() {
			if (this.getWindowSkin() === EVENT_SKINS.EASTER_SKIN_EASTER_HEN) {
				this.hideEasterBrewEffect();
			} else {
				this.hideIncantationBrewEffect();
			}
			this.initializeIngredientsTooltips();
		},

		hideIncantationBrewEffect : function() {
			var $effect_area = this.$el.find('.crafting_effect'),
				$brew_slots = this.$el.find('.brew_slot'),
				$curtain =  this.$el.find('.curtain'),
				$parts = this.$el.find('.crafting_effect > div'),
				$flames = this.$el.find('.brew_table .fire');

			$parts.transition({opacity: 0}, 1000, function() {
				// reset everything
				$parts.removeAttr('style');
				$flames.remove();
				$effect_area.hide();
				$curtain.transition({opacity: 0}, 1000, function() { $curtain.removeAttr('style'); });
				$brew_slots.removeClass('consumed');
			});
		},

		showIncantationBrewEffect : function() {
			var showRewardBox = this.showRewardBox.bind(this),
				$el = this.$el.find('.crafting_effect'),
				$curtain =  this.$el.find('.curtain'),
				$runes = $el.find('.runes'),
				$spirit = $el.find('.spirit'),
				$circle = $el.find('.circle'),
				$brew_table = this.$el.find('.brew_table'),
				$brew_slots = $brew_table.find('.brew_slot'),
				enableTabs = this.controller.enableTabs.bind(this.controller);

			for (var i=1; i<=3; i++) {
				var $flame = $('<div/>').addClass('fire').addClass('fire_slot_' + i);
				$brew_table.prepend($flame);
			}
			var $flames = $brew_table.find('.fire');

			$el.show();
			this.hideRewardBox();
			this.controller.disableTabs();

			var animation_completed = false;

			return new Promise(function(resolve) {
				$brew_slots.addClass('consumed');
				$flames.transition({opacity:0.3, y:'-60px'}, 1000, function() {
					if (!animation_completed) {
						$curtain.show().transition({opacity:0.6}, 2000);
						$runes.transition({opacity:1}, 500);
						$spirit.transition({opacity:1}, 1000, function() {
							$circle.css({opacity: 1}, 200);
							showRewardBox();
							resolve();
							enableTabs();
						});
						// This callback was called 3 times rather than once. Probably a bug in jQuery.transit
						// That's why we use the ugly workaround for now (GP-15486)
						animation_completed = true;
					}
				});
			});
		},

		getEggGraphicIndex: function (reward_type, reward_subtype) {
            var reward_id = this.controller.getModel('easter').getRewardId(reward_type, reward_subtype),
                reward_ids = Object.keys(this.controller.getAllRewards()).sort();

            return reward_ids.indexOf(reward_id) % 24; // modulo number off egg graphics we have
		},

		showEasterBrewEffect : function(args) {
			var data = JSON.parse(args),
				reward_type = data.json.reward_type ? data.json.reward_type : false,
				reward_subtype = data.json.reward_subtype ? data.json.reward_subtype : false,
				self = this,
				$el = this.$el.find('.egg_effect'),
				$egg = $el.find('.egg'),
				$open = $el.find('.egg_open'),
				$crack = $el.find('.egg_crack'),
				$beam = $el.find('.egg_beam'),
				$yolk = $el.find('.egg_yolk'),
				egg = this.getEggGraphicIndex(reward_type, reward_subtype),
				enableTabs = this.controller.enableTabs.bind(this.controller);

			$egg.addClass('egg_' + (egg + 1));// graphics start from 1

			$el.show();
			this.hideRewardBox();
			this.controller.disableTabs();

			var animation_completed = false;

			return new Promise(function(resolve) {

				$egg.transition({opacity: 1}, 500, function () {
					$crack.transition({opacity: 1}, 500);
					$beam.transition({opacity: 1}, 1000, function () {
						$beam.css({opacity: 0});
						$crack.css({opacity: 0});
						$open.transition({opacity: 1}, 300, function () {
							$yolk.transition({opacity: 1, y: '-30'}, 200, function () {
								$yolk.transition({y: '-20'}, 100);
								self.showRewardBox();
								resolve();
								enableTabs();
								animation_completed = true;
							});
						});
					});
				});
			});
		},

		showEasterRewardAvailableState : function(active_reward_recipe) {
			var reward_type = active_reward_recipe.getRewardItem().getPowerId(),
				reward_subtype = active_reward_recipe.getRewardItem().getSubtype(),
				egg = this.getEggGraphicIndex(reward_type, reward_subtype),
				$el = this.$el.find('.egg_effect'),
				$egg = $el.find('.egg'),
				$open = $el.find('.egg_open'),
				$yolk = $el.find('.egg_yolk');
			$egg.css({opacity: 1});
			$egg.addClass('egg_' + (egg + 1));
			$open.css({opacity: 1});
			$yolk.transition({y: '-20', opacity: 1}, 0);
		},


		showIncantationRewardAvailableState : function() {
			var $el = this.$el.find('.crafting_effect'),
				$brew_slots = this.$el.find('.brew_table .brew_slot'),
				$curtain = this.$el.find('.curtain'),
				$runes = $el.find('.runes'),
				$spirit = $el.find('.spirit'),
				$circle = $el.find('.circle');
			$brew_slots.addClass('consumed');
			$curtain.show().css({opacity:0.6});
			$runes.css({opacity:1});
			$spirit.css({opacity:1});
			$circle.css({opacity: 1});
			$el.show();
		},

		showDemeterRewardAvailableState : function() {
			this.$el.find('.curtain').show().css({opacity:0.6});
		},

		showRewardAvailableState : function(active_reward_recipe) {
			switch(this.getWindowSkin()) {
				case EVENT_SKINS.EASTER_SKIN_EASTER_HEN:
					this.showEasterRewardAvailableState(active_reward_recipe);
					break;
				case EVENT_SKINS.EASTER_SKIN_INCANTATION:
					this.showIncantationRewardAvailableState();
					break;
				case EVENT_SKINS.EASTER_SKIN_DEMETER:
					this.showDemeterRewardAvailableState();
					break;
			}
		},

		hideEasterBrewEffect : function() {
			var $parts = this.$el.find('.egg_effect > div'),
				$egg = this.$el.find('.egg_effect .egg');

			$parts.transition({opacity: 0}, 1000, function() {
				// reset everything
				$parts.removeAttr('style');
				$egg.removeClass(); // remove all classes
				$egg.addClass('egg');
			});
		},

		showPlusOneCircle : function() {
			var $el = this.$el.find('.new_recipe .round_button');
			$el.showElement(function() {
				$el.hideElement();
			});

			var $el2 = this.$el.find('.js-new-receipe-glow-effect');
			$el2.showElement(function() {
				$el2.hideElement();
			});
		},

		handleFullTable : function() {
			this.updateRewardAndBrewBoxes();
		},

		handleNotFullTable : function() {
			this.updateRewardAndBrewBoxes();
		},

		renderIngredientsList : function() {
			var controller = this.controller;

			this.$el.find('.ingredients_box').html(us.template(controller.getTemplate('ingredients_box'), {
				ingredients : controller.getIngredients(),
				controller : controller
			}));

			this.$drag = $('.easter_alchemy .ingredients_box .easter_ingredient');
		},

		reRenderIngredientsList : function() {
			this.destroyDrag();
			this.renderIngredientsList();
			this.initializeDrag();
			this.initializeBuyForGoldButtons();
			this.initializeIngredientsTooltips();
		},

		addIngredient : function(ingredient, pos) {
			var $ingredient = this.$el.find('.easter_ingredient.' + ingredient.getIngredientType()).clone(),
				$base = this.$el.find('.brew_table .base_' + pos);

			//remove previous ingredients
			this.removeIngredient(ingredient, pos);

			//Remove content of the icon
			$ingredient.empty();

			//add new ingredient
			$base.append($ingredient);

			$base.addClass('contains_ingredient ' + ingredient.getElement());
		},

		removeIngredient : function(ingredient, pos) {
			//don't remove 'ingredient' argument because this function is called by the event handler from collection
			var $base = this.$el.find('.brew_table .base_' + pos),
				$ingredient = $base.find('.easter_ingredient');

			//remove ingredient
			$ingredient.on('webkitTransitionEnd oTransitionEnd MSTransitionEnd transitionend', function() {
				$ingredient.off().remove();
			});

			$ingredient.addClass('hide');

			//$base.find('.easter_ingredient').remove();
			$base.removeClass('air water earth fire contains_ingredient');
		},

		showBrewButton : function() {
			var $predicted_reward = this.$brew_box.find('.predicted_reward'),
				ingredients_on_the_table = this.controller.getIngredientsFromTheTable(),
				recipe = this.controller.getRecipeByIngredients(ingredients_on_the_table);
			var l10n = HelperEaster.getEasterl10nForSkin().alchemy;

			this.$brew_box.showElement();
			this.btn_brew.enable();

			//Clean css classes
			$predicted_reward.removeClass().addClass('predicted_reward');

			if (recipe !== null) {
				var reward = recipe.getRewardItem();

				$predicted_reward.addClass('power_icon60x60 ' + GameDataPowers.getRewardCssClassIdWithLevel(reward));
				$predicted_reward.tooltip(TooltipFactory.createPowerTooltip(reward.getPowerId(), {}, reward.getConfiguration()));
			}
			else {
				$predicted_reward.addClass('question_mark_icon');
				$predicted_reward.tooltip(l10n.tooltips.question_mark);
			}
		},

		hideBrewButton : function() {
			this.btn_brew.disable();
			this.$brew_box.hideElement();
		},

		showRewardBox : function() {
			this.$reward_box.showElement();
			this.$harmony_box.showElement();
			this.$el.find('.plate_glow').css({opacity: 1});
			this.$el.find('.ingredients_box').addClass(DISABLED_CSS_CLASS);
		},

		hideRewardBox : function() {
			this.$reward_box.hideElement();
			this.$harmony_box.hideElement();
			this.$el.find('.plate_glow').css({opacity: 0});
			this.$el.find('.ingredients_box').removeClass(DISABLED_CSS_CLASS);
		},

		updateIngredientCount : function(ingredient) {
			var $ingredient = this.$el.find('.easter_ingredient.' + ingredient.getIngredientType());
			var amount = this.controller.getAmountOfIngredient(ingredient.getIngredientType());

			$ingredient.toggleClass('zero', amount === 0);
			$ingredient.parent().find('.amount').html(amount);
		},

		registerViewComponents : function() {
			this.initializeDrag();
			this.initializeDrop();
			this.initializeRemoveIngredientButtons();
			this.initializeShortcuts();
			this.initializeBuyForGoldButtons();
			this.initializeOverlayElements();
			this.initializeIngredientsTooltips();
			this.initializeOtherButtons();
			this.initializeProgressbar();
			this.initializeCountdown();
			this.initializeHarmonyPointsTooltip();
			this.renderDailyProgress();

		},

		initializeCountdown : function() {
			var countdown_component = this.$el.find('.countdown_box .middle').countdown2({
				value : this.controller.getEventEndAt() - Timestamp.now(),
				display : 'event',
				tooltip : { title: this.l10n.tooltips.countdown, style: {width : 400}}
			}).on('cd:finish', function() {
				this.controller.closeWindow();
			}.bind(this));
			this.controller.registerComponent(
					'easter_countdown',
					countdown_component
				);
		},

		initializeProgressbar : function() {
			var controller = this.controller, l10n = this.l10n;

			var reward_1 = controller.getFirstReward(),
				reward_2 = controller.getSecondReward();

			controller.registerComponent('two_parts_progressbar', this.$el.find('.progressbar_container').twoPartsProgressbar({
				id : 'pb_rewards',
				templates : {
					main : this.controller.getTemplate('progressbar'),
					tooltip : this.controller.getTemplate('progressbar_tooltip')
				},
				first_reward_type : reward_1.reward,
				second_reward_type : reward_2.reward,
				amount : controller.getProcessCount(),
				threshold_reward1 : reward_1.threshold,
				threshold_reward2 : reward_2.threshold,
				l10n : {
					rewards : l10n.rewards,
					tooltips : {
						progressbar : l10n.progressbar_tooltip
					}
				}
			}));
		},

		updateProgressBar : function() {
			var two_parts_progressbar = this.controller.getComponent('two_parts_progressbar');
			two_parts_progressbar.setAmount(this.controller.getProcessCount());
		},

		updateRecipeCount : function() {
			var el = this.$el.find('.recipes_count'),
				total = EASTER_RECIPE_MAX,
				current = this.controller.getNumberOfKnownRecipes();

			el.text(current + '/' + total);
		},

		initializeOtherButtons : function() {
			var controller = this.controller, l10n = this.l10n,
				l10n_ranking = DM.getl10n('easter', 'ranking'),
				craft = controller.craft.bind(controller),
				showEffect = this.showBrewEffect.bind(this);

			//Brew button
			this.btn_brew = controller.registerComponent('btn_brew', this.$el.find('.btn_brew').button({
				caption : l10n.brew_the_ingredients,
				state : false,
				disabled : false,
				tooltips : [
					{title : l10n.btn_brew_tooltip},
					{title : l10n_ranking.evaluating}
				]
			}).on('btn:click', function() {
				this.btn_brew.disable();
				this.btn_brew.setState(false);

				$.Observer(GameEvents.easter.crafted).publish();

				this.effect_promise = Promise.all([craft().then(showEffect, function(e) { console.error(e);	})]);
			}.bind(this)));

			//Recipes button
			controller.registerComponent('btn_recipes', this.$el.find('.btn_recipes').button({
				caption : l10n.btn_recipe, tooltips : [{title : l10n.btn_recipe_tooltip}]
			}).on('btn:click', function() {
				EasterWindowFactory.openEasterRecipesWindow();
			}));


		},

		initializeRewardButton: function () {
			var $btn_reward = this.$el.find('.btn_reward'),
                reward_recipe = this.controller.getActiveRewardRecipe();

            if (!this.controller.hasActiveRewardRecipe()) {
            	return;
            }

            this.unregisterComponent('rwd_reward');
			this.registerComponent('rwd_reward', $btn_reward.reward({
				reward: reward_recipe.getReward()
			}).on('rwd:click', function (event, reward, position) {
				ContextMenuHelper.showRewardContextMenu(event, reward, position);
			}.bind(this)));

            this.showEasterRewardAvailableState(reward_recipe);
		},

		initializeHarmonyPointsTooltip : function() {
			this.$harmony_box.tooltip(this.l10n.tooltips.harmony_points);
		},

		initializeDrag : function() {
			var controller = this.controller,
				window_skin = this.getWindowSkin();

			this.$drag.draggable({
				appendTo: 'body',
				distance: 10,
				drag_listener_container : this.$el.find('.easter_alchemy'),
				helper: function () {
					var $el = $(this),
						$ingredient = $el.clone(false),
						$bases = $('.easter_alchemy .base'),
						drag_item_type = $ingredient.data('drag_item_type');

					//Remove content of the icon
					$ingredient.empty();
					//Add styles
					$ingredient.addClass(window_skin);
					$ingredient.css({width : $el.width(), cursor : 'move'});

					//Hack for removing glow for slots without ingredient (backgorund is removed so there was no effect of chaning opacity)
					$bases.removeClass('tmp-air tmp-water tmp-earth tmp-fire');
					$bases.addClass('tmp-' + drag_item_type);

					return $ingredient;
				},
				scope: 'crafting',
				start: function(event, ui) {
					var active_reward_recipe = controller.getActiveRewardRecipe();
					if (active_reward_recipe !== null) {
						event.preventDefault();
						return;
					}

					var $el = $(this),
						ingredient_type = $el.data('type');

					if (!controller.canBeDragged(ingredient_type)) {
						event.preventDefault();
					}
				}
			});
		},

		initializeDrop : function() {
			var controller = this.controller;

			// drop
			this.$drop.droppable({
				drop : function(event, ui) {
					var $base = $(this),
						$ingredient = ui.helper.clone(false),
						table_pos = $base.data('position'),
						ingredient_type = $ingredient.data('type');

					controller.addIngredientOnTheTable(ingredient_type, table_pos);
				},
				scope: 'crafting'
			});
		},

		initializeRemoveIngredientButtons : function() {
			var controller = this.controller;
			var click_event_name = HelperBrowserEvents.getOnClickEventName();

			//Clicks on remove button
			this.$el.off(click_event_name + '.remove_from_table').on(click_event_name + '.remove_from_table', '.btn_remove_from_table', function(e) {
				var $el = $(e.currentTarget),
					pos = $el.data('position');

				controller.removeIngredientFromTheTable(pos);
			});
		},

		initializeShortcuts : function() {
			var controller = this.controller;
			var click_event_name = HelperBrowserEvents.getOnClickEventName();

			//Clicks on ingredient with SHIFT to add all of them at once
			this.$el.off(click_event_name + '.add_to_all_fields').on(click_event_name + '.add_to_all_fields', '.ingredients_box .easter_ingredient', function(e) {
				if (controller.getActiveRewardRecipe() !== null) {
					return;
				}

				if (e.shiftKey) {
					var $el = $(e.currentTarget),
						ingredient_type = $el.data('type');

					var i, l = controller.getAmountOfIngredient(ingredient_type);

					for (i = 0; i < l; i++) {
						controller.addIngredientOnTheTable(ingredient_type);
					}
				}
			});

			//Clicks on ingredient with CTRL to add it quicker
			this.$el.off(click_event_name + '.add_single').on(click_event_name + '.add_single', '.ingredients_box .easter_ingredient', function(e) {
				var $el = $(e.currentTarget),
					ingredient_type = $el.data('type');

				if (controller.getActiveRewardRecipe() !== null) {
					return;
				}

				if (controller.getAmountOfIngredient(ingredient_type) > 0) {
					controller.addIngredientOnTheFreeSpotOnTable(ingredient_type);
				}
			});
		},

		initializeBuyForGoldButtons : function() {
			var controller = this.controller,
				sub_context = 'buy_for_gold_buttons';

			this.controller.unregisterComponents(sub_context);

			var onClick = function(ingredient, e, _btn) {
				//BuyForGoldWindowFactory.openBuyEventIngredientWindow(_btn, ingredient, controller);
				BuyForGoldWindowFactory.openBuyEasterIngredientForGoldWindow(_btn, ingredient, function() {
					controller.buyIngredient(ingredient.getIngredientType());
				});
			};

			//Buy by gold buttons
			this.$el.find('.ingredients_box .btn_buy_by_gold').each(function(index, el) {
				var $el = $(el),
					ingredient_type = $el.data('type'),
					ingredient = controller.getIngredient(ingredient_type);

				controller.registerComponent('btn_buy_by_gold_' + ingredient_type, $el.button({
					template : 'tpl_simplebutton_borders',
					caption : ingredient.getCost(),
					icon: true,
					icon_type: 'gold',
					icon_position: 'right',
					tooltips : controller.getBuyForGoldIngredientButtonTooltips(ingredient_type)
				}).on('btn:click', onClick.bind(null, ingredient)), sub_context);
			});
		},

		initializeOverlayElements : function() {
			var controller = this.controller;

			//btn_info_overlay
			controller.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
				template : 'internal',
				tooltips : [
					{title : this.l10n.info}
				]
			}).on('btn:click', this.controller.onBtnInfoOverlayClick.bind(this.controller)));
		},

		initializeIngredientsTooltips : function() {
			//Tolltips for ingredients
			var ingredient,
				ingredients = GameDataEaster.getAllIngredients(),
				i,
				ingredients_lenght = ingredients.length,
				controller = this.controller,
				has_active_reward = controller.getActiveRewardRecipe() !== null,
				l10n = HelperEaster.getEasterl10nForSkin();

			if (has_active_reward) {
				this.$el.find('.easter_ingredient').tooltip(l10n.active_reward_available_error_message);
			} else {
				for (i = 0; i < ingredients_lenght; i++) {
					ingredient = ingredients[i];
					this.$el.find('.easter_ingredient.' + ingredient.id).tooltip(ingredient.name);
				}
			}
		},

		handleAddIngredientOnTable : function(ingredient, pos) {
			//Add ingredient on the table
			this.addIngredient(ingredient, pos);

			//Update number in the box
			this.updateIngredientCount(ingredient);
		},

		handleRemoveIngredientFromTable : function(ingredient, pos) {
			this.removeIngredient(ingredient, pos);

			//Update number in the box
			this.updateIngredientCount(ingredient);
		},

		handleRecipeChange : function() {
			this.updateProgressBar();
			this.updateRewardAndBrewBoxes();
		},

		handleNewRecipe : function() {
			this.updateProgressBar();
			//this.showPlusOneCircle();
			this.updateRecipeCount();
		},

		destroyDrag : function() {
			this.$drag.off('.draggable');
		},

		destroyDrop : function() {
			this.$drop.off('.draggable');
		},

		showRewardOverlay : function(reward_type) {
			var l10n = HelperEaster.getEasterl10nForSkin().alchemy;
			var $reward_overlay = this.$el.find('.reward_overlay');

			$reward_overlay.html(us.template(this.controller.getTemplate('reward_overlay'), {
				reward_type : reward_type,
				l10n : l10n
			}));

			this.controller.registerComponent('btn_accept_reward', this.$el.find('.btn_accept_reward').button({
				caption : l10n.btn_accept_reward
			}).on('btn:click', function() {
				this.hideRewardOverlay();
			}.bind(this)), 'reward_overlay');

			$reward_overlay.show();
		},

		hideRewardOverlay : function() {
			this.controller.unregisterComponents('reward_overlay');

			this.$el.find('.reward_overlay').hide();
		},

		getWindowSkin : function() {
			var window_model_arguments = this.controller.getWindowModel().getArguments();
			return window_model_arguments.window_skin ? window_model_arguments.window_skin : false;
		},

		destroy : function() {
			this.destroyDrag();
			this.destroyDrop();
		}
	});

	window.GameViews.EasterAlchemy = EasterAlchemy;
	return EasterAlchemy;
});
