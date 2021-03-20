/*global Game, GameViews, Hercules2014WindowFactory, HelperHercules2014 */

(function() {
	'use strict';

	var GameControllers = window.GameControllers;

	var Hercules2014CollectController = GameControllers.TabController.extend({
		view : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		//Data from the server is given though 'data' argument
		renderPage : function(data) {
			this.view = new GameViews.Hercules2014CollectView({
				el : this.$el,
				controller : this
			});

			this.initializeListeners();

			return this;
		},

		initializeListeners : function() {
			// rerender if mercs are added while collect window is still open
			this.getCollection('campaign_dropped_units').once('add', this.renderPage, this);
		},

		getCombinedDroppedUnits : function() {
			return HelperHercules2014.getCombinedDroppedUnits();
		},

		/**
		 * Disable collect hint on backend, player does not want to see this window again
		 *
		 * @return {Void}
		 */
		toggleCollectHint : function() {
			var hint = this.getCollection('player_hints').getForType('hercules2014_collect');
			hint.toggle();
		},

		handleOnButtonClick : function() {
			Hercules2014WindowFactory.openWindow();
			HelperHercules2014.resetAmountBadge();
			this.closeWindow();
		},

		getMarketId : function() {
			return Game.market_id;
		},

		destroy : function() {
			// upon every window destroy collection is reset
			// we only want to the see the ingredients collected since last window open
			this.getCollection('campaign_dropped_units').off(null, null, this);
			this.getCollection('campaign_dropped_units').reset();
		}
	});

	window.GameControllers.Hercules2014CollectController = Hercules2014CollectController;

}());
