/*global Game */

define('features/custom_colors/collections/custom_colors', function() {
	'use strict';

	var GrepolisCollection = require_legacy('GrepolisCollection');
	var Model = require('features/custom_colors/models/custom_colors');
	var FILTERS = require('enums/filters');

	var CustomColors = GrepolisCollection.extend({
		model : Model,
		model_class : 'CustomColor',

		getCustomColorByIdAndType : function(type, id) {
			if (type === FILTERS.FILTER_TYPES.PLAYER) {
				return this.findWhere({ type : type, other_id : parseInt(id, 10) });
			} else if (type === FILTERS.ALLIANCE_TYPES.PACT || type === FILTERS.ALLIANCE_TYPES.ENEMY || type === FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE) {
				return this.findWhere({ type : type});
			} else {
				return this.findWhere({ type : type, other_id : parseInt(id, 10)});
			}
		},

		getCustomPlayerColorsForCurrentPlayer : function() {
			return this.where({
				type : FILTERS.FILTER_TYPES.PLAYER,
				player_id : Game.player_id
			});
		},

		getCustomAllianceColorsForCurrentPlayer : function() {
			return this.where({
				type : FILTERS.FILTER_TYPES.ALLIANCE,
				player_id : Game.player_id
			});
		},

		getPeacePactCustomColorIfSet : function () {
			return this.findWhere({
				type : FILTERS.ALLIANCE_TYPES.PACT,
				player_id : Game.player_id
			});
		},

		getWarPactCustomColorIfSet : function() {
			return this.findWhere({
				type : FILTERS.ALLIANCE_TYPES.ENEMY,
				player_id : Game.player_id
			});
		},

		getCustomColorForOwnAlliance : function() {
			var custom_color_own_alliance = this.findWhere({
				type : FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE,
				player_id : Game.player_id,
				other_id : 0
			});
			return custom_color_own_alliance ? custom_color_own_alliance.getColor() : null;
		},

		getCustomColorForOwnCities : function() {
			var custom_color_own_cities = this.findWhere({
				type : FILTERS.FILTER_TYPES.PLAYER,
				player_id : Game.player_id,
				other_id : Game.player_id
			});
			return custom_color_own_cities ? custom_color_own_cities.getColor() : null;
		},

		checkIfAllianceHasCustomColor : function(id) {
			return this.findWhere({ type : FILTERS.FILTER_TYPES.ALLIANCE, other_id : parseInt(id, 10) });
		},

		assignColor: function(obj, callback) {
			this.execute('assignColor', obj, callback);
		},

		removeColorAssignment: function(obj, callback) {
			this.execute('removeColorAssignment', obj, callback);
		},

		onColorChange: function (obj, callback) {
			obj.listenTo(this, 'change:color', callback);
		}

	});

	window.GameCollections.CustomColors = CustomColors;

	return CustomColors;
});