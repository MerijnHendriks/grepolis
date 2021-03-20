/* global Timestamp */

define('events/spawn/models/spawn_mission', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var SpawnMission = GrepolisModel.extend({
		urlRoot: 'SpawnMission',

        getReturnedUnits: function() {
            // backend returns null if no units survived
            return this.get('returned_units') || {};
        },

        isFinished: function() {
            // cosmetic - otherwise it would be 'getIsFinished'
            return this.get('is_finished');
        },

        gotStone: function() {
            return this.get('got_stone');
        },

        getTimeLeft: function() {
		    var end_at = this.get('end_at');

            if (this.isFinished()) {
                return 0;
            }
            return end_at ? end_at - Timestamp.now() : this.getCooldown();
        },

        /**
         * used by CollectionAutomaticFetchFactory / getNextInterval
         */
        getRealTimeLeft: function() {
            if (this.isRewardReady()) {
                return 0;
            }
            return this.getTimeLeft();
        },

        isRunning: function() {
            return this.get('end_at') > 0 || this.isFinished();
        },

        isRewardReady: function() {
            return this.isRunning() && this.getTimeLeft() <= 0;
        }
	});

	GrepolisModel.addAttributeReader(SpawnMission.prototype,
		'mission_id',
		'needed_units', // {'slinger': 10}
		'resources_amount',
		'favor',
		'cooldown',
		'chance_stone',
		'chance_die',
		'end_at', // null if mission not running
		'is_finished',
		'returned_units',
		'got_stone',
		'town_id'
	);

	window.GameModels.SpawnMission = SpawnMission;
	return SpawnMission;
});



