define('features/ui_highlights/models/highlight', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var Highlight = GrepolisModel.extend({
        urlRoot: 'Highlight'
    });

    GrepolisModel.addAttributeReader(Highlight.prototype,
        'type',
        'subtype'
    );

    window.GameModels.Highlight = Highlight;

    return Highlight;
});