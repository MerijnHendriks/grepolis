/* global GrepolisModel */
(function() {
	'use strict';

	var Maintenance = function () {}; // never use this, because it will be overwritten
	Maintenance.urlRoot = 'Maintenance';

	GrepolisModel.addAttributeReader(Maintenance, 'message');

	Maintenance.onUpdate = function(callback) {
		this.on('change', callback);
	};

	window.GameModels.Maintenance = GrepolisModel.extend(Maintenance);
}());
