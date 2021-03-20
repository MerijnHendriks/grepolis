/* globals TM, WM */

define('events/town_overlay/controllers/layout_game_event_item', function (require) {
    'use strict';

    var BaseController = window.GameControllers.BaseController;
    var TownOverlayLayoutGameEventItemView = require('events/town_overlay/views/layout_game_event_item');
    var TownOverlayWindowFactory = require('events/town_overlay/factories/town_overlay');
    var windows = require('game/windows/ids');

    var TownOverlayGameEventItemController = BaseController.extend({
        view: null,

        initialize: function (options) {
            //Don't remove it, it should call its parent
            BaseController.prototype.initialize.apply(this, arguments);
            this.benefit = this.options.benefit;
        },

        renderPage: function () {
            this.view = new TownOverlayLayoutGameEventItemView({
                el: this.$el,
                controller: this
            });

            this.registerTimer();

            return this;
        },

        registerTimer: function () {
            TM.once('TownOverlayGameEventItem', this.getTimeLeft(), function () {
                WM.closeWindowsByType(windows.TOWN_OVERLAY);
            });
        },

        getSkin: function () {
            return this.benefit.getParam('skin');
        },

        getBenefitType: function () {
            return this.benefit.getBenefitType();
        },

        getTimeLeft: function () {
            return this.benefit.secondsTillEnd() * 1000;
        },

        onClick: function () {
            TownOverlayWindowFactory.openWindow();
        }
    });

    window.GameControllers.TownOverlayGameEventItemController = TownOverlayGameEventItemController;
    return TownOverlayGameEventItemController;
});