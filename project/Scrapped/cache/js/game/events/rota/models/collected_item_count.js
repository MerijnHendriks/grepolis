define('events/rota/models/collected_item_count', function () {
	'use strict';

	var CollectedItemCountModel = window.GameModels.CollectedItemCount;
	var RotaEventCollectedItemCount = CollectedItemCountModel.extend({
		urlRoot: 'RotaEventCollectedItemCount'
	});

	window.GameModels.RotaEventCollectedItemCount = RotaEventCollectedItemCount;
	return RotaEventCollectedItemCount;
});
