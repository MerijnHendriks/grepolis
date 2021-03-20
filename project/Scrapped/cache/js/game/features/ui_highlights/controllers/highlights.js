define('features/ui_highlights/controllers/highlights', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var View = require('features/ui_highlights/views/highlights');

    return GameControllers.BaseController.extend({
        initialize: function (options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);

            this.collection = this.getCollection('highlights');
            this.renderPage();
        },

        renderPage: function () {
            this.view = new View({
                controller : this,
                el : this.$el
            });

            this.registerEventListeners();
        },

        registerEventListeners: function () {
            this.collection.stopListening(this.collection);
            this.collection.onAddHighlight(this, this.view.render.bind(this.view));
        },

        getHighlightsCollection: function () {
            return this.collection;
        },

        removeHighlight: function(model) {
            this.collection.remove(model);
            if (model) {
                model.unregisterFromModelManager();
            }
        }
    });
});