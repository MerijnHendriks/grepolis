/* global TM */

define('events/turn_over_tokens/views/sub_windows/new_targets_animation_assassins', function(require) {
    'use strict';

    var View = window.GameViews.BaseView;

    var SubWindowNewTargetsAnimationAssassinsView = View.extend({
        initialize: function (options) {
            View.prototype.initialize.apply(this, arguments);

            this.l10n = this.controller.getl10n();
            this.render();
        },

        render : function() {
            this.renderTemplate(this.$el, 'sub_window_all_units_dead_animation', {l10n : this.l10n});
            this.startAnimation();
        },

        startAnimation: function() {
            this.$el.find('.arrow')
                .transition({
                    opacity : 0,
                    x : 758,
                    y : -187,
                    rotate: -25
                })
                .transition({
                    opacity : 1,
                    x : 290,
                    y : 36,
                    rotate: -25
                }, 800);

            this.$el.find('.middle').transition({
                width : 200
            }, 800, function () {
                this.showMainAnimationText();
                TM.unregister('show_reset_animation_text');
                TM.register('show_reset_animation_text', 300, this.showText.bind(this), {max : 1});
            }.bind(this));

        },

        showMainAnimationText : function() {
            this.$el.find('.paper_main_text').css({opacity: 1});
        },

        showText: function () {
            TM.unregister('show_reset_animation_text');
            this.$el.find('.paper_text').css({opacity: 1});
            TM.unregister('closing_reset_animation');
            TM.register('closing_reset_animation', 1200, function() {
                this.controller.closeMe();
                TM.unregister('closing_reset_animation');
            }.bind(this), {max : 1});
        },

        destroy : function() {

        }
    });

    return SubWindowNewTargetsAnimationAssassinsView;
});
