define('features/commands/collections/movements_spy', function(require) {
	'use strict';

    var Collection = require_legacy('GrepolisCollection');
	var Model = require('features/commands/models/movements_spy');

	var MovementsSpys = Collection.extend({
		model : Model,
		model_class : 'MovementsSpy',

		initialize: function() {
		},

		onAdd : function(obj, callback) {
			obj.listenTo(this, 'add', callback);
		},

		onRemove : function(obj, callback) {
			obj.listenTo(this, 'remove', callback);
		},

		onChange : function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		}
	});

	window.GameCollections.MovementsSpys = MovementsSpys;

	return MovementsSpys;
});
