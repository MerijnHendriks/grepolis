/*global window*/

define('events/missions/collections/missions', function (require) {
    'use strict';

    var Collection = window.GrepolisCollection;
    var Mission = require('events/missions/models/mission');

    var Missions = Collection.extend({
        model: Mission,
        model_class: 'Mission',

        getMissions: function () {
            // Sort collection so the mission with the lower sort order is always on top
            // This is needed because when we swap the mission the order can be changed. To fix this we
            // implemented the sort order
            return this.models.sort(function(first_mission, second_mission) {
                return first_mission.getSortOrder() - second_mission.getSortOrder();
            });
        },

        getNewMission: function(mission_id, mission_swap_price, callback) {
            this.execute('newMission', {
                'mission_id': mission_id,
                'estimated_cost': mission_swap_price
            }, callback);
        },

        onMissionAddRemove: function (obj, callback) {
            obj.listenTo(this, 'add remove', callback);
        },

        startMission: function (mission_id, units, callback) {
            this.execute('startMission', {
                'mission_id': mission_id,
                'params': units
            }, callback);
        },

        boostMission: function (mission_id, estimated_cost, callback) {
            this.execute('boostMissionSpeed', {
                'mission_id': mission_id,
                'estimated_cost': estimated_cost
            }, callback);
        },

        isMissionRunning: function () {
            return this.length === 1;
        }
    });

    window.GameCollections.Missions = Missions;
    us.extend(window.GameCollections.Missions.prototype, window.GrepolisCollectionAutomaticFetch);

    return Missions;
});