/*globals Promise */
define('events/grid_event/collections/figure_rewards', function () {
	'use strict';

	var Collection = window.GrepolisCollection;
	var GridFigureReward = require('events/grid_event/models/figure_reward');

	var PlayerGridFigureRewards = Collection.extend({
		model: GridFigureReward,
		model_class: 'GridFigureReward',

		comparator: function (a, b) {
			var width_order = b.getFigureWidth() - a.getFigureWidth(),
				height_order = b.getFigureHeight() - a.getFigureHeight();

			return height_order !== 0 ? height_order : width_order;
		},

		getFigureRewards: function () {
			return this.models;
		},

		getFigureTypes: function () {
			var result = [];

			this.models.forEach(function (model) {
				result.push(model.getFigureType());
			});

			return result;
		},

		getFigurePlacements: function () {
			var figure_placements = {};

			this.getFigureRewards().forEach(function (figure) {
				var figure_type = figure.getFigureType();

				if (figure.getIsComplete()) {
					figure_placements[figure_type] = figure.getFigurePlacement();
				}
			});

			return figure_placements;
		},

		getFigureReward: function (figure_type) {
			return this.findWhere({figure_type: figure_type});
		},

		onNumberOfHitsChange: function (obj, callback) {
			obj.listenTo(this, 'change:number_of_hits', callback);
		},

		onIsCompleteChange: function () {
			return new Promise(function(resolve) {
				this.once('change:is_complete', function (model) {
					resolve(model);
				});
			}.bind(this));
		}
	});

	window.GameCollections.PlayerGridFigureRewards = PlayerGridFigureRewards;
	return PlayerGridFigureRewards;
});
