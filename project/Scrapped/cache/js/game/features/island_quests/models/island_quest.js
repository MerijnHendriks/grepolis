/*global GameData, Game, Timestamp, debug */

(function() {
	'use strict';

	var Progressable = window.GameModels.Progressable;
	var QUESTS = require('enums/quests');

	var IslandQuest;

	IslandQuest = Progressable.extend({
		urlRoot: 'IslandQuest',

		initialize: function (/*attributes*/) {
			Progressable.prototype.initialize.apply(this, arguments);
		},

		getSetId : function() {
			return this.getGroupId() + '_' + this.getId();
		},

		getGroupId : function() {
			return QUESTS.ISLAND_QUEST;
		},

		/**
		 * Feel free to make it better ;)
		 */
		getType : function() {
			var progressable_id = this.get('progressable_id'),
				pos_good = progressable_id.indexOf('Good'),
				pos_evil = progressable_id.indexOf('Evil'),
				pos = pos_good > -1 ? pos_good : pos_evil;

				if (pos === -1) {
					throw 'Incorrect progressabe id for this island Quest or you are calling a function which you should not use';
				}

			return this.get('progressable_id').substr(0, pos);
		},

		hasSteps: function() {
			return false;
		},

		getTownId : function () {
			return this.getConfiguration().town_id;
		},

		getIslandX : function () {
			return this.getConfiguration().island_x;
		},

		getIslandY : function () {
			return this.getConfiguration().island_y;
		},

		getNumberOnIsland : function () {
			return this.getConfiguration().number_on_island;
		},

		/**
		 * @return {int} value between 0 and 100
		 */
		getProgressPercentDone : function() {
			var challenge_type = this.getChallengeType(),
				progress_percent_done = 0;

			switch(challenge_type) {
				case 'attack_player':
					progress_percent_done = this._getAttackPlayerProgress();
					break;
				case 'collect_units':
					progress_percent_done = this._getCollectUnitsProgress().progress;
					break;
				case 'attack_npc':
					progress_percent_done = this._getAttackNPCProgress();
					break;
				case 'spend_resources':
					progress_percent_done = this._getSpendResourcesProgress();
					break;
				case 'provoke_attack':
					progress_percent_done = this._getProvokeAttackProgress();
					break;
				case 'bear_effect':
					progress_percent_done = this._getBearEffectProgress();
					break;
				case 'wait_time':
					progress_percent_done = this._getWaitTimeProgress();
					break;
				default:
					if (Game.dev) {
						debug('Not supported IslandQuest challenge type: ' + challenge_type);
					}
			}

			return progress_percent_done;
		},

		isAttackOnPlayerRunning : function() {
			return (this.getProgress().on_the_move === true);
		},

		_getAttackPlayerProgress : function() {
			var count_attacks_to_win = this.getConfiguration().count_attacks_to_win,
				attacks_won = this.getProgress().attacks_won;

			if (!attacks_won) {
				attacks_won = 0;
			}

			return Math.min(100, Math.max(0, (attacks_won/count_attacks_to_win)*100));
		},

		_getAttackNPCProgress : function() {
			var unit_id,
				base_units = this.getConfiguration().units,
				units_to_send = this.getProgress().units,
				gd_units = GameData.units, base_count = 0, to_send_count = 0, units_defeat;

			for (unit_id in base_units) {
				if (base_units.hasOwnProperty(unit_id)) {
					base_count += base_units[unit_id] * gd_units[unit_id].population;
					to_send_count += units_to_send[unit_id] * gd_units[unit_id].population;
				}
			}

			//Because 'current_units' keeps information about units which I still have to sent
			units_defeat = base_count - to_send_count;

			return Math.min(100, Math.max(0, (units_defeat * 100) / base_count));
		},

		_getCollectUnitsProgress : function() {
			var count_units = this.getProgress().count_units,
				count_to_rally = this.getConfiguration().count_to_rally;

			if (!count_units) {
				count_units = 0;
			}

			return {
				count_units: count_units,
				count_to_rally: count_to_rally,
				progress: Math.min(100, Math.max(0, (count_units/count_to_rally)*100))
			};
		},

		_getSpendResourcesProgress : function() {
			var res_id, base_resources = this.getConfiguration().resources,
				resources_to_send = this.getProgress().resources, resources_sent,
				base_count = 0, to_send_count = 0;

			for (res_id in base_resources) {
				if (base_resources.hasOwnProperty(res_id)) {
					base_count += base_resources[res_id];
					to_send_count += resources_to_send[res_id];
				}
			}

			resources_sent = base_count - to_send_count;

			return Math.min(100, Math.max(0, (resources_sent * 100) / base_count));
		},

		_getProvokeAttackProgress : function() {
			return this._getAttackNPCProgress();
		},

		_getBearEffectProgress : function() {
			if (this.getProgress().wait_till === null) {
				return 0;
			}

			var progress = Math.floor(100 - (((this.getProgress().wait_till - Timestamp.now()) / this.getConfiguration().time_to_wait) * 100));

			return Math.max(0, progress);
		},

		_getWaitTimeProgress : function() {
			return this._getBearEffectProgress();
		},

		getChallengeType : function() {
			return this.staticData.challenge_type;
		},

		getSide : function() {
			return this.staticData.side;
		},

		getDescription : function() {
			return this.staticData.description;
		},

		getBlockRender: function() {
			return true;
		},

		getClasses: function () {
			return 'island_quest ' + this.getStatus() + ' right_sided ' + this.getType();
		},

		/* Attack NPC */
		getAttackNPCUnitsLeft : function() {
			var unit_id, current_units = this.getProgress().units,
				units_to_attack = {}, units_left;

			for (unit_id in current_units) {
				if (current_units.hasOwnProperty(unit_id)) {
					units_left = current_units[unit_id];

					if (units_left > 0) {
						units_to_attack[unit_id] = units_left;
					}
				}
			}

			return units_to_attack;
		},

		getProvokeAttackUnitsLeft : function() {
			return this.getAttackNPCUnitsLeft();
		},

		/* Spend resources */
		getResourcesSent : function() {
			var res_id, base_resources = this.getConfiguration().resources,
				resources_to_send = this.getProgress().resources, res_already_sent = {};

			for (res_id in base_resources) {
				if (base_resources.hasOwnProperty(res_id)) {
					res_already_sent[res_id] = Math.max(0, Math.min(base_resources[res_id], base_resources[res_id] - resources_to_send[res_id]));
				}
			}

			return res_already_sent;
		},

		getResourcesLeftToSend : function() {
			return this.getProgress().resources;
		},

		getTotalResourcesToSend : function() {
			return this.getConfiguration().resources;
		},

		getRewards : function() {
			var sameGamePhase = function(reward) {
				return !reward.player_game_phase || reward.player_game_phase === this.getPlayerGamePhase();
			};

			return Progressable.prototype.getRewards.call(this).filter(sameGamePhase);
		},

		areRewardsStashable : function() {
			var rewards = this.getRewards(),
				rewards_length = rewards.length,
				i = 0;

			for (; i < rewards_length; ++i) {
				if (rewards[i].stashable) {
					return true;
				}
			}

			return false;
		},

		getPlayerGamePhase: function() {
			return this.get('player_game_phase');
		},

		getEffectConfiguration : function() {
			var configuration = this.get('configuration');

			return configuration && configuration.effect && configuration.effect.configuration ? configuration.effect.configuration : null;
		},

		getProgress : function() {
			return this.get('progress');
		},

		getChallengeFactor : function() {
			return this.getConfiguration().cf;
		},

		onProgressChange : function(obj, callback) {
			obj.listenTo(this, 'change:progress', callback);
		},

		isTownOnSameIsland : function(town) {
			return town.getIslandX() === this.getIslandX() && town.getIslandY() === this.getIslandY();
		},

		getIslandId: function() {
			return this.get('dynamic_data').island_id;
		}
	});

	window.GameModels.IslandQuest = IslandQuest;
}());
