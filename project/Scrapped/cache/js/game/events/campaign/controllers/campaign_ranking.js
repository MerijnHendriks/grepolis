/* global GameEvents, GameControllers */
(function() {
	'use strict';

	var BaseController = GameControllers.BaseController;

	var CampaignRankingController = BaseController.extend({
		evaluation_active : false,

		initialize : function() {
			BaseController.prototype.initialize.apply(this, arguments);

			this.ranking_model = this.getModel('campaign_ranking');
			this.event_model = this.getModel('campaign');
		},

		renderPage : function() {
			this.view = new window.GameViews.CampaignRankingView({
				controller : this,
				el : this.$el
			});

			this.registerEventListeners();

			return this;
		},

		rerender : function() {
			this.rerenderDailyRanking();
			this.rerenderOverallRanking();

			this.publishEvent(GameEvents.campaign.ranking_evaluation, this.isEvaluationActive());
		},

		rerenderDailyRanking : function() {
			this.view.rerenderDailyRanking();
		},

		rerenderOverallRanking : function() {
			this.view.rerenderOverallRanking();
		},

		registerEventListeners : function() {
			var rerender = this.rerender.bind(this);

			this.event_model.onEventDayChange(this, this.onEventDayChange.bind(this));
			this.event_model.onRankingAccessibilityChange(this, rerender);

			this.ranking_model.onDailyRankingChange(this, this.onDailyRankingChange.bind(this));
			this.ranking_model.onOverallRankingChange(this, this.onOverallRankingChange.bind(this));
		},

		isEvaluationActive : function() {
			return this.evaluation_active === true;
		},

		setEvaluation : function(value) {
			this.evaluation_active = value;
		},

		startEvaluation : function() {
			this.setEvaluation(true);
			this.rerender();
			this.setEvaluation(false);
		},

		/**
		 * Use only for tests
		 */
		stopEvaluation : function() {
			this.setEvaluation(false);
			this.rerender();
		},

		isRankingEnabled : function() {
			return this.event_model.isRankingEnabled();
		},

		getDailyRankingEndTimestamp : function() {
			return this.ranking_model.getDailyRankingTimeout();
		},

		getDailyRankingPlayers : function() {
			return this.ranking_model.getDailyRankingPlayers();
		},

		getOverallRankingPlayers : function() {
			return this.ranking_model.getOverallRankingPlayers();
		},

		onDailyRankingInfoButtonClick : function() {
			var l10n = this.getl10n().ranking;

			var view = new window.GameControllers.SubWindowCampaignDailyRewardsController({
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

		onOverallRankingInfoButtonClick : function() {
			var l10n = this.getl10n().ranking;

			var view = new window.GameControllers.SubWindowCampaignOverallRewardsController({
				window_controller : this.parent_controller,
				models: this.getModels(),
				l10n : l10n.info_windows.overall,
				cm_context : this.getContext('overall_rewards'),
				templates : {
					sub_window_overall_ranking : this.getTemplate('sub_window_overall_ranking')
				}
			});

			this.parent_controller.openSubWindow({
				title : l10n.info_windows.overall.title,
				controller : view,
				skin_class_names : 'classic_sub_window overall_rewards'
			});
		},

		onEventDayChange : function() {
			//Refetch rankings
			this.ranking_model.forceUpdate();
			this.publishEvent(GameEvents.campaign.ranking_evaluation, {is_evaluation_active : this.isEvaluationActive()});
		},

		getGainedPoints : function() {
			return this.ranking_model.getGainedPoints();
		},

		onDailyRankingChange : function() {
			this.rerenderDailyRanking();
		},

		onOverallRankingChange : function() {
			this.rerenderOverallRanking();
		},

		destroy : function() {

		}
	});

	window.GameControllers.CampaignRankingController = CampaignRankingController;
}());
