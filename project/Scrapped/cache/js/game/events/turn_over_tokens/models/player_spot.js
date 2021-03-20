/*global window */

define('events/turn_over_tokens/models/player_spot', function(require) {
    'use strict';

    var GrepolisModel = window.GrepolisModel;
	var AssassinsPlayerSpot = GrepolisModel.extend({
		urlRoot: 'AssassinsPlayerSpot',

		shootSpot: function(spot_id, callbacks) {
			return this.execute('fight', {spot_id: spot_id}, callbacks);
		},

		isKilled: function() {
			return this.getIsKilled();
		}
	});

	GrepolisModel.addAttributeReader(AssassinsPlayerSpot.prototype,
		 'id',
		 'spot_id',
		 'type',
		 'tier',
		 'is_killed'
	);

	window.GameModels.AssassinsPlayerSpot = AssassinsPlayerSpot;
	return AssassinsPlayerSpot;
});
