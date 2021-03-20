/*global define */

define('farmtowns/models/farm_town', function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var FarmTown = function() {};

	FarmTown.urlRoot = 'FarmTown';

	GrepolisModel.addAttributeReader(FarmTown,
		'id',
		'name',
		'island_x',
		'island_y',
		'island_xy',
		'chunks_x',
		'chunks_y',
		'number_on_island',
		'resource_offer',
		'resource_demand',
		'expansion_stage',		// old system
		'resources'				// old system only
	);

	window.GameModels.FarmTown = GrepolisModel.extend(FarmTown);
	return window.GameModels.FarmTown;
});
