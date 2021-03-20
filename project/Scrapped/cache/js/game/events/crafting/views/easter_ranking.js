/* global Game, HelperEaster */

define('events/crafting/views/easter_ranking', function(require) {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	var EasterRankingView = BaseView.extend({
		initialize: function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

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

		renderDailyRanking : function() {
			var l10n = HelperEaster.getEasterl10nForSkin(),
				$daily_ranking = this.$el.find('.js-ranking-daily');

			this.renderTemplate($daily_ranking, 'ranking', {
				l10n : l10n.ranking,
				type : 'daily',
				cooldown : true,
				players : this.controller.getDailyRankingPlayers(),
				current_player_id : Game.player_id,
				ranking_enabled : this.controller.isRankingEnabled(),
				evaluation_active : this.controller.isEvaluationActive()
			});

			this.adjustColumnSizes($daily_ranking);
			this.registerDailyRankingComponents($daily_ranking);

			var $info_btn = $daily_ranking.find('.btn_ranking_info'),
				onInfoButtonClick = this.controller.onDailyRankingInfoButtonClick.bind(this.controller);

			$daily_ranking.find('.list').tooltip(this.getRankingTooltip(l10n));
			$info_btn.click(onInfoButtonClick).tooltip(l10n.alchemy.info);
		},

		renderOverallRanking : function() {
			var l10n = HelperEaster.getEasterl10nForSkin(),
				$overall_ranking = this.$el.find('.js-ranking-overall');

			this.renderTemplate($overall_ranking, 'ranking', {
				l10n : l10n.ranking,
				type : 'overall',
				cooldown : false,
				players : this.controller.getOverallRankingPlayers(),
				current_player_id : Game.player_id,
				ranking_enabled : this.controller.isRankingEnabled(),
				evaluation_active : false
			});

			this.adjustColumnSizes($overall_ranking);
			this.registerOverallRankingComponents($overall_ranking);

			var $info_btn = $overall_ranking.find('.btn_ranking_info'),
				onInfoButtonClick = this.controller.onOverallRankingInfoButtonClick.bind(this.controller);

			$overall_ranking.find('.list').tooltip(this.getRankingTooltip(l10n));
			$info_btn.click(onInfoButtonClick).tooltip(l10n.alchemy.info);
		},

		registerDailyRankingComponents : function($scope) {
			var l10n = HelperEaster.getEasterl10nForSkin().ranking;
			var sub_context = 'daily_ranking';

			this.unregisterComponents(sub_context);

			if (this.controller.isRankingEnabled() && !this.controller.isEvaluationActive()) {
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

		getRankingTooltip: function (l10n) {
			return this.getTemplate('ranking_tooltip', {
				l10n: l10n.ranking.ranking_tooltip
			});
		},

		destroy : function() {

		}
	});

	window.GameViews.EasterRankingView = EasterRankingView;
	return EasterRankingView;
});
