define('features/custom_colors/models/custom_colors', function() {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var CustomColor = GrepolisModel.extend({
		urlRoot : 'CustomColor'
	});

	GrepolisModel.addAttributeReader(CustomColor.prototype,
		'id',
		'player_id',
		'other_id',
		'type',
		'color',
		'other_name',
		'player_alliance_id'
	);

	window.GameModels.CustomColor = CustomColor;

	return CustomColor;
});


