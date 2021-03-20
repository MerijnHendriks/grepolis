/* globals DM, TM, Timestamp */

define('features/olympus/controllers/overview', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers'),
		OlympusStages = require('enums/olympus_stages'),
		OlympusWindowFactory = require('features/olympus/factories/olympus_window_factory'),
		TempleSizes = require('enums/temple_sizes');

	return GameControllers.TabController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		registerOlympusStageChangeListener: function () {
			 this.getOlympus().offOlympusStageChange(this);
			 this.getOlympus().onOlympusStageChange(this, function () {
			 	this.view.updatel10nByOlympusStage();
			 	this.view.render();
			 }.bind(this));
		},

		registerOlympusStageTimer: function () {
			var timeout = (this.getNextOlympusStageStartTime() - Timestamp.now()) * 1000;

			TM.unregister('olympus_stage_timer');

			if (timeout > 0) {
				TM.register('olympus_stage_timer', timeout, function () {
					this.closeWindow();
					OlympusWindowFactory.openWindow();
				}.bind(this), {max : 1});
			}
		},

		getNextOlympusStageStartTime: function (stage) {
			var result = 0;

			switch (stage || this.getOlympusStage()) {
				case OlympusStages.PRE_TEMPLE_STAGE:
					result =  this.getOlympus().getOlympusSmallOceanTempleStageTimestamp();
					break;
				case OlympusStages.SMALL_TEMPLE_STAGE:
					result =  this.getOlympus().getOlympusLargeOceanTempleStageTimestamp();
					break;
				case OlympusStages.LARGE_TEMPLE_STAGE:
					result =  this.getOlympus().getOlympusOlympusStageTimestamp();
					break;
				default:
					break;
			}

			return result;
		},

		getOlympus: function () {
			if (!this.olympus) {
				 this.olympus = this.getModel('olympus');
			}

			return  this.olympus;
		},

		getOlympusStage: function () {
			return this.getOlympus().getOlympusStage();
		},

		getl10nByOlympusStage: function () {
			var l10n = this.getl10n(),
				stage_l10n = DM.getl10n(this.getOlympusStage());

			return $.extend(true, l10n, stage_l10n);
		},

		isPreTempleStageActive: function () {
			return this.getOlympusStage() === OlympusStages.PRE_TEMPLE_STAGE;
		},

		isSmallTempleStageActive: function () {
			return this.getOlympusStage() === OlympusStages.SMALL_TEMPLE_STAGE;
		},

		isLargeTempleStageActive: function () {
			return this.getOlympusStage() === OlympusStages.LARGE_TEMPLE_STAGE;
		},

		isOlympusStageActive: function () {
			return this.getOlympusStage() === OlympusStages.OLYMPUS_STAGE;
		},

		isPostTempleStageActive: function () {
			return this.getOlympusStage() === OlympusStages.POST_TEMPLE_STAGE;
		},

		getLargeTemplesSpawnAmount: function () {
			return  this.getOlympus().getLargeTemplesSpawnAmount();
		},

		getLargeTemplesOwnedCount: function () {
			return this.getCollection('temples').getLargeTemplesOwnedCount();
		},

		handleAllianceIdChange: function (model) {
			var size = model.getTempleSize();

			if (size === TempleSizes.LARGE) {
				this.view.updateLargeTempleProgress();
				this.view.renderLargeTemples();
			} else if (size === TempleSizes.SMALL) {
				this.view.updateSmallTemplesRow(model);
			} else {
				this.view.render();
			}
		},

		getCustomColors: function () {
			if (!this.custom_colors ) {
				this.custom_colors = this.getCollection('custom_colors');
			}
			return this.custom_colors;
		},

		getActiveTabType: function () {
			return this.window_model.getActivePage().getType();
		},

		getWinningAllianceId: function () {
			return this.getOlympus().getWinningAllianceId();
		},

		getWinningAllianceName: function () {
			return this.getOlympus().getWinningAllianceName();
		}
	});
});