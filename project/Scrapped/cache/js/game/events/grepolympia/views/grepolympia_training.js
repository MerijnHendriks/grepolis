/* globals gtime, DM, Timestamp, NotificationLoader, DateHelper, GameData */
define('events/grepolympia/views/grepolympia_training', function(require) {
	'use strict';

	var TooltipFactory = require_legacy('TooltipFactory');

	var View = window.GameViews.BaseView,
	l10n = {
			premium : DM.getl10n('COMMON', 'premium'),
			gui : DM.getl10n('COMMON', 'gui'),
			time : DM.getl10n('COMMON', 'time')
	};

	var GrepolympiaTrainingView = View.extend({

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			var controller = this.controller;
			this.renderTemplate(this.$el, 'training', {
				l10n: $.extend({time : l10n.time}, this.l10n),
				discipline: controller.getActiveGrepolympiaDiscipline(),
				is_training : controller.isTraining(),
				slot_data : controller.getSlotData(),
				extra_slot_count : controller.getExtraSlotCount(),
				isBonusActive : controller.isBonusActive()
			});

			this.renderSubTemplates();
			this.registerEventComponents();
		},

		reRender : function() {
			this.render();
		},

		renderSubTemplates : function() {
			this.renderTrainingGroundTemplate();
			this.renderSkillsTemplate();
		},

		renderTrainingGroundTemplate : function() {
			var controller = this.controller,
				window_args = controller.getWindowModel().getArguments();

			this.renderTemplate(this.$el.find('.middle_box.training'), 'training_ground', {
				l10n: this.l10n,
				slot_data : controller.getSlotData(),
				extra_slot_count : controller.getExtraSlotCount(),
				isBonusActive : controller.isBonusActive(),
                skin : window_args.window_skin ? window_args.window_skin : '',
                athlete_boost_active : controller.getAthleteBoostActive()
			});
			this.setTrainingGroundTitle();
		},

		setTrainingGroundTitle : function() {
			var discipline_name = this.l10n.disciplines[this.controller.getActiveGrepolympiaDiscipline()],
				title_text = this.l10n.training_ground.title(discipline_name, this.controller.getAthleteLevel());

			this.$el.find('.content .title').text(title_text);
		},

		renderSkillsTemplate : function() {
			var controller = this.controller,
				$table_skill_points = this.$el.find('.skill_points_box .table_skillpoints');

			$table_skill_points.html('');
			this.renderTemplate($table_skill_points, 'skills', {
				l10n: this.l10n,
				available_skill_points: controller.getAvailableSkillPoints(),
				skillnames : controller.getSkillNames(),
				controller : controller
			});
		},

		registerEventComponents : function() {
			if (this.controller.isBonusActive()) {
				this.registerBonusProgressBar();
			}
			else {
				this.registerBuyBonusButton();
			}

			this.refreshPointsDisplayAndTooltip();
			this.registerTrainingProgressBar();
			this.registerSlots();
			this.registerTooltips();
			this.registerSkillComponents();
			this.registerEventCountdown();
		},

		registerBuyBonusButton : function() {
			var buy_bonus_button_label = this.l10n.training_ground.buy_bonus(this.controller.getBonusCosts()),
				buy_bonus_button_tooltip = this.l10n.training_ground.buy_bonus_tooltip(this.controller.bonusPercentage(), this.controller.bonusDuration() / 3600);

			this.unregisterComponent('btn_buy_bonus');
			this.registerComponent('btn_buy_bonus', this.$el.find('.btn_buy_bonus').button({
				caption : buy_bonus_button_label, template : 'tpl_simplebutton', icon : 'gold', icon_position : 'right',
				tooltips : [
					{title : buy_bonus_button_tooltip, styles : {width : 400}}
				]
			}).on('btn:click', function() {
				this.controller.buyBonus();
			}.bind(this)));

			this.getComponent('btn_buy_bonus').show();
		},

		registerResetSkillButton : function() {
			var controller = this.controller,
				reset_skill_costs = controller.getResetSkillsCosts(),
				reset_skills_label = this.l10n.skills.reset_skills(reset_skill_costs);

			this.unregisterComponent('btn_skill_reset');
			this.registerComponent('btn_skill_reset', this.$el.find('.btn_skill_reset').button({
				caption : reset_skills_label,
				tooltips : [
					{title : this.l10n.skills.reset_skills_tooltip(reset_skill_costs)}
				],
				icon : true
			}).on('btn:click', function () {
				controller.resetSkills();
			}));
		},

		unRegisterButtonBuyBonus : function() {
			this.getComponent('btn_buy_bonus').hide();
			this.unregisterComponent('btn_buy_bonus');
		},

		registerBonusProgressBar : function() {
			var bonus_ends_at = this.controller.getTimestampBonusEndsAt(),
				bonus_starts_at = this.controller.getTimestampBonusStartsAt();
			this.unregisterComponent('pb_bonus_progress');
			this.registerComponent('pb_bonus_progress', this.$el.find(".pb_bonus_progress").singleProgressbar({
				value : gtime.getTimeDifference(bonus_ends_at),
				max : gtime.getTimeDifference(bonus_ends_at, bonus_starts_at),
				type: 'time',
				countdown: true,
				countdown_settings : {
					display_days : true,
					timestamp_end : bonus_ends_at
				},
				liveprogress : true,
				liveprogress_interval : 10,
				template : 'tpl_pb_time_progress_only'
			}).on("pb:cd:finish", function() {
				this.controller.makeBonusInactive();
				this.unregisterComponent('pb_bonus_progress');
			}.bind(this)));

			this.getComponent('pb_bonus_progress').show();
		},

		unRegisterBonusProgressBar : function() {
			this.getComponent('pb_bonus_progress').hide();
			this.unregisterComponent('pb_bonus_progress');
		},

		refreshPointsDisplayAndTooltip : function() {
			var l10n = this.l10n,
				max_training_points_per_skillpoint = this.controller.getMaxTrainingPointsPerSkillpoint(),
				training_points_per_skillpoint = this.controller.getTrainingPointsPerSkillpoint(),
				training_points_popup_text = l10n.training_ground.training_points_tooltip;

			this.$el.find('.content .training_points')
				.text(training_points_per_skillpoint + ' / ' + max_training_points_per_skillpoint)
				.tooltip(training_points_popup_text, {width :450});
		},

		registerTrainingProgressBar : function() {
			var max_training_points_per_skillpoint = this.controller.getMaxTrainingPointsPerSkillpoint(),
				training_points_per_skillpoint = this.controller.getTrainingPointsPerSkillpoint(),
				$training_progress = this.$el.find('#training_progress');
			this.unregisterComponent('training_progress');
			$training_progress.html('');
			// Register round progress
			this.registerComponent('training_progress', $training_progress.singleProgressbar({
				type: 'round',
				template: 'tpl_pb_round',
				step_count: 39,
				max: max_training_points_per_skillpoint,
				value: training_points_per_skillpoint,
				animate: false
			}).setAnimate(true));
		},

		registerSlots : function() {
			this.registerSlotTimers();
			this.registerEmptySlots();
			this.registerPremiumSlots();
		},

		registerPremiumSlots : function() {
			var $premium = this.$el.find('.units li .premium'),
				l10n = this.l10n,
				controller = this.controller,
				_self = this;

			$premium.each(function(i) {
				_self.unregisterComponent('btn_buy_grepolympia_training_slot_' + i);
				_self.registerComponent('btn_buy_grepolympia_training_slot_' + i, $(this).button({
					buy_slot : l10n.training_ground.buy_slot,
					buy_slot_cost : controller.getExtraSlotCosts()[$(this).attr('data-extra-slot-id')],
					template : 'tpl_grepolympia_training_slot'
				}).on('btn:click', function() {
					controller.buySlot();
				}));
			});
		},

		registerEmptySlots : function() {
			var $unlocked_training_slot = this.$el.find('.units li .none'),
				_self = this;

			$unlocked_training_slot.each(function() {
				// in the context of the each loop, "this" is the reference to the current list index element
				_self.addUnitsDropdownToSlotElement(this);
			});
		},

		registerSlotTimers : function() {
			var $timers = this.$el.find('.units li .timer'),
				_self = this;

			$timers.each(function(i) {
				var $timer = $($timers[i]);
				if ($timer.data('end_time')) {
					var unit_id = $timer.data('unit_type'),
						unit_build_time = _self.controller.getTrainingTimeForUnit(unit_id),
						slot_id = parseInt($timer.parent().attr('data-details'), 10);

					if (slot_id === 0) {
						var timer_value = $timer.data('end_time') - Timestamp.now();

						_self.unregisterComponent('train_unit_countdown_' + slot_id);
						_self.registerComponent('train_unit_countdown_' + slot_id, $timer.countdown2({
							value : timer_value,
							timestamp_end : $timer.data('end_time')
						})).on('cd:finish', function () {
							NotificationLoader.resetNotificationRequestTimeout();
						});
					}
					else {
						$timer.text(
							DateHelper.readableSeconds($timer.data('unit_count') * unit_build_time)
						);
					}
				}
			});
		},

		registerTooltips : function() {
			var $el = this.$el,
				l10n = this.l10n;

			$el.find('.table_skillpoints .header .skill_points').tooltip(this.l10n.skills.skill_points_amount);

			//BONUS
			$el.find('.tooltip_bonus_box').tooltip(
				l10n.training_ground.buy_bonus_tooltip(this.controller.bonusPercentage(), this.controller.bonusDuration() / 3600),
				{width : 400}
			);

			$el.find('.units .premium_training_slot').tooltip(
				l10n.training_ground.buy_slot_tooltip + '<div class="tooltip_tip">' + l10n.training_ground.buy_slot_tooltip_tip + '</div>',
				{width : 400}
			);

			if (this.controller.getAthleteBoostActive()) {
                $el.find('.grepolympia_athlete_boost').tooltip(
                    TooltipFactory.createPowerTooltip('grepolympia_athlete_boost',
                        {}, this.controller.getAthleteBoostConfiguration())
                );
            }

		},

		addUnitsDropdownToSlotElement : function(element) {
			var controller = this.controller,
				units_for_training = controller.getUnitsForTraining(),
				slot_id = $(element).parent().attr('data-details'),
				_self = this;

			this.unregisterComponent('train_unit_pickup_' + slot_id);
			this.registerComponent('train_unit_pickup_' + slot_id, $(element).dropdown({
				list_pos : 'center',
				type : 'image',
				//Select first option
				value : units_for_training.length > 0 ? units_for_training[0].value : '',
				options : units_for_training,
				template : 'tpl_dd_units',
				details : slot_id,
				class_name : 'train_unit l_'+ units_for_training.length,
				disabled : units_for_training.length === 0,
				auto_hide_list : false,
				onInit: function ($list) {
					_self._initializeTrainingUnitDropdown(slot_id, $list, this);
				},
				tooltips : [
					{title : _self.l10n.training_ground.add_troops_btn.part1 + '<div class="tooltip_tip">' + _self.l10n.training_ground.add_troops_btn.part2 + '</div>', width: 400},
					{title : _self.l10n.training_ground.no_units, width: 400}
				]
			}).on("dd:change:value", function (e, new_val, old_val, _dd) {
				var $list = _dd.getListElement(),
					$option = $list.find('.option.selected'),
					unit_id = new_val,
					option = _dd.getOption('value', unit_id),
					unit_count = option.name,
					$item_count_selector = $list.find('.item_count_selector'),
					offset_left = $option.position().left,
					slot_id = _dd.getDetails();

				var unit_slot_limit = controller.getSlotLimitForUnit(unit_id),
					max = unit_count < unit_slot_limit ? unit_count : unit_slot_limit;

				//move the dropdown list to point on the unit
				$item_count_selector.css('left', offset_left);
				//Update details about the unit
				_self.updateUnitsDropdownDescriptions($item_count_selector, unit_id);

				//update textbox
				_self.getComponent('train_unit_count_textbox_' + slot_id).setMax(max);
				//update slider
				_self.getComponent('train_unit_count_slider_' + slot_id).setMax(max).setValue(max);
			}));
		},

		registerUnitCountSlider : function(slot_id, $item_count_selector, max) {
			this.unregisterComponent('train_unit_count_slider_' + slot_id);
			// register unit count slider
			this.registerComponent('train_unit_count_slider_' + slot_id, $item_count_selector.find('.grepo_slider').grepoSlider({
				min: 1,
				max : max,
				shiftClick_ratio: 2,
				value : max
			})).on('sl:change:value', function (e, _sl, value, old_val) {
				if (this.getComponent('train_unit_count_textbox_' + slot_id)) {
                    this.getComponent('train_unit_count_textbox_' + slot_id).setValue(value, false);
					this.setEnableAcceptButton(slot_id, value > 0);
				}
			}.bind(this));
		},

		registerUnitCountTextBox : function(slot_id, $item_count_selector, max) {
			this.unregisterComponent('train_unit_count_textbox_' + slot_id);
			// register unit count textbox
			this.registerComponent('train_unit_count_textbox_' + slot_id, $item_count_selector.find('.unit_count').textbox({
				type: 'number',
				min: 0,
				max : max,
				value : max,
				hidden_zero: false
			})).on('txt:change:value', function () {
				var slider = this.getComponent('train_unit_count_slider_' + slot_id);

				if (slider) {
                    var textbox_value = this.getComponent('train_unit_count_textbox_' + slot_id).getValue();
					slider.setValue(textbox_value, true);
					this.setEnableAcceptButton(slot_id, textbox_value > 0);
				}
			}.bind(this)).on('txt:key:up', function (event, new_val) {
                new_val = parseInt(new_val, 10);
                this.setEnableAcceptButton(slot_id, !(isNaN(new_val) || new_val <= 0));
			}.bind(this));
		},

		registerAcceptUnitsButton : function(slot_id, $item_count_selector, element) {
			var controller = this.controller,
				_self = this;
			this.unregisterComponent('train_unit_count_btn_accept_' + slot_id);
			// register accep units button
			this.registerComponent('train_unit_count_btn_accept_' + slot_id, $item_count_selector.find('.button_new').button({
				template : 'empty'
			}).on('btn:click', function () {
				var unit_id = element.getValue(),
					unit_count = _self.getComponent('train_unit_count_textbox_' + slot_id).getValue(),
					training_points = controller.getAvailableTrainingPoints(),
					isTraining = controller.isTraining();

				if (unit_count > 0) {
					//Display confirmation window only once
					//There are no training points and training queue is empty
					if (training_points === 0 && isTraining === 0) {
						_self.controller.startTraining(unit_id, unit_count);
						element.hide();
					}
					else {
						_self.controller.startTraining(unit_id, unit_count);
						element.hide();
					}
				}
				else {
					element.hide();
				}
			}));
		},

		registerEventCountdown : function() {
			var controller = this.controller;
			//Timer
			this.unregisterComponent('grepolympia_countdown');
			this.registerComponent('grepolympia_countdown', this.$el.find("#grepolympia_countdown").countdown2({
				value : controller.getDisciplineEndsAt() - Timestamp.now(),
				display : 'day_hr_min_sec',
				tooltip: {title: this.l10n.page_athlete.tooltip_countdown, style: {width : 400}}
			}).on('cd:finish', function() {
				//Do nothing, its handled somewhere else
			}));
		},

		registerSkillComponents : function() {
			this.registerResetSkillButton();
			this.registerSkillpointsTableComponent();
		},

		registerSkillpointsTableComponent : function() {
			var controller = this.controller,
				l10n = this.l10n,
				no_points_to_distribute = controller.getAvailableSkillPoints() === 0,
				_self = this;

            this.unregisterComponents('btn_skillpoints');
			this.$el.find('.table_skillpoints').find('.button_new').each(function(index, el) {
				var $el = $(el),
					skill_type = $el.attr('data-details'),
					settings = {
						template : 'empty',
						cid : skill_type,
						disabled : no_points_to_distribute,
						tooltips : [
							{title : l10n.skills.add_skill_point_btn_text}
						]
					};

				_self.registerComponent('btn_plus_' + skill_type, $el.button(settings).on("btn:click", function (e, _btn) {
					var skill_type = _btn.getCid(),
						buttons = controller.getComponents('btn_skillpoints');

					for (var button in buttons) {
						if (buttons.hasOwnProperty(button)) {
							buttons[button].disable();
						}
					}

					controller.increaseSkill(skill_type);
				}), 'btn_skillpoints');
			});
		},

		_initializeTrainingUnitDropdown : function(slot_id, $list, element) {
			var controller = this.controller,
				units_for_training = controller.getUnitsForTraining();
			/**
			 * do not initialize dropdown when no unit is available
			 */
			if (units_for_training.length === 0) {
				return;
			}

			var dd_units = element,
				default_unit_id = dd_units.getValue(),
				selected_option = dd_units.getOption('value', default_unit_id),
				default_unit_count = selected_option.name,
				$item_count_selector = $list.find('.item_count_selector'),
				max = default_unit_count < controller.getSlotLimitForUnit(default_unit_id) ? default_unit_count
					: controller.getSlotLimitForUnit(default_unit_id);

			this.registerUnitCountSlider(slot_id, $item_count_selector, max);
			this.registerUnitCountTextBox(slot_id, $item_count_selector, max);
			this.registerAcceptUnitsButton(slot_id, $item_count_selector, element);

			// set the defaults
			this.updateUnitsDropdownDescriptions($item_count_selector, default_unit_id);
		},

		updateUnitsDropdownDescriptions : function($item_count_selector, unit_id) {
			var $description = $item_count_selector.find('.js-description'),
				controller = this.controller,
				is_bonus_active = controller.isBonusActive(),
				l10n = this.l10n.training_ground.units_pick;

			//update units name
			$description.children('.unit_name').text(GameData.units[unit_id].name);
			//update training points caption (does not change)
			$description.children('.training_points').text(l10n.training_points);
			//update training points value
			$description.children('.training_points_value').text(
				controller.getTrainingPointsForUnit(unit_id, is_bonus_active) + "/" + l10n.per_unit
			);
			//update max per slot caption
			$description.children('.max_per_slot').text(l10n.max_per_slot);
			//update max per slot value
			$description.children('.max_per_slot_value').text(
				controller.getSlotLimitForUnit(unit_id) + ' ' + l10n.units
			);
			//update training time caption
			$description.children('.time_per_unit').text(l10n.time_per_unit);
			//update training time value
			$description.children('.time_per_unit_value').text(
				DateHelper.readableSeconds(controller.getTrainingTimeForUnit(unit_id)) + "/" + l10n.per_unit
			);
		},

		_updateTrainingPointsRelatedUi: function () {
			this.refreshPointsDisplayAndTooltip();
			this.registerTrainingProgressBar();
			this.renderSkillsTemplate();
			this.registerSkillComponents();
			this.setTrainingGroundTitle();

			if(this.getComponent('training_progress')) {
				this.getComponent('training_progress').setValue(this.controller.getTrainingPointsPerSkillpoint());
			}
		},

		_handleChangeTrainingBonusEndsAtEvent : function() {
			var $bonus_description = this.$el.find('.bonus_description');

			if (this.controller.isBonusActive()) {
				this.unRegisterButtonBuyBonus();
				this.registerBonusProgressBar();
			}
			else {
				if (!this.button_buy_bonus) {
					this.registerBuyBonusButton();
				}
				this.unRegisterBonusProgressBar();
				$bonus_description.html(this.l10n.training_ground.bonus_not_active);
			}
			this.registerEmptySlots();
		},

        setEnableAcceptButton: function (slot_id ,enable) {
            var btn_accept = this.getComponent('train_unit_count_btn_accept_' + slot_id);

			if (enable && btn_accept.isDisabled()) {
                btn_accept.enable();
            }
            else if (!enable && !btn_accept.isDisabled()) {
                btn_accept.disable();
            }
        }
	});

	return GrepolympiaTrainingView;
});
