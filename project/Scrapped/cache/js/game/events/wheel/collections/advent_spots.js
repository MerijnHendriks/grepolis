 (function() {
	'use strict';

	var AdventSpot = window.GameModels.AdventSpot;
	var GrepolisCollection = window.GrepolisCollection;
	var GameEvents = window.GameEvents;
	var AdventSpots = function() {}; // never use this, because it will be overwritten

	AdventSpots.model = AdventSpot;
	AdventSpots.model_class = 'AdventSpot';

	AdventSpots.comparator = 'end';

	AdventSpots.initialize = function() {
		/**
		 * we do not sort on model.add during gameload, so we have to do it here manually
		 */
		$.Observer(GameEvents.game.start).subscribe(['advent_spots'], function() {
			this.sort();
		}.bind(this));
	};

	/**
	 * get spot by number
	 *
	 * @param {Number} spot_number number of spot
	 * @returns {window.GameModels.AdventSpot} or null
	 */
	AdventSpots.getSpot = function(spot_number) {
		var spot = this.where({number : spot_number});

		return spot.length ? spot[0] : null;
	};

	window.GameCollections.AdventSpots = GrepolisCollection.extend(AdventSpots);
}());
