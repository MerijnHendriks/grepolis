define('events/black_friday/controllers/black_friday', function () {
	'use strict';

	var TabController = window.GameControllers.TabController,
		BlackFridayView = require('events/black_friday/views/black_friday');

	return TabController.extend({
		view: null,

		initialize: function (options) {
			TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.view = new BlackFridayView({
				el: this.$el,
				controller: this
			});
		}
	});
});