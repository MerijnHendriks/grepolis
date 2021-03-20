/* globals GrepolisModel */

define('events/crafting/models/easter_ranking', function(require) {
	'use strict';

	var EasterRanking = function () {}; // never use this, because it will be overwritten
	EasterRanking.urlRoot = 'EasterRanking';

	EasterRanking.getDailyRankingPlayers = function() {
		return this.get('daily');
	};

	EasterRanking.getOverallRankingPlayers = function() {
		return this.get('overall');
	};

	EasterRanking.getDailyRankingTimeout = function() {
		return this.get('daily_timeout');
	};

	EasterRanking.getGainedPoints = function() {
		return this.get('gained_points');
	};

	EasterRanking.onDailyRankingChange = function(obj, callback) {
		obj.listenTo(this, 'change:daily', callback);
	};

	EasterRanking.onOverallRankingChange = function(obj, callback) {
		obj.listenTo(this, 'change:overall', callback);
	};

	EasterRanking.onEventDayChange = function(obj, callback) {
		obj.listenTo(this, 'change:event_day', callback);
	};

	EasterRanking.forceUpdate = function(callback) {
		this.execute('forceUpdate', {}, callback);
	};

	window.GameModels.EasterRanking = GrepolisModel.extend(EasterRanking);
	return EasterRanking;
});



