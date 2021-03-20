define('features/ui_highlights/views/highlights', function () {
    'use strict';

    var GameViews = require_legacy('GameViews');

    return GameViews.BaseView.extend({
        initialize: function () {
            GameViews.BaseView.prototype.initialize.apply(this, arguments);

            this.highlights_collection = this.controller.getHighlightsCollection();
        },
        
        render: function () {
            this.highlights_collection.forEach(this.renderHightlight.bind(this));
        },

        renderHightlight: function (model) {
            var $highlight = this.$el.find('.ui_highlight[data-type="' + model.getType() + '"][data-subtype="' + model.getSubtype() + '"]');

            $highlight.hide();
            $highlight.show().addClass('fade_and_blink').delay(2000).hide(0, function() {
                    $highlight.removeClass('fade_and_blink');
                });
            this.controller.removeHighlight(model);
        }
    });
});