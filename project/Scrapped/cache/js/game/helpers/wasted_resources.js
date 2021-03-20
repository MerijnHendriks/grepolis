/**
 * Helper class to help with checks for wasted resources
 *
 * This implementation deals with the power configuration as the smallest common thing -> {
 * 		wood: 5,
 * 		favor: 400
 * } etc.
 *
 * see ResourceRewardDataFactory to convert to this format from everywhere
 */
define('WastedResourcesHelper', function() {

	var RES = { wood: 'wood', iron: 'iron', stone: 'stone', favor: 'favor', fury: 'fury', all: 'all' };

	/**
	 * @param {TownModel} current_town
	 * @param {PlayerGods} player_gods
	 */
	var WastedResources = function(current_town, player_gods) {
		this.current_town = current_town;
		this.player_gods = player_gods;
		this.current_god = current_town.getGod();
		this.storage_capa = current_town.getStorageCapacity();
		this.resources = current_town.getResources();
		this.wasted = {
			'wood': 0,
			'stone': 0,
			'iron': 0,
			'favor': 0,
			'fury': 0
		};

		if (this.current_god) {
			this.current_favor = player_gods.getCurrentFavorForGod(this.current_god);
			this.max_favor = player_gods.getMaxFavor();
		}

		this.current_fury = player_gods.getFury();
		this.max_fury = player_gods.getMaxFury();
	};


	/**
	 * Test if we waste resources, as a side effects keeps the amount of wasted resources
	 * as instance variable
	 * @param {Reward} reward
	 * @return {Boolean}
	 */
	WastedResources.prototype.hasWastedResources = function(simple_reward_data) {
		var wasted = false;

		for (var type in simple_reward_data) {
			if (simple_reward_data.hasOwnProperty(type)) {
				var amount = simple_reward_data[type];

				switch (type) {
					case RES.wood:
					case RES.stone:
					case RES.iron:
						if (this.resources[type] + amount > this.storage_capa) {
							this.wasted[type] = amount - (this.storage_capa - this.resources[type]);
							wasted = true;
						}
						break;
					case RES.favor:
						if (this.current_favor + amount > this.max_favor) {
							this.wasted[RES.favor] = amount - (this.max_favor - this.current_favor);
							wasted = true;
						}
						break;
					case RES.fury:
						if (this.current_fury + amount > this.max_fury) {
							this.wasted[RES.fury] = amount - (this.max_fury - this.current_fury);
							wasted = true;
						}
						break;
					default:
						break;
				}
			}
		}

		return wasted;
	};

	/**
	 * @returns { resource: wasted_amount, ... }
	 */
	WastedResources.prototype.getWastedResources = function(simple_reward_data) {
		this.hasWastedResources(simple_reward_data);
		return this.wasted;
	};

	window.WastedResourcesHelper = WastedResources;
	return WastedResources;

});
