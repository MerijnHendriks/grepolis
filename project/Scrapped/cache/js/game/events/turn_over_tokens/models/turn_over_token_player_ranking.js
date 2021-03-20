/* global GrepolisModel, Promise */

(function() {
	'use strict';

	var TurnOverTokenPlayerRanking = function () {}; // never use this, because it will be overwritten
    TurnOverTokenPlayerRanking.urlRoot = 'TurnOverTokenPlayerRanking';

	GrepolisModel.addAttributeReader(TurnOverTokenPlayerRanking,
		'id',
		'daily_timeout',
		'event_day',
		'daily',
		'overall',
		'ranking_id',
		'gained_points'
	);

    TurnOverTokenPlayerRanking.getDailyRankingPlayers = function() {
		return this.getDaily();
	};

    TurnOverTokenPlayerRanking.getDailyRankingTimeout = function() {
		return this.getDailyTimeout();
	};

    TurnOverTokenPlayerRanking.onDailyRankingChange = function(obj, callback) {
		obj.listenTo(this, 'change:daily', callback);
	};

    TurnOverTokenPlayerRanking.onEventDayChange = function(obj, callback) {
    	obj.listenTo(this, 'change:event_day', callback);
	};

    TurnOverTokenPlayerRanking.forceUpdate = function(callback) {
		this.execute('forceUpdate', {}, callback);
	};

    TurnOverTokenPlayerRanking.getDailyPointsChangePromise = function() {
		return new Promise(function(resolve, reject) {
			this.once('change:daily', function(model, value, options) {
				resolve(value);
			});
		}.bind(this));
	};

	window.GameModels.TurnOverTokenPlayerRanking = GrepolisModel.extend(TurnOverTokenPlayerRanking);
}());



