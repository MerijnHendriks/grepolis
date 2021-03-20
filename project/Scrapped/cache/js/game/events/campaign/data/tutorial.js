/* global Game, localforage, Promise,  Raven */

define('events/campaign/data/tutorial', function() {

	'use strict';
	var PLAYER_PREFIX = 'player_' + Game.player_id + '_';
	var LOCALSTORE_PREFIX =  PLAYER_PREFIX + 'SpartaHades2016';
	var PLAYER_HINT_KEY = 'hercules2014_explanation';
    var Features = require('data/features');


	var // player_hint used to save whether the player has already seen the tutorial
		player_hint = null;

	/**
	 * This object manages which tutorial steps are available and which have been shown already.
	 * The information is persisted on the client side
	 */
	var CampaignTutorial = {

		/**
		 * Sets the current tutorial step to the first
		 */
		init: function(player_hints_collection) {
			player_hint = player_hints_collection.getForType(PLAYER_HINT_KEY);
		},

		/**
		 * Checks in backend if the tutorial has been finished before (e.g. i a different browser)
		 */
		hasBeenCompleted: function() {
			return player_hint.isHidden();
		},

		/**
		 * Mark tutorial as finished in backend db via player_hint
		 */
		markAsFinishedInBackend: function() {
			player_hint.disable();
		},

		/** @param {string} step */
		saveStepAsSeen : function(step) {
			localforage
				.setItem(LOCALSTORE_PREFIX + ':' + step, true)
				.catch(function (e) {
					Raven.captureException(e);
				});
		},

		/**
		 * @param {string} step
		 * @return {Promise} - (isStepSeen)
		 */
		isStepSeen : function(step) {
			return new Promise(function(resolve, reject) {
				if (this.hasBeenCompleted()) {
					return resolve(true);
				}
				localforage.getItem(LOCALSTORE_PREFIX + ':' + step)
					.then(resolve)
					.catch(function (e) {
						resolve(true);
						Raven.captureException(e);
					});
			}.bind(this));
		},

		steps : {
			BATTLEGROUND: 'battleground',
			ATTACKING: 'attacking',
			ATTACK_AGAIN: 'attack_again',
			COLLECT_TROOPS: 'collect_troops',
			YOU_WON: 'you_won',
			HONOR_POINTS: 'honor_points',
			RANKING: 'ranking',
			HERO: 'hero',
			WOUNDED_UNITS: 'wounded_units'
		},

		getTutorialOrder : function(has_hero_reward) {
			var tutorial_order = [
				this.steps.BATTLEGROUND,
				this.steps.ATTACKING,
				this.steps.ATTACK_AGAIN,
				this.steps.WOUNDED_UNITS,
				this.steps.COLLECT_TROOPS,
				this.steps.YOU_WON,
				this.steps.HONOR_POINTS,
				this.steps.RANKING
			];

			if (Features.areHeroesEnabled() && has_hero_reward) {
				tutorial_order.push(this.steps.HERO);
			}

			return tutorial_order;
		}

	};

	return CampaignTutorial;
});
