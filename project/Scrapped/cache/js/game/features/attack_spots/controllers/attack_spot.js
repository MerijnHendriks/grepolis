/* global Game, GameData */
define('features/attack_spots/controllers/attack_spot', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var GameDataUnits = require_legacy('GameDataUnits');
	var View = require('features/attack_spots/views/attack_spot');
	var HelperSimulator = require('features/fatal_attack_warning/helpers/fight_simulator');
	var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
	var GameEvents = require('data/events');
	var GamePlayerAttackSpotData = require('features/attack_spots/data/player_attack_spot');
	var AttackSpotWindowFactory = require('features/attack_spots/factories/attack_spot');
	var GameDataHeroes = require('data/heroes');
	var UnitPickerController = require('features/unit_picker/controllers/unit_picker');
	var GroundUnits = require('enums/ground_units');

	return GameControllers.TabController.extend({
		initialize: function(options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
			this.select_all_toggle_state = false;
			this.SHOW_RUNTIMES_MIN_LEVEL = 10;
		},

		registerEventListeners: function() {
			this.stopListening();

			var attack_spot_model = this.getModel('player_attack_spot');

			this.getCollection('units').onUnitsChange(this, this.renderPage.bind(this));
			this.stopObservingEvent(GameEvents.town.town_switch);
			this.observeEvent(GameEvents.town.town_switch, this.townSwitchEvent.bind(this));
			attack_spot_model.onDestroy(this, this.closeWindow);
			attack_spot_model.onRewardStateChanged(this, this.checkAndOpenVictoryWindow);
		},

		renderPage: function() {
			this.unregisterController('unit_picker');
			this.registerController('unit_picker', new UnitPickerController({
				parent_controller: this,
				collections: {
					units: this.getCollection('units')
				},
				settings: {
					el_selector: '.unit_picker_container',
					show_capacity_bar: false,
					show_zero_amount_units: true,
					show_laurels: false,
					show_expand_button: false,
					show_simulator_button: true,
					show_runtime_simulator: true,
					show_max_booty: false,
					show_needed_transport: false,
					show_hero: true,
					show_land_units: true,
					show_naval_units: false,
					show_runtimes: this.getModel('player_attack_spot').getLevel() >= this.SHOW_RUNTIMES_MIN_LEVEL,
					runtimes: this.getUnitRuntimes.bind(this),
					action_button_getter: function () {
						return this.getComponent('btn_attack');
					}.bind(this),
					line_break_before: '',
					// window_model is used to save input values over a re-render loop
					window_model: this.window_model,
					npc_units: this.getNPCUnits(),
					filter_units: {ground_units: ['catapult']},
                    onRenderComplete: this.registerUnitPickerEventListeners.bind(this)
				}
			}));

			this.initializeView();
			this.updateWindowTitle();

			this.getController('unit_picker').renderPage();
		},

		initializeView: function() {
			this.view = new View({
				controller: this,
				el: this.$el
			});
			this.registerEventListeners();
			this.refreshUnitRuntimes();
		},

        registerUnitPickerEventListeners: function () {
			this.$el.find('.defending_units .enemy_units_box').on('mouseenter mouseleave', function (e) {
                var $target = $(e.currentTarget),
					$highlight = $target.find('.highlight'),
					def_unit = $target.data('type'),
					att_unit;

                switch (def_unit) {
					case GroundUnits.SWORD:
					case GroundUnits.RIDER:
					case GroundUnits.CHARIOT:
						att_unit = GroundUnits.HOPLITE;
						break;
					case GroundUnits.SLINGER:
					case GroundUnits.HOPLITE:
						att_unit = GroundUnits.SLINGER;
						break;
					case GroundUnits.ARCHER:
						att_unit = GroundUnits.RIDER;
						break;
				}

				$highlight.toggle();
                this.$el.find('.attacking_units .unit[data-unit_id="' + att_unit + '"]').toggleClass('highlight');
			}.bind(this));

            this.$el.find('.attacking_units .unit').on('mouseenter mouseleave', function (e) {
            	var unit_type = $(e.currentTarget).data('unit_id'),
					unit = GameDataUnits.getUnit(unit_type);

				if (unit) {
                    this.$el.find('.defending_units .stat[data-type="def_' + unit.attack_type + '"]').toggleClass('highlight');
                }
			}.bind(this));
        },

		updateWindowTitle: function() {
			// we count the level from 0..99, display it from 1..100
			var max_level = GamePlayerAttackSpotData.getMaxLevel() + 1,
				current_level = this.getModel('player_attack_spot').getLevel() + 1;

			this.setWindowTitle(this.l10n.window_title + ' (' + current_level + ' / ' + max_level + ')');
		},

		/**
		 * if we have a reward, close the attack window and open the victory window
		 */
		checkAndOpenVictoryWindow: function() {
			if (this.getModel('player_attack_spot').hasReward()) {
				this.closeWindow();
				AttackSpotWindowFactory.openWindow();
			}
		},

		/**
		 * re-render on town switch
		 */
		townSwitchEvent: function() {
			this.initializeView();
		},

		/**
		 * tell the model to update the unit runtimes for the current town
		 */
		refreshUnitRuntimes: function() {
			this.getModel('player_attack_spot').refreshUnitRuntimes();
		},

		/**
		 * battlepoints are rewarded, additionally to resources
		 * @returns {Number}
		 */
		getRewardBP: function() {
			return this.getModel('player_attack_spot').getBattlePoints();
		},

		/**
		 * rewards/ powers may be rewarded
		 */
		getRewards: function() {
			return [this.getModel('player_attack_spot').getReward()];
		},

		/**
		 * return hash with all values from the input_boxes != 0
		 * { sword: 33, slinger: 13 }
		 *
		 * the way the hero gets added to this has differs for the attack action and the simulator (defined by APIs)
		 * simulator: the hero will be added as <heroId>: <level>
		 * non-simulator: the hero will be added as 'heroes': <heroId>
		 *
		 * @param {boolean} simulator
		 * @returns {Object} units
		 */
		getSelectedUnits : function(simulator) {
			return this.getController('unit_picker').getSelectedUnits(simulator);
		},

		// get enemy units for the current attack_spot mission
		getNPCUnits: function() {
			return this.getModel('player_attack_spot').getUnits();
		},

		getNPCUnitsAndData: function() {
			var units = this.getNPCUnits();
			var unitsWithData = us.map(units, function (amount, unit_id) {
				var unitData = GameData.units[unit_id];
				return {
					unit_name: unit_id,
					amount: amount,
					def_hack: unitData.def_hack,
					def_pierce: unitData.def_pierce,
					def_distance: unitData.def_distance
				};
			});
			return unitsWithData;
		},

		simulateAttack: function() {
			var units_for_simulator = this.getSelectedUnits(true),
				units_for_attack = this.getSelectedUnits(false),
				npc_units = this.getNPCUnits(),
				simulator_units_array = HelperSimulator.buildSimulatorUnitsArrayForFatalAttackCheck(units_for_simulator, npc_units),
				do_attack = function () {
					this.getModel('player_attack_spot').attack(units_for_attack);
					this.closeWindow();
				}.bind(this);

			HelperSimulator.simulateFight(simulator_units_array)
				.then(HelperSimulator.isAttackFatal)
				.then(function (is_fatal) {
					if (is_fatal) {
						ConfirmationWindowFactory.openConfirmationFatalAttack(function () {
							do_attack();
						});
					} else {
						do_attack();
					}
				});
		},

		hasCooldown: function() {
			return this.getModel('player_attack_spot').hasCooldown();
		},

		getCooldownDuration: function() {
			return this.getModel('player_attack_spot').getCooldownDuration();
		},

		getCooldownAt: function() {
			return this.getModel('player_attack_spot').getCooldownAt();
		},

		getHeroCollection: function() {
			return this.getCollection('player_heroes');
		},

		hasHeroInCurrentTown: function() {
			return GameDataHeroes.areHeroesEnabled() && this.getHeroCollection().getHeroOfTown(Game.townId);
		},

		getHeroId: function() {
			return this.getHeroCollection().getHeroOfTown(Game.townId).getId();
		},

		hideLaurelsIfNoHeroInTown: function() {
			if (GameDataHeroes.areHeroesEnabled()) {
				return this.hasHeroInCurrentTown();
			}
			return true;
		},

		getUnitRuntimes: function() {
			return {
				ground_units: this.getModel('player_attack_spot').getUnitRuntimes()
			};
		}

	});
});

