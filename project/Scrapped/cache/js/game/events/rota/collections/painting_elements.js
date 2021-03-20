define('events/rota/collections/painting_elements', function () {
	'use strict';

	var Collection = window.GrepolisCollection;
	var PushablePaintingElement = require('events/rota/models/painting_element');

	var RotaUnfinishedPaintingElements = Collection.extend({
		model: PushablePaintingElement,
		model_class: 'PushablePaintingElement',
		url_root: 'RotaUnfinishedPaintingElement',
		comparator: 'zIndex',

		getPaintingElements: function () {
			return this.models;
		},

		onAdd: function (obj, callback) {
			obj.listenTo(this, 'add', callback);
		}
	});

	window.GameCollections.RotaUnfinishedPaintingElements = RotaUnfinishedPaintingElements;
	return RotaUnfinishedPaintingElements;
});
