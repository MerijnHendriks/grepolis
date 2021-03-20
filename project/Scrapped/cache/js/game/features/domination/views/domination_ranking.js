// Domination ranking tab view
define('features/domination/views/domination_ranking', function () {
    'use strict';

    var BaseView = window.GameViews.BaseView,
        DOMINATION_ERAS = require('enums/domination_eras'),
        Timestamp = require('misc/timestamp'),
        Game = require_legacy('Game'),
        AllianceLinkHelper = require('helpers/alliance_link'),

        DominationRankingView = BaseView.extend({
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.l10n = this.controller.getl10n();
                this.render();
            },

            registerFlagTooltips: function () {
                var number_of_flags = 3,
                    ranking_data = this.controller.getRankingData();
                for (var i = 0; i < number_of_flags; i++) {
                    if (ranking_data[i]) {
                        this.$el.find('.flag_' + (i+1)).tooltip(ranking_data[i].alliance_name);
                    }
                }
            },

            renderWinnerPedestal: function () {
                var winner_pedestal_wrapper = this.$el.find('.winner_pedestal_wrapper');

                this.renderTemplate(winner_pedestal_wrapper, 'winner_pedestal', {
                    flag_1_url: this.controller.getFlagForAlliance(0),
                    flag_2_url: this.controller.getFlagForAlliance(1),
                    flag_3_url: this.controller.getFlagForAlliance(2),
                    flag_1_color: this.controller.getFlagColorForAlliance(0),
                    flag_2_color: this.controller.getFlagColorForAlliance(1),
                    flag_3_color: this.controller.getFlagColorForAlliance(2)
                });
            },

            registerRankingWillChangeCountdown: function () {
                if (this.controller.getDominationEra() === DOMINATION_ERAS.POST_DOMINATION) {
                    return;
                }
                var value = Timestamp.now() - Game.world_start_timestamp,
                    max = this.controller.getNextCalculationTimestamp() - Game.world_start_timestamp;
                this.unregisterComponent('pg_progress_ranking_change_countdown');
                this.registerComponent('pg_progress_ranking_change_countdown', this.$el.find(".pg_ranking_change").countdown2({
                    value : max - value,
                    display : 'seconds_in_last48_hours_with_left_word'
                }));
                this.$el.find('.info_icon').tooltip(this.l10n.ranking.next_rank_update);
            },

            registerAllianceLinks: function () {
                AllianceLinkHelper.registerOpenAllianceProfileClick(this.$el.find('table tbody'));
            },

            render: function () {
                this.renderTemplate(this.$el, 'domination_ranking', {
                    l10n: this.l10n,
                    era: this.controller.getDominationEra()
                });
                this.renderWinnerPedestal();
                this.registerFlagTooltips();
                this.registerRankingWillChangeCountdown();
                this.controller.registerRanking();
                this.registerAllianceLinks();
            }
        });

    window.GameViews.DominationRankingView = DominationRankingView;

    return DominationRankingView;

});
