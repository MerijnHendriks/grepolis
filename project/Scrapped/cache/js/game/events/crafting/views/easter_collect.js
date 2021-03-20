/* global us, GameDataEaster, DM, HelperEaster */

define('events/crafting/views/easter_collect', function(require) {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var EasterCollect = BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();
		},

		/**
		 * Render main layout
		 */
		render: function() {
			var controller = this.controller;

			this.$el.html(us.template(controller.getTemplate('main'), {
				l10n : this.l10n,
				ingredient_types : GameDataEaster.getAllIngredientTypes(),
				ingredient_sums : controller.getIngredientSum(),
				power_is_active: controller.isPowerActive()
			}));

			this.initializeIngredientsTooltips();
			this.registerComponents();

			return this;
		},

		initializeIngredientsTooltips : function() {
			//Tooltips for ingredients
			var ingredient, ingredients = GameDataEaster.getAllIngredients(), i, l = ingredients.length;

			for (i = 0; i < l; i++) {
				ingredient = ingredients[i];
				this.$el.find('.easter_ingredient.' + ingredient.id).tooltip(ingredient.name);
			}
		},

		registerComponents : function() {
			var common_l10n = DM.getl10n('COMMON'),
				easter_collect = HelperEaster.getEasterCollectl10nForSkin();

			this.controller.unregisterComponents();

			this.controller.registerComponent('btn_close_window', this.$el.find('.btn_close_window').button({
				caption : easter_collect.okay_button
			}).on('btn:click', this.controller.handleOnButtonClick.bind(this.controller)));

			this.controller.registerComponent('cbx_show_window', this.$el.find('.cbx_show_window').checkbox({
				checked : false, caption : common_l10n.dont_show_this_window_again
			}).on('cbx:check', this.controller.handleCheckBoxCheck.bind(this.controller)));
		},

		destroy : function() {

		}
	});

	window.GameViews.EasterCollect = EasterCollect;
	return EasterCollect;
});
