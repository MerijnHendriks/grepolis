/* global MM, Timestamp */

define('models/town/takeover', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var TYPES = require('enums/map_extra_info_types');

	var Takeover = GrepolisModel.extend({
		urlRoot : 'Takeover',

		initialize : function() {
			this.towns_collection = MM.getOnlyCollectionByName('Town');
			this.id = this.getId();
		},

		isIncomingRevolt : function() {
			var origin_town_id = this.getOriginTown().id,
				destination_town_id = this.getDestinationTown().id,
				command_type = this.getCommand().type;

			return !origin_town_id && command_type === TYPES.REVOLT && this.towns_collection.isMyOwnTown(destination_town_id);
		},

		isIncomingTakeOver : function() {
			var destination_town_id = this.getDestinationTown().id,
				command_type = this.getCommand().type;

			return command_type === TYPES.TAKE_OVER && this.towns_collection.isMyOwnTown(destination_town_id);
		}
	});

	GrepolisModel.addAttributeReader(Takeover.prototype,
		'id',
		'command',
		'destination_town',
		'origin_town',
		'units'
	);

	window.GameModels.Takeover = Takeover;
	return Takeover;
});
