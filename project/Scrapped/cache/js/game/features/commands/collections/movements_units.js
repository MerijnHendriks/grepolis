/*global Timestamp, Game */
define('features/commands/collections/movements_units', function(require) {
	'use strict';

    var Collection = require_legacy('GrepolisCollection'),
    	Model = require('features/commands/models/movements_units');

    var MovementsUnits =  Collection.extend({
		model : Model,
        model_class : 'MovementsUnits',

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
		},

		getAttackSpotMovements : function() {

			return this.filter(function (model) {
				// "incoming" is from the POV of the sending town, so we filter only "attacks", not "returns"
				return model.isAttackSpotAttack() === true && model.getType() === 'attack_land' && model.isIncommingMovement() === false;
			});
		},

		getIncomingAttacks : function(fragment_town_id) {
			return this.filter(function (model) {
				return model.isIncommingMovement() === true &&
					model.isIncommingAttack() === true &&
					model.getTargetTownId() === fragment_town_id &&
					model.getArrivalAt() > Timestamp.now();
			});
		},

		getIncomingAttacksCount : function(town_id) {
			var fragment_town_id = town_id ? town_id : Game.townId;
			var incoming_attacks = this.getIncomingAttacks(fragment_town_id);
			return incoming_attacks.length;
		},

		getMovementByCommandId : function(command_id) {
			return this.findWhere({ command_id : command_id});
		}
	});
    window.GameCollections.MovementsUnits = MovementsUnits;

    return MovementsUnits;
});
