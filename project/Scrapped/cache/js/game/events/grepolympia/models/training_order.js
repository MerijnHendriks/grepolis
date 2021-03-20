define('events/grepolympia/models/training_order', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var TrainingOrder = GrepolisModel.extend({
		urlRoot : 'TrainingOrder',

		initialize : function(data) {
			this.model_athlete = data.model_athlete;
			this.collection_training_orders = data.collection_training_orders;
		},

		kill : function() {
			this.model_athlete = null;
			this.collection_training_orders = null;
		}
	});

	GrepolisModel.addAttributeReader(TrainingOrder.prototype,
		'id',
		'units_left'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.TrainingOrder = TrainingOrder;

	return TrainingOrder;
});

