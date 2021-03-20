define('events/grid_event/views/progression_movement', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		movement_item;

	return BaseView.extend({

		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			movement_item = this.$el.find("#progression_movement_item");
			this.setMovementItemToBeginningPosition();
		},

		setMovementItemToBeginningPosition: function () {
			var current_position_data = this.controller.getCurrentPositionData();
			movement_item.transition({
				x: current_position_data.x,
				y: current_position_data.y
			}, 0);
			movement_item.attr('data-direction', current_position_data.direction);
		},

		moveProgressItem: function (current_position_data, position) {
			movement_item.transition({
				x: current_position_data.x,
				y: current_position_data.y
			}, 1000, 'ease', function () {
				if (position === this.controller.getMaxPosition()) {
					this.hideMovementItemAndGoOneStepFurther();
				} else {
					this.controller.moveProgressionItemOneStep();
				}
				movement_item.attr('data-direction', current_position_data.direction);

			}.bind(this));
		},

		hideMovementItemAndGoOneStepFurther: function () {
			movement_item.addClass('invisible');
			this.controller.moveProgressionItemOneStep();
		},

		showAndPlaceMovementItemOnGivenPosition: function (current_position_data) {
			movement_item.transition({
				x: current_position_data.x,
				y: current_position_data.y
			}, 200, function () {
				movement_item.removeClass('invisible');
				this.controller.moveProgressionItemOneStep();
			}.bind(this));
		}
	});
});