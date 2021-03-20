define('events/missions/controllers/sub_windows/overall_ranking', function () {
	'use strict';

	var MissionsOverallRankingSubWindowView = require('events/missions/views/sub_windows/overall_ranking'),
		GameControllers = require_legacy('GameControllers');

	return GameControllers.SubWindowController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);
			this.skin = options.skin;
		},

		render: function ($content_node) {
			this.$el = $content_node;
			this.initializeView();
			return this;
		},

		getRankingModel: function() {
			return this.getModel('ranking_model');
		},

		getOverallRankingRewards: function() {
			var ranking_model = this.getRankingModel();
			return ranking_model.getOverallRankingRewards();
		},

		getOverallRankingAwards: function() {
			var ranking_model = this.getRankingModel();
			return ranking_model.getOverallRankingAwards();
		},

		initializeView: function () {
			this.view = new MissionsOverallRankingSubWindowView({
				controller: this,
				el: this.$el,
				skin: this.skin
			});
		},

		destroy : function() {

		}
	});
});

