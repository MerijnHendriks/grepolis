/*global window, GameDataAssassins */

define('events/turn_over_tokens/collections/player_spots', function(require) {
    'use strict';

    var Collection = window.GrepolisCollection;
	var AssassinsPlayerSpot = require('events/turn_over_tokens/models/player_spot');

    var AssassinsPlayerSpots = Collection.extend({
		model : AssassinsPlayerSpot,
		model_class : 'AssassinsPlayerSpot',

		getSpots : function() {
			return this.models;
		},

		getSpot : function(spot_id) {
			return this.find(function(model) {
				return model.get('spot_id') === spot_id;
			});
		},

		onSpotsChange : function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},

		setNewPlayerSpots : function() {
			this.execute('buyReset',{});
		},

		getNumberOfLivingUnits: function() {
			return this.models.reduce(function(sum, unit) {
				return unit.isKilled() ? sum : sum + 1;
			}, 0);
		},

		getRemainingPointsAverage: function() {
			var living_units = this.getNumberOfLivingUnits(),
				total_points = GameDataAssassins.getTotalPointsOfAllTiers(),
				killed_points = this.models.reduce(function(points, unit) {
					return unit.isKilled() ? points + GameDataAssassins.getTiers()[unit.getTier()].points : points;
				}, 0);
			return (total_points - killed_points) / living_units;
		}

    });

	window.GameCollections.AssassinsPlayerSpots = AssassinsPlayerSpots;
	return AssassinsPlayerSpots;
});
