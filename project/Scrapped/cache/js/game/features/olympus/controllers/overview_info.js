/* global Game, DateHelper */
define('features/olympus/controllers/overview_info', function () {
	'use strict';

	var OverviewController = require('features/olympus/controllers/overview'),
		OverviewInfoView = require('features/olympus/views/overview_info'),
		Artifacts = require('enums/artifacts'),
		OLYMPUS_AWARD = 'olympus_blessing';

	return OverviewController.extend({
		initialize: function (options) {
			OverviewController.prototype.initialize.apply(this, arguments);
		},

		renderPage: function () {
			this.view = new OverviewInfoView({
				el: this.$el,
				controller: this
			});

			this.registerOlympusStageTimer();
			this.registerOlympusStageChangeListener();
		},

		getOlympusReward: function () {
			return Artifacts.GOLDEN_FLEECE;
		},

		getOlympusAward: function () {
			return OLYMPUS_AWARD;
		},

		getOlympusHoldDays: function () {
			return  this.getOlympus().getOlympusHoldDays();
		},

		getTempleShieldTime: function () {
			return  this.getOlympus().getTempleShieldTime();
		},

		getPreTempleStageDays: function () {
			return  this.getOlympus().getPreTempleStageDays();
		},

		getSmallTemplesSpawnAmount: function () {
			return  this.getOlympus().getSmallTemplesSpawnAmount();
		},

		getSmallTemplesAllianceLimit: function () {
			return  this.getOlympus().getSmallTemplesAllianceLimit();
		},

		getSmallTempleStageDays: function () {
			return  this.getOlympus().getSmallTempleStageDays();
		},

		getLargeTemplesAllianceLimit: function () {
			return  this.getOlympus().getLargeTemplesAllianceLimit();
		},

		getLargeTempleStageDays: function () {
			return  this.getOlympus().getLargeTempleStageDays();
		},

		geOlympusSpawnHours: function () {
			return  this.getOlympus().getOlympusSpawnHours();
		},

		getOlympusJumpDays: function () {
			return  this.getOlympus().getOlympusJumpDays();
		},

		getPortalTempleAmount: function () {
			return  this.getOlympus().getPortalTempleAmount();
		},

		getPortalTempleTravelHours: function () {
			return  this.getOlympus().getPortalTempleTravelHours();
		},

		getOlympusUnitKillPercentage: function () {
			return  this.getOlympus().getOlympusUnitKillPercentage();
		},

		getOlympusStageDateAndTime: function () {
			var olympus_stage_timestamp =  this.getOlympus().getOlympusOlympusStageTimestamp();
			return DateHelper.formatDateTimeNice(olympus_stage_timestamp, true, false);
		},

		getOlympusWikiPage: function () {
			return Game.olympus_wiki_url;
		}
	});
});
