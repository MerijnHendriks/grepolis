/*global $, GameData, _, s, HumanMessage, TooltipFactory, DM, gpAjax, GrepoApiHelper, Game, JSON */
/**
 * Controls the fight simulator
 *
 */

(function() {
	'use strict';

	var GameDataFeatureFlags = require('data/features');

	var FightSimulator = {

		/**
		 * Stores unit types
		 */
		units: {},

		/**
		 * Stores god infos
		 */
		gods: {},

		/**
		 * Stores god id of attacker
		 */
		att_god_id: '',

		/**
		 * Stores god id of defender
		 */
		def_god_id: '',

		/**
		 * @type Oject
		 */
		fight_result: {},

		/**
		 * Saved units displayed in the simulator
		 */
		saved_player_units : {},

		/**
		 * Saved gods displayed in the simulator
		 */
		saved_player_gods : {},

		simulator_configuration : {},

		/**
		 * Initializes the simulator. Attaches popups and shows/hides stuff.
		 */
		initialize: function (options) {
			this.units = options.units || [];
			this.gods = options.gods || [];

			if (!us.isArray(options.player_units)) {
				this.player_units = options.player_units;
				this.saved_player_units = $.extend(true, {}, options.player_units);
			}
			else {
				this.player_units = this.saved_player_units;
			}

			// this is in fact used
			this.att_god_id = '';
			this.def_god_id = '';

			// backup the gods somewhere for when this is refreshed
			this.saved_player_gods = {
				attacker_god_id: options.attacker_god_id,
				defender_god_id: options.defender_god_id
			};

			this.refreshForm();

			this.registerTooltips();

			var that = this;
			$('#simulator_mods_morale').unbind('click').bind('click', function () {
				that.openMoral();
			});

			$('#simulator_body').find('.unit:not(.hero_unit)').click(function () {
				var unit_id = $(this).attr('id').replace('building_place_', '');
				var unit_max = Math.floor($(this).find('span').text());
				var input_field = $('input[name="sim[units][att][' + unit_id + ']"]:visible');
				if (parseInt(input_field.val(), 10) === unit_max) {
					input_field.val(0);
				} else {
					input_field.val(unit_max);
				}
			});

			$('.place_sim_wrap_mods').find('input').blur(function () {
				that.closeModsExtended();
			});

			$('.place_sim_select_gods.att select').val(options.attacker_god_id).change();
			$('.place_sim_select_gods.def select').val(options.defender_god_id).change();
		},

		registerTooltips: function() {
			var l10n = DM.getl10n('COMMON', 'simulator'),
				table = $('table.place_simulator_table');

			// Attach unit popups
			$.each(GameData.units, function (unit) {
				$('#building_place_' + unit).setPopup(unit + '_details');
			});

			// attach mouse popups to images
			var img_popups = $('table.place_simulator_table img[alt], table.place_simulator_table .place_image, table.place_simulator_table .power');
			img_popups.each(function (i, elm) {
				elm = $(elm);
				var text = elm.data('title') || elm.attr('alt') || elm.attr('title');
				if (text.length) {
					elm.tooltip(text);
				}
			});

			$('#insert_survives_def_units').tooltip(l10n.insert_survivors);
			$('#flip_troops').tooltip(l10n.flip_troops);

			table.find('.is_night').tooltip(l10n.night_bonus);
			table.find('.building_tower').tooltip(l10n.tower);
			table.find('.pa_commander').tooltip(l10n.commander);
			table.find('.pa_captain').tooltip(l10n.captain);
			table.find('.pa_priest').tooltip(l10n.priestess);

			table.find('.research_ram').tooltip(GameData.researches.ram.description);
			table.find('.research_phalanx').tooltip(GameData.researches.phalanx.description);
			table.find('.strategy_breach').tooltip(GameData.researches.breach.description);
			if (GameDataFeatureFlags.areExtendedWorldFeaturesEnabled()) {
                table.find('.research_combat_experience').tooltip(GameData.researches.combat_experience.description);
				table.find('.research_divine_selection').tooltip(GameData.researches.divine_selection.description);
			}
		},

		/**
		 * Sends setup and requests results. Results will be shown through ajax callbacks.
		 *
		 */
		simulate: function () {
			var params = $('#place_simulator_form').serializeArray(),
				heroes_attack = $('#hero_attack_value').val(),
				heroes_defense = $('#hero_defense_value').val(),
				configuration;

			if (heroes_attack) {

				params.push({
					name: 'sim[units][att]['+heroes_attack+']',
					value: $('#hero_attack_level').val()
				});
			}

			if (heroes_defense) {
				params.push({
					name: 'sim[units][def]['+heroes_defense+']',
					value: $('#hero_defense_level').val()
				});
			}

			if (Game.features.simulator_power_window) {
				params.push({
					name: 'sim[power_configuration]',
					value: JSON.stringify(this.simulator_configuration)
				});
			}

			configuration = $.param(params);

			// Simulate fight
			this.executePost('simulate', {'simulator': configuration} , function (data) {
				var unit_id, count, data_heroes = GameData.heroes, $hero_level;

				for (unit_id in data.att_losses) {
					if (data.att_losses.hasOwnProperty(unit_id)) {
						count = data.att_losses[unit_id];
						$('#building_place_att_losses_' + unit_id).text(count || '');
						$hero_level = $('.place_sim_hero_attack .' + unit_id + ' #hero_attack_text');

						if (data_heroes.hasOwnProperty(unit_id) && $hero_level.length) {
							$hero_level.css({color : count > 0 ? 'red' : '#F8D257'});
						}
					}
				}
				for (unit_id in data.def_losses) {
					if (data.def_losses.hasOwnProperty(unit_id)) {
						count = data.def_losses[unit_id];
						$('#building_place_def_losses_' + unit_id).text(count ? count : '');
						$hero_level = $('.place_sim_hero_defense .' + unit_id + ' span');

						if (data_heroes.hasOwnProperty(unit_id) && $hero_level.length) {
							$hero_level.css({color : count > 0 ? 'red' : '#F8D257'});
						}
					}
				}

				$(".att_killpoints").text("+" + data.battle_points.att);
				$(".def_killpoints").text("+" + data.battle_points.def);

				$('#building_place_def_losses_wall_level').text(data.wall_loss);
				this.fight_result = data;
			}.bind(this));
			return false;
		},


		/**
		 * Switch god in simulator
		 *
		 */
		switchGod: function (player, god_id) {
			// set god id of attacker/defender
			var old_god_id = this[player + '_god_id'];
			this[player + '_god_id'] = god_id;

			// reset units
			this.refreshForm(player, old_god_id, god_id);
		},

		/**
		 * Refreshed the form. Hides and shows units depending on chosen gods of att and def player.
		 *
		 */
		refreshForm: function (player, old_god_id, god_id) {
			var god;
			// Hide all god columns and also the input fields for both players
			$('td.building_place_all').hide();
			for (god in this.gods) {
				if (this.gods.hasOwnProperty(god)) {
					$('td.building_place_' + god).hide();
					$('input.building_place_att_' + god).hide();
					$('input.building_place_def_' + god).hide();

					if (player && god !== god_id) {
						$('input.building_place_' + player + '_' + god).val(0);
					}

					$('input.building_place_att_' + god + '[type="checkbox"]').prop('checked', false);
					$('input.building_place_def_' + god + '[type="checkbox"]').prop('checked', false);
				}
			}

			//Units like 'godsent' are assigned to all gods, and there are not in the 'this.gods' object
			$('td.building_place_all').show();

			if (this.att_god_id || this.def_god_id) {
				$('td.building_place_all').show();

				// Show correct gods columns
				$('td.building_place_' + this.att_god_id).show();
				$('td.building_place_' + this.def_god_id).show();

				// Show input fields for this player
				$('input.building_place_att_' + this.att_god_id).show();
				$('input.building_place_def_' + this.def_god_id).show();
			}
		},

		/**
		 * shows inner window curtain
		 */
		showInnerCurtain: function() {
			$('#place_simulator_form .window_inner_curtain').show();
		},

		/**
		 * hide inner window curtain
		 */
		hideInnerCurtain: function() {
			$('#place_simulator_form .window_inner_curtain').hide();
		},

		/**
		 * Shows the extended modification inputs
		 */
		openModsExtended: function () {
			var $mods_extended = $('div.place_sim_wrap_mods_extended');

			this.showInnerCurtain();
			$mods_extended.fadeIn(100);

			$mods_extended.find('.power').each(function(i, el) {
				var $el = $(el),
					data = $el.data(),
					power_id = data.powerId,
					power_configuration = GameData.powers[power_id].meta_defaults,
					tooltip = TooltipFactory.createPowerTooltip(power_id, {show_costs : false}, power_configuration);

				$(el).tooltip(tooltip, {width: 370});
			});

			return false;
		},

		/**
		 * Hides extended modifications, send them via ajax and writes modification info into
		 * document.
		 */
		closeModsExtended: function () {
			var params = $('#place_simulator_form').serialize();

			// Simulate fight
			this.executePost('simulate_bonuses', {'simulator': params} , function (data) {
				var i;
				for (i in data) {
					if (data.hasOwnProperty(i)) {
						// i will be somtehing like 'att_ground_factor', 'def_naval_factor', ..
						$('td.building_place_' + i + ' span.percentage').text(data[i] + '%');
					}
				}
				this.hideInnerCurtain();
				$('div.place_sim_wrap_mods_extended').fadeOut(100);
			}.bind(this));

			return false;
		},


		/**
		 * Shows the extended modification inputs
		 */
		openMoral: function () {
			$('div.place_sim_wrap_mods_extended').fadeOut(100);
			$('div.place_sim_wrap_mods_moral').fadeIn(100);
			return false;
		},

		/**
		 * Hides extended modifications, send them via ajax and writes modification info into
		 * document.
		 */
		closeMoral: function () {
			var defender_name = $('#morale_player_name').val();
			if (defender_name.length > 0) {
				// Simulate fight
				this.executePost('simulate_moral', {'defender_name': defender_name} , function (data) {
					$('input[name="sim[mods][att][morale]"]').val(parseInt(data.morale, 10));
					$('div.place_sim_wrap_mods_moral').fadeOut(100);
				}.bind(this));
			} else {
				$('input[name="sim[mods][att][morale]"]').val('');
				$('div.place_sim_wrap_mods_moral').fadeOut(100);
			}

			return false;
		},


		/**
		 * Insert an object of units into unit input fields
		 *
		 * @param units Object - (unit_type: count)
		 * @param type String - "att" or "def"
		 */
		insertUnits: function (units, type) {
			this.insert(units, type, 'units');
		},

		/**
		 * Insert an object of units into unit input fields
		 *
		 * @param units Object - (unit_type: count)
		 * @param type String - "att" or "def"
		 * @param object String - "units" or "mods"
		 */
		insert: function (units, type, object) {
			$.each(units, function (unit_id, count) {
				var field_name = s('sim[%1][%2][%3]', object, type, unit_id);
				$('input[name="' + field_name + '"]').val(count);
			});
		},

		/**
		 * Get home units via Ajax and insert intut fields
		 */
		insertHomeUnits: function () {
			var type = $('#select_insert_units').val();
			gpAjax.ajaxGet('building_place', 'get_home_units', {type: type}, false, function (data) {
				FightSimulator.insertUnits(data.units, type);
			});
		},

		insertSurvivesDefUnitsAsNewDefender: function () {
			var survivers,
				wall;

			if (!this.fight_result.def_survives) {
				HumanMessage.error(_('No battle has taken place yet'));
				return false;
			}
			//insert defender units

			survivers = this.fight_result.def_survives;
			wall = {wall_level : parseInt($('input[name="sim[mods][def][wall_level]"]')[0].value, 10) - this.fight_result.wall_loss};

			this.insertUnits(survivers, 'def');
			this.insert(wall, 'def', 'mods');

			//cleanup last fight result
			$('td.place_losses').empty();

			//recalculate fight
			this.simulate();
			return false;
		},

		flipAttackerDefenderValues : function() {
			$.each($('#place_simulator_form').serializeArray(), function (index, field_data) {
				var field_name = field_data.name,
					amount = field_data.value;

				// switch the field names by refacing att with def and def with att and
				// re-insert into the forms

				var att_pos = field_name.indexOf('[att]'),
					def_pos = field_name.indexOf('[def]');

				if (att_pos !== -1) {
					field_name = field_name.replace('[att]','[def]');
				} else if (def_pos !== -1) {
					field_name = field_name.replace('[def]','[att]');
				}

				$('input[name="' + field_name + '"]').val(amount);
			});
		},

		executePost : function(method, parameters, callback) {
			if (GameDataFeatureFlags.isPowerWindowSimulatorActive()) {
				var param_value = Object.values(parameters)[0];
				return GrepoApiHelper.execute('Simulator', method.camelCase(), {'params' : param_value }, callback);
			}

			return gpAjax.ajaxPost('building_place', method, parameters, false, callback);
		}
	};

	window.FightSimulator = FightSimulator;
}());
