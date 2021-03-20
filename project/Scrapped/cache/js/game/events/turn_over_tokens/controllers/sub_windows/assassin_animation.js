define('events/turn_over_tokens/controllers/sub_windows/assassin_animation', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowAssassinAnimationView = require('events/turn_over_tokens/views/sub_windows/assassin_animation');

	var SubWindowAssassinAnimationController = GameControllers.BaseController.extend({

		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.spot_id = options.spot_id;
			this.window_controller = options.window_controller;
			this.animation_terminated = false;
			this.daily_ranking = this.window_controller.getModel('assassins_ranking');
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowAssassinAnimationView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		startAnimation: function() {
			return this.view.render();
		},

		closeMe: function() {
			// Make sure that this is only processed once, otherwise
			// promises in the chain upwards break
			if (!this.animation_terminated) {
				this.animation_terminated = true;
				this.window_controller.closeSubWindow();
			}
		},

		continueAnimationWithData : function(points) {
			return this.view.startAnimationThirdPart(points);
		},

		startAnimationFourthPart : function() {
			return this.view.startAnimationFourthPart();
		},

		/*
		 * the second part of the animation is shown above the main UI
		 * here we remove the curtain and subwindow DOM, but keep the view
		 * and controller
		 */
		destroySubWindowContainers : function() {
			this.window_controller.hideSubWindowCurtainInDom();
		},

		getMainWindowDomNode : function() {
			return this.window_controller.$el;
		},

		getSpotPosition : function() {
			return this.getSpotDom().position();
		},

		getSpotDom : function() {
			return this.getMainWindowDomNode().find('.target_' + this.spot_id);
		},

		getSpotType : function() {
			return this.window_controller.getSpotType(this.spot_id);
		},

		getSpotId : function() {
			return this.spot_id;
		},

		isRankingEnabled : function() {
			return this.daily_ranking.isRankingEnabled();
		},

		destroy : function() {

		}
	});

	return SubWindowAssassinAnimationController;
});
