/* globals Timestamp */

define('features/olympus/models/temple_info', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var TempleInfo =  GrepolisModel.extend({
		urlRoot: 'TempleInfo',

		getActiveMovementsCountByTypes: function (types) {
			return this.getMovements().filter(function (movement) {
				return movement.type &&
					types.indexOf(movement.type) >= 0 &&
					movement.arrival_at > Timestamp.now();
			}).length;
		},

		sendBack: function (units_id, callback) {
			this.execute('sendBack', {
				target_id: this.getId(),
				support_id: units_id
			}, callback);
		},

		sendBackPart: function (units_id, units, callback) {
			this.execute('sendBackPart', {
				target_id: this.getId(),
				units_id: units_id,
				params: units
			}, callback);
		},

		sendBackAllUnits: function (callback) {
			this.execute('sendBackAllUnits', {
				target_id: this.getId()
			}, callback);
		},

		onStateChange: function (obj, callback) {
			obj.listenTo(this, 'change:state', callback);
		},

		onUnitsChange: function (obj, callback) {
			obj.listenTo(this, 'change:units', callback);
		},

		onMovementsChange: function (obj, callback) {
			obj.listenTo(this, 'change:movements', callback);
		}
	});

	GrepolisModel.addAttributeReader(TempleInfo.prototype,
		'id',
		'units',
		'movements',
		'state',
		'shield_time_remaining',
		'takeover',
		'flag_type'
	);

	window.GameModels.TempleInfo = TempleInfo;

	return TempleInfo;
});
