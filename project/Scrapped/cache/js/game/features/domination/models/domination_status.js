define('features/domination/models/domination_status', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var DominationStatus = GrepolisModel.extend({
        urlRoot: 'DominationStatus',

        getOwnedCities: function() {
            return this.get('world_statistics').owned_cities;
        },

        getUnownedCities: function () {
            return this.getTotalCities() - this.getOwnedCities();
        },

        getTotalCities: function () {
            return this.get('world_statistics').total_cities;
        },

        getAllianceData: function (alliance_id) {
            var alliance_ranking = this.get('alliance_ranking');
            return alliance_ranking.find(function (ranking_data) {
                return ranking_data.id === alliance_id;
            });
        },

        getDominationEra: function () {
            return this.get('status').era;
        },

        getNextCalculationTimestamp: function () {
            return this.get('status').next_calculation_timestamp;
        },

        getCurrentGoal: function() {
            return this.get('status').current_goal;
        },

        getWinningAllianceId: function () {
            return this.get('status').winning_alliance_id;
        },

        getShutdownTimestamp: function () {
            return this.get('status').shutdown_timestamp;
        },

        onStatusChange: function (obj, callback) {
            obj.listenTo(this, 'change:status', callback);
        }
    });

    GrepolisModel.addAttributeReader(DominationStatus.prototype,
        'status',
        'world_statistics',
        'alliance_ranking'
    );

    window.GameModels.DominationStatus = DominationStatus;

    return DominationStatus;
});
