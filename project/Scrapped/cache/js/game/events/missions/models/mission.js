define('events/missions/models/mission', function(require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel'),
		Timestamp = require('misc/timestamp');

	var Mission = GrepolisModel.extend({
		urlRoot : 'Mission',

		onDestroy: function(obj, callback) {
			obj.listenTo(this, 'destroy', callback);
		},

		hasEnded: function() {
			return this.getEndTime() && this.getEndTime() <= Timestamp.now();
		},

		getDurationTime: function() {
			return this.getConfiguration().duration_time;
		},

		getBaseChance: function() {
			return this.getConfiguration().success_chance.base;
		},

		getSuccessChance: function() {
			return this.getConfiguration().success_chance.success_chance;
		},

		getUnitChance: function() {
			return this.getSuccessChance() - this.getBaseChance();
		},

		getMaxUnitBonus: function() {
			return this.getConfiguration().success_chance.maximum_bonus;
		},

		getMaxSuccessChance: function() {
			return this.getMaxUnitBonus() + this.getBaseChance();
		}
	});

	GrepolisModel.addAttributeReader(Mission.prototype,
		'id',
		'mission_number',
		'title',
        'type',
		'description',
		'player_id',
		'happening_id',
		'skin_id',
		'start_time',
		'end_time',
		'duration_time',
		'success_chance',
		'succeeded',
		'configuration',
		'sort_order'
	);

	window.GameModels.Mission = Mission;

	return Mission;
});
