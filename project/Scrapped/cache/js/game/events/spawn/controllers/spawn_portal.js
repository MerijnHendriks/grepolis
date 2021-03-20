/* global GameControllers, GameViews, WM, MM */

define('events/spawn/controllers/spawn_portal', function(require) {
	'use strict';

	var BaseController = GameControllers.BaseController;
	var SpawnPortalView = GameViews.SpawnPortalView;
	var SpawnWindowFactory = require('events/spawn/window_factory');
	var GameEvents = require('data/events');

	var LayoutGameEventSpawnController = BaseController.extend({
		view : null,

		initialize : function(options) {
			//Call method from the parent
			BaseController.prototype.initialize.apply(this, arguments);

			this.view = new SpawnPortalView({
				el : this.$el,
				controller : this
			});

			this.spawn_missions = MM.getOnlyCollectionByName('SpawnMission');
			this.registerEventListeners();
		},

		registerEventListeners : function() {
			var closeWindowAndDestroyPortal = this.onEventEnd.bind(this);

			this.registerTimerOnce(
				'spawn_event_end',
				this.getTimeLeft() * 1000,
				closeWindowAndDestroyPortal
			);

			this.spawn_missions.onMissionChange(this.view, this.view.showOrHideTroopIcon);

			$.Observer(GameEvents.spawn.destroy_city_portal)
				.subscribe('spawn', closeWindowAndDestroyPortal);

		},

		onEventEnd: function() {
			this.view.$el.find('.hades_unit_movement').hide();
			WM.closeWindowsByType('spawn');
			WM.minimizeAllWindows();
			// wait 2 seconds, then show destroy animation
			setTimeout(function() {
				this.view.showDestroyAnimation()
					.then(this._destroy.bind(this));
			}.bind(this), 2000);
		},

		getTimeLeft : function() {
			return this.getModel('spawn').getTimeLeft();
		},

		renderPage : function() {
			this.view.render();
			return this;
		},

		onSpawnClick : function() {
			if (!this.getModel('spawn').isDestroyed()) {
				SpawnWindowFactory.openWindow(this.getModel('spawn'));
			}
		},

		isMissionRunning: function() {
			var running_mission = this.spawn_missions.getRunningMission();
			if (running_mission && running_mission.isRunning() && !running_mission.isFinished()) {
				return true;
			}
			return false;
		},

		destroy : function() {
			this.$el.find('.spawn').remove();
		}
	});

	return LayoutGameEventSpawnController;
});
