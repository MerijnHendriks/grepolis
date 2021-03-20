/* global Game */

(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var CampaignRankingView = BaseView.extend({

		// if ranking slided out of the view
		hidden:false,

		initialize: function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.initializeUIEvents();

			this.render();
		},

		rerenderDailyRanking : function() {
			this.renderDailyRanking();
		},

		rerenderOverallRanking : function() {
			this.renderOverallRanking();
		},

		render : function() {
			this.renderDailyRanking();
			this.renderOverallRanking();
		},

		initializeUIEvents : function() {
			this.$el.on('click', '.js-ranking-daily .btn_ranking_info', this.controller.onDailyRankingInfoButtonClick.bind(this.controller));
			this.$el.on('click', '.js-ranking-overall .btn_ranking_info', this.controller.onOverallRankingInfoButtonClick.bind(this.controller));
		},

		renderDailyRanking : function() {
			var l10n = this.controller.getl10n().ranking;
			var $daily_ranking = this.$el.find('.js-ranking-daily');

			this.renderTemplate($daily_ranking, 'ranking', {
				l10n : l10n,
				type : 'daily',
				cooldown : true,
				players : this.controller.getDailyRankingPlayers(),
				current_player_id : Game.player_id,
				ranking_enabled : this.controller.isRankingEnabled(),
				evaluation_active : this.controller.isEvaluationActive()
			});

			this.adjustColumnSizes($daily_ranking);
			this.registerDailyRankingComponents($daily_ranking);

			$daily_ranking.find('.list').tooltip(l10n.daily_ranking_tooltip);
		},

		renderOverallRanking : function() {
			var l10n = this.controller.getl10n().ranking;
			var $overall_ranking = this.$el.find('.js-ranking-overall');

			this.renderTemplate($overall_ranking, 'ranking', {
				l10n : l10n,
				type : 'overall',
				cooldown : false,
				players : this.controller.getOverallRankingPlayers(),
				current_player_id : Game.player_id,
				ranking_enabled : this.controller.isRankingEnabled(),
				evaluation_active : false
			});

			this.adjustColumnSizes($overall_ranking);
			this.registerOverallRankingComponents($overall_ranking);
		},

		registerDailyRankingComponents : function($scope) {
			var l10n = this.controller.getl10n().ranking;
			var sub_context = 'daily_ranking';

			this.unregisterComponents(sub_context);

			if (this.controller.isRankingEnabled()) {
				this.registerComponent('countdown', $scope.find('.js-cooldown').countdown2({
					display : 'readable_seconds',
					timestamp_end : this.controller.getDailyRankingEndTimestamp()
				}).on('cd:finish', function() {
					$scope.find('.js-cooldown').html(l10n.evaluating);
					this.controller.startEvaluation();
				}.bind(this)), sub_context);
			}
		},

		registerOverallRankingComponents : function() {
			var sub_context = 'overall_ranking';
			this.unregisterComponents(sub_context);
		},

		adjustColumnSizes : function($ranking) {
			//Adjust column sizes
			var $selected_row = $ranking.find('.list.players tr:first');
			var first_column_width = $selected_row.find('.position').outerWidth();
			var third_column_width = $selected_row.find('.points').outerWidth();

			$ranking.find('.fix_no_wrap').width(200 - first_column_width - third_column_width);
		},

		slideOut: function() {
			if (!this.hidden) {
				var $overall_ranking = this.$el.find('.js-ranking-overall'),
					$daily_ranking = this.$el.find('.js-ranking-daily');

				$overall_ranking.transition({translate: [-185, 0]});
				$daily_ranking.transition({translate: [-185, 0]});

				this.hidden = true;
			}
		},

		slideIn: function() {
			if (this.hidden) {
				var $overall_ranking = this.$el.find('.js-ranking-overall'),
					$daily_ranking = this.$el.find('.js-ranking-daily');

				$overall_ranking.transition({translate: [0, 0]});
				$daily_ranking.transition({translate: [0, 0]});
				this. hidden = false;
			}
		},

		destroy : function() {

		}
	});

	window.GameViews.CampaignRankingView = CampaignRankingView;
}());
