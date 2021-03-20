define('events/grepolympia/collections/grepolympia_rankings', function(require) {
	'use strict';

	var Collection = require_legacy('GrepolisCollection');
	var GrepolympiaRanking = require('events/grepolympia/models/grepolympia_ranking');

	var GrepolympiaRankings = Collection.extend({
		model : GrepolympiaRanking,
		model_class : 'GrepolympiaRanking',

		onRankingChanges : function(obj, callback) {
			obj.listenTo(this, 'add change', callback);
		}
	});

	// this is needed for the model manager to discover this collection
	window.GameCollections.GrepolympiaRankings = GrepolympiaRankings;

	return GrepolympiaRankings;
});
