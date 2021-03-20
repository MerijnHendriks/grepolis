define('features/olympus/views/ranking', function () {
	'use strict';

	var GameViews = require_legacy('GameViews'),
		AllianceLinkHelper = require('helpers/alliance_link');

	return GameViews.BaseView.extend({
		initialize: function (options) {
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		registerFlagTooltips: function () {
			var number_of_flags = 3,
				ranking_data = this.controller.getRankingData();
			for (var i = 0; i < number_of_flags; i++) {
				if (Object.keys(ranking_data)[i]) {
					var key = Object.keys(ranking_data)[i],
						$flag = this.$el.find('.flag_' + (i+1));
					if (ranking_data[key].alliance_name !== null) {
						$flag.tooltip(ranking_data[i].alliance_name);
					} else {
						$flag.tooltip(this.l10n.ranking.dissolved_alliance);
					}
				}
			}
		},

		renderWinnerPedestal: function () {
			var flags_in_background = this.$el.find('.flags_in_background');

			this.renderTemplate(flags_in_background, 'flags_in_background', {
				flag_1_url: this.controller.getFlagForAlliance(0),
				flag_2_url: this.controller.getFlagForAlliance(1),
				flag_3_url: this.controller.getFlagForAlliance(2),
				flag_1_color: this.controller.getFlagColorForAlliance(0),
				flag_2_color: this.controller.getFlagColorForAlliance(1),
				flag_3_color: this.controller.getFlagColorForAlliance(2)
			});
		},

		registerAllianceLinks: function () {
			AllianceLinkHelper.registerOpenAllianceProfileClick(this.$el.find('table tbody'));
		},

		render: function () {
			this.renderTemplate(this.$el, 'ranking', {
				l10n: this.l10n
			});
			this.renderWinnerPedestal();
			this.controller.registerRanking();
			this.registerAllianceLinks();
			this.registerFlagTooltips();
		}
	});
});
