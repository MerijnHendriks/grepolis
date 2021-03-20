define('features/skip_tutorial/views/skip_tutorial', function () {
    'use strict';

    var GameViews = require_legacy('GameViews');

    return GameViews.BaseView.extend({
        initialize: function () {
            GameViews.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.render();
        },

        registerViewComponents: function() {
            this.unregisterComponent('skip_tutorial_button');
            this.registerComponent('skip_tutorial_button', this.$el.find('.skip_tutorial_button').button({
                caption: this.l10n.button_caption,
                tooltips: [
                    {title: this.l10n.button_tooltip}
                ]
            }).on('btn:click', function() {
                this.controller.disableGuidedTutorialArrows();
            }.bind(this)));

            this.toggleSkipTutorialButton(false);
        },
        
        render: function () {
            this.registerViewComponents();
        },

        toggleSkipTutorialButton: function (hide) {
            if (this.$el.is(':visible') === hide && this.controller.canShowButton()) {
                this.$el.slideToggle(1000);
            }
        }
    });
});