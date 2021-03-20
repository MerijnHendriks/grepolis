/*global Game */
(function(window) {
	'use strict';

	var GameDataCrm = {

		/**
		 * Returns valid channels
		 *
		 * @return {Object}
		 */
		getValidChannels : function() {
			return Game.constants.crm.channel;
		}
	};

	window.GameDataCrm = GameDataCrm;
}(window));
