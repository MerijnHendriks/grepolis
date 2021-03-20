define('features/grepolis_score/views/world_points', function(require) {
    'use strict';

    var Views = require_legacy('GameViews');

    return Views.BaseView.extend({
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            // we first load a placeholder template that shows a loader and gives the correct height to the sub-window,
            // in order to prevent positioning problems of the sub-window system
            this.renderTemplate(this.$el, 'world_points_sizer', {});

            this.grepo_score = this.controller.getModel('score_worlds');

            // the final template is loaded upon retrieval of the world scores from backend
            // this.grepo_score.getScoreForPlayersWorlds().then(this.render.bind(this));
            this.render();
        },

        render : function() {
            this.renderTemplate(this.$el, 'world_points', {
                l10n : this.l10n,
                worlds: this.controller.getWorldScores()
            });
            this.registerScrollbar();
            this.registerTooltips();
        },

        registerScrollbar: function() {
            this.controller.unregisterComponent('world_scrollbar');
            this.controller.registerComponent('world_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: this.$el.find('.js-scrollbar-content'),
                element_viewport: this.$el.find('.js-scrollbar-viewport'),
                scroll_position: 0,
                min_slider_size : 16
            }));
        },

        registerTooltips: function() {
            this.$el.find('.world_score_tooltip_area').tooltip(this.l10n.tooltip_one_world_score);
            this.$el.find('.world_icon').tooltip(this.l10n.tooltip_world_score);
        }
    });
});
