define('events/grid_event/models/player_grid', function () {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var PlayerGrid = GrepolisModel.extend({
		urlRoot: 'PlayerGrid',

		resetGrid: function (callback) {
			this.execute('resetGrid', {}, callback);
		},

		useReward: function (callback) {
			this.execute('utilize', {}, callback);
		},

		stashReward: function (callback) {
			this.execute('stash', {}, callback);
		},

		trashReward: function (callback) {
			this.execute('trash', {}, callback);
		},

		hasBlockedFigureType: function () {
			return this.get('blocked_figure_type') !== null;
		},

		onGridStateChange: function (obj, callback) {
			obj.listenTo(this, 'change:grid_state', callback);
		},

		onCurrentRewardToCollectChange: function (obj, callback) {
			obj.listenTo(this, 'change:current_reward_to_collect', callback);
		},

		onAdvancedScoutPowerCastedChanged: function (obj, callback) {
			obj.listenTo(this, 'change:advanced_scouts_power_casted', callback);
		},

		onGridResetCostChange: function(obj, callback) {
			obj.listenTo(this, 'change:grid_reset_cost', callback);
		},

		onAvailableScoutsChange: function (obj, callback) {
			obj.listenTo(this, 'change:available_scouts', callback);
		},

		onRewardQuantityMultiplierChange: function (obj, callback) {
			obj.listenTo(this, 'change:reward_quantity_multiplier', callback);
		}
	});

	GrepolisModel.addAttributeReader(PlayerGrid.prototype,
		'id',
		'advanced_scouts_power_casted',
		'advanced_scout_power_configuration',
		'reset_time',
		'daily_reward',
		'blocked_figure_type',
		'available_scouts',
		'grid_width',
		'grid_height',
		'turn_cost',
		'grid_reset_cost',
		'reward_quantity_multiplier',
		'current_reward_to_collect',
		'grid_state'
	);

	window.GameModels.PlayerGrid = PlayerGrid;
	return PlayerGrid;
});
