/*global GameControllers */

(function() {
	'use strict';

	var GameEvents = window.GameEvents;

	var UPDATE_STATE = {
		UPDATED: 'updated',
		IN_PROGRESS: 'updating'
	};

	var UpdateNotificationController = {
		view : null,
		update_status : UPDATE_STATE.IN_PROGRESS,

		initialize : function() {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);

			/**
			 * switch window states whenever maintenance mode turns on or off
			 */
			$.Observer(GameEvents.system.maintenance_started).subscribe('update_notification_controller', function(e, data) {
				this._updateWindowState(UPDATE_STATE.IN_PROGRESS);
			}.bind(this));

			$.Observer(GameEvents.system.maintenance_ended).subscribe('update_notification_controller', function(e, data) {
				this._updateWindowState(UPDATE_STATE.UPDATED);
			}.bind(this));
		},

		renderPage : function() {
			this.view = new window.GameViews.UpdateNotificationView({
				controller : this,
				el : this.$el
			});

			return this;
		},

		/**
		 * set the update status and refresh the window
		 */
		_updateWindowState : function(update_status) {
			this.update_status = update_status;
			// Maintenance mode may end before the view is rendered
			if (this.view) {
				this.view.reRender();
			}
		},

		getState : function() {
			return this.update_status;
		},

		isUpdateInFinished : function() {
			return this.update_status === UPDATE_STATE.UPDATED;
		},

		onRefreshClicked : function() {
			window.location.reload();
		},

		destroy : function() {
			$.Observer(GameEvents.system.maintenance_ended).unsubscribe('update_notification_controller');
			$.Observer(GameEvents.system.maintenance_started).unsubscribe('update_notification_controller');
		}
	};

	window.GameControllers.UpdateNotificationController = GameControllers.TabController.extend(UpdateNotificationController);
}());

