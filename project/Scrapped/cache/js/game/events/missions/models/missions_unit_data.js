define('events/missions/models/missions_units_data', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var MissionsUnitData = GrepolisModel.extend({
        urlRoot: 'MissionsUnitData',

        getUnits: function () {
            return this.get('units');
        }
    });

    window.GameModels.MissionsUnitData = MissionsUnitData;

    return MissionsUnitData;
});