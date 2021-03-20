define('events/grid_event/models/player_grid_turn', function () {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var PlayerGridTurn = GrepolisModel.extend({
		urlRoot: 'PlayerGridTurn',

		isRewardClaimed: function () {
			return this.get('grid_index') !== null &&
				this.get('uncovered_only') === 'completed';
		},

		getRewardType: function () {
			return this.get('reward').type;
		}
	});

	GrepolisModel.addAttributeReader(PlayerGridTurn.prototype,
		'id',
		'grid_index',
		'interaction_result',
		'reward',
		'figure_orientation',
		'uncovered_only'
	);

	window.GameModels.PlayerGridTurn = PlayerGridTurn;
	return PlayerGridTurn;
});
