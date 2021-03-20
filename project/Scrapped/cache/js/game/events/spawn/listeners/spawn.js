/* global Backbone, MM, GameCollections, Game */

define('events/spawn/listeners/spawn', function() {
	'use strict';

	var BenefitTypes = require('enums/benefit_types');
	var ModelsListener = {

		initialize : function(models, collections) {
			var start_spawn = function() {
				var spawn = MM.getModelByNameAndPlayerId('Spawn');

				if (!MM.getOnlyCollectionByName('SpawnMission')) {
					MM.addCollection(new GameCollections.SpawnMissions());
				}

				if (!spawn) {
					spawn = MM.checkAndPublishRawModel('Spawn', {id: Game.player_id, persistent : true});
				}

				spawn.reFetch(function() {
					window.layout_main_controller.initializeSpawnEvent(spawn);
				});
			};

			var end_spawn = function() {
				$('.ui_city_overview .layout_game_events_items .spawn').empty();
			};

			var spawn_benefit = collections.benefits.getFirstRunningBenefitOfType(BenefitTypes.SPAWN);

			// The Spawn event model is not pushed, but the Benefit is
			// so we reload it manually and then render or hide the event
			collections.benefits.onBenefitStarted (this, function(model) {
				if (model.getBenefitType() === BenefitTypes.SPAWN) {
					start_spawn();
				}
			});

			collections.benefits.onBenefitEnded (this, function(model) {
				if (model.getBenefitType() === BenefitTypes.SPAWN) {
					end_spawn();
				}
			});

			if (spawn_benefit) {
				start_spawn();
			}
		},

		destroy : function() {

		}
	};

	us.extend(ModelsListener, Backbone.Events);

	window.GameListeners.SpawnListener = ModelsListener;
	return ModelsListener;
});
