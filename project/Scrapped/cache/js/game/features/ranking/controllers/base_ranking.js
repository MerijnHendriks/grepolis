define('features/ranking/controllers/base_ranking', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');


	return GameControllers.TabController.extend({
		view: null,

		initialize: function (options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners: function () {
			//implement in child controller
		},

		getAllGeneralModels: function () {
			this.model_player = this.getModel('player');
			this.all_ranking_rows = this.getAllRankingColumnRows();
		},

		renderPage: function () {
			this.getAllGeneralModels();
			//extend in child controller
		},

		initializeView: function () {
			//implement in child controller
		},

		getRankingData: function () {
			//implement in child controller
		},

		getRankingHeaderRow: function () {
			//implement in child controller
		},

		getAllRankingColumnRows: function () {
			//implement in child controller
		},

		getRankingColumnRowsToShow: function (start_point, end_point) {
			return this.all_ranking_rows.slice(start_point, end_point);
		},

		getMyAllianceRankingData: function () {
			return us.find(this.all_ranking_rows, function (data) {
				return parseInt(data.alliance_id, 10) === this.model_player.getAllianceId();
			}.bind(this));
		},

		getMyRankId: function () {
			if (this.model_player.getAllianceId()) {
				var ranking_data = this.getMyAllianceRankingData();
				if (ranking_data) {
					return ranking_data.row_id;
				}
			}

			return null;
		},

		getMyRankPageNumber: function (callback) {
			var ranking_data = this.getMyAllianceRankingData();
			if (ranking_data) {
				var page_nr = this.getPageNumber(ranking_data.row_id);
				this.switchPage(page_nr, this.getPageStartPoint(page_nr), this.getPageEndPoint(page_nr), null, callback);
			}
		},

		getPageNumber: function (row_index) {
			return Math.floor(row_index / this.getRowsPerPage());
		},

		getRowsPerPage: function () {
			//implement in child controller
		},

		getPageStartPoint: function (page_nr) {
			return page_nr * this.getRowsPerPage();
		},

		getPageEndPoint: function (page_nr) {
			return this.getPageStartPoint(page_nr) + this.getRowsPerPage();
		},

		switchPage: function (page_nr, start_point, end_point, search_id, callback) {
			var sliced_column_rows = this.getRankingColumnRowsToShow(start_point, end_point);
			callback(page_nr, sliced_column_rows, search_id);
		},

		searchPage: function (alliance_name, callback) {
			var page_nr = -1;
			var search_id = null;
			var ranking_data_for_value = us.find(this.all_ranking_rows, function (ranking) {
				return ranking.alliance_name === alliance_name;
			});
			if (ranking_data_for_value) {
				page_nr = this.getPageNumber(ranking_data_for_value.row_id);
				search_id = ranking_data_for_value.row_id;
			}
			this.switchPage(page_nr, this.getPageStartPoint(page_nr), this.getPageEndPoint(page_nr), search_id, callback);
		},

		registerRanking: function () {
			//implement in child controller
		}
	});
});
