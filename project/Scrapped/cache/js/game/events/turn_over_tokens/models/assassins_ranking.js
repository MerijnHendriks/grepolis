/* global GrepolisModel */
(function() {
	'use strict';

	var AssassinsRanking = function () {}; // never use this, because it will be overwritten
	AssassinsRanking.urlRoot = 'AssassinsRanking';

	AssassinsRanking.isRankingEnabled = function() {
		return this.get('ranking_enabled');
	};

	AssassinsRanking.getDailyRankingAward = function() {
		return this.get('ranking_awards').daily;
	};

	AssassinsRanking.getDailyRankingReward = function() {
		return this.get('ranking_rewards').daily;
	};

	/**
	 * On the last event day after 8pm this will fire and ranking_enabled will return false
	 * @param obj
	 * @param callback
	 */
	AssassinsRanking.onRankingAccessibilityChange = function(obj, callback) {
		obj.listenTo(this, 'change:ranking_enabled', callback);
	};

	window.GameModels.AssassinsRanking = GrepolisModel.extend(AssassinsRanking);
}());



