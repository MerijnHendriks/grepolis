/*global define, TM */
define('events/grepolympia/controller/grepolympia_ranking', function() {
	'use strict';

	var GrepolympiaRankingController,
		EventJsonTrackingController = require('controllers/common/event_json_tracking'),
		GrepolympiaRankingView = require('events/grepolympia/views/grepolympia_ranking'),
		GrepolympiaWindowFactory = require('events/grepolympia/factories/grepolympia_window_factory'),
		window_ids = require('game/windows/ids');

	GrepolympiaRankingController = EventJsonTrackingController.extend({
		view : null,

		initialize : function(options) {
			EventJsonTrackingController.prototype.initialize.apply(this, arguments);
		},

		renderPage : function () {

			this.model_ranking = this.getModel('grepolympia_discipline_ranking');
			this.model_discipline = this.getModel('grepolympia_discipline');
			this.ranking_collection = this.getCollection('grepolympia_rankings');

			if (this.model_discipline && this.model_discipline.getSecondsToTheEndOfDiscipline() > 0) {
				this.refresh_window_after = (this.model_discipline.getSecondsToTheEndOfDiscipline() + 1) * 1000;
				this.initializeDisciplineCountdown();
			}
			this.initializeView();
			return this;
		},

		registerEventListeners: function() {
			this.ranking_collection.onRankingChanges(this, function() {
				this.window_model.replaceModels({ranking: undefined});
			});

			this.model_ranking.onDataChange(this, this.view.renderList.bind(this.view));
			this.model_ranking.onTotalRowsChange(this, this.view._handleTotalRowsChange.bind(this.view));
			this.model_ranking.onSourceChange(this, this.view._handleSourceChange.bind(this.view));
			this.model_ranking.onFilterChange(this, this.view._handleFilterChange.bind(this.view));
		},

		initializeDisciplineCountdown : function() {
			var _self = this;
			TM.unregister('refresh_grepolympia_window');
			//Refresh window when discipline will change
			TM.once('refresh_grepolympia_window', _self.refresh_window_after, function() {
				_self.window_model.close();
				GrepolympiaWindowFactory.openWindow();
			});
		},

		initializeView: function () {
			this.view = new GrepolympiaRankingView({
				controller: this,
				el: this.$el
			});
			this.registerEventListeners();
		},

		getFilter : function() {
			return this.model_ranking.getFilter();
		},

		getDiscipline : function() {
			if (this.model_discipline && this.getWindowType() === window_ids.GREPOLYMPIA) {
				return this.model_discipline.getDiscipline();
			}
			return false;
		},

		getWindowType : function() {
			return this.getWindowModel().getType();
		},

		getSource : function() {
			return this.model_ranking.getSource();
		},

		getRows : function() {
			return this.model_ranking.getRows();
		},

		getActivePage : function() {
			return this.model_ranking.getActivePage();
		},

		getPerPage : function() {
			return this.model_ranking.getPerPage();
		},

		getTotalRows : function() {
			return this.model_ranking.getTotalRows();
		},

		getScoreUnit : function() {
			var discipline_data = this.getModel('grepolympia').getDataDisciplines(),
				active_discipline_data = discipline_data[this.getFilter()];
			return active_discipline_data.score_unit;
		},

		fetchPage : function(source, filter, offset, name, callback) {
			this.model_ranking.fetchPage(source, filter, offset, name, callback);
		},

		searchRankings : function(source, filter, name) {
			this.model_ranking.searchRankings(source, filter, name);
		},

		getWindowSkin : function() {
			return this.getArgument('window_skin');
		}
	});

	return GrepolympiaRankingController;
});
