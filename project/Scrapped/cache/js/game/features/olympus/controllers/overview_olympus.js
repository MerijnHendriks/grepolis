/* globals Timestamp */
define('features/olympus/controllers/overview_olympus', function () {
	'use strict';

	var OverviewController = require('features/olympus/controllers/overview'),
		OverviewOlympusView = require('features/olympus/views/overview_olympus'),
		OlympusHelper = require('helpers/olympus'),
		BenefitsHelper = require('helpers/benefit');

	return OverviewController.extend({
		initialize: function (options) {
			OverviewController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.temples = this.getCollection('temples');

			this.view = new OverviewOlympusView({
				el: this.$el,
				controller: this
			});

			this.registerOlympusStageTimer();
			this.registerEventListeners();
			this.registerOlympusStageChangeListener();
		},

		registerEventListeners: function () {
			this.stopListening();
			this.getCollection('temples').onAllianceIdChange(this, this.handleAllianceIdChange.bind(this));
			this.getOlympus().onOlympusStageTimestampChange(this, this.view.renderOlympusHeader.bind(this.view));
			this.getOlympus().onNextJumpAtChange(this, this.view.renderOlympusHeader.bind(this.view));
		},

		getLastOlympusJumpTimestamp: function () {
			var wait_time = Timestamp.fromDays( this.getOlympus().getOlympusJumpDays());
			return this.getNextOlympusJumpTimestamp() - wait_time;
		},

		getNextOlympusJumpTimestamp: function () {
			return  this.getOlympus().getNextJumpAt();
		},

		getOlympusTemple: function () {
			return OlympusHelper.getOlympusTemple();
		},

		getOlympusTempleId: function () {
			return this.getOlympusTemple().getId();
		},

		getOwnerAllianceData: function () {
			var temple = this.getOlympusTemple();

			if (temple) {
				return {
					id: temple.getAllianceId(),
					name: temple.getAllianceName()
				};
			}

			return {};
		},

		getOlympusDataForContextMenu: function () {
			var temple = this.getOlympusTemple();

			if (temple) {
				return {
					ix: temple.getIslandX(),
					iy: temple.getIslandY()
				};
			}

			return {};
		},

		isPeaceTimeActive: function () {
			return !!BenefitsHelper.getRunningPeaceTimeHappening();
		}
	});
});
