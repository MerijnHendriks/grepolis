/*globals WF, MM, DM, Game, debug */

define('features/farmtowns/factories/farm_town_window_factory', function() {
	'use strict';

	var features = require('data/features');
	var map = require('map/wmap');
	var HumanMessage = require('misc/humanmessage');

	var FarmTownWindowFactory = {
		/**
		 * Open farm town window, BPV and non-BPV
		 * in case of BPV only opens if: on same island like current town and player has a relation model
		*/
		openWindow : function (farm_town_id) {
			if (!features.battlepointVillagesEnabled()) {
				if (Game.dev) {
					debug('NON-BPV Farm Window system requires the use of the context menu');
				}
				return;
			}

			var island = map.mapData.findTownInChunks(Game.townId),
				farm_town_data = MM.getOnlyCollectionByName('FarmTown').get(farm_town_id);

			if (island && typeof farm_town_data !== 'undefined' && farm_town_data.getIslandX() === island.x && farm_town_data.getIslandY() === island.y) {

				var farm_town_relations = MM.getOnlyCollectionByName('FarmTownPlayerRelation');

				if (farm_town_relations.getRelationForFarmTown(farm_town_id)) {
					WF.open('farm_town', {args: {farm_town_id: farm_town_id}} );
				}
			} else {
				HumanMessage.error(DM.getl10n('farm_town').not_on_same_island);
			}
		}
	};

	window.FarmTownWindowFactory = FarmTownWindowFactory;

	return FarmTownWindowFactory;
});
