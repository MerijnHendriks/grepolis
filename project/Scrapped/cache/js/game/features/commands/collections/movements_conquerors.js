define('features/commands/collections/movements_conquerors', function(require) {
    'use strict';

    var Collection = require_legacy('GrepolisCollection');
    var Model = require('features/commands/models/movements_conqueror');

    var MovementsConquerors = Collection.extend({
        model : Model,
        model_class : 'MovementsConqueror',

        initialize: function() {
        },

        onAdd : function(obj, callback) {
            obj.listenTo(this, 'add', callback);
        },

        onRemove : function(obj, callback) {
            obj.listenTo(this, 'remove', callback);
        },

        onChange : function(obj, callback) {
            obj.listenTo(this, 'change', callback);
        }
    });

    window.GameCollections.MovementsConquerors = MovementsConquerors;

    return MovementsConquerors;

});
