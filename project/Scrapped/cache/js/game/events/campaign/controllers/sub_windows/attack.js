/*global GameDataHercules2014 */

define('events/campaign/controllers/sub_windows/attack', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var GameModels = window.GameModels;
	var AttackWindow = require('events/campaign/views/sub_windows/attack');

	var AttackWindowController = GameControllers.BaseController.extend({
		stage_id : null,

		total_assigned_units : 0,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.stage_id = options.stage_id;
			this.window_controller = options.window_controller;

			//Initialize listeners
			this.getModel('campaign_player_army').onArmyChange(this, function() {
				this.view.reRender();
			}.bind(this));
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new AttackWindow({
				el : this.$el,
				controller : this
			});

			return this;
		},

		/**
		 * Returns stage id
		 *
		 * @return {Number}
		 */
		getStageId : function() {
			return this.stage_id;
		},

		/**
		 * returns the number of units already assigned to the stage
		 *
		 * @returns {Number}
		 */
		getTotalAssignedUnits : function() {
			return this.total_assigned_units;
		},

		/**
		 * Returns all data needed to display the 'my_army' army for current stage
		 *
		 * @return {Object}}
		 */
		getAllBaseUnits : function() {
			return this.window_controller.getAllBaseUnits();
		},

		/**
		 * given a mercenary_type returns the amount 'my army' has
		 *
		 * @param {String} mercenary_type
		 * @return {Object} amount
		 */
		getMyArmyUnitAmount : function(mercenary_type) {
			return this.window_controller.getArmyAmountsFor(mercenary_type);
		},

		/**
		 * given a mercenary_type returns the amount 'enemy army' has for current stage
		 *
		 * @param {String} mercenary_type
		 * @return {Object} amount
		 */
		getEnemyArmyUnitAmount : function(mercenary_type) {
			return this.window_controller.getEnemyArmyUnitAmount(this.stage_id, mercenary_type);
		},

		/**
		 * return the number of units you can send into a stage
		 *
		 * @returns {Number}
		 */
		getStageMaxUnits : function() {
			return GameDataHercules2014.getStageMaxUnits(this.stage_id);
		},

		/**
		 * return level of current stage
		 */
		getStageLevel : function() {
			return this.window_controller.getStageLevel(this.stage_id);
		},

		/**
		 * return reward-Object for the stage reward
		 */
		getReward : function() {
			return this.window_controller.getStageReward(this.stage_id)[0];
		},

		getStageRewardHtml : function() {
			var normal_rewards = this.window_controller.getStageReward(this.stage_id),
				onetime_rewards = this.window_controller.getStageOnetimeReward(this.stage_id),
				rewards = normal_rewards.concat(onetime_rewards);

			return this.window_controller.getStageRewardHtml(rewards.length > 1 ? this.l10n.rewards : this.l10n.reward, rewards);
		},

		/**
		 * return the correct sorting order number for a given unit type
		 *
		 * @return {Number}
		 */
		getUnitSortingOrderNo : function(mercenary_type) {
			return GameDataHercules2014.getUnitSortingOrderNo(mercenary_type);
		},

		/**
		 * return boost cooldown time
		 *
		 * @return {Number} timestamp
		 */
		getBoostCooldownTime : function() {
			return this.window_controller.getHerculesCooldownTime();
		},

		/**
		 * return the cost to re-enable the unit boost
		 *
		 * @return {Numnber} cost
		 */
		getUnitBoostCost : function() {
			return this.window_controller.getHeroCost();
		},

		/**
		 * Helper function, given a $textbox, returns a sane Number value or 0
		 *
		 * @param {Object} $textbox
		 * @return {Number}
		 */
		getTextboxValue : function($textbox) {
			var value;

			if (!$textbox) {
				return 0;
			}

			value = parseInt($textbox.getValue(), 10) || 0;
			if (value < 0) {
				value = 0;
			}

			return value;
		},

		/**
		 * getMercenary
		 */
		getMercenary : function() {
			return this.window_controller.getMercenary.apply(this.window_controller, arguments);
		},

		/**
		 * getmercenaryCost
		 */
		getMercenaryCost : function() {
			return this.window_controller.getMercenaryCost.apply(this.window_controller, arguments);
		},

		getMercenaryName : function() {
			return this.window_controller.getMercenaryName.apply(this.window_controller, arguments);
		},
		/**
		 * get HTML from parent controller
		 * @param {Function} getAmountFunc
		 */
		getMercenariesBoxHtml : function(getAmountFunc, enemy) {
			return this.window_controller.getMercenariesBoxHtml(getAmountFunc, enemy);
		},

		/**
		 * get HTML for mercenary tooltip form parent controller
		 *
		 * @param {String} mercenary_type
		 */
		getMercenaryTooltip : function(mercenary_type, hide_amounts) {
			return this.window_controller.getMercenaryTooltip(mercenary_type, hide_amounts);
		},

		/**
		 * validate textbox values for every unit:
		 * parseInt the input field, value must not be < 0 and > max units healthy
		 * units with 0 are not send
		 *
		 * @param {Object} my_army_textboxes with Unit type: $textbox
		 * @returns {Object} with unit_type : value
		 */
		_validateTextboxes : function(my_army_textboxes) {
			var army_amounts = {};

			for (var mercenary_type in my_army_textboxes) {
				if (my_army_textboxes.hasOwnProperty(mercenary_type)) {
					var $textbox = my_army_textboxes[mercenary_type],
						value = this.getTextboxValue($textbox);

					if (value > 0) {
						if (value > this.getMyArmyUnitAmount(mercenary_type).healthy) {
							value = this.getMyArmyUnitAmount(mercenary_type).healthy;
						}
						army_amounts[mercenary_type] = value;
					}
				}
			}

			return army_amounts;
		},

		/**
		 * Handles situation when button were clicked
		 */
		validateInputFieldsAndAttack : function(my_army_textboxes) {
			var attacking_units = this._validateTextboxes(my_army_textboxes),
				$checkbox = this.getComponent('cbx_add_boost'),
				attack_data, use_hercules = false;

			if ($checkbox) {
				use_hercules = $checkbox.isChecked();
			}

			attack_data = {
				units: attacking_units,
				has_hero : use_hercules,
				stage_id : this.stage_id
			};

			// attack the stage
			var empty_stage = new GameModels.CampaignPlayerStage();
			empty_stage.attack(attack_data);

			// tell main controller to show animation
			this.window_controller.showFightAnimation(this.stage_id);

		},

		/**
		 * handle changes on the input fields and cut the max amount
		 * (this is the only place in the Game where its done)
		 */
		onInputBoxChange : function(my_army_textboxes, event) {
			var //my_army_textboxes = this.view.my_army_textboxes,
				current_box_id = $(event.currentTarget).data('box_id'),
				$button = this.getComponent('btn_attack'),
				$progressbar = this.getComponent('unit_progressbar'),
				stage_max = this.getStageMaxUnits(),
				sum = 0, value = 0,
				$current_textbox;

			// loop over all textboxes - except the current one, get and validate their value,
			for (var mercenary_type in my_army_textboxes) {
				if (my_army_textboxes.hasOwnProperty(mercenary_type)) {
					var $textbox = my_army_textboxes[mercenary_type],
						box_id = $textbox.data('box_id');

					if (box_id === current_box_id) {
						$current_textbox = $textbox;
						continue;
					}

					value = this.getTextboxValue($textbox);

					// add the value or a fraction if possible to the sum
					if ((sum + value) < stage_max) {
						sum += value;
					} else {
						$textbox.setValue(stage_max - sum, { silent: true });
						sum += stage_max - sum;
					}
				}
			}

			// try to add the current textbox or cap it
			value = this.getTextboxValue($current_textbox);

			// add the value or a fraction if possible to the sum
			if ((sum + value) < stage_max) {
				sum += value;
			} else {
				$current_textbox.setValue(stage_max - sum, { silent: true });
				sum += stage_max - sum;
			}

			// update progressbar
			$progressbar.setValue(sum);

			// enable / disable attack button
			if (sum > 0) {
				$button.setState(false);
				$button.enable();
			} else {
				$button.setState(true);
				$button.disable();
			}
		},

		/**
		 * trigger the OnInputBox Change Event
		 */
		triggerInputBoxEvent : function(my_army_textboxes) {
			for (var mercenary_type in my_army_textboxes) {
				if (my_army_textboxes.hasOwnProperty(mercenary_type)) {
					var $textbox = my_army_textboxes[mercenary_type];

					this.onInputBoxChange(my_army_textboxes, {
						currentTarget: $textbox
					});
				}
			}
		},

		/**
		 * returns true if there are any units in any of the textboxes
		 * (used to set a different tooltip in the view)
		 */
		areUnitsSelected : function(my_army_textboxes) {
			var sum = 0;
			for (var mercenary_type in my_army_textboxes) {
				if (my_army_textboxes.hasOwnProperty(mercenary_type)) {
					var $textbox = my_army_textboxes[mercenary_type],
						value = this.getTextboxValue($textbox);

					sum += value;
				}
			}

			if (sum) {
				return true;
			}

			return false;
		},

		/**
		 * heal hercules for gold action
		 */
		healHerculesForGold : function() {
			this.window_controller.healHerculesForGold();
		},

		buyHealerForGold : function () {
			this.window_controller.buyHealerForGold();
		},

		getHealerCost : function () {
			return this.window_controller.getHealerCost();
		},

		getHealerTimestamp : function () {
			return this.window_controller.getHealerTimestamp();
		},

		getHealerTooltip : function () {
			return this.window_controller.getHealerTooltip();
		},

        areArmyUnitsWounded : function () {
			return this.window_controller.areArmyUnitsWounded();
		},

		destroy : function() {

		}
	});

	return AttackWindowController;

});
