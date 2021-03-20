/* globals GrepolisModel */

(function() {
	'use strict';

	var CampaignRanking = function () {}; // never use this, because it will be overwritten
	CampaignRanking.urlRoot = 'CampaignRanking';

	CampaignRanking.getDailyRankingPlayers = function() {
		return this.get('daily');
	};

	CampaignRanking.getOverallRankingPlayers = function() {
		return this.get('overall');
	};

	CampaignRanking.getDailyRankingTimeout = function() {
		return this.get('daily_timeout');
	};

	CampaignRanking.getGainedPoints = function() {
		return this.get('gained_points');
	};

	CampaignRanking.onDailyRankingChange = function(obj, callback) {
		obj.listenTo(this, 'change:daily', callback);
	};

	CampaignRanking.onOverallRankingChange = function(obj, callback) {
		obj.listenTo(this, 'change:overall', callback);
	};

	CampaignRanking.forceUpdate = function() {
		this.execute('forceUpdate', {}, function() {

		});
	};

	window.GameModels.CampaignRanking = GrepolisModel.extend(CampaignRanking);
}());



