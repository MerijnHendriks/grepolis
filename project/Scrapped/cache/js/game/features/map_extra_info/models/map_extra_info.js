define('features/map_extra_info/models/map_extra_info', function(require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

	var MapExtraInfo = GrepolisModel.extend({
		urlRoot : 'MapExtraInfo'
	});

	GrepolisModel.addAttributeReader(MapExtraInfo.prototype,
		 'id',
		 'town_id',
		 'finished_at',
		 'report_id',
		 'type',
		 'start_at'
	);

	window.GameModels.MapExtraInfo = MapExtraInfo;

	return MapExtraInfo;
});
