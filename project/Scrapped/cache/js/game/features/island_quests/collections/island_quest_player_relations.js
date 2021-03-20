define('features/island_quests/collections/island_quest_player_relations', function(require) {
    'use strict';

    var Collection = require_legacy('GrepolisCollection');
    var Model = require('features/island_quests/models/island_quest_player_relation');

    var IslandQuestPlayerRelations = Collection.extend({
        model : Model,
        model_class : 'IslandQuestPlayerRelation',

        getQuest : function(id) {
            return this.get(id);
        },

        onQuestChange: function(obj, callback) {
            obj.listenTo(this, 'change', callback);
        },

        getActiveQuestsCount : function() {
            return this.filter(function(model) {
                return model.getProgressablesId() !== null;
            }).length;
        }
    });

    // this is needed for the model manager to discover this collection
    window.GameCollections.IslandQuestPlayerRelations = IslandQuestPlayerRelations;

    return IslandQuestPlayerRelations;
});