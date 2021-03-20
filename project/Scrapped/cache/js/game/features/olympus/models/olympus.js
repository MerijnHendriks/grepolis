define('features/olympus/models/olympus', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var OlympusStages = require('enums/olympus_stages');

	var Olympus = GrepolisModel.extend({
		urlRoot: 'Olympus',

		onOlympusStageTimestampChange: function (obj, callback) {
			obj.listenTo(this, 'change:olympus_olympus_stage_timestamp', callback);
		},

		offOlympusStageChange: function (obj) {
			obj.stopListening(this, 'change:olympus_stage');
		},

		onOlympusStageChange: function (obj, callback) {
			obj.listenTo(this, 'change:olympus_stage', callback);
		},

		onNextJumpAtChange: function (obj, callback) {
			obj.listenTo(this, 'change:next_jump_at', callback);
		},

		isGlobalShieldActive: function() {
			return this.getOlympusStage() === OlympusStages.PRE_TEMPLE_STAGE || this.getGlobalShieldActive();
		}
	});

	GrepolisModel.addAttributeReader(Olympus.prototype,
		'id',
		'olympus_small_ocean_temple_stage_timestamp',
		'olympus_large_ocean_temple_stage_timestamp',
		'olympus_olympus_stage_timestamp',
		'olympus_stage',
		'pre_temple_stage_days',
		'small_temple_stage_days',
		'large_temple_stage_days',
		'small_temples_spawn_amount',
		'large_temples_spawn_amount',
		'small_temples_alliance_limit',
		'large_temples_alliance_limit',
		'olympus_spawn_hours',
		'olympus_hold_days',
		'olympus_jump_days',
		'temple_shield_time',
		'olympus_unit_kill_percentage',
		'portal_temple_amount',
		'portal_temple_travel_hours',
		'next_jump_at',
		'winning_alliance_id',
		'winning_alliance_name',
		'global_shield_active',
		'next_global_shield_toggle'
	);

	window.GameModels.Olympus = Olympus;

	return Olympus;
});
