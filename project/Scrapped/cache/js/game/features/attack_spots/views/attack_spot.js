define('features/attack_spots/views/attack_spot', function(require) {
    'use strict';

    var Views = require_legacy('GameViews');
    var GameDataPowers = require('data/powers');
    var AttackSpotHelper = require('features/attack_spots/helpers/attack_spot_helper');

    return Views.BaseView.extend({
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.render();
        },

        render : function() {
            this.renderTemplate(this.$el, 'index', {
                l10n : this.l10n,
                reward_title : this.l10n.reward_title,
                reward_bp: this.controller.getRewardBP(),
                rewards: this.controller.getRewards(),
                npc_units : this.controller.getNPCUnitsAndData(),
                has_cooldown : this.controller.hasCooldown(),
                wrong_island : AttackSpotHelper.isAttackSpotOnWrongIsland(),
                show_laurels: !this.controller.hideLaurelsIfNoHeroInTown()
            });

            this.registerViewComponents();
            this.registerRewards();
        },

        reRender : function() {
            this.render();
        },

        registerViewComponents: function() {
            var attack_btn = this.$el.find('.btn_attack');
            this.unregisterComponents();

            this.registerComponent('btn_attack', attack_btn.button({
                caption: this.l10n.attack,
                disabled: true,
                state: true,
                tooltips: [
                    { title: '' },
                    { title: this.l10n.tooltips.select_units }
                ]
            }).on('btn:click', function(event, button) {
                this.controller.simulateAttack();
            }.bind(this)));

            var max_time = this.controller.getCooldownDuration();
            var cooldown_at = this.controller.getCooldownAt();

            this.registerComponent('cooldown_progressbar', this.$el.find('.cooldown_progressbar').singleProgressbar({
                template: 'tpl_pb_single_nomax_bg',
                type: 'time',
                reverse_progress : true,
                liveprogress: true,
                liveprogress_interval : 1,
                value: max_time,
                max: max_time,
                countdown : true,
                countdown_settings : {
                    timestamp_end : cooldown_at
                }
            }).on('pb:cd:finish', function() {
                this.controller.renderPage();
            }.bind(this)));
        },

        registerRewards : function() {
            var rewards = this.controller.getRewards();
            this.unregisterComponents('rewards');

            us.each(rewards, function(reward, idx) {
                var $reward = this.$el.find('.reward.' + GameDataPowers.getCssPowerId(reward));

                this.registerComponent('reward_' + idx, $reward.reward({
                    reward: reward
                }), 'rewards');

            }.bind(this));

            this.$el.find('.reward_bp').tooltip(this.l10n.tooltips.reward_bp);
        }
    });
});
