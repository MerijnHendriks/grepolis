define('features/commands/collections/movements_revolts_attacker', function(require) {
	'use strict';

	var Collection = require_legacy('GrepolisCollection');
	var Model = require('features/commands/models/movements_revolt_attacker');

	var MovementsRevoltsAttacker = Collection.extend({
		model : Model,
		model_class : 'MovementsRevoltAttacker',

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

	window.GameCollections.MovementsRevoltsAttacker = MovementsRevoltsAttacker;

	return MovementsRevoltsAttacker;
});
