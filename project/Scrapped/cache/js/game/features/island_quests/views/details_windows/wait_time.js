/*global us, Timestamp */

define('features/island_quests/views/details_windows/wait_time', function () {
    'use strict';

    var DetailsWindow = require('features/island_quests/views/details_windows/details_window');
    var NotificationLoader = require('notifications/notification_loader');

    return DetailsWindow.extend({
        sub_context: 'bear_effect',

        initialize: function () {
            DetailsWindow.prototype.initialize.apply(this, arguments);

            this.registerEventListeners();
        },

        render: function ($content_node) {
            this.$el = $content_node;

            this.$el.html(us.template(this.controller.getTemplate('wnd_wait_time'), {
                l10n: this.l10n,
                decision: this.decision
            }));

            this.registerViewComponents();

            return this;
        },

        registerViewComponents: function () {
            var $el = this.$el,
                total_time = this.decision.getConfiguration().time_to_wait;

            var current = this.decision.getProgress().wait_till - Timestamp.now();

            this.controller.registerComponent('pb_wait_time', $el.find('.pb_wait_time').singleProgressbar({
                value: current,
                max: total_time,
                real_max: total_time,
                liveprogress: true,
                reverse_progress: true,
                type: 'time',
                countdown: true,
                template: 'tpl_pb_single_nomax'
            }).on('pb:cd:finish', function () {
                NotificationLoader.resetNotificationRequestTimeout(100);
            }), this.sub_context);
        },

        destroy: function () {
            DetailsWindow.prototype.destroy.apply(this, arguments);

            this.controller.unregisterComponents(this.sub_context);
        }
    });
});