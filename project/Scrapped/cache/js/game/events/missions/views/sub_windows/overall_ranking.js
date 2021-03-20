define('events/missions/views/sub_windows/overall_ranking', function() {
    'use strict';

    var Views = require_legacy('GameViews');
    var TooltipFactory = require('factories/tooltip_factory');

    return Views.BaseView.extend({
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.skin = options.skin;
            this.render();
        },

        render: function () {
            this.renderTemplate(this.$el, 'overall_ranking', {
                l10n: this.l10n,
                skin: this.skin
            });

            this.registerRewardComponents();
            this.registerAwards();
            this.registerScrollbar();
        },

        registerRewardComponents: function() {
            var rewards = this.controller.getOverallRankingRewards(),
                $ranking_place = this.$el.find('.ranking_place'),
                $caption,
                rank = '';

            for (var key in rewards) {
                if (!rewards.hasOwnProperty(key)) {
                    continue;
                }

                rank = rewards[key].rank;

                $caption = $ranking_place.filter('[data-rank="' + rank + '"]').find('.caption');
                $caption.text(rank);

                rewards[key].rewards.forEach(this.registerReward.bind(this, rank));
            }
        },

        registerReward: function (rank, reward_data, index) {
            var reward_id = 'ranking_place_' + rank + '_' + index,
                $rewards = this.$el.find('.ranking_place[data-rank="' + rank + '"] .rewards'),
                $reward = document.createElement('div'),
                reward = reward_data.reward;

            $reward = $($reward);
			$reward.addClass('reward');
            $rewards.append($reward);

            this.unregisterComponent(reward_id);
            this.registerComponent(reward_id, $reward.reward({
                reward: reward,
                disabled: false,
                amount: reward.power_id === 'instant_gold' ? reward.configuration.amount : reward_data.amount
            }));
        },

        registerAwards: function() {
            var awards = this.controller.getOverallRankingAwards();

            for (var key in awards) {
                if (!awards.hasOwnProperty(key)) {
                    continue;
                }

                var ranking_place_id = 'ranking_place[data-rank="' + key + '"]';
                var $award = this.$el.find('.' + ranking_place_id + ' .award');
                $award.addClass(awards[key]);
                $award.tooltip(TooltipFactory.getAwardTooltip(awards[key]));
            }
        },

        registerScrollbar: function () {
            var $overall_ranking = this.$el.find('.missions_overall_ranking'),
                $overall_ranking_wrapper = $overall_ranking.find('.overall_ranking_wrapper');

            this.unregisterComponent('overall_ranking_scrollbar');
            this.controller.registerComponent('overall_ranking_scrollbar', $overall_ranking.skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: $overall_ranking_wrapper,
                element_viewport: $overall_ranking,
                scroll_position: 0,
                min_slider_size : 16
            }));
        }
    });
});