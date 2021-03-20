/* global require_legacy */

define('features/commands/collections/movements_colonizations', function(require) {
	'use strict';

	//GP-22361 rename into movements_colonizations 

	var Collection = require_legacy('GrepolisCollection');
	var MovementsColonization = require('features/commands/models/movements_colonization');

	var MovementsColonizations = Collection.extend({
		model : MovementsColonization,
		model_class : 'MovementsColonization',

		getColonizedTown : function(town) {
			return this.find(function(model) {
					return (model.getIslandX() === town.x || model.getIslandX() === town.ix) &&
						(model.getIslandY() === town.y || model.getIslandY() === town.iy)&&
						model.getNumberOnIsland() === town.nr;
				}) || false;
		},

		onMovementsColonizationsChange : function(obj, callback) {
			obj.listenTo(this, 'add change remove', callback);
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

	window.GameCollections.MovementsColonizations = MovementsColonizations;

	return MovementsColonizations;
});
