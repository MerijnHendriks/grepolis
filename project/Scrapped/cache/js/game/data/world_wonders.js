/*globals Game */

define('data/world_wonders', function() {
	'use strict';

	var GameDataWorldWonders = {

		getMaxExpansionStage : function() {
			return Game.constants.wonder.max_expansion_stage;
		},

		getMythUnitsModificationForMausoleum : function() {
			return Game.constants.wonder.myth_units_modification_for_mausoleum;
		},

		getResourceProductionModificationForHangingGardens : function() {
			return Game.constants.wonder.resource_production_modification_for_hanging_gardens;
		},

		getStorageModificationForPyramid : function() {
			return Game.constants.wonder.storage_modification_for_pyramid;
		}
	};

	window.GameDataWorldWonders = GameDataWorldWonders;
	return GameDataWorldWonders;
});
