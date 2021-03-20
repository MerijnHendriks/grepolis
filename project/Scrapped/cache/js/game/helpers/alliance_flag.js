/* globals Game */

define('helpers/alliance_flag', function () {
	'use strict';

	var GREY_HEX_COLOR = '666',
		DefaultColorsHelper = require('helpers/default_colors');

	return {
		getCdnFlagImageUrl: function (flag_type) {
			return Game.game_url + '/images/game/flags/big/flag' + flag_type + '.png';
		},

		getFlagColorForAlliance: function (alliance_id, custom_colors_collection) {
			var alliance_color;


			if (alliance_id && alliance_id === Game.alliance_id) {
				alliance_color = custom_colors_collection.getCustomColorForOwnAlliance();
			} else {
				alliance_color = this.getFlagColorForNotOwnedAlliance(alliance_id, custom_colors_collection);
			}

			if (!alliance_color) {
				alliance_color = DefaultColorsHelper.getDefaultColorForAlliance(alliance_id);
			}

			return '#' + (alliance_color ? alliance_color : GREY_HEX_COLOR);
		},

		getFlagColorForNotOwnedAlliance: function (alliance_id, custom_colors_collection) {
			var custom_alliance_color = custom_colors_collection.checkIfAllianceHasCustomColor(alliance_id);
			return  custom_alliance_color ? custom_alliance_color.getColor() : null;
		}
	};
});
