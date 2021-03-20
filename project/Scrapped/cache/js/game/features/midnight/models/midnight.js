define('features/midnight/models/midnight', function(require) {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var GameEvents = window.GameEvents;

	var Midnight = GrepolisModel.extend({
		urlRoot : 'Midnight',
		initialize: function() {
			this.on('change', function() {
				$.Observer(GameEvents.system.midnight_signal).publish({ model : this });
			});
		}
	});

	GrepolisModel.addAttributeReader(Midnight.prototype,
		'time',
		'year',
		'month',
		'day',
		'hour',
		'minute',
		'second'
	);

	window.GameModels.Midnight= Midnight;
	return Midnight;
});
