define('events/turn_over_tokens/controllers/sub_windows/new_targets_animation', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowNewTargetsAnimationSlingersView = require('events/turn_over_tokens/views/sub_windows/new_targets_animation_slingers');
	var SubWindowNewTargetsAnimationAssassinsView = require('events/turn_over_tokens/views/sub_windows/new_targets_animation_assassins');
	var BenefitHelper = require('helpers/benefit');
	var EventSkins = require('enums/event_skins');

	var SubWindowNewTargetsAnimationController = GameControllers.BaseController.extend({
		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.window_controller = options.window_controller;
		},

		render : function($content_node) {
			var skin = BenefitHelper.getBenefitSkin();
			this.$el = $content_node;

			if (skin === EventSkins.ASSASSINS) {
                this.view = new SubWindowNewTargetsAnimationAssassinsView({
                    el: this.$el,
                    controller: this
                });
            }
            else {
                this.view = new SubWindowNewTargetsAnimationSlingersView({
                    el: this.$el,
                    controller: this
                });
			}

			return this;
		},

		closeMe: function() {
			this.window_controller.closeSubWindow();
		},

		destroy : function() {

		}
	});

	return SubWindowNewTargetsAnimationController;
});
