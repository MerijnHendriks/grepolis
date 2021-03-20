/* globals Promise */

define('events/missions/models/missions_player_ranking', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var MissionsPlayerRanking = GrepolisModel.extend({
		urlRoot: 'MissionsPlayerRanking',

		getDailyRankingPlayers: function() {
			return this.getDaily();
		},

		getOverallRankingPlayers: function() {
			return this.getOverall();
		},

		getDailyRankingTimeout: function() {
			return this.getDailyTimeout();
		},

		onDailyRankingChange: function(obj, callback) {
			obj.listenTo(this, 'change:daily', callback);
		},

		forceUpdate: function(callback) {
			this.execute('forceUpdate', {}, callback);
		},

		getDailyPointsChangePromise: function() {
			return new Promise(function(resolve, reject) {
				this.once('change:daily', function(model, value, options) {
					resolve(value);
				});
			}.bind(this));
		},

		onEventDayChange: function(obj, callback) {
			obj.listenTo(this, 'change:event_day', callback);
		}
	});

	GrepolisModel.addAttributeReader(MissionsPlayerRanking.prototype,
		'id',
		'daily_timeout',
		'event_day',
		'daily',
		'overall',
		'ranking_id',
		'gained_points'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.MissionsPlayerRanking = MissionsPlayerRanking;

	return MissionsPlayerRanking;
});




