/* global us */
define('features/world_wonder_donations/collections/wonder_participations', function(require) {
    'use strict';

	var Collection = require_legacy('GrepolisCollection');
	var Model = require('features/world_wonder_donations/models/wonder_participation');

	var WonderParticipations = Collection.extend({
		model : Model,
		model_class : 'WonderParticipation',

		comparator: function(a, b) {
			return b.getTotal() - a.getTotal();
		},

		getTotalDonationAmount: function(wonder_type) {
			var models = wonder_type && wonder_type !== 'all' ? this.where({wonder_type: wonder_type}) : this.models;
			return models.reduce(function(sum, donation) {
				return sum + donation.getTotal();
			}, 0);
		},

		onChange: function(obj, callback) {
			obj.listenTo(this, 'change add', callback);
		},

		/**
		 * Returns an array of new WonderParticipation each representing a current alliance member except the given excludes.
		 * WonderParticipation model will have all donation amounts set to 0.
		 *
		 * @param {Array<Number>} excluded_players
		 * @return {Array<WonderParticipation>}
		 */
		createEmptyModels: function(excluded_players) {
			var isExcluded = function(values, player_id) {
				return us.contains(excluded_players, player_id);
			},
			toEmptyWonderParticipationModel = function(donations) {
				return new Model({
					wonder_type: null,
					alliance_id: donations[0].getAllianceId(),
					still_in_alliance: true,
					player_id: donations[0].getPlayerId(),
					name: donations[0].getName(),
					town_count: donations[0].getTownCount(),
					wood: 0,
					iron: 0,
					stone: 0
				});
			},
			non_excluded_by_player_id = us
				.chain(this.where({still_in_alliance: true}))
				.groupBy(function(model) {
					return model.getPlayerId();
				})
				.reject(isExcluded)
				.value();

			return non_excluded_by_player_id.map(toEmptyWonderParticipationModel);
		}
	});

	window.GameCollections.WonderParticipations = WonderParticipations;
	return WonderParticipations;
});
