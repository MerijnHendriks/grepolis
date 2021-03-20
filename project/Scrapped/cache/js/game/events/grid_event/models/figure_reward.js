define('events/grid_event/models/figure_reward', function () {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var GridFigureReward = GrepolisModel.extend({
		urlRoot: 'GridFigureReward'
	});

	GrepolisModel.addAttributeReader(GridFigureReward.prototype,
		'id',
		'grid_id',
		'figure_type',
		'number_of_hits',
		'figure_width',
		'figure_height',
		'figure_placement',
		'figure_orientation',
		'reward',
		'is_complete'
	);

	window.GameModels.GridFigureReward = GridFigureReward;
	return GridFigureReward;
});
