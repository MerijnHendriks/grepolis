/* globals GameEvents, JSON */
define('features/custom_colors/controllers/custom_colors', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/custom_colors/views/custom_colors');
	var HelperDefaultColors = require('helpers/default_colors');
	var FILTERS = require('enums/filters');

	return GameControllers.TabController.extend({

		initialize: function(options) {

			GameControllers.TabController.prototype.initialize.apply(this, arguments);

		},

		registerEventListeners: function() {
			this.stopObservingEvent(GameEvents.color_picker.change_color);
			this.observeEvent(GameEvents.color_picker.change_color, function(e, data) {
				if(data.type !== 'text') {
					this.reRender();
				}
			}.bind(this));
		},

		reRender: function() {
			this.view.reRender();
		},

		renderPage: function() {
			this.view = new View({
				controller : this,

				el : this.$el
			});
			this.registerEventListeners();
		},

		getListOfPlayerCustomColors: function() {
			return this.getCollection('custom_colors').getCustomPlayerColorsForCurrentPlayer();
		},

		getListOfAllianceCustomColors: function() {
			return this.getCollection('custom_colors').getCustomAllianceColorsForCurrentPlayer();
		},

		getCustomColorForOwnAlliance: function() {
			var own_alliance_custom_color = this.getCollection('custom_colors').getCustomColorForOwnAlliance();
			if (own_alliance_custom_color === null) {
				own_alliance_custom_color = HelperDefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE);
			}
			return own_alliance_custom_color;
		},

		getCustomColorForOwnCities: function() {
			var own_cities_custom_color = this.getCollection('custom_colors').getCustomColorForOwnCities();
			if (own_cities_custom_color === null) {
				own_cities_custom_color = HelperDefaultColors.getDefaultColorByIdFromGameData(FILTERS.OWN_PLAYER);
			}
			return own_cities_custom_color;
		},

		getCustomColorForEnemy: function() {
			var enemy_custom_color = this.getCollection('custom_colors').getWarPactCustomColorIfSet();
			return enemy_custom_color ? enemy_custom_color.getColor() : HelperDefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.ENEMY);
		},

		getCustomColorForPact: function() {
			var pact_custom_color = this.getCollection('custom_colors').getPeacePactCustomColorIfSet();
			return pact_custom_color ? pact_custom_color.getColor() : HelperDefaultColors.getDefaultColorByIdFromGameData(FILTERS.ALLIANCE_TYPES.PACT);
		},

		getLinkData : function(id, name) {
			return btoa(JSON.stringify({
				id: id,
				name: name
			}));
		}
	});
});

