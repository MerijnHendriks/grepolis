/*global window */

/**
 * collections of all gained ingredients so far
 */
(function()	{

	'use strict';

	var Collection = window.GrepolisCollection;
	var CampaignDroppedUnits = window.GameModels.CampaignDroppedUnits;

	var DroppedUnits = function() {}; // never use this, because it will be overwritten

	DroppedUnits.model = CampaignDroppedUnits;
	DroppedUnits.model_class = 'CampaignDroppedUnits';

	/**
	 * Returns models which contains dropped units
	 *
	 * @return {GameModels.CampaignDroppedUnits}
	 */
	DroppedUnits.getDroppedUnits = function() {
		return this.models;
	};

	/**
	 * Adding new models to this collection event.
	 *
	 * @param {Function} callback
	 */
	DroppedUnits.onReceivingUnit = function(callback) {
		this.listenTo(this, 'add', callback);
	};

	window.GameCollections.CampaignDroppedUnits = Collection.extend(DroppedUnits);
}());
