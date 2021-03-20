/*global window */

define('events/grepolympia/models/grepolympia', function(require) {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var Grepolympia = GrepolisModel.extend({
		urlRoot : 'Grepolympia'

	});

	GrepolisModel.addAttributeReader(Grepolympia.prototype,
		'id',
		'training_bonus_costs',
		'extra_slot_costs',
		'training_bonus_percent',
		'reset_skills_costs',
		'training_points_per_skillpoint',
		'training_bonus_duration_seconds',
		'interval_duration_seconds',
		'data_disciplines',
		'reset_skills_costs',
		'training_bonus_percent',
		'training_data',
		'number_of_top_alliances'
	);

	window.GameModels.Grepolympia = Grepolympia;
	return Grepolympia;
});
