define('events/missions/models/missions_player_army', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var MissionsPlayerArmy = GrepolisModel.extend({
        urlRoot: 'MissionsPlayerArmy',

        hasUnit: function (unit_type) {
            return typeof this.getUnits()[unit_type] !== 'undefined';
        },

        buyUnits: function (unit_type, estimated_cost, callback) {
            this.execute('buyUnits', {
                estimated_cost: estimated_cost,
                unit_id: unit_type
            }, callback);
        },

        onUnitsChange: function (obj, callback) {
            obj.listenTo(this, 'change:units', callback);
        },

        offUnitsChange: function (obj, callback) {
            obj.stopListening(this, 'change:units', callback);
        },

        onUnitPacksCollectedCountChange: function (obj, callback) {
            obj.listenTo(this, 'change:unit_packs_collected_count', callback);
        }
    });

    GrepolisModel.addAttributeReader(MissionsPlayerArmy.prototype,
        'id',
        'unit_packs_collected',
        'unit_packs_collected_count',
        'units'
    );

    window.GameModels.MissionsPlayerArmy = MissionsPlayerArmy;

    return MissionsPlayerArmy;
});