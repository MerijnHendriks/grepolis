/* global gpAjax, us, JSON */
define('features/fatal_attack_warning/helpers/fight_simulator', function() {
	return {
		/**
		 * calls the fight simulator
		 * @param {FightUnits[]} simulator_units_array see below
		 * @param {function} [empty_function] callback optional callback
		 * @returns {Promise}
		 *
			simulator_units_array = [{
				name: 'sim[units][att][bireme]',
				value: '30'
			}, {
				name: 'sim[units][def][bireme]',
				value: '10'
			},{
				name: 'sim[mods][att][luck]',
				value: '30'
			},
			{
				name: 'sim[attack_strategy]',
				value: 'regular'
			}];
		*/
		simulateFight: function(simulator_units_array, callback) {
			callback = callback || function() {};
			// TODO replace with API call to frontend_bridge
			return gpAjax.ajaxPost('building_place', 'simulate', {'simulator': $.param(simulator_units_array)}, false, callback);
		},

		/**
		 * @returns {Boolean} true, if the total number of surviving units = 0
		 */
		isAttackFatal: function(simulator_result) {
			//TODO fixes when switching to API ?
			simulator_result = JSON.parse(simulator_result).json;

			var att_survivers = us.values(simulator_result.att_survives),
				total_survivers = us.reduce(att_survivers, function(sum, value) {
				return sum + value;
			}, 0);

			return total_survivers === 0;
		},

		/**
		 * helper functions to build up simulator units from unit IDs and numbers
		 * @TODO the list is incomplete (hereos, magic and stuff) and only based on what I need at the moment
		 */
		getAttackUnit : function(unit_id, amount) {
			return {
				name: 'sim[units][att]['+ unit_id + ']',
				value : amount.toString()
			};
		},

		getDefendUnit : function(unit_id, amount) {
			return {
				name: 'sim[units][def]['+ unit_id + ']',
				value : amount.toString()
			};
		},

		getAttackModifier : function(modifier_id, value) {
			return {
				name: 'sim[mods][att]['+ modifier_id + ']',
				value : value.toString()
			};
		},

		getDefendModifier : function(modifier_id, value) {
			return {
				name: 'sim[mods][def]['+ modifier_id + ']',
				value : value.toString()
			};
		},

		getRegularAttack : function() {
			return {
				name: 'sim[attack_strategy]',
				value: 'regular'
			};
		},

		/**
		 * convert
		 * @param {Object} units_hash { bireme: 30, slinger: 10 }
		 * for a
		 * @param {string} type "attack" or "defend" type
		 * to a simulator Unit and
		 * @returns {Object}
		 */
		getSimulatorUnitsFromUnitsHash : function(type, units_hash) {
			var simulator_units_array = [];

			for (var unit_id in units_hash) {
				if (units_hash.hasOwnProperty(unit_id)) {
					var amount = units_hash[unit_id];

					if (type === 'attack') {
						simulator_units_array.push(this.getAttackUnit(unit_id, amount));
					} else {
						simulator_units_array.push(this.getDefendUnit(unit_id, amount));
					}
				}
			}

			return simulator_units_array;
		},

		/**
		 * given a hash of attackers and defenders, build a regular attack with attacker luck +30
		 * to be used to check if the attack would be fatal
		 * @returns {Object[]} a Simulator Units Array
		 */
		buildSimulatorUnitsArrayForFatalAttackCheck : function(attackers, defenders) {
			var attack_sim_array = this.getSimulatorUnitsFromUnitsHash('attack', attackers),
				defend_sim_array = this.getSimulatorUnitsFromUnitsHash('defend', defenders),
				attack_type = this.getRegularAttack(),
				luck = this.getAttackModifier('luck', 30);

			return [attack_type, luck].concat(attack_sim_array, defend_sim_array);
		}

	};
});
