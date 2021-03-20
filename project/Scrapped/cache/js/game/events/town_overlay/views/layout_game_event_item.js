define('events/town_overlay/views/layout_game_event_item', function () {
    'use strict';
    var BaseView = window.GameViews.BaseView;

    var TownOverlayLayoutGameEventItemView = BaseView.extend({

        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);
            this.render();
        },

        render: function () {
            var l10n = this.controller.getl10n(),
                town_overlay = document.createElement('div');

            town_overlay.className = this.controller.getBenefitType() + ' ' + this.controller.getSkin();

            this.$el.html(town_overlay)
                .off('click')
                .on('click', this.controller.onClick.bind(this.controller))
                .tooltip(l10n.tooltip);
        }
    });

    window.GameViews.TownOverlayLayoutGameEventItemView = TownOverlayLayoutGameEventItemView;
    return TownOverlayLayoutGameEventItemView;
});