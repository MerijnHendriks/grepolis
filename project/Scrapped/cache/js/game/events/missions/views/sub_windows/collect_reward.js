define('events/missions/views/sub_windows/collect_reward', function (require) {
    'use strict';

    var Views = require_legacy('GameViews'),
        ContextMenuHelper = require('helpers/context_menu');

    return Views.BaseView.extend({
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.skin = options.skin;
            this.render();
        },

        render: function () {
            this.renderTemplate(this.$el, 'collect_reward', {
                l10n: this.l10n,
                skin: this.skin
            });

            this.registerCurrentReward();
        },

        registerCurrentReward: function () {
            var $rwd = this.$el.find('.rwd_reward');

            this.unregisterComponent('rwd_reward');
            this.registerComponent('rwd_reward', $rwd.reward({
                reward: this.controller.getCurrentReward(),
                disabled: false,
                size: 86
            }).on('rwd:click', function (event, reward, position) {
                ContextMenuHelper.showRewardContextMenu(event, reward, position);
            }.bind(this)));
        }

    });
});
