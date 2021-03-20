/* globals GameEvents */

define('events/missions/views/sub_windows/rewards_list', function (require) {
    'use strict';

    var Views = require_legacy('GameViews');
    var ContextMenuHelper = require('helpers/context_menu');

    return Views.BaseView.extend({
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.skin = options.skin;
            this.EXTRA_REWARD = 'extra_reward';
            this.render();
        },

        render: function () {
            var rewards = this.controller.getRewards();

            this.renderTemplate(this.$el, 'rewards_list', {
                l10n: this.l10n,
                skin: this.skin
            });

            this.$list_el = this.$el.find('.reward_list_container');
            this.$list_el.empty();

            rewards.forEach(this.appendReward.bind(this));
            this.appendReward(null, rewards.length);

            this.unregisterComponents(this.sub_context);
            this.registerScrollbar();
            this.registerRewards();
        },

        scrollToPosition: function () {
            var current_level = this.controller.getCurrentLevel(),
                $elements_to_scroll = this.$el.find('.reward_list .reward_list_container'),
                $child = $($elements_to_scroll.children()[current_level]);
            if ($child.position()) {
                this.getComponent('sb_rewards_list').scrollTo($child.position().top, true);
            }
        },

        registerScrollbar: function () {
            this.registerComponent('sb_rewards_list', this.$el.find('.reward_list').skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: this.$el.find('.reward_list .js-scrollbar-content'),
                element_viewport: this.$el.find('.reward_list.js-scrollbar-viewport'),
                scroll_position: 0,
                min_slider_size: 16,
                hide_when_nothing_to_scroll: false
            }), this.sub_context);

            this.scrollToPosition();
        },

        registerRewards: function () {
            this.$list_el.find('.reward').each(function (idx, el) {
                var $el = $(el),
                    id = $el.data('reward_id'),
                    active = this.controller.isRewardClaimed(id) || !this.controller.isRewardAvailable(id);

                if (id === this.EXTRA_REWARD) {
                    return;
                }

                this.registerComponent('rwd_reward_' + id, $el.reward({
                    reward: this.controller.getRewardForLevel(id),
                    disabled: active,
                    size: 60
                }).on('rwd:click', function (event, reward, position) {
                    ContextMenuHelper.showContextMenu(event, position, {
                        data: {
                            event_group: GameEvents.active_happening.reward,
                            data: reward,
                            id: reward.data('reward_id')
                        }
                    });
                }));
            }.bind(this));
        },

        appendReward: function (reward, idx) {
            var level_id,
                is_new = false,
                is_claimed = false,
                is_current = false,
                is_available = false;

            if (!reward) {
                level_id = this.EXTRA_REWARD;

                if (this.controller.getCurrentLevel() >= 40) {
                    is_available = true;
                }
            }
            else {
                level_id = reward.level_id;
                is_new = this.controller.isRewardNew(level_id);
                is_claimed = this.controller.isRewardClaimed(level_id);
                is_current = this.controller.isCurrentReward(level_id);
                is_available = this.controller.isRewardAvailable(level_id);
            }

            this.$list_el.append(this.getTemplate('rewards_list_reward', {
                l10n: this.l10n,
                list_idx: idx,
                reward_id: level_id,
                is_new: is_new,
                is_claimed: is_claimed,
                is_current: is_current,
                is_available: is_available
            }));
        }
    });
});
