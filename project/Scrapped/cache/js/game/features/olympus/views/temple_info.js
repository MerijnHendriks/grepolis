/* globals Timestamp, GameEvents, AttackCommandWindowFactory, GameData */

define('features/olympus/views/temple_info', function () {
	'use strict';

	var GameViews = require_legacy('GameViews'),
		ViewHelper = require('view/helper'),
		TooltipFactory = require('factories/tooltip_factory'),
		DateHelper = require('helpers/date'),
		OlympusTempleStates = require('enums/olympus_temple_states'),
		BuildingPlace = require_legacy('BuildingPlace'),
		GPWindowMgr = require_legacy('GPWindowMgr'),
		WMap = require('map/wmap'),
		MAX_UNIT_SLOTS = 21,
		TempleInfoHelper = require('features/olympus/helpers/temple_info'),
		AllianceLinkHelper = require('helpers/alliance_link'),
		AllianceFlagHelper = require('helpers/alliance_flag'),
		OlympusHelper = require('helpers/olympus'),
		CommandTypes = require('enums/command_types');

	return GameViews.BaseView.extend({
		initialize: function (options) {
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.is_olympus = this.controller.isOlympus();
			this.render();
		},

		render: function () {
			var small_temple_stage_start = this.controller.getSmallTempleStageStartTime(),
				is_pre_temple_stage_active = this.controller.isPreTempleStageActive(),
				state = this.controller.getState();

			small_temple_stage_start = DateHelper.timestampToDateTime(small_temple_stage_start);

			this.renderTemplate(this.$el, 'temple_info', {
				_game_border: ViewHelper._game_border,
				l10n: this.l10n,
				temple_size: this.controller.getTempleSize(),
				owner: this.getOwner(),
				flag_color: this.getOwnerFlagColor(),
				flag_url: this.getOwnerFlag(),
				is_pre_temple_stage_active: is_pre_temple_stage_active,
				can_start_portal_commands: this.controller.canStartPortalCommands(),
				pre_temple_stage_text: this.l10n.pre_temple_stage_info(small_temple_stage_start),
				state: state,
				state_text: this.getStateText(state)
			});

			this.renderTempleInfoImage();

			this.renderSummarizedSupportTroops();
			this.registerSupportTroopsInfoIcon();
			this.registerSimulatorButton();

			this.renderMovements();

			if (!is_pre_temple_stage_active) {
				this.registerActionButtons();
			}

			this.updateMovementCounts();
			this.registerAllianceLinks();
		},

		registerSupportTroopsInfoIcon: function () {
			this.$el.find('.troops_support .info_icon').tooltip(
				TooltipFactory.getUnitListTooltip(this.controller.getAllUnits())
			);
		},

		registerAllianceLinks: function () {
			AllianceLinkHelper.registerOpenAllianceProfileClick(this.$el.find('.alliance_link'));
		},

		renderTempleInfoImage: function () {
			var $wrapper = this.$el.find('.temple_image_wrapper');

			if (this.is_olympus) {
				this.renderTempleInfoImageOlympus($wrapper);
			} else {
				this.renderTemplate($wrapper, 'temple_info_image', {
					l10n: this.l10n,
					temple_id: this.controller.getTempleId(),
					god: this.controller.getTempleGod(),
					temple_size: this.controller.getTempleSize(),
					name: this.controller.getTempleName()
				});
				this.registerTemplePowersOverlay();
				this.registerBBCodeButton();
			}
		},

		renderTempleInfoImageOlympus: function ($wrapper) {
			this.renderTemplate($wrapper, 'temple_info_image_olympus', {
				l10n: this.l10n,
				temple_id: this.controller.getTempleId(),
				name: this.controller.getTempleName()
			});

			this.registerOlympusJumpProgress();
		},

		registerOlympusJumpProgress: function () {
			var next_jump = this.controller.getNextOlympusJumpTimestamp();

			this.unregisterComponent('olympus_jump_progress');
			this.registerComponent(
				'olympus_jump_progress',
				this.$el.find('.olympus_jump_progress').singleProgressbar({
					caption: this.l10n.next_jump,
					value: next_jump - Timestamp.now(),
					max: Timestamp.fromDays(this.controller.getOlympusJumpDays()),
					type: 'time',
					reverse_progress: true,
					countdown: true,
					countdown_settings: {
						timestamp_end: next_jump,
						display: 'seconds_in_last48_hours_with_left_word'
					}
				})
			);
		},

		registerBBCodeButton: function () {
			var $btn = this.$el.find('.btn_bb_code');
			$btn.off().on('click', function () {
				var $bb_code = this.$el.find('.bb_code');
				$bb_code.toggle();
				$bb_code.select();
			}.bind(this));
			$btn.tooltip(this.l10n.tooltips.bb_code);
		},

		registerSimulatorButton: function () {
			var $btn = this.$el.find('.btn_simulate');
			$btn.off().on('click', function () {
				var sim_units = {
					'att': {},
					'def': this.controller.getAllUnits()
				};

				BuildingPlace.insertUnitsToSimulator(sim_units);
			}.bind(this));
			$btn.tooltip(this.l10n.tooltips.simulator);
		},

		registerActionButtons: function () {
			var $actions = this.$el.find('.temple_actions_wrapper'),
				subcontext = 'action_buttons',
				openAttackOrSupportWindow = function (action) {
					GPWindowMgr.Create(
						GPWindowMgr.TYPE_TOWN,
						this.controller.getTempleName(),
						{ 'action': action },
						{ id: this.controller.getTempleId() }
					);
				};

			this.unregisterComponents(subcontext);
			this.registerComponent('btn_attack', $actions.find('.btn_attack').button({
				caption: this.l10n.attack
			}).on('btn:click', openAttackOrSupportWindow.bind(this, CommandTypes.ATTACK)), subcontext);

			this.registerComponent('btn_support', $actions.find('.btn_support').button({
				caption: this.l10n.support
			}).on('btn:click', openAttackOrSupportWindow.bind(this, CommandTypes.SUPPORT)), subcontext);

			if (this.controller.canStartPortalCommands()) {
				this.registerComponent('btn_portal_attack', $actions.find('.btn_portal_attack').button({
					caption: this.l10n.portal_attack
				}).on('btn:click', function () {
					OlympusHelper.openPortalActionWindow(CommandTypes.PORTAL_ATTACK_OLYMPUS, this.controller.getTempleId());
				}.bind(this)), subcontext);

				this.registerComponent('btn_portal_support', $actions.find('.btn_portal_support').button({
					caption: this.l10n.portal_support
				}).on('btn:click', function () {
					OlympusHelper.openPortalActionWindow(CommandTypes.PORTAL_SUPPORT_OLYMPUS, this.controller.getTempleId());
				}.bind(this)), subcontext);
			}

			$actions.find('.btn_jump_to').off().on('click', function () {
				var coords = {
					ix: this.controller.getTempleIslandX(),
					iy: this.controller.getTempleIslandY()
				};

				WMap.mapJump(coords, false, function () {
					$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
				});
			}.bind(this));
			$actions.find('.btn_jump_to').tooltip(this.l10n.tooltips.jump_to);
		},

		renderSummarizedSupportTroops: function () {
			var units = this.controller.getAllUnits(),
				fragment = TempleInfoHelper.getUnitsFragment(units, !this.is_olympus),
				slots_count = Object.keys(units).length,
				$unit_slots = this.$el.find('.troops_support .unit_slots');

			while (slots_count < MAX_UNIT_SLOTS) {
				var slot = document.createElement('div');
				slot.className = 'empty';
				fragment.appendChild(slot);
				slots_count++;
			}

			$unit_slots.html(fragment);

			if (this.is_olympus) {
				this.renderCurseOverlay($unit_slots.parent());
			}
		},

		renderMovements: function () {
			var fragment = document.createDocumentFragment(),
				movements = this.controller.getMovements(),
				$movements_content = this.$el.find('.troops_movements .content'),
				active_movements = 0;

			this.controller.unregisterTimer('movements_timer');

			movements.forEach(function (movement) {
				var time_left = movement.arrival_at - Timestamp.now();

				if (time_left > 0) {
					var template = us.template(this.controller.getTemplate('command'), {
						id: movement.id,
						type: movement.type,
						time_left: DateHelper.readableSeconds(),
						home_town_link: movement.home_town_link
					});

					$(template).appendTo(fragment);
					active_movements++;
				}
			}.bind(this));

			if (active_movements > 0) {
				$movements_content.html(fragment);
				this.registerScrollbar();
				this.registerMovementsClick($movements_content);
				this.controller.registerTimer('movements_timer', 1000, this.updateMovementsTimer.bind(this, $movements_content));
			} else {
				this.renderNoMovementsText($movements_content);
			}

			this.updateMovementCounts();
		},

		registerMovementsClick: function ($el) {
			$el.off().on('click', function (event) {
				var $target = $(event.target),
					type, movement_id, title = '';

				if (!$target.hasClass('icon')) {
					return;
				}

				type = $target.data('type');
				movement_id = $target.parent().data('movement_id');
				title = this.l10n.command_types[type];
				AttackCommandWindowFactory.openAttackCommandWindow(title, movement_id);
			}.bind(this));
		},

		renderNoMovementsText: function ($movements_content) {
			var div = document.createElement('div');
			div.className = 'centered_text';
			div.innerText = this.l10n.no_movements;

			$movements_content.html(div);
		},

		updateMovementsTimer: function ($movements_content) {
			var movements = this.controller.getMovements(),
				$content = $movements_content.clone(),
				active_movements = 0,
				update_scrollbar = false;

			movements.forEach(function (movement) {
				var $command = $content.find('.command[data-movement_id="' + movement.id + '"]');

				if (movement.arrival_at >= Timestamp.now()) {
					var new_arrival_time = DateHelper.readableSeconds(movement.arrival_at - Timestamp.now());
					$command.find('.time').text(new_arrival_time);
					active_movements++;
				} else {
					$command.remove();
					update_scrollbar = true;
				}
			});

			if (active_movements > 0) {
				$movements_content.html($content.find('.command'));

				if (update_scrollbar) {
					this.updateScrollbar();
				}
			} else {
				this.renderMovements();
			}
		},

		updateScrollbar: function () {
			var scrollbar = this.getComponent('movements_scrollbar', this.sub_context);

			if (scrollbar) {
				scrollbar.update();
			}
		},

		registerScrollbar: function () {
			this.unregisterComponent('movements_scrollbar', this.sub_context);
			this.registerComponent('movements_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'purple',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				elements_to_scroll_position: 'relative',
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				min_slider_size: 16
			}), this.sub_context);
		},

		updateMovementCounts: function () {
			var incoming_attacks = this.controller.getIncomingAttacks(),
				incoming_support = this.controller.getIncomingSupport();

			this.$el.find('.incoming_attacks .value').text(incoming_attacks);
			this.$el.find('.incoming_support .value').text(incoming_support);
		},

		getStateText: function (state) {
			if (state === OlympusTempleStates.UNDER_PROTECTION) {
				return this.l10n.states[state](
					DateHelper.timestampToDateTime(this.controller.getTempleProtectionEndsTimestamp())
				);
			}

			var result = '';

			if (state === OlympusTempleStates.UNDER_SIEGE) {
				result = this.l10n.states[state](
					this.getTakeoverAllianceLink(),
					DateHelper.timestampToDateTime(this.controller.getTakeoverEnd())
				);
			}

			if (!this.controller.isGlobalShieldActive() && !this.is_olympus) {
				result += '</br>' + this.l10n.next_shield_toggle(
					DateHelper.timestampToDateTime(this.controller.getNextGlobalShieldToggle())
				);
			}

			return result;
		},

		getOwner: function () {
			var alliance_id = this.controller.getOwnerAllianceId(),
				alliance_name = this.controller.getOwnerAllianceName();

			if (alliance_id && alliance_name)  {
				return AllianceLinkHelper.getAllianceLink(alliance_id, alliance_name);
			}

			return this.l10n.no_owner;
		},

		getOwnerFlagColor: function () {
			var alliance_id = this.controller.getOwnerAllianceId(),
				custom_colors = this.controller.getCustomColors();

			return AllianceFlagHelper.getFlagColorForAlliance(alliance_id, custom_colors);
		},

		getOwnerFlag: function () {
			var flag_type = this.controller.getOwnerFlagType();
			flag_type = flag_type >= 0 ? flag_type : 0;
			return AllianceFlagHelper.getCdnFlagImageUrl(flag_type);
		},

		getTakeoverAllianceLink: function () {
			var alliance_id = this.controller.getTakeoverAllianceId(),
				alliance_name = this.controller.getTakeoverAllianceName();

			return AllianceLinkHelper.getAllianceLink(alliance_id, alliance_name);
		},

		registerTemplePowersOverlay: function () {
			var powers = this.controller.getTemplePowers(),
				temple = this.controller.getTemple(),
				powers_list = TooltipFactory.getOlympusTemplePowerList(powers, temple),
				god_id = this.controller.getTempleGod(),
				template = this.getTemplate('temple_powers_overlay', {
					god_id: god_id,
					god_name: GameData.gods[god_id].name,
					powers_list: powers_list
				});

			this.$el.find('.temple_image').prepend(template);

			this.unregisterComponent('btn_temple_powers');
			this.registerComponent('btn_temple_powers', this.$el.find('.btn_temple_powers').button({
				toggle: true,
				state: true,
				tooltips: [{ title: this.l10n.tooltips.powers_list_button }]
			}).on('btn:click', function (event, button) {
				this.$el.find('.temple_powers_overlay').toggleClass('hidden', button.state);
			}.bind(this)));
		},

		renderCurseOverlay: function ($el) {
			var template = this.getTemplate('olympus_curse', {
				l10n: this.l10n.olympus_curse
			});

			$el.append(template);
		}
	});
});
