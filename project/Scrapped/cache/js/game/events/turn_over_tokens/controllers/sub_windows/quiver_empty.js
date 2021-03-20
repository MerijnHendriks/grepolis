/* globals GameDataAssassins */

define('events/turn_over_tokens/controllers/sub_windows/quiver_empty', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowQuiverEmptyView = require('events/turn_over_tokens/views/sub_windows/quiver_empty');

	var SubWindowQuiverEmptyController = GameControllers.BaseController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.window_controller = options.window_controller;
			this.player_meta_data = this.window_controller.getModel('assassins_player_meta_data');
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowQuiverEmptyView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getArrowCount : function() {
			return this.player_meta_data.getArrows();
		},

		getArrowCost: function () {
			return this.getArrowBasicPrice() * this.player_meta_data.getCostFactor().arrow;
		},

		getArrowBasicPrice: function() {
			return GameDataAssassins.getArrowCost();
		},

		getArrowNum: function () {
			return GameDataAssassins.getArrowNum();
		},

		refillArrows: function () {
			this.player_meta_data.refillArrowQuiver();
			this.closeMe();
		},

		closeMe : function() {
			this.window_controller.closeSubWindow();
		},

		destroy : function() {

		}
	});

	return SubWindowQuiverEmptyController;
});
