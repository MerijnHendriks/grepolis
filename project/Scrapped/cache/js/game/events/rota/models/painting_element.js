define('events/rota/models/painting_element', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var PushablePaintingElement = GrepolisModel.extend({
		urlRoot: 'PushablePaintingElement'
	});

	GrepolisModel.addAttributeReader(
		PushablePaintingElement.prototype,
		'imageId',
		'paintingId',
		'x',
		'y',
		'zIndex'
	);

	window.GameModels.PushablePaintingElement = PushablePaintingElement;
	return PushablePaintingElement;
});
