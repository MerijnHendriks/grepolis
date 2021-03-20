define('features/commands/collections/movements_revolts_defender', function(require) {
    'use strict';

    var Collection = require_legacy('GrepolisCollection');
    var Model = require('features/commands/models/movements_revolt_defender');

    var MovementsRevoltsDefender = Collection.extend({
        model : Model,
        model_class : 'MovementsRevoltDefender',

        initialize: function() {
        },

        getRevolts : function(isArising) {
            var isArisingRevolt = isArising || false;
            return this.filter(function (model) {
                return isArisingRevolt === model.isArising() && !model.isBeyond();
            });
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

    window.GameCollections.MovementsRevoltsDefender = MovementsRevoltsDefender;

    return MovementsRevoltsDefender;
});
