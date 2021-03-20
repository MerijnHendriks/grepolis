define('features/olympus/factories/olympus_window_factory', function () {
	'use strict';

	var windows = require('game/windows/ids'),
		WF = require_legacy('WF');

	return {
		openOverviewWindow: function () {
			return WF.open(windows.OLYMPUS_OVERVIEW);
		},

		openTempleInfoWindow: function (temple_id, open_ranking) {
			return WF.open(windows.OLYMPUS_TEMPLE_INFO, {
				args: {
					target_id: temple_id,
					activepagenr: open_ranking ? 2 : 0
				}
			});
		},

		openRankingWindow: function () {
			return WF.open(windows.OLYMPUS_RANKING);
		}
	};
});
