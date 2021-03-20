/* global Timestamp, Promise */

define('events/spawn/models/spawn', function(require) {
	'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

	var Spawn = GrepolisModel.extend({
        urlRoot: 'Spawn',

        getTimeLeft: function() {
			return this.get('end_date') - Timestamp.now();
		},

		isDestroyed: function() {
			return this.get('event_finished');
		},

		claimEndReward: function() {
			return new Promise(function(resolve, reject) {
				this.execute('claimEndReward', {}, {
					success: resolve,
					error: reject
				});
			}.bind(this));
		},

		onStonesChange: function(obj, callback) {
			obj.listenTo(this, 'change:stones', callback);
		},

		onSpawnEventChanged: function(obj, callback) {
			obj.listenTo(this, 'add remove', callback);
		}
	});

    GrepolisModel.addAttributeReader(Spawn.prototype,
        'stones', // number
        'start_date',
        'end_date',
        'event_finished',
        'end_rewards'
	);


    window.GameModels.Spawn = Spawn;
    return Spawn;
});
