define('events/grepolympia/models/grepolympia_ranking', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var GrepolympiaRanking = GrepolisModel.extend({
		urlRoot : 'GrepolympiaRanking',

		defaults : {
			score : '?',
			position : '?'
		}
	});

	GrepolisModel.addAttributeReader(GrepolympiaRanking.prototype,
		'id',
		'score',
		'position'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.GrepolympiaRanking = GrepolympiaRanking;

	return GrepolympiaRanking;
});
