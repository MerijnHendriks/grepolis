/* global GameEvents, GameControllers, HelperEaster */
define('events/crafting/controllers/easter_ranking', function(require) {
	'use strict';

	var BaseController = GameControllers.BaseController,
		Timestamp = require_legacy('Timestamp');

	var EasterRankingController = BaseController.extend({
		evaluation_active : false,

		initialize : function() {
			BaseController.prototype.initialize.apply(this, arguments);
		},

		renderPage : function() {
			this.view = new window.GameViews.EasterRankingView({
				controller : this,
				el : this.$el
			});

			this.registerEventListeners();

			return this;
		},

		rerender : function() {
            if (!this.view) {
                return;
            }

			this.rerenderDailyRanking();
			this.rerenderOverallRanking();

			this.publishEvent(GameEvents.easter.ranking_evaluation, this.isEvaluationActive());
		},

		rerenderDailyRanking : function() {
            this.view.rerenderDailyRanking();
		},

		rerenderOverallRanking : function() {
			this.view.rerenderOverallRanking();
		},

		registerEventListeners : function() {
			var rerender = this.rerender.bind(this);

			this.stopListening();

			this.getModel('easter').onRankingAccessibilityChange(this, rerender);

			this.getModel('easter_ranking').onDailyRankingChange(this, this.onRankingChange.bind(this));
			this.getModel('easter_ranking').onOverallRankingChange(this, this.onRankingChange.bind(this));
			this.getModel('easter_ranking').onEventDayChange(this, this.refetchRanking.bind(this));
		},

		isEvaluationActive : function() {
			return this.evaluation_active;
		},

		setEvaluation : function(value) {
			this.evaluation_active = value;
		},

		startEvaluation : function() {
			this.setEvaluation(true);
			this.rerender();
			this.refetchRanking();
		},

		stopEvaluation : function() {
			this.setEvaluation(false);
			this.rerender();
		},

		refetchRanking : function() {
			if (this.isEvaluationActive() ||  this.getDailyRankingEndTimestamp() < Timestamp.now()) {
                this.getModel('easter_ranking').forceUpdate({success: this.stopEvaluation.bind(this)});
			}
		},

		isRankingEnabled : function() {
			return this.getModel('easter').isRankingEnabled();
		},

		getDailyRankingEndTimestamp : function() {
			return this.getModel('easter_ranking').getDailyRankingTimeout();
		},

		getDailyRankingPlayers : function() {
			return this.getModel('easter_ranking').getDailyRankingPlayers();
		},

		getOverallRankingPlayers : function() {
			return this.getModel('easter_ranking').getOverallRankingPlayers();
		},

		onDailyRankingInfoButtonClick : function() {
			var l10n = HelperEaster.getEasterl10nForSkin().ranking;

			var view = new window.GameControllers.SubWindowEasterDailyRewardsController({
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
			var l10n = HelperEaster.getEasterl10nForSkin().ranking;

			var view = new window.GameControllers.SubWindowEasterOverallRewardsController({
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

		getGainedPoints : function() {
			return this.getModel('easter_ranking').getGainedPoints();
		},

		onRankingChange : function() {
			this.parent_controller.waitForBrewEffectEnd()
				.then(this.rerender.bind(this));
		},

		destroy : function() {

		}
	});

	window.GameControllers.EasterRankingController = EasterRankingController;
	return EasterRankingController;
});
