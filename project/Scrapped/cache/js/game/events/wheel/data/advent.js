/*globals Game */

(function(window) {
	"use strict";

	var GameDataAdvent = {

		/**
		 * Returns maximal amount of shards player can get
		 *
		 * @return {Number}
		 */
		getMaxAmountOfShards : function() {
			return Game.constants.advent.max_shards;
		},

		/**
		 *
		 * @returns {Array}
		 */
		getShardPositionOnTheWheel : function() {
			return Game.constants.advent.shard_position;
		}
	};

	window.GameDataAdvent = GameDataAdvent;
}(window));
