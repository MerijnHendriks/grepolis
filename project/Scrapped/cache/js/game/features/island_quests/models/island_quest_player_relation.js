define('features/island_quests/models/island_quest_player_relation', function(require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var IslandQuestPlayerRelation = GrepolisModel.extend({
        urlRoot : 'IslandQuestPlayerRelation'
    });

    GrepolisModel.addAttributeReader(IslandQuestPlayerRelation.prototype,
        'id',
        'progressables_id',
        'island_x',
        'island_y',
        'created_at',
        'accepted_at',
        'finished_at',
        'last_hit'
    );

    // this is needed for the model manager to discover this model
    window.GameModels.IslandQuestPlayerRelation = IslandQuestPlayerRelation;

    return IslandQuestPlayerRelation;
});