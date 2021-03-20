/**
 * Collection which represents supports for the active town given from
 * different towns.
 *
 * @see top of the support_overview_index.js where are descriptions of all modes
 *
 * @extends GameCollections.Units
 */
(function() {
	'use strict';

	var UnitsCollection = window.GameCollections.Units;
	//var Units = window.GameCollections.UnitsCollection;
	var Units = window.GameModels.Units;

	var SupportForActiveTown = function() {}; // never use this, becasue it will be overwritten

	SupportForActiveTown.model = Units;
	SupportForActiveTown.model_class = 'Units';

	window.GameCollections.SupportForActiveTown = UnitsCollection.extend(SupportForActiveTown);
}());
