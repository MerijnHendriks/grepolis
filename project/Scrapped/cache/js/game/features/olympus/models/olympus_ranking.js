define('features/olympus/models/olympus_ranking', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var OlympusRanking = GrepolisModel.extend({
		urlRoot: 'OlympusRanking'
	});

	GrepolisModel.addAttributeReader(OlympusRanking.prototype,
		'id',
		'ranking'
	);

	window.GameModels.OlympusRanking = OlympusRanking;

	return OlympusRanking;
});
