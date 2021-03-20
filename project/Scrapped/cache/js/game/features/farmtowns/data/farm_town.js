define('farmtowns/data/farm_town', function() {
	'use strict';

	var GameData = window.GameData;

	return {
		getFarmTownBuildingRequirement : function() {
			return GameData.farm_town.building_requirements;
		},

		getExpansionTimes : function() {
			return GameData.farm_town.expansion_times;
		},

		getExpansionCosts : function() {
			return GameData.farm_town.expansion_costs;
		},

		getUnlockCosts : function() {
			return GameData.farm_town.unlock_costs;
		},

		getClaimUnits : function() {
			return GameData.farm_town.claim_units;
		},

		getClaimTimesNormalResources : function() {
			return GameData.farm_town.claim_resource_cooldowns_normal;
		},

		getClaimTimesBootyResources : function() {
			return GameData.farm_town.claim_resource_cooldowns_booty;
		},

		getClaimTimesUnits : function() {
			return GameData.farm_town.claim_unit_cooldowns;
		},

		getMaxResourceStorage : function() {
			return GameData.farm_town.max_resources_per_day;
		}

	};
});