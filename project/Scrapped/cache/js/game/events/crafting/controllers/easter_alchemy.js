/*global us, GameEvents, GameData, GameControllers, LocalStore, HelperEaster, Timestamp, Game, HumanMessage */

define('events/crafting/controllers/easter_alchemy', function(require) {
	'use strict';

	var BrewTable = window.BrewTable;

	var current_year = Timestamp.toDate(Timestamp.now()).getYear() + 1900;
	var LOCALSTORE_KEY = 'crafting_reward_overlay_count' + current_year;

	var EasterAlchemyController = GameControllers.EasterController.extend({
		table : null,

		initialized : false,

		renderPage : function() {
			GameControllers.EasterController.prototype.renderPage.apply(this, arguments);

			HelperEaster.resetAmountBadge();

			this.setOnManualClose(function() {
				LocalStore.set('easter_reward_overlay_shown', false);
			});

			//Initilize marking
			this.rankingController = new GameControllers.EasterRankingController({
				el : this.$el,
				parent_controller : this
			});

			this.table = new BrewTable();

			this.view = new window.GameViews.EasterAlchemy({
				controller : this,
				el : this.$el
			});

			this.registerEventListeners();
			this.addPreloadedIngredientsOnTheTable();

			this.openEventInfoWindowOnLoad();

			this.rankingController.renderPage();

			this.initialized = true;

			return this;
		},

		registerEventListeners : function() {
			this.table.off();

			this.table.on('ingredient:add', this.view.handleAddIngredientOnTable, this.view);
			this.table.on('ingredient:remove', this.view.handleRemoveIngredientFromTable, this.view);
			this.table.on('table:full', this.view.handleFullTable, this.view);
			this.table.on('table:not_full', this.view.handleNotFullTable, this.view);

            this.stopListening();

			this.getCollection('easter_ingredients').onChangeOrAdd(this, this.view.reRenderIngredientsList.bind(this.view));
			this.getCollection('easter_ingredients').onCollectedAmountChange(this, this.view.renderDailyProgress.bind(this.view));

			this.getCollection('easter_recipes').onChange(this, function() {
				this.view.handleRecipeChange();
			}.bind(this));

			this.getCollection('easter_recipes').onCraftCountChanged(this, function() {
				this.checkRewardOverlayConditions();
			});

			this.getCollection('easter_recipes').onAdd(this, function() {
				this.view.handleNewRecipe();
			}.bind(this));

            this.getModel('easter').onGuestChange(this, function(model) {
                this.view.showGuest(model.getGuest());
            }.bind(this));

            this.stopObservingEvents();

			this.observeEvent(GameEvents.easter.ranking_evaluation, this.updateBrewButtonDuringEvaluation.bind(this));
            this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
            this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
            this.observeEvent(GameEvents.active_happening.reward.trash, this.trashReward.bind(this));

			this.setupAudio();
		},

		setupAudio: function() {
			if (GameData.Sounds) {
				Game.Audio.enableSoundBranch(GameData.Sounds.window.events.crafting);

				var playSound = function() {
					Game.Audio.play(GameData.Sounds.window.events.crafting.crafted);
				};

				this.observeEvent(GameEvents.easter.crafted, playSound);
			}

		},


		waitForBrewEffectEnd: function() {
			return this.view.waitForBrewEffectEnd();
		},

		getCraftedRecipiesCount : function() {
			return this.getCollection('easter_recipes').getCraftedRecipesCount();
		},

		getNumberOfKnownRecipes : function() {
			return this.getCollection('easter_recipes').getRecipes().length;
		},

		getRecipeByIngredients : function(ingredients) {
			return this.getCollection('easter_recipes').getRecipeByIngredients(ingredients);
		},

		getIngredientsFromTheTable : function() {
			return this.table.getIngredientTypes();
		},

		getPreloadedIngredients : function() {
			var args = this.getWindowModel().getArguments();

			if (!args || !args.data || !args.data.ingredients) {
				return {};
			}

			return args.data.ingredients;
		},

		/**
		 * Updates preloaded ingredients which means that even after tab switch all of them will stay on the table
		 *
		 * @param {Array} ingredients
		 *
		 * @return {}
		 */
		setPreloadedIngredients : function(ingredients) {
			var args = us.clone(this.getWindowModel().getArguments()) || {};

			if (!args.data) {
				args.data = {};
			}

			if (!args.data.ingredients) {
				args.data.ingredients = {};
			}

			args.data.ingredients = Object.assign({}, args.data.ingredients, ingredients);

			this.getWindowModel().setArguments(args);
		},

		addIngredientOnTheTable : function(ingredient_type, position) {
			var ingredient = this.getIngredient(ingredient_type);
			var ingredients = {};

			if (position > -1 && this.getAmountOfIngredient(ingredient_type) > 0) {
				this.table.addIngredient(ingredient, position);
			}
			ingredients[position] = ingredient_type;
            this.setPreloadedIngredients(ingredients);
		},

		addPreloadedIngredientsOnTheTable : function() {
			var preloaded_ingredients = this.getPreloadedIngredients(),
				ingredient_type;

			if (Object.keys(preloaded_ingredients).length === 0) {
				return;
			}

			if (this.getActiveRewardRecipe() !== null) {
				var l10n = HelperEaster.getEasterl10nForSkin();
				HumanMessage.error(l10n.active_reward_available_error_message);
				return;
			}

            for(var key in preloaded_ingredients) {
                if (preloaded_ingredients.hasOwnProperty(key)) {
                    ingredient_type = preloaded_ingredients[key];
                    if (ingredient_type) {
                        this.addIngredientOnTheTable(ingredient_type, key);
                    }
                }
            }
		},

		isTableFull : function() {
			return this.table.hasFreeSpot() === false;
		},

		addIngredientOnTheFreeSpotOnTable : function(ingredient_type) {
			var free_spot_position = this.table.getFreeSpotPosition();

			if (free_spot_position > -1) {
				this.addIngredientOnTheTable(ingredient_type, free_spot_position);
			}
		},

		removeIngredientFromTheTable : function(pos) {
            delete this.getPreloadedIngredients()[pos];
			this.table.removeIngredient(pos);
		},

		canBeDragged : function(ingredient_type) {
			return this.getAmountOfIngredient(ingredient_type) > 0;
		},

		getAmountOfIngredient : function(ingredient_type) {
			var ingredient = this.getIngredient(ingredient_type);

			if (!ingredient) {
				return 0;
			}

			return ingredient.getAmount() - this.table.getIngredientsAmount(ingredient_type);
		},

		getProcessCount : function() {
			var collection = this.getCollection('easter_recipes');

			return collection.getProcessCount();
		},

		useReward : function() {
			var active_reward_recipe = this.getActiveRewardRecipe();

			if (active_reward_recipe) {
				active_reward_recipe.useReward({
					success: function() {
						this.view.hideBrewEffect();
					}.bind(this)
				});
			}
		},

		stashReward : function() {
			var active_reward_recipe = this.getActiveRewardRecipe();

			if (active_reward_recipe) {
				active_reward_recipe.stashReward({
					success: function() {
						this.view.hideBrewEffect();
					}.bind(this)
				});
			}
		},

		trashReward : function() {
			var active_reward_recipe = this.getActiveRewardRecipe();

			if (active_reward_recipe) {
				active_reward_recipe.trashReward({
					success: function() {
						this.view.hideBrewEffect();
					}.bind(this)
				});
			}
		},

		/**
		 * check if player hint for show brewing overlay at startup ist still true
		 *
		 * @returns {Boolean}
		 */
		shouldShowBrewHint: function() {
			var hint = this.getCollection('player_hints').getForType('easter_brewing');

			return hint && !hint.isHidden();
		},

		/**
		 * Disable brewing hint
		 * sets property and submits ajax request
		 *
		 * @returns {void}
		 */
		disableBrewHint: function() {
			var hint = this.getCollection('player_hints').getForType('easter_brewing');
			if (hint && !hint.isHidden()) {
				hint.disable();
			}
		},

		getActiveRewardRecipe : function() {
			return this.getCollection('easter_recipes').getActiveRewardRecipe();
		},

		hasActiveRewardRecipe : function() {
			return this.getActiveRewardRecipe() !== null;
		},

		getActiveRewardHarmonyPoints : function() {
			return this.rankingController.getGainedPoints();
		},

		getFirstReward : function() {
			return this.getModel('easter').getFirstProgressReward();
		},

		getSecondReward : function() {
			return this.getModel('easter').getSecondProgressReward();
		},

		getTutorialTemplate : function() {
			var l10n = HelperEaster.getEasterl10nForSkin().alchemy.tutorial,
				unit_name = GameData.units.sea_monster ?
					GameData.units.sea_monster.name_plural :
					GameData.units.bireme.name_plural; // fallback in case Poseidon is not active

			return us.template(this.getTemplate('tutorial'), {
				l10n : $.extend({}, l10n, {example_unit: unit_name})
			});
		},

		getCurrentGuestId: function() {
			return this.getModel('easter').getGuest();
		},

		openEventInfoWindow : function() {
			var l10n = HelperEaster.getEasterl10nForSkin().alchemy.tutorial;

			this.openEventTutorialWindow(l10n.window_title, this.getTutorialTemplate());
		},

		openEventInfoWindowOnLoad : function() {
			if (this.shouldShowBrewHint()) {
				this.disableBrewHint();
				this.openEventInfoWindow();
			}
		},

		onBtnInfoOverlayClick : function () {
			this.openEventInfoWindow();
		},

		checkRewardOverlayConditions : function() {
			var easter_reward_overlay_count = LocalStore.get(LOCALSTORE_KEY);

			var crafted_recipes_count = this.getCraftedRecipiesCount(),
				reward_1 = this.getFirstReward(),
				reward_2 = this.getSecondReward();

				if (this.initialized && !easter_reward_overlay_count) {
					if (reward_1.threshold === crafted_recipes_count) {
						this.view.showRewardOverlay(reward_1.reward);
						LocalStore.set(LOCALSTORE_KEY, 1);
					}
				} else if (this.initialized && easter_reward_overlay_count === 1) {
					if (reward_2.threshold === crafted_recipes_count) {
						this.view.showRewardOverlay(reward_2.reward);
						LocalStore.set(LOCALSTORE_KEY, 2);
					}
				}
		},

		updateBrewButtonDuringEvaluation : function(e, data) {
			var btn_brew = this.getComponent('btn_brew');
			var is_evaluation_active = data.is_evaluation_active;

			btn_brew.setState(is_evaluation_active);
			btn_brew.toggleDisable(is_evaluation_active);
		},

        showRewardContextMenu: function (event, reward) {
            var data = {
                event_group: {},
                level_id: reward.level_id,
                data: reward
            };

            us.extend(data.event_group, GameEvents.active_happening.reward);
            window.Layout.contextMenu(event, 'item_reward_all', data);
		},
		
		destroy : function() {
			GameControllers.EasterController.prototype.destroy.call(this);

			this.unregisterReloadOnDayChange();

			$.Observer().unsubscribe('crafting');

			this.getCollection('easter_ingredients').off(null, null, this.view);
			this.getCollection('easter_recipes').off(null, null, this.view);
			this.table.off(null, null, this.view);
			this.table = null;
			this.rankingController._destroy();
		}
	});

	window.GameControllers.EasterAlchemyController = EasterAlchemyController;
	return EasterAlchemyController;
});
