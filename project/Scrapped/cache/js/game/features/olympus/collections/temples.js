/*global Game */
define('features/olympus/collections/temples', function () {
	"use strict";

	var GrepolisCollection = window.GrepolisCollection,
		Temple = require('features/olympus/models/temple'),
		TempleSizes = require('enums/temple_sizes');

	var Temples = GrepolisCollection.extend({
		model: Temple,
		model_class: 'Temple',

		getTempleById: function (temple_id) {
			return this.findWhere({id: temple_id});
		},

		getTemplesBySize: function (temple_size) {
			return this.where({temple_size: temple_size});
		},

		getTempleByIslandXY: function (island_xy) {
			return this.findWhere({island_xy: island_xy});
		},

		getPortalTemples: function () {
			return this.models.filter(function (model) {
				return Game.alliance_id !== null &&
					model.getAllianceId() === Game.alliance_id &&
					model.isPortalTemple();
			});
		},

		getLargeTemplesOwnedCount: function () {
			var owned_temples = this.models.filter(function (model) {
				return model.getTempleSize() === TempleSizes.LARGE && model.getAllianceId() !== null;
			});

			return owned_temples.length;
		},

		onAllianceIdChange: function (obj, callback) {
			obj.listenTo(this, 'change:alliance_id', callback);
		}
	});

	window.GameCollections.Temples = Temples;

	return Temples;
});
