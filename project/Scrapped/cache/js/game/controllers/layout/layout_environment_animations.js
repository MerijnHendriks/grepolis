/* global Game, GameControllers, GameViews */
(function() {
	'use strict';

	var LayoutEnvironmentAnimationsController = GameControllers.BaseController.extend({
		view : null,

		initialize : function(options) {
			//Call method from the parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.view = new GameViews.LayoutEnvironmentAnimationsView({
				el : this.$el,
				controller : this
			});
		},

		rerenderPage : function() {
			this.view.rerender();
		},

		renderPage : function() {
			this.view.render();
			return this;
		},

		isAnimationEnabled : function(animation_name) {
			var config_enabled = Game.animations,
				setting_enabled = animation_name === 'clouds' ?
					(Game.player_settings.animations_clouds):
					Game.player_settings.animations_city;

			return config_enabled && setting_enabled;
		},

		areBoatsAnimated : function() {
			return this.isAnimationEnabled();
		},

		getShoreAnimationClasses : function() {
			return [
				'shore_waves_1',
				'shore_waves_2',
				'shore_waves_3',
				'shore_waves_4'
			];
		},

		getRiverAnimationClasses : function() {
			return [
				'river_1',
				'river_2',
				'river_3',
				'waterfall_1',
				'waterfall_2'
			];
		},

		getSeaAnimationClasses : function() {
			return [
				'fishes_1',
				'fishes_2',
				'fishes_3',
				'fishes_4',
				'fishes_5',
				'fishes_6',
				'fishes_7'
			];
		},

		getBoatAnimationClasses : function() {
			return [
				'ship_1',
				'trader_1',
				'boat1',
				'boat2',
				'boat3',
				'boat5',
				'boat6'
			];
		},

		/**
		 * Returns all css classes of enabled animations
		 * @returns {Array} css classes as string
		 */
		getAnimationClasses : function() {
			// TODO externalize this list
			var animations = ['clouds']
				.concat(this.getShoreAnimationClasses())
				.concat(this.getRiverAnimationClasses())
				.concat(this.getSeaAnimationClasses());

			return animations.filter(function(animation) {
				return this.isAnimationEnabled(animation);
			}.bind(this));
		},

		destroy : function() {

		}
	});

	window.GameControllers.LayoutEnvironmentAnimationsController = LayoutEnvironmentAnimationsController;
}());
