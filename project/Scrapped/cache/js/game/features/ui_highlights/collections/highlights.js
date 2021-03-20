define('features/ui_highlights/collections/highlights', function () {
    'use strict';

    var GrepolisCollection = require_legacy('GrepolisCollection');
    var LayoutHightlight = require('features/ui_highlights/models/highlight');

    var Highlights = GrepolisCollection.extend({
        model: LayoutHightlight,
        model_class: 'Highlight',

        onAddHighlight: function (obj, callback) {
            obj.listenTo(this, 'add', callback);
        }
    });

    window.GameCollections.Highlights = Highlights;

    return Highlights;
});