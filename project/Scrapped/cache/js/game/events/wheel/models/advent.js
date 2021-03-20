/* global GrepolisModel */
(function() {
	'use strict';

	var Advent = function () {}; // never use this, because it will be overwritten
	Advent.urlRoot = 'Advent';

	GrepolisModel.addAttributeReader(Advent,
		'event_end_at',
		'wheel_event_skin',
		'free_refill_power_active',
		'free_refill_power_configuration'
	);

	Advent.isHeroRewardType = function() {
		return this.get('wheel_shard_reward').shard_reward_type === 'hero';
	};

	Advent.getHeroName = function() {
		return this.get('wheel_shard_reward').shard_reward_hero_type;
	};

	window.GameModels.Advent = GrepolisModel.extend(Advent);
}());
