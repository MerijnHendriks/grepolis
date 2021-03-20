(function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;

	var DroppedUnit = function () {}; // never use this, because it will be overwritten
	DroppedUnit.urlRoot = 'CampaignDroppedUnits';

	GrepolisModel.addAttributeReader(DroppedUnit,
		'id',
		'units_source',
		'units',
		'units_total_daily'
	);

	window.GameModels.CampaignDroppedUnits = GrepolisModel.extend(DroppedUnit);
}());
