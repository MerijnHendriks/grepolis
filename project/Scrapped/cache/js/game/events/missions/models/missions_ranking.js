define('events/missions/models/missions_ranking', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var MissionsRanking = GrepolisModel.extend({
		urlRoot: 'MissionsRanking',

		isRankingEnabled: function () {
			return this.get('ranking_enabled');
		},

		getDailyRankingAward: function () {
			return this.get('ranking_awards').daily;
		},

		getDailyRankingReward: function () {
			return this.get('ranking_rewards').daily;
		},

		getOverallRankingAwards: function () {
            return this.get('ranking_awards').overall;
		},

		getOverallRankingRewards: function () {
            return this.get('ranking_rewards').overall;
		},

		/**
		 * On the last event day after 8pm this will fire and ranking_enabled will return false
		 * @param obj
		 * @param callback
		 */
		onRankingAccessibilityChange: function(obj, callback) {
			obj.listenTo(this, 'change:ranking_enabled', callback);
		}
	});

	GrepolisModel.addAttributeReader(MissionsRanking.prototype,
		'id',
		'event_day',
		'ranking_enabled',
		'ranking_rewards',
		'daily',
		'overall',
		'ranking_awards',
		'ranking_timeout'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.MissionsRanking = MissionsRanking;

	return MissionsRanking;
});




