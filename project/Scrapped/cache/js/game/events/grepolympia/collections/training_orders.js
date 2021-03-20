define('events/grepolympia/collections/training_order', function(require) {
	'use strict';

	var Collection = require_legacy('GrepolisCollection');
	var TrainingOrder = require('events/grepolympia/models/training_order');

	var TrainingOrders = Collection.extend({
		model : TrainingOrder,
		model_class : 'TrainingOrder',

		onTrainingOrdersChange : function(obj, callback) {
			obj.listenTo(this, 'add remove reset', callback);
		}
	});

	// this is needed for the model manager to discover this collection
	window.GameCollections.TrainingOrders = TrainingOrders;

	return TrainingOrders;
});
