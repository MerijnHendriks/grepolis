/*globals Game, HelperABSolution*/

define('events/missions/views/collection', function () {
    'use strict';

    var View = window.GameViews.BaseView,
        Timestamp = require('misc/timestamp'),
        NotificationLoader = require('notifications/notification_loader'),
        SCREEN_STATE = require('events/missions/enums/mission_states'),
        ANIMATIONS = require('events/missions/enums/animations'),
        ANIMATION_LENGTH = 3500;

    return View.extend({
        initialize: function (options) {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function () {
            var next_level = this.controller.getLevel() + 1,
                max_level = this.controller.getMaxLevel();

            this.state = this.controller.getScreenState();
            this.animation_data = this.controller.getAnimationData();

            this.renderTemplate(this.$el, 'collection', {
                l10n: this.l10n,
                skin: this.controller.getMissionsSkin(),
                has_cooldown: this.animation_data[ANIMATIONS.HIDE_COOLDOWN_BOX] || this.state === SCREEN_STATE.COOLDOWN,
                has_collect_reward: this.state === SCREEN_STATE.COLLECT_REWARD,
                sub_level: this.controller.getSubLevel(),
                max_sub_level: this.controller.getMaxSubLevel(),
                fade_step: this.animation_data[ANIMATIONS.FADE_STEP] || false,
                reward_level_progress: this.getRewardLevelProgress(next_level, max_level)
            });

            this.registerRewardBox();
            this.registerRankingBox();
            this.registerRankingRewards();
            this.registerCooldownProgressbar();
            this.registerCountdown();
            this.registerCollectRewardButton();
            this.controller.enableDisableTabs();
            this.hideCooldownBox();
            this.fadeStep();
            this.showAddPoints();
        },

        reRender: function () {
            this.render();
        },

        registerRewardBox: function () {
            this.registerCurrentReward();
            this.registerShowMoreButton();
            this.registerSkipCooldownButton();
        },

        registerCurrentReward: function () {
            this.unregisterComponent('rwd_next_reward');
            this.registerComponent('rwd_next_reward', this.$el.find('.next_reward').reward({
                reward: this.controller.getCurrentReward(),
                disabled: false,
                size: 60
            }));
        },

        registerShowMoreButton: function () {
            this.unregisterComponent('btn_show_more');
            this.registerComponent('btn_show_more', this.$el.find('.btn_show_more').button({
                caption: this.l10n.reward_box.show_more
            }).on('btn:click', function () {
                this.controller.openRewardsListSubwindow();
            }.bind(this)));
        },

        registerCollectRewardButton: function () {
            this.unregisterComponent('btn_collect_reward');
            this.registerComponent('btn_collect_reward', this.$el.find('.btn_collect_reward').button({
                caption: this.l10n.collect_reward,
                tooltips: [{title: this.l10n.tooltips.collect_reward_button}]
            }).on('btn:click', function () {
                this.controller.collectReward();
            }.bind(this)));
        },

        registerCooldownProgressbar: function () {
            this.unregisterComponent('pg_cooldown');
            this.registerComponent('pg_cooldown', this.$el.find('.pg_cooldown').singleProgressbar({
                value: this.controller.getCooldownTime() - Timestamp.now(),
                max: this.controller.getCooldownDuration(),
                type: 'time',
                countdown: true,
                countdown_settings: {
                    display_days: true,
                    timestamp_end: this.controller.getCooldownTime()
                },
                liveprogress: true,
                liveprogress_interval: 1,
                template: 'tpl_pb_single'
            }).on("pb:cd:finish", function () {
                this.controller.setHideCooldownBoxAnimation();
                NotificationLoader.resetNotificationRequestTimeout(100);
            }.bind(this)));
        },

        registerSkipCooldownButton: function () {
            this.unregisterComponent('btn_skip_cooldown');
            this.registerComponent('btn_skip_cooldown', this.$el.find('.btn_skip_cooldown').button({
                caption: this.l10n.skip_cooldown(this.controller.getSkipCooldownCost()),
                icon: true,
                icon_type: 'gold',
                icon_position: 'right',
                tooltips: [{title: this.l10n.tooltips.skip_cooldown_button(this.controller.getSkipCooldownCost())}]
            }).on('btn:click', function () {
                this.controller.skipLevelUpCooldown(this.hideCooldownBox.bind(this));
            }.bind(this)));
        },

        /*
         * Initialize Event Countdown
         */
        registerCountdown: function () {
            this.unregisterComponent('countdown');
            this.registerComponent('countdown', this.$el.find('.countdown_box .middle').countdown2({
                value : this.controller.getEventEndAt() - Timestamp.now(),
                display : 'event',
                tooltip : {title: this.l10n.tooltips.event_timer_tooltip}
            }));

            this.controller.unregisterComponent('btn_info_overlay');
            this.controller.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
                template : 'internal',
                tooltips: [
                    {title: this.l10n.tooltips.event_info_btn}
                ]
            }).on('btn:click', function() {
                var MissionTutorial = require('events/missions/helpers/tutorial'),
                    controller = this.controller;

                MissionTutorial.showTutorial(controller, controller.enableDisableTabs.bind(controller));
            }.bind(this)));
        },

        registerRankingBox: function() {
            this.renderDailyRanking();
            this.registerRankingCooldown();
            this.registerRankingInfoButton();
        },

        registerRankingRewards: function() {
            this.renderRankingRewards();
            this.registerRewardComponents();
        },

        renderRankingRewards: function() {
            var $ranking_reward_box = this.$el.find('.ranking_reward_box');
            $ranking_reward_box.html('');

            this.renderTemplate($ranking_reward_box, 'ranking_rewards', {
                l10n : this.l10n
            });
        },

        registerRewardComponents: function () {
            var rewards = this.controller.getOverallRankingRewards();

            for (var i = 0; i <= 2; i++) {
                var reward_id = 'ranking_reward_' + rewards[i].rank;

                rewards[i].rewards.forEach(this.registerReward.bind(this, reward_id));

                if (i === 0) {
                    this.$el.find('.' + reward_id + ' .reward').addClass('show_glow');
                }
            }
        },

        registerReward: function (reward_id, reward, index) {
            var component_id = reward_id + '_' + index,
                selector = '.' + reward_id + ' .reward[data-index="' + index + '"]';

            this.unregisterComponent(component_id);
            this.registerComponent(component_id, this.$el.find(selector).reward({
                reward: reward.reward,
                disabled: false,
                amount: reward.reward.power_id === 'instant_gold' ? reward.reward.configuration.amount : reward.amount
            }));
        },

        renderDailyRanking: function() {
            var $ranking_box = this.$el.find('.ranking_box'),
                players = this.controller.getOverallRankingPlayers();

            $ranking_box.html('');

            this.renderTemplate($ranking_box, 'ranking', {
                l10n : this.l10n,
                players: players,
                current_player_id: Game.player_id,
                ranking_enabled : this.controller.isRankingEnabled(),
                evaluation_active : this.controller.isEvaluationActive()
            });

            $ranking_box.find('.list_players tr.js-player-entry').each(function(idx, el) {
                var $el= $(el),
                    player_name = $el.data('player_name');

                $el.tooltip(player_name);
            });
        },

        registerRankingCooldown: function() {
            this.unregisterComponent('ranking_countdown');

            if (!this.controller.isEvaluationActive()) {
                this.registerComponent('ranking_countdown', this.$el.find('.ranking_cooldown').countdown2({
                    display: 'day_hr_min_sec',
                    timestamp_end: this.controller.getOverallRankingEndTimestamp()
                }).on('cd:finish', function () {
                    this.controller.startEvaluation();
                }.bind(this)));
            }
        },

        registerRankingInfoButton : function() {
            this.$el.find('.btn_ranking_info').click(this.controller.openOverallRankingSubWindow.bind(this.controller))
                .tooltip(this.l10n.ranking_box.btn_ranking_info_tooltip);
        },

        fadeStep: function () {
            var $fade = this.$el.find('.collection_box_fade');

            if (this.animation_data[ANIMATIONS.FADE_STEP]) {
                $fade.addClass('blink').fadeOut(ANIMATION_LENGTH, this.showCollectRewardBox.bind(this));
            }
        },

        showCollectRewardBox: function () {
            var $close_container_box = this.$el.find('.close_container_box'),
                $glow = $close_container_box.find('.glow');

            if (this.animation_data[ANIMATIONS.SHOW_COLLECT_REWARD_BOX]) {
                $glow.hide();

                $close_container_box.slideToggle(ANIMATION_LENGTH, function () {
                    $glow.show();
                }.bind(this));
            }
        },

        hideCooldownBox: function () {
            if (this.animation_data[ANIMATIONS.HIDE_COOLDOWN_BOX]) {
                this.$el.find('.cooldown_box').slideToggle(ANIMATION_LENGTH);
            }
        },

        showAddPoints: function () {
            if (this.animation_data[ANIMATIONS.ADD_POINTS]) {
                this.animation_data[ANIMATIONS.ADD_POINTS].forEach(function (reward) {
                    this.$el.find('.rewards_fade.reward_' + reward.name + ' .text').text(reward.amount);
                }.bind(this));

                $('.rewards_fade').show().delay(1500).fadeOut(500);
            }
        },

        getRewardLevelProgress: function (next_level, max_level) {
            if (next_level <= max_level) {
                return "(" + next_level + "/" + max_level + ")";
            }

            return "(" + next_level + ")";
        }
    });
});

