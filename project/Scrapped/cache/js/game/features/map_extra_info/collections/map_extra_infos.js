/* global TM, WMap */

define('features/map_extra_info/collections/map_extra_infos', function(require) {
    'use strict';

    var Collection = require_legacy('GrepolisCollection');
	var Model = require('features/map_extra_info/models/map_extra_info');
	var GameEvents = require('data/events');
	var Timestamp = require('misc/timestamp');
	var TYPES = require('enums/map_extra_info_types');

    var MapExtraInfos = Collection.extend({
		model : Model,
		model_class : 'MapExtraInfo',
		initialize: function() {
			this.on('add', function(model) {
				var type = model.getType(),
					id = 'MapExtraInfo:' + type + ':' + model.getId(),
					clear_timeout = ((model.getFinishedAt() - Timestamp.now()) * 1000);

				if (type === TYPES.REVOLT) {
					// if the start_at is in the future, we have an uprising revolt
					// if it is in the past, the revolt is running
					// we also add a clear timer to refresh
					var revolt_timeout = (model.getStartAt() - Timestamp.now()) * 1000;

					if (revolt_timeout > 0) {
						TM.once(id, revolt_timeout, function() {
							// revolt is uprising - just refresh the map when phase changes to re-evaluate
							WMap.refresh(true);
						});
					}
				}

				// for all types we add a "clear" timeout and force a refresh of the map
				if (clear_timeout > 0) {
					TM.once(id + '_clear', clear_timeout, function() {
						this.remove(model);
						WMap.refresh(true);
					}.bind(this));
				}
			}.bind(this));

			// after game load: refresh the map when something changes, gets added or removed from here
			// during game load we want to avoid double rendering of the map
			$.Observer(GameEvents.game.load).subscribe(['MapExtraInfos'], function() {
				this.on('add remove change', function() {
					WMap.refresh(true);
				});
			}.bind(this));
		},

		hasRecentAttackOnTown : function(town_id) {
			return this.findWhere({
				type : TYPES.ATTACK,
				town_id : parseInt(town_id, 10)
			}) !== undefined;
		},

		hasRevoltUprisingOnTown : function(town_id) {
			town_id = parseInt(town_id, 10);

			return this.filter(function(model){
				return  model.getType() === TYPES.REVOLT &&
						model.getTownId() === town_id &&
						model.getStartAt() > Timestamp.now();
			}).length > 0;
		},

		hasRevoltRunningOnTown : function(town_id) {
			town_id = parseInt(town_id, 10);

			return this.filter(function(model){
				return  model.getType() === TYPES.REVOLT &&
						model.getTownId() === town_id &&
						(model.getStartAt() < Timestamp.now()) && (model.getFinishedAt() > Timestamp.now());
			}).length > 0;
		},


		hasConquestRunningOnTown : function(town_id) {
			town_id = parseInt(town_id, 10);

			return this.filter(function(model){
				return  model.getType() === TYPES.CONQUEST &&
						model.getTownId() === town_id &&
						model.getFinishedAt() > Timestamp.now();
			}).length > 0;
		},

		/**
		 * remove models given an Array of report ids
		 * @param {[Number]} report_ids
		 * @return {MapExtraInfo} deleted_models
		 */
		removeByReports : function(report_ids) {
			return this.remove(this.filter(function(model) {
				return report_ids.indexOf(model.getReportId()) !== -1;
			}));
		}
    });

	window.GameCollections.MapExtraInfos = MapExtraInfos;

	return MapExtraInfos;
});
