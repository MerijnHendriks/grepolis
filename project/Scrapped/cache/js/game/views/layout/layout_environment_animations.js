/*global us, Backbone, HelperCssAnimations */

(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var LayoutEnvironmentAnimationsView = BaseView.extend({

		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);
		},

		rerender : function() {

		},

		render : function() {
			var controller = this.controller,
				animation_classes = controller.getAnimationClasses();

			this.$el.html(
				us.template(controller.getTemplate('main'),
					{ animations : animation_classes }
				)
			);

			if (us.contains(animation_classes, 'clouds')) {
				this.renderClouds();
			}

			if (controller.areBoatsAnimated()) {
				this.initializeBoatAnimations();
			}

			this.randomizeFishAnimations();
			this.addEventlisteners();
		},

		addEventlisteners : function() {
			var shore_waves = {
					classes : this.controller.getShoreAnimationClasses(),
					animations : this.controller.getShoreAnimationClasses().map(this.getCssAnimationName)
				},
				fishes = {
					classes : this.controller.getSeaAnimationClasses(),
					animations : this.controller.getSeaAnimationClasses().map(this.getCssAnimationName)
				};

			HelperCssAnimations.onAnimationIteration(
				this.$el.find(this._createSelector(fishes.classes)),
				this.pauseAndReplayAnimations(fishes.animations, this._rndBetween.bind(this, 10*1000, 300*1000), true)
			);

			HelperCssAnimations.onAnimationIteration(
				this.$el.find(this._createSelector(shore_waves.classes)),
				this.pauseAndReplayAnimations(shore_waves.animations, 6 * 1000)
			);
		},

		pauseAndReplayAnimations : function(animations_to_pause, pause_time, fade) {
			return function(animation_name, e) {
				if (us.contains(animations_to_pause, animation_name)) {
					this.stopAnimation(e.target);

					if (fade) {
						$(e.target).fadeOut();
					}

					this.controller.registerTimerOnce(
						'enable-' + animation_name,
						pause_time instanceof Function ? pause_time() : pause_time,
						this.playAnimation.bind(this, e.target, fade)
					);
				}
			}.bind(this);
		},

		randomizeFishAnimations : function() {
			var fishes = this.controller.getSeaAnimationClasses().map(function(layer_name) {
				return '.' + layer_name
			});

			fishes.forEach(function(fish_selector) {
				var rnd = this._rndBetween(0, 300);
				this.$el.find(fish_selector).css('animation-delay', rnd + 's');
			}.bind(this));
		},

		initializeBoatAnimations : function() {
			var $building_container = $('.js-city-overview-buildings-container'), // boats are in a different viewport
				boat_selector = this._createSelector(this.controller.getBoatAnimationClasses());

			$building_container.find(boat_selector).addClass('animated');
		},

		getCssAnimationName : function(animation_class) {
			return 'env-' + animation_class + '-animation';
		},

		stopAnimation : function(el) {
			$(el).addClass('paused');
		},

		playAnimation : function(el, fade) {
			var $el = $(el).removeClass('paused');
			if (fade) {
				$el.fadeIn();
			}
		},

		renderClouds: function() {

			var numClouds = 15,
				layers = ['slow_1', 'slow_2', 'fast_1', 'fast_2'],
				$viewport = this.$el.find('.clouds'),
				view_width = 1920,
				view_height = 1200,
				self = this;

			layers.forEach(function(layer_class) {
				var $layer = $('<div/>').addClass(layer_class);

				for (var i=0; i<numClouds; i++) {
					var cloud = $('<div/>')
						.addClass('cloud_'+ self._rndBetween(1,5))			// choose images
						.css('left', self._rndBetween(100,view_width-100))	// left offset
						.css('top', self._rndBetween(50,view_height-50))		// top offset
						.addClass('cloud')
					$layer.append(cloud);
				}

				$viewport.append($layer);
			});
		},

		_createSelector : function(class_array) {
			return class_array.map(function(klass) {
				return '.' + klass;
			}).join(',');
		},

		_rndBetween : function(lower, upper) {
			return Math.floor((Math.random() * (upper-lower) + lower));
		},

		destroy : function() {
			this.$el.hide();
		}
	});

	window.GameViews.LayoutEnvironmentAnimationsView = LayoutEnvironmentAnimationsView;
}());
