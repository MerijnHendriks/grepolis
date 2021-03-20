/* global Game */

(function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var AssassinsDailyRankingView = BaseView.extend({

		// if ranking slided out of the view
		hidden:false,

		initialize: function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n().ranking;
			this.render();
		},

		render : function() {
			this.renderDailyRanking();
		},

		initializeUIEvents : function() {
			this.$el.find('.btn_ranking_info')
				.click(this.controller.onDailyRankingInfoButtonClick.bind(this.controller))
				.tooltip(this.l10n.btn_ranking_info);
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
			this.initializeUIEvents();

			$daily_ranking.tooltip(l10n.daily_ranking_tooltip);
		},

		rerenderDailyRanking : function() {
			window.setTimeout(this.renderDailyRanking.bind(this), 500);
		},

		registerDailyRankingComponents : function($scope) {
			var sub_context = 'daily_ranking';

			this.unregisterComponents(sub_context);

			if (this.controller.isRankingEnabled()) {
				this.registerComponent('countdown', $scope.find('.js-cooldown').countdown2({
					display : 'readable_seconds',
					timestamp_end : this.controller.getDailyRankingEndTimestamp()
				}).on('cd:finish', function() {
					$scope.find('.js-cooldown').html(this.l10n.evaluating);
					this.controller.startEvaluation();
				}.bind(this)), sub_context);
			}
		},

		adjustColumnSizes : function($ranking) {
			//Adjust column sizes
			var $selected_row = $ranking.find('.list.players tr:first');
			var first_column_width = $selected_row.find('.position').outerWidth();
			var third_column_width = $selected_row.find('.points').outerWidth();

			$ranking.find('.fix_no_wrap').width(200 - first_column_width - third_column_width);
		},

		destroy : function() {

		}
	});

	window.GameViews.AssassinsDailyRankingView = AssassinsDailyRankingView;
}());
