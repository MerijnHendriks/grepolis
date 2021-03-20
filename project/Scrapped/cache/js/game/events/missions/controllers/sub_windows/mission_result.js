define('events/missions/controllers/sub_windows/mission_result', function () {
	'use strict';

	var MissionResultView = require('events/missions/views/sub_windows/mission_result'),
		GameControllers = require_legacy('GameControllers');

	return GameControllers.SubWindowController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.skin = options.skin;
			this.mission_result = options.mission_result;
			this.rewards = options.rewards;
			this.setOnAfterClose(function() {
				this.window_controller.markAsRead();
			}.bind(this));
		},

		render: function ($content_node) {
			this.$el = $content_node;
			this.initializeView();
			return this;
		},

		initializeView: function () {
			this.view = new MissionResultView({
				controller: this,
				el: this.$el,
				skin: this.skin,
				mission_result: this.mission_result,
				rewards: this.rewards
			});
		},

		destroy : function() {

		}
	});
});

