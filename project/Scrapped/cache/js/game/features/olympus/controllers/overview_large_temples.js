define('features/olympus/controllers/overview_large_temples', function () {
	'use strict';

	var OverviewController = require('features/olympus/controllers/overview'),
		OverviewLargeTemplesView = require('features/olympus/views/overview_large_temples'),
		TempleSizes = require('enums/temple_sizes');

	return OverviewController.extend({
		initialize: function (options) {
			OverviewController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.temples = this.getCollection('temples');
			this.view = new OverviewLargeTemplesView({
				el: this.$el,
				controller: this
			});

			this.registerOlympusStageTimer();
			this.registerEventListeners();
			this.registerOlympusStageChangeListener();
		},

		registerEventListeners: function () {
			this.stopListening();
			this.temples.onAllianceIdChange(this, this.handleAllianceIdChange.bind(this));
			this.getOlympus().onOlympusStageTimestampChange(this, this.view.renderLargeTempleHeader.bind(this.view));
		},

		getLargeTemples: function () {
			return this.temples.getTemplesBySize(TempleSizes.LARGE);
		},

		hasReachedLargeTempleStage: function() {
			return this.isLargeTempleStageActive() || this.isOlympusStageActive();
		}
	});
});
