/*globals GrepolisModel, ITowns, Game, gpAjax */

(function() {
	'use strict';

	var DateHelper = require('helpers/date');

	function ResourceOffer() {}

	ResourceOffer.urlRoot = 'ResourceOffer';

	ResourceOffer.VISIBILITY_ALL = 0;
	ResourceOffer.VISIBILITY_ALLIANCE = 1;
	ResourceOffer.VISIBILITY_ALLIANCE_PACT = 2;
	ResourceOffer.VISIBILITY_ALL_BUT_ENEMY = 3;

	GrepolisModel.addAttributeReader(ResourceOffer,
		'id',
		'bonus',
		'valid_until',
		'demand',
		'demand_type',
		'distance',
		'duration',
		'duration_seconds',
		'gp_player_link',
		'island_x',
		'island_y',
		'max_distance',
		'max_delivery_time',
		'offer',
		'offer_type',
		'offerer_has_captain',
		'player_id',
		'player_name',
		'alliance_id',
		'alliance_name',
		'flag_type',
		'flag_color', // custom flag color or undefined
		'ratio',
		'pact_status', // war, neutral, peace
		'map_x',
		'map_y',
		'town_id' // only in own offers
	);

	ResourceOffer.getCreatedAt = function() {
		return this.get('created_at_seconds');
	};

	ResourceOffer.getRatio = function() {
		// Offers seem to be different to farm village ratios.
		// This way readableRatio prints the correct order
		return 1 / this.get('ratio');
	};

	ResourceOffer.getCity = function() {
		return ITowns.getTown(this.getTownId()).getName();
	};

	ResourceOffer.getLinkFragment = function() {
		return ITowns.getTown(this.getTownId()).getLinkFragment();
	};

	ResourceOffer.getDuration = function() {
		// the own offers API sends the duration in seconds via delivery_time_current_town
		var duration = this.get('duration_seconds') || this.get('delivery_time_current_town');
		return DateHelper.readableSeconds(duration);
	};

	/*
	 * Instead of creating a new player link, I use the already provided backend
	 * player link and jQuery magic to replace the text with a better shortend name
	 */
	ResourceOffer.getPlayerLink = function() {
		var player_name = this.get('player_name');
		if (!player_name) {
			return Game.player_name;
		}
		var player_name_short = window.ellipsis(player_name, 20);
		return $('<div>').html(this.getGpPlayerLink()).find('a').text(player_name_short).parent().html();
	};

	ResourceOffer.getVisibleFor = function() {
		switch (this.get('visible_for')) {
			case this.VISIBILITY_ALL:
				return 'all';
			case this.VISIBILITY_ALLIANCE:
				return 'alliance';
			case this.VISIBILITY_ALLIANCE_PACT:
				return 'pact';
			case this.VISIBILITY_ALL_BUT_ENEMY:
				return 'not_enemy';
		}
	};

	ResourceOffer.getCustomFlagColorInlineHtml = function() {
		var flag_color = this.getFlagColor();

		if (typeof flag_color !== 'undefined' && flag_color !== null) {
			return 'style="background-color:#'+ flag_color + ';"';
		}
		return '';
	};

	/**
	 * custom overwrite getPactStatus because the backend does not deal with the 'own_alliance' state
	 */
	ResourceOffer.getPactStatus = function() {
		var status = this.get('pact_status'),
			own_alliance_id = Game.alliance_id,
			offer_alliance_id = this.get('alliance_id');

		if (own_alliance_id && own_alliance_id === offer_alliance_id) {
			return 'alliance';
		}
		return status;
	};

	ResourceOffer.trade = function(amount) {
		var index_params = {
			model_url : 'BuildingMarket',
			action_name : 'acceptOffer',
			'arguments': {
				offer_id: this.get('id'),
				amount: amount === undefined ? this.getDemand() : amount
			}
		};

		return gpAjax.ajaxPost('frontend_bridge', 'execute', index_params, false).promise();
	};

	window.GameModels.ResourceOffer = GrepolisModel.extend(ResourceOffer);
}());
