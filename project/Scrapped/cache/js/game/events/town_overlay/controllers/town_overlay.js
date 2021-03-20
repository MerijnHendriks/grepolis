define('events/town_overlay/controllers/town_overlay', function (require) {
    'use strict';

    var TabController = window.GameControllers.TabController;
    var TownOverlayView = require('events/town_overlay/views/town_overlay');

    var TownOverlayController = TabController.extend({
        view: null,

        initialize: function (options) {
            //Don't remove it, it should call its parent
            TabController.prototype.initialize.apply(this, arguments);
        },

        renderPage: function () {
            this.view = new TownOverlayView({
                el: this.$el,
                controller: this
            });

            return this;
        },

		getWindowSkin : function() {
			var window_model_arguments = this.getWindowModel().getArguments();
			return window_model_arguments.window_skin ? window_model_arguments.window_skin : '';
		}
    });

    window.GameControllers.TownOverlayController = TownOverlayController;
    return TownOverlayController;
});