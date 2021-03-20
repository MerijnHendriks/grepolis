/**
 * Collection which represents supports from the active town given to
 * different towns.
 *
 * @see top of the support_overview_index.js where are descriptions of all modes
 *
 * @extends GameCollections.Units
 */
 (function() {
	"use strict";

	var UnitsCollection = window.GameCollections.Units;
	var Units = window.GameModels.Units;

	var ActiveTownSupportsTowns = function() {}; // never use this, becasue it will be overwritten

	ActiveTownSupportsTowns.model = Units;
	ActiveTownSupportsTowns.model_class = 'Units';

	window.GameCollections.ActiveTownSupportsTowns = UnitsCollection.extend(ActiveTownSupportsTowns);
}());
