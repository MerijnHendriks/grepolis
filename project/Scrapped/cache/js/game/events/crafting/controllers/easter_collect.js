/*global EasterWindowFactory, HelperEaster, MM */

define('events/crafting/controllers/easter_collect', function(require) {
	'use strict';

	var Controller = window.GameControllers.TabController;
	var EasterCollectView = window.GameViews.EasterCollect;
    var POWER_ID = 'crafting_ingredients_boost';

	var EasterCollectController = Controller.extend({
		main_view : null,

		renderPage : function() {
			this.l10n = HelperEaster.getEasterCollectl10nForSkin();

			this.main_view = new EasterCollectView({
				controller : this,
				el : this.$el
			});

			this.stopListening(this.getCollection('easter_dropped_ingredients'));
			this.getCollection('easter_dropped_ingredients')
				.onAdd(this, this.main_view.render.bind(this.main_view));

			return this;
		},

		/**
		 * Get the sum of collected ingredients
		 *
		 * @return {Object}
		 */
		getIngredientSum : function() {
			return this.getCollection('easter_dropped_ingredients').getSum();
		},

        /**
         * Checks if the power is active for doubling ingredients
         * @returns {boolean}
         */
        isPowerActive: function() {
			var casted_powers = MM.getCollections().CastedPowers[0];
            var power = casted_powers.getPower(POWER_ID);
            return power !== null;
        },

		/**
		 * toggle easter collect hint on backend, player does not want to see this window again
		 *
		 * @return {Void}
		 */
		setCollectHint : function(hidden) {
			this.getCollection('player_hints')
				.getForType('easter_collect')
				.setHidden(hidden);
		},

		handleOnButtonClick : function() {
			this.closeWindow();
			EasterWindowFactory.openEasterWindow();
		},

		handleCheckBoxCheck : function() {
			var checkbox = this.getComponent('cbx_show_window');
			this.setCollectHint(checkbox.isChecked());
		},

		destroy : function() {
			// upon every window destroy collection is reset
			// we only want to the see the ingredients collected since last window open
			var easter_dropped_ingredients = this.getCollection('easter_dropped_ingredients');
			if (easter_dropped_ingredients) {
				easter_dropped_ingredients.off(null, null, this);
				easter_dropped_ingredients.reset();
			}

			this.main_view.destroy();
			this.main_view = null;
		}
	});

	window.GameControllers.EasterCollectController = EasterCollectController;
	return EasterCollectController;
});
