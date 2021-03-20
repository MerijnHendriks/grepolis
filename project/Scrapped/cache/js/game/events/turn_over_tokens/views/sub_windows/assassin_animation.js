/* globals Promise, GameEvents */

define('events/turn_over_tokens/views/sub_windows/assassin_animation', function(require) {
	'use strict';

	var View = window.GameViews.BaseView;

	var GUY_SLIDE_IN_TIME = 1000;
	var GUY_GET_OUT_TIME = 1000;

	var SubWindowAssassinAnimationView = View.extend({
		initialize: function (options) {
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();
		},

		render : function() {
			this.renderTemplate(this.$el, 'sub_window_assassin_animation', {});

			this.spot_position = this.controller.getSpotPosition();

			return this.startAnimationFirstPart()
				.then(this.controller.destroySubWindowContainers.bind(this.controller))
				.then(this.startAnimationSecondPart.bind(this));
		},

		/**
		 * part 1, where the guy slides in from left on the greyed-out UI
		 */
		startAnimationFirstPart: function() {
			var $guy = this.$el.find('.assassin'),
				$dust = this.$el.find('.dust'),
				guy_transition = $.support.transition ? 'ease-out' : '';

			return new Promise(function(resolve) {
				$guy.transition({ x : 0 }, GUY_SLIDE_IN_TIME)
					.transition({ x : 800, opacity: 0}, GUY_GET_OUT_TIME, guy_transition, resolve);

				$dust.transition({
					opacity: 1,
					duration: GUY_SLIDE_IN_TIME/2,
					complete: function() {
						setTimeout(function() {
							$dust.transition({
								opacity: 0,
								y: 200,
								x: -100
							}, 300);
						}, GUY_SLIDE_IN_TIME/2);
					}
				});
			});
		},

		/**
		 * part 2, where the arrow hits the button you just clicked
		 * and destroys it
		 */
		startAnimationSecondPart: function() {
			var spot_position = this.spot_position;

			return new Promise(function(resolve) {
				this.controller.getSpotDom().hide();

				this.renderTemplate(this.$el, 'sub_window_assassin_animation_arrow', {
					spot_id : this.controller.getSpotId(),
					type : this.controller.getSpotType()
				});

				var $arrow = this.$el.find('.arrow'),
					$fake_target = this.$el.find('.assassins_target'),
					$surround_glow = this.$el.find('.target_surround_glow'),
					$crack_glow = this.$el.find('.target_crack_glow'),
					arrow_transition = $.support.transition ? 'snap' : '';

				// harden this code against e.g. window closing during animation
				try {
					$arrow.css({
						top : spot_position.top - 20,
						left : spot_position.left - 40
					});
					$fake_target.css({
						top: spot_position.top + 4,
						left: spot_position.left + 7
					});
					$surround_glow.css({
						top: spot_position.top + 6,
						left: spot_position.left + 11
					});
					$surround_glow.transition({
						opacity: 1
					}, 200).transition({
						opacity: 0
					}, 200, function() {
						$arrow.show();
						$arrow.transition({
							x : 50,
							y : 35
						}, 200, arrow_transition).transition({
							opacity: 0
						}, 1, function() {
							// fire shot event for sound
							$.Observer(GameEvents.turn_over_tokens.shot).publish({});

							$crack_glow.transition({
								opacity: 1
							}, 200, function() {
								$crack_glow.transition({
									opacity: 0
								}, 100, function () {

									$fake_target.find('.target_top').transition({
										y: -25,
										opacity: 0
									}, 600);
									$fake_target.find('.target_left').transition({
										x: -25,
										opacity: 0
									}, 600);
									$fake_target.find('.target_bottom').transition({
										y: 25,
										opacity: 0
									}, 600, resolve);

								});
							});

						});
					});
				} catch (e) {
					// ignore all errors
				}
			}.bind(this));
		},

		/**
		 * part3, where things glow on the UI or whatever
		 */
		startAnimationThirdPart: function(points) {
			return new Promise(function(resolve) {

				this.renderTemplate(this.$el, 'sub_window_assassin_animation_points', {});

				var $skull = this.$el.find('.skull'),
					$honor_points_glow = this.$el.find('.honor_points_glow'),
					$honor_points = this.$el.find('.honor_points'),
					$battle_points_glow = this.$el.find('.battle_points_glow'),
					$battle_points = this.$el.find('.battle_points'),
					$points = this.$el.find('.points'),
					points_transition = $.support.transition ? 'ease-out' : '';

				var spot_position = this.spot_position;

				// harden this code against e.g. window closing during animation
				try {
					$skull.css({
						top: spot_position.top,
						left : spot_position.left
					});

					$honor_points.css({
						top: spot_position.top - 45,
						left : spot_position.left - 27
					});
					$honor_points_glow.css({
						top: spot_position.top -75 ,
						left : spot_position.left - 35
					});
					$battle_points.css({
						top: spot_position.top -45,
						left : spot_position.left + 42
					});
					$battle_points_glow.css({
						top: spot_position.top - 75,
						left : spot_position.left + 35
					});

					$battle_points.find('.text').text(points);
					$honor_points.find('.text').text(points);

					$honor_points.transition({
						opacity : 1
					}, 200);

					$battle_points.transition({
						opacity : 1
					}, 200);

					$honor_points_glow.transition({
						opacity: 1
					}, 300);

					$battle_points_glow.transition({
						opactiy: 1
					}, 300, function() {
						$points.transition({
							opacity: 0,
							y: -70,
							delay: 500
						}, 600, points_transition, resolve);
					});

				} catch (e) {
					// ignore all errors
				}
			}.bind(this));
		},

		/**
		 * part4, where ranking and points in top right glow
		 */
		startAnimationFourthPart: function() {
			var $deco = this.$el.find('.deco'),
				$ranking_glow = this.$el.find('.deco.ranking_glow');

			return new Promise(function(resolve) {
				// if ranking is disabled (on the last day) don't show the ranking honer points glow
				if(!this.controller.isRankingEnabled()) {
					$ranking_glow.hide();
				}
				else {
					$ranking_glow.show();
				}

				$deco.transition({
					opacity : 1
				}, 600).transition({
					opacity: 0
				}, 750, resolve);

			}.bind(this));
		},


		destroy : function() {

		}
	});

	return SubWindowAssassinAnimationView;
});
