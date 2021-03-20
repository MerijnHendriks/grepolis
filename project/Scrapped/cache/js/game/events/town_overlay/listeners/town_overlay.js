/* global Backbone */

define('events/town_overlay/listeners/town_overlay', function () {
	'use strict';

	var BenefitTypes = require('enums/benefit_types');

	var TownOverlayListener = {
		initialize: function (models, collections) {

			var start_town_overlay = function () {
                window.layout_main_controller.initializeGameEventsItems();
			};

			var end_town_overlay = function () {
				$('.ui_city_overview .layout_game_events_items .town_overlay').remove();
			};

			// The Spawn event model is not pushed, but the Benefit is
			// so we reload it manually and then render or hide the eventt
			collections.benefits.onBenefitStarted(this, function(model) {
				if (model.getBenefitType() === BenefitTypes.TOWN_OVERLAY) {
                    start_town_overlay();
				}
			});

			collections.benefits.onBenefitEnded(this, function(model) {
				if (model.getBenefitType() === BenefitTypes.TOWN_OVERLAY) {
                    end_town_overlay();
				}
			});

		},

		destroy: function () {

		}
	};

	us.extend(TownOverlayListener, Backbone.Events);

	window.GameListeners.TownOverlayListener = TownOverlayListener;
	return TownOverlayListener;
});