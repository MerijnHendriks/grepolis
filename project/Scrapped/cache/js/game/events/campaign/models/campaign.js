/* globals GrepolisModel */

(function() {
	'use strict';

	var Campaign = function () {}; // never use this, because it will be overwritten
	Campaign.urlRoot = 'Campaign';

	Campaign.getEventEndAt = function() {
		return this.get('event_end_at');
	};

	Campaign.isRankingEnabled = function() {
		return this.get('ranking_enabled') === true;
	};

	Campaign.getDailyRankingAward = function() {
		return this.get('ranking_awards').daily;
	};

	Campaign.getOverallRankingAward = function() {
		return this.get('ranking_awards').overall;
	};

	Campaign.getDailyRankingReward = function() {
		return this.get('ranking_rewards').daily;
	};

	Campaign.getOverallRankingRewards = function() {
		return this.get('ranking_rewards').overall;
	};

	Campaign.getNextMidnight = function() {
		return this.get('next_midnight');
	};

	Campaign.onEventDayChange = function(obj, callback) {
		obj.listenTo(this, 'change:event_day', callback);
	};

	//Tanking enabled is "true" during entire event, its false only when the event finishes, the tanking is closed, but users can still brew
	Campaign.onRankingAccessibilityChange = function(obj, callback) {
		obj.listenTo(this, 'change:ranking_enabled', callback);
	};

	window.GameModels.Campaign = GrepolisModel.extend(Campaign);
}());
