define('farmtowns/collections/farm_towns', function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var FarmTown = require('farmtowns/models/farm_town');

	var FarmTowns = function() {};

	FarmTowns.model = FarmTown;
	FarmTowns.model_class = 'FarmTown';

	/**
	 * given an island (via its combined id 'island_xy') return all farm towns
	 */
	FarmTowns.getAllForIsland = function(island_xy) {
		return this.where({ island_xy : island_xy });
	};

	/**
	 * given an island (via proper island coordinates) return all farm towns
	 */
	FarmTowns.getAllForIslandViaXY = function(island_x, island_y) {
		return this.where({ island_x : island_x, island_y : island_y });
	};

	window.GameCollections.FarmTowns = GrepolisCollection.extend(FarmTowns);

	return window.GameCollections.FarmTowns;
});
