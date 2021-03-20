define('events/rota/models/player_rota', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var PlayerRota = GrepolisModel.extend({
		urlRoot: 'PlayerRota',

		initialize: function () {
			GrepolisModel.prototype.initialize();

			this.listenTo(this, 'change:slots', this.setEffectiveSlotChances.bind(this));
			this.setEffectiveSlotChances();
		},

		spin: function (resolve, reject) {
			this.execute('spin', {}, {
				success: resolve,
				error: reject
			});
		},

		onDoubleRewardProgressChange: function (obj, callback) {
			obj.listenTo(this, 'change:double_reward_progress', callback);
		},

		onGrandPrizeIndexToCollectChange: function (obj, callback) {
			obj.listenTo(this, 'change:grand_prize_index_to_collect', callback);
		},

		reset: function (resolve, reject) {
			this.execute('reset', {}, {
				success: resolve,
				error: reject
			});
		},

		getAvailableSlots: function() {
			return this.getSlots().filter(function (slot) { return slot.available; });
		},

		setEffectiveSlotChances: function () {
			var available_slots = this.getAvailableSlots();

			// Calculate the sum of all chances of slots that are still available to the player
			var total_effective_chance = available_slots.reduce(
				function (carry, slot) { return carry + parseFloat(slot.chance); },
				0.0
			);

			if (total_effective_chance === 0.0 || total_effective_chance === 100.0) {
				return;
			}

			// Set the effective chance for each slot, rounding to 1 decimal place
			available_slots.forEach(
				function (slot) {
					slot.chance = Math.round((parseFloat(slot.chance) * 1000) / total_effective_chance) / 10;
				}
			);

			// Check whether there is a rounding error, such that effective chances do not sum to 100.0%
			var rounding_error = available_slots.reduce(
				function (carry, slot) { return carry + parseFloat(slot.chance); },
				0.0
			) - 100.0;

			if (rounding_error !== 0.0) {
				// "Correct" the rounding error by reducing the chance of the least likely slot (if error is positive)
				// or increasing the chance of the most likely slot (if error is negative)
				var key = Object.keys(available_slots).reduce(
					rounding_error > 0.0 ?
						function (carry, index) {
							return available_slots[index].chance < available_slots[carry].chance ? index : carry;
						} :
						function (carry, index) {
							return available_slots[index].chance > available_slots[carry].chance ? index : carry;
						}
				);

				available_slots[key].chance = Math.round(
					10 * (parseFloat(available_slots[key].chance) - rounding_error)
				) / 10;
			}
		}
	});

	GrepolisModel.addAttributeReader(
		PlayerRota.prototype,
		'id',
		'slots',
		'double_reward_progress',
		'original_size',
		'grand_prize_index_to_collect',
		'reset_time'
	);

	window.GameModels.PlayerRota = PlayerRota;

	return PlayerRota;
});
