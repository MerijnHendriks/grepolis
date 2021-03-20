define('events/rota/models/event_data', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var RotaEventData = GrepolisModel.extend({
		urlRoot: 'RotaEventData'
	});

	GrepolisModel.addAttributeReader(
		RotaEventData.prototype,
		'inventory_limit',
		'double_reward_threshold',
		'grand_prize_threshold',
		'reset_cost',
		'spin_cost'
	);

	window.GameModels.RotaEventData = RotaEventData;
	return RotaEventData;
});
