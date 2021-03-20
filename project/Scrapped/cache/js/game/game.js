/*global Game */
(function() {
	'use strict';

	/**
	 * checks whether town token is valid or not
	 *
	 * @param object rx_data
	 * @return boolean
	 */
	function hasValidTownToken(rx_data, t_token) {
		return (rx_data && t_token && Game.townId && t_token === Game.townId);
	}

	window.hasValidTownToken = hasValidTownToken;
}());

