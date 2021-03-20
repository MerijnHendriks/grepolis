/*global Promise */
define('events/grid_event/collections/player_grid_turns', function () {
	'use strict';

	var Collection = window.GrepolisCollection;
	var PlayerGridTurn = require('events/grid_event/models/player_grid_turn');

	var PlayerGridTurns = Collection.extend({
		model: PlayerGridTurn,
		model_class: 'PlayerGridTurn',

		getPlayerGridTurns: function () {
			return this.models;
		},

		getPlayerGridTurnByGridIndex: function (grid_index) {
			return this.findWhere({grid_index: grid_index});
		},

		getUncoveredGridIndeces: function () {
			var grid_indeces = [];

			this.models.forEach(function (model) {
				var grid_index = model.getGridIndex();
				if (grid_index !== null) {
					grid_indeces.push(grid_index);
				}
			});

			return grid_indeces.sort(function(a, b) {
				return a - b;
			});
		},

		getRewards: function () {
			var rewards = [];

			this.models.forEach(function (model) {
				var reward = {
					data: model.getReward(),
					is_claimed: model.isRewardClaimed()
				};
				rewards.push(reward);
			});

			return rewards;
		},

		takeTurn: function (grid_index, callback) {
			this.execute('takeTurn', {
				grid_index: grid_index
			}, callback);
		},

		onChange: function () {
			return new Promise(function(resolve) {
				this.once('change', function(model) {
					resolve({
						resolved: true,
						model : model
					});
				});
			}.bind(this));
		}
	});

	window.GameCollections.PlayerGridTurns = PlayerGridTurns;
	return PlayerGridTurns;
});
