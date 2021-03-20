define('features/olympus/models/temple', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel'),
		Temple = GrepolisModel.extend({
			urlRoot: 'Temple',

			onAllianceIdChange: function (obj, callback) {
				obj.listenTo(this, 'change:alliance_id', callback);
			},

			isPortalTemple: function () {
				return this.getBuff().hasOwnProperty('portal_to_olympus_alliance');
			}
		});

	GrepolisModel.addAttributeReader(Temple.prototype,
		'id',
		'island_x',
		'island_y',
		'sea',
		'island_xy',
		'chunks_x',
		'chunks_y',
		'name',
		'temple_size',
		'god',
		'buff',
		'alliance_id',
		'alliance_name',
		'temple_protection_ends'
	);

	window.GameModels.Temple = Temple;

	return Temple;
});
