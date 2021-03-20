/* global GameEvents, GameControllers, Timestamp */
(function() {
	'use strict';

	var BaseController = GameControllers.BaseController;

	var AssassinsDailyRankingController = BaseController.extend({
		evaluation_active : false,

		initialize : function() {
			BaseController.prototype.initialize.apply(this, arguments);

			this.ranking_player_model = this.getModel('turn_over_token_player_ranking');
			this.ranking_model = this.getModel('assassins_ranking');
		},

		renderPage : function() {
			this.view = new window.GameViews.AssassinsDailyRankingView({
				controller : this,
				el : this.$el
			});

			this.registerEventListeners();

			return this;
		},


		rerender : function() {
			this.rerenderDailyRanking();

			this.publishEvent(GameEvents.turn_over_tokens.ranking_evaluation, this.isEvaluationActive());
		},

		rerenderDailyRanking : function() {
			this.parent_controller.waitForRightMomentToUpdatePoints()
				.then(this.view.rerenderDailyRanking.bind(this.view));
		},

		registerEventListeners : function() {
			var rerender = this.rerender.bind(this);

			this.stopListening();
			this.ranking_model.onRankingAccessibilityChange(this, rerender);

			this.ranking_player_model.onDailyRankingChange(this, this.rerenderDailyRanking);
            this.ranking_player_model.onEventDayChange(this, this.refetchRanking.bind(this));
		},

		isEvaluationActive : function() {
			return this.evaluation_active;
		},

		setEvaluation : function(value) {
			this.evaluation_active = value;
		},

		startEvaluation : function() {
			this.setEvaluation(true);
			this.parent_controller.rerenderSpots();
			this.rerender();
			this.refetchRanking();
		},

		/**
		 * Use only for tests
		 */
		stopEvaluation : function() {
			this.setEvaluation(false);
			this.parent_controller.rerenderSpots();
			this.rerender();
		},

		isRankingEnabled : function() {
			return this.ranking_model.isRankingEnabled();
		},

		getDailyRankingEndTimestamp : function() {
			return this.ranking_player_model.getDailyRankingTimeout();
		},

		getDailyRankingPlayers : function() {
			return this.ranking_player_model.getDailyRankingPlayers();
		},

		onDailyRankingInfoButtonClick : function() {
			var l10n = this.getl10n().ranking;

			var view = new window.GameControllers.SubWindowAssassinsDailyRewardsController({
				window_controller : this.parent_controller,
				models: this.getModels(),
				l10n : l10n.info_windows.daily,
				cm_context : this.getContext('daily_rewards'),
				templates : {
					sub_window_daily_ranking : this.getTemplate('sub_window_daily_ranking')
				}
			});

			this.parent_controller.openSubWindow({
				title : l10n.info_windows.daily.title,
				controller : view,
				skin_class_names : 'classic_sub_window daily_rewards'
			});
		},

		refetchRanking : function() {
            if (this.isEvaluationActive() ||  this.getDailyRankingEndTimestamp() < Timestamp.now()) {
                this.ranking_player_model.forceUpdate({success: this.stopEvaluation.bind(this)});
            }
		},

		getGainedPoints : function() {
			return this.ranking_player_model.getGainedPoints();
		},

		destroy : function() {

		}
	});

	window.GameControllers.AssassinsDailyRankingController = AssassinsDailyRankingController;
}());
