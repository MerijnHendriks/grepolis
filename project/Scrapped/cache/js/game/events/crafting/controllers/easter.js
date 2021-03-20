/*global GameDataEaster, GameControllers, EasterWindowFactory, TM, GameModels, TooltipFactory, Timestamp, HelperEaster */

define('events/crafting/controllers/easter', function(require) {
	'use strict';

	var EasterController = GameControllers.TabController.extend({
		renderPage : function(data) {
			this.registerReloadOnDayChange();
		},

		/**
		 * get ingredient from collection or create new one
		 *
		 * @param {String} ingredient_type
		 * @returns {window.GameModels.EasterIngredient}
		 */
		getIngredient : function(ingredient_type) {
			var ingredient = this.getCollection('easter_ingredients').getIngredient(ingredient_type);

			if (ingredient === null) {
				ingredient = new GameModels.EasterIngredient({
					id : null,
					ingredient_type : ingredient_type,
					amount : GameDataEaster.getDefaultIngredientAmount(ingredient_type),
					cost_factor : GameDataEaster.getDefaultCostFactor()
				});
			}

			return ingredient;
		},

		/**
		 * test ig player already has this ingredient
		 *
		 * @param {String} ingredient_type
		 * @returns {Boolean}
		 */
		hasIngredient : function(ingredient_type) {
			return this.getIngredient(ingredient_type).getAmount() > 0;
		},

		/**
		 * Get the number of ingredients collected today
		 * @returns {number}
		 */
		getDailyProgress : function() {
			return this.getCollection('easter_ingredients').getTotalCollectedTimesToday();
		},

		/**
		 * test if player has ingredient in a sufficient amount
		 *
		 * @param {String} ingredient_type
		 * @param {integer } amount
		 * @returns {Boolean}
		 */
		hasIngredientCount : function(ingredient_type, amount) {
			return this.getIngredient(ingredient_type).getAmount() >= amount;
		},

		/**
		 * get all ingredients from player in proper order
		 *
		 * @returns {Array}
		 */
		getIngredients : function() {
			//we need to have ingredients in specific order
			var ingredient_type, ingredient, ingredients = GameDataEaster.getAllIngredientTypes(),
				i, l = ingredients.length, output = [];

			for (i = 0; i < l; i++) {
				ingredient_type = ingredients[i];
				ingredient = this.getIngredient(ingredient_type);

				output.push(ingredient);
			}

			return output;
		},

		getAllRewards : function() {
			return this.getModel('easter').getAllRewards();
		},

		getIngredientsCollectedToday : function() {
			var ingredients_ids = GameDataEaster.getAllIngredientTypes();
			var collected = {},
				easter_stats = this.getModel('easter_stats');

			ingredients_ids.forEach(function(ingredient_id, index) {
				//@TODO remove this and fix model
				//collected[ingredient_id] = easter_stats.get(ingredient_id) || 0;
				collected[ingredient_id] = easter_stats.getForIngredient(ingredient_id);
			});

			return collected;
		},

		/**
		 * buy ingredient of type
		 *
		 * @param {String} ingredient_type
		 * @returns {void}
		 */
		buyIngredient : function(ingredient_type) {
			var ingredient = this.getIngredient(ingredient_type);

			ingredient.buyIngredient();
		},

		getEventEndAt : function() {
			var model = this.getModel('easter');
			return model.getEventEndAt();
		},

		getBuyForGoldIngredientButtonTooltips : function(ingredient_type) {
			var l10n = HelperEaster.getEasterl10nForSkin().common,
				ingredient = GameDataEaster.getIngredient(ingredient_type),
				tooltip = TooltipFactory.getTitle(ingredient.name) + '<div style="margin-top:5px;">' + l10n.btn_buy_for_gold_tooltip + '</div>';

			return [{title : tooltip}];
		},

		craft : function() {
			var model = this.getModel('easter'),
				table = this.table;

			return model.craft(this.table.getIngredientTypes(), {
				success : function() {
					table.cleanTable();
				}
			});
		},

		/**
		 * to refresh the window, it has to reload after the current 'day' is over.
		 */
		registerReloadOnDayChange : function() {
			var next_midnight = this.getModel('easter').getNextMidnight();
            var now = Timestamp.now();

            if (next_midnight > now) {
                this.unregisterReloadOnDayChange();
                TM.register('reload_easter_window', (next_midnight - now) * 1000, this.reloadWindow.bind(this), {max: 1});
            } else {
                this.reloadWindow.bind(this);
            }
		},

		/**
		 * register timer if not needed anymore
		 */
		unregisterReloadOnDayChange : function() {
			TM.unregister('reload_easter_window');
		},

		/**
		 * this method is used to 'refresh' the advent page when the next day starts while the window is open
		 *
		 * @method reloadWindow
		 */
		reloadWindow : function() {
			this.closeWindow();
			EasterWindowFactory.openEasterWindow();
		},

		destroy: function() {
			this.unregisterReloadOnDayChange();
		}
	});

	window.GameControllers.EasterController = EasterController;
	return EasterController;
});
