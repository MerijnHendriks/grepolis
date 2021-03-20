/* globals Promise */

define('events/spawn/collections/spawn_missions', function(require) {
	'use strict';

    var GrepolisCollection = require_legacy('GrepolisCollection');
	var SpawnMission = require('events/spawn/models/spawn_mission');

	var SpawnMissions = GrepolisCollection.extend({ // never use this, because it will be overwritten
        model: SpawnMission,
        model_class: 'SpawnMission',

		getMissions: function () {
			return this.models;
		},

		getMission: function (mission_id) {
			return this.find(function (model) {
				return model.getMissionId() === mission_id;
			});
		},

		/**
		 * @return {undefined|SpawnMission}
		 */
		getRunningMission: function () {
			return this.find(function (mission) {
				return mission.isRunning();
			});
		},

		claimMissionReward: function (mission_id) {
			// we want the promise to be rejected on error ('no god in town')
			// gpajax won't reject the promise on backend game_exception
			return new Promise(function (resolve, reject) {
				this.execute('claimMissionReward', {
					mission_id: parseInt(mission_id, 10)
				}, {
					success: resolve,
					error: function (data) {
						reject(data.error);
					}
				});
			}.bind(this));
		},

		sendMission: function (mission_id) {
			// we want the promise to be rejected on error ('not enough units')
			// gpajax won't reject the promise on backend game_exception
			return new Promise(function (resolve, reject) {
				this.execute('startMission', {
					mission_id: parseInt(mission_id, 10)
				}, {
					success: resolve,
					error: reject
				});
			}.bind(this));
		},

		/**
		 * used for ConfirmationWastedResources
		 *
		 * @returns {Object} All Resources and Favor
		 */
		getMissionResourcesAndFavor: function (mission_id) {
			var mission = this.getRunningMission();

			return {
				all_resources: mission.getResourcesAmount(),
				favor: mission.getFavor()
			};
		},

		onMissionChange: function (obj, callback) {
			obj.listenTo(this, 'change', callback);
		}
	});

	window.GameCollections.SpawnMissions = SpawnMissions;

	return SpawnMissions;
});
