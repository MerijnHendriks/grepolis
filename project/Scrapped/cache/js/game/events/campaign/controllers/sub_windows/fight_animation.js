define('events/campaign/controllers/sub_windows/fight_animation', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowFightAnimationView = require('events/campaign/views/sub_windows/fight_animation');

	//var FIGHT_ANIMATION_TIMEOUT = 1000; //ms

	var SubWindowFightAnimation = GameControllers.BaseController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.stage_id = options.stage_id;

		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowFightAnimationView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		destroy : function() {

		}
	});

	return SubWindowFightAnimation;
});
