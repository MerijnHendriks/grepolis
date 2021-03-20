/* global Game */

define('features/world_wonder_donations/models/wonder_participation', function(require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

	var WonderParticipation = GrepolisModel.extend({
		urlRoot : 'WonderParticipation',

		onChange: function(obj, callback) {
			return obj.listenTo(this, 'change', callback);
		},

		getSilver: function() {
			return this.getIron();
		},

		getTotal: function() {
			return this.getWood() + this.getSilver() + this.getStone();
		},

		getWood: function() {
			return this.get('wood') || 0;
		},

		getIron: function() {
			return this.get('iron') || 0;
		},

		getStone: function() {
			return this.get('stone') || 0;
		},

		isCurrentPlayer: function() {
			return Game.player_id === this.getPlayerId();
		},

		/**
		 * set the isDisplayed property on this model which
		 * is used to mark models as shown / hidden in the view.
		 * Is updated silently to avoid interfering with "real"
		 * model updates and re-renderings triggerd by onChange
		 */
		showInResults: function() {
			this.set({isDisplayed: true}, {silent: true});
		},

		hideFromResults : function() {
			this.set({isDisplayed: false}, {silent: true});
		}
	});

	GrepolisModel.addAttributeReader(WonderParticipation.prototype,
		'id',
		'wonder_type',
		'alliance_id',
		'player_id',
		'name',
		'wonder_type',
		'town_count',
		'still_in_alliance'
	);

	window.GameModels.WonderParticipation = WonderParticipation;

	return WonderParticipation;
});
