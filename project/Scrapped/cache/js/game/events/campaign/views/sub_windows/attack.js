/* global us, GameDataPowers */

define('events/campaign/views/sub_windows/attack', function (require) {
	'use strict';

	var View = window.GameViews.BaseView;
	var HelperCampaign = window.HelperHercules2014;
	var Timestamp = window.Timestamp;
	var BuyForGoldWindowFactory = window.BuyForGoldWindowFactory;
	var NotificationLoader = window.NotificationLoader;
	var TooltipFactory = window.TooltipFactory;
	var GameDataHercules2014 = window.GameDataHercules2014;
	var GameFeatures = require('data/features');

	var AttackWindow = View.extend({

		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.my_army_textboxes = {};
			this.render();
		},

		/**
		 * handler for clicking on a unit image, flips between setting and unsetting
		 * triggers change event on the corresponding textbox
		 *
		 * @param event
		 */
		_mercenaryImageClickHandler : function(event) {
			var $el = $(event.currentTarget),
				mercenary_type = $el.data('type'),
				$textbox = this.my_army_textboxes[mercenary_type],
				current_value = this.controller.getTextboxValue($textbox),
				healthy_units = this.controller.getMyArmyUnitAmount(mercenary_type).healthy;

			if (current_value) {
				$textbox.setValue(0);
			} else {
				$textbox.setValue(healthy_units);
			}
		},

		render : function() {

			this.renderTemplate(this.$el, 'sub_window_attack', {
				l10n : this.l10n,
				stage_id : this.controller.getStageId(),
				units: this.controller.getAllBaseUnits()
			});

            this.unregisterComponents();

			var my_army_amount_func = HelperCampaign.flipTotalAndHealthyAmountsDecorator(this.controller.getMyArmyUnitAmount.bind(this.controller)),
				enemy_army_amount_func = HelperCampaign.flipTotalAndHealthyAmountsDecorator( this.controller.getEnemyArmyUnitAmount.bind(this.controller));
			this.initializeUnits(this.$el.find('.my_army'), my_army_amount_func);
			this.initializeUnits(this.$el.find('.enemy_army'), enemy_army_amount_func, true);

			var $mercenaries_box = this.$el.find('.my_army .mercenaries_box');
			$mercenaries_box.on('click', '.mercenary_image', this._mercenaryImageClickHandler.bind(this));

			this.initializeUnitProgressbar();
			this.initializeUnitInputBoxes();
			this.initializeAttackButton();
			this.initializeUnitBoost();
            this.initializeHealer();
			this.initializeRewardsContainer();
			this.initializeMercenaryTooltip();
			this.initializeMainRewardTooltip();
			this.initializeHeroRewardTooltip();
			this.initializeCultureRewardTooltip();
			this.initializeBuyByGoldButtons();
			this.updateDynamicUICompontens();
		},

		reRender : function() {
			this.$el.empty();
			this.render();
		},

		/**
		 * update progressbar and attack button, their state is based on the input boxes values
		 * these boxes may have initialized with pre-defined values
		 */
		updateDynamicUICompontens: function() {
			this.controller.triggerInputBoxEvent(this.my_army_textboxes);
		},

		/**
		 * Initialize components
		 */
		initializeAttackButton : function() {
			var l10n = this.l10n,
				controller = this.controller,
				my_army_textboxes = this.my_army_textboxes,
				attack_button = this.$el.find('.btn_attack');

			controller.registerComponent('btn_attack', attack_button.button({
				template : 'tpl_simplebutton_borders',
				caption : l10n.attack,
				disabled : true,
				state: true,
				icon: false,
				tooltips : [
					{title : l10n.tooltips.attack_button },
					{title : l10n.tooltips.attack_button_disabled }
				]
			}).on('btn:click', function(event){
				controller.validateInputFieldsAndAttack(my_army_textboxes);
			}));
		},

		initializeUnitProgressbar : function() {
			var total_assigned_units = this.controller.getTotalAssignedUnits(),
				stage_max_units = this.controller.getStageMaxUnits();

			this.controller.registerComponent('unit_progressbar', this.$el.find('.pb_unit_amount').singleProgressbar({
				value : total_assigned_units,
				max : stage_max_units,
				template : 'tpl_pb_single'
			}));
		},

		/**
		 * get HTML and append to $el, for the units from controllers
		 * @param {Object} $el jQuery-Object which must contain .mercenaries_box class
		 * @param {Function} getAmountFunc function called to determine the amounts shown
		 */
		initializeUnits : function($el, getAmountFunc, enemy) {
			var $mercenaries_box = $el.find('.mercenaries_box');
			$mercenaries_box.append(this.controller.getMercenariesBoxHtml(getAmountFunc, enemy));
		},

		initializeUnitInputBoxes: function() {
			var $textboxes = this.$el.find('.textbox_container'),
				controller = this.controller,
				mercenaries = controller.getAllBaseUnits();

			for (var i = 0, l = mercenaries.length; i < l; i++) {
				var mercenary = mercenaries[i],
					box_id = controller.getUnitSortingOrderNo(mercenary.type),
					$box = $textboxes.find('.textbox[data-box_id="'+ box_id + '"]'),
					$current_textbox = this.my_army_textboxes[mercenary.type],
					current_value = this.controller.getTextboxValue($current_textbox);

				var textbox = controller.registerComponent('textbox_' + box_id , $box.textbox({
					type: 'number',
					value: current_value,
					max: this.controller.getMyArmyUnitAmount(mercenary.type).healthy,
					hidden_zero: false
				}), this.sub_context).on('txt:change:value', controller.onInputBoxChange.bind(this.controller, this.my_army_textboxes));

				// store reference to textbox for later reference
				this.my_army_textboxes[mercenary.type] = textbox;
			}
		},

		initializeUnitBoost : function() {
			if (this.controller.getBoostCooldownTime() <= Timestamp.now())   {
				this.initializeBoostCheckbox();
			} else {
				this.initializeBoostCooldown();
			}

			var boost_tooltip = us.template(this.controller.getTemplate('hercules_tooltip'), {
				l10n: this.l10n,
				text : this.l10n.tooltips.artillery_description,
				title: this.l10n.tooltips.artillery,
				plus_20 : this.l10n.plus_20
			});

			this.$el.find('.attack_boost_container .frame_icon').tooltip(boost_tooltip, {}, false);
		},

		initializeBoostCheckbox : function() {
			var $select_container = this.$el.find('.select_boost_container'),
				$hercules_cooldown_box = this.$el.find('.cooldown_boost_container'),
				$checkbox = this.$el.find('.cbx_add_boost');

			$select_container.show();
			$hercules_cooldown_box.hide();

			var checkbox = $checkbox.checkbox({
				caption : this.l10n.battle.caption_hercules_ready,
				checked : false
			}).on('cbx:check', function(evt, $el, hero_checked) {
				var player_has_selected_units = this.controller.areUnitsSelected(this.my_army_textboxes);
				var attack_button = this.controller.getComponent('btn_attack');

				if (!player_has_selected_units && !hero_checked) {
					attack_button.setTooltip(this.l10n.tooltips.attack_button_disabled, 1);
				} else if (hero_checked && !player_has_selected_units) {
					attack_button.setTooltip(this.l10n.tooltips.attack_button_only_hero, 1);
				}
			}.bind(this));

            this.$el.find('.attack_boost_container .frame_icon').on('click', function(event) {
				checkbox.check(!checkbox.isChecked());
			});

			this.controller.registerComponent('cbx_add_boost', checkbox);
		},

		initializeBoostCooldown : function() {
			var $select_container = this.$el.find('.select_boost_container'),
				$boost_cooldown_box = this.$el.find('.cooldown_boost_container'),
				$progressbar = $boost_cooldown_box.find('.pb_boost_cooldown'),
				$buy_unit_boost = $boost_cooldown_box.find('.btn_unit_boost'),
				boost_cooldown_time = this.controller.getBoostCooldownTime(),
                unit_boost_cost = this.controller.getUnitBoostCost(),
				controller = this.controller;

			$select_container.hide();
            $boost_cooldown_box.show();

			var onClick = function(e, _btn) {
				BuyForGoldWindowFactory.openBuyHercules2014HealHerculesWindow(_btn, controller, unit_boost_cost);
			};

			this.controller.registerComponent('boost_progressbar', $progressbar.singleProgressbar({
				value :  boost_cooldown_time - Timestamp.now(),
				max : boost_cooldown_time,
				liveprogress : true,
				type : 'time',
				countdown : true,
				template : 'tpl_pb_single_nomax'
			}).on('pb:cd:finish', function() {
				NotificationLoader.resetNotificationRequestTimeout(100);
			}.bind(this)));

			this.controller.registerComponent('btn_unit_boost', $buy_unit_boost.button({
				template : 'tpl_simplebutton_borders',
				caption : unit_boost_cost,
				icon: true,
				icon_type: 'gold',
				icon_position: 'right',
				tooltips : [
					{title : this.l10n.tooltips.hercules_instant_heal(unit_boost_cost), styles:{width: 300}}
				]
			}).on('btn:click', onClick.bind(this)));

			this.$el.find('.attack_boost_container .frame_icon').tooltip(this.l10n.tooltips.hercules_portrait);
			$progressbar.tooltip(this.l10n.tooltips.hercules_cooldown_bar);
		},

		initializeHealerProgress: function ($progressbar) {
			var healer_cooldown_time = this.controller.getHealerTimestamp();

            this.controller.registerComponent('healer_progressbar', $progressbar.singleProgressbar({
                value: healer_cooldown_time - Timestamp.now(),
                max: GameDataHercules2014.getHealerCooldownDuration(),
                liveprogress: true,
                type: 'time',
                countdown: true,
                template: 'tpl_pb_single_nomax'
            }). on('pb:cd:finish', function () {
                NotificationLoader.resetNotificationRequestTimeout(100);
            }));
		},

		initializeBuyHealerButton: function ($button) {
			var instant_heal_cost = this.controller.getHealerCost(),
				button_disabled = !this.controller.areArmyUnitsWounded();

            this.controller.registerComponent('btn_buy_healer', $button.button({
                template : 'tpl_simplebutton_borders',
                caption : instant_heal_cost,
                icon: true,
                icon_type: 'gold',
                icon_position: 'right',
				disabled: button_disabled,
                state: button_disabled,
                tooltips : [
                    {title : this.l10n.tooltips.buy_healer(instant_heal_cost), styles:{width: 300}},
                    {title : this.l10n.tooltips.cant_buy_healer}
                ]
            }).on('btn:click', function () {
                this.controller.buyHealerForGold();
            }.bind(this)));
		},

        initializeHealer: function () {
            var $healer_container = this.$el.find('.healer_container'),
                $healer_icon = $healer_container.find('.frame_icon'),
                $buy_healer_button = $healer_container.find('.btn_buy_healer'),
                $progressbar = $healer_container.find('.pb_healer_timer'),
                healer_tooltip = this.controller.getHealerTooltip(),
                healer_tooltip_options = {width: 350};

            this.initializeHealerProgress($progressbar);
            this.initializeBuyHealerButton($buy_healer_button);

            $healer_icon.tooltip(healer_tooltip, healer_tooltip_options);
            $progressbar.tooltip(healer_tooltip, healer_tooltip_options);
        },

		/**
		 * show the reward subtemplate
		 */
		initializeRewardsContainer : function() {
			var $reward_container = this.$el.find('.reward_container');
			$reward_container.append(this.controller.getStageRewardHtml());

			// if stage is on level > 1, set them to disabled
			if (this.controller.getStageLevel() > 1) {
				$reward_container.find('.hero, .culture_level').addClass('disabled');
			}
		},

		/**
		 * show mercenary tooltips on every unit
		 */
		initializeMercenaryTooltip : function() {
			var controller = this.controller;

			this.$el.find('.enemy_army .mercenary .mercenary_image').each(function(idx, val) {
				var $el = $(val),
					type = $el.data('type');

				$el.tooltip(controller.getMercenaryTooltip(type, true), {}, false);
			});

			this.$el.find('.my_army .mercenary .mercenary_image').each(function(idx, val) {
				var $el = $(val),
					type = $el.data('type');

				$el.tooltip(controller.getMercenaryTooltip(type), {}, false);
			});
		},

		/**
		 * bind tooltips to the (single) reward which must not be a "hero" or "culture" reward
		 */
		initializeMainRewardTooltip : function() {
			var reward = this.controller.getReward(),
				$el = this.$el.find('.reward.' + GameDataPowers.getCssPowerId(reward)),
				tooltip = TooltipFactory.createPowerTooltip(reward.power_id, {}, reward.configuration);

			$el.tooltip(tooltip);
		},

		/**
		 * bind custom tooltip for special hero
		 */
		initializeHeroRewardTooltip : function() {
			if (GameFeatures.areHeroesEnabled() && this.controller.window_controller.hasHeroReward()) {
				var $el = this.$el.find('.reward.hero');

				$el.tooltip(TooltipFactory.getHeroCard(GameDataHercules2014.getRewardHeroId(), {
					show_requirements: true, l10n: {
						exclusive_hero: this.l10n.onetime_once
					}
				}), {}, false);
			}
		},

		/**
		 * bind custom tooltip for culture level reward
		 */
		initializeCultureRewardTooltip : function() {
			var $el = this.$el.find('.reward.culture_level');

			$el.tooltip(this.l10n.onetime_culture + '<br><br><span style="color:red">' + this.l10n.onetime_once + '</span>', {
				width : 250
			});
		},

		/**
		 * initialize the buy mercenaries buttons
		 */
		initializeBuyByGoldButtons : function() {
			var controller = this.controller,
				l10n = this.l10n;

			var onClick = function(mercenary_type, mercenary, cost, e, _btn) {
				BuyForGoldWindowFactory.openBuyHercules2014MercenaryWindow(_btn, mercenary_type, mercenary, cost, controller.window_controller);
			};

			//Buy mercenaries button
			this.$el.find('.my_army .btn_buy_mercenary_attack_window').each(function(index, el) {
				var $el = $(el),
					mercenary_type = $el.data('type'),
					mercenary = controller.getMercenary(mercenary_type),
					cost = controller.getMercenaryCost(mercenary_type);

				controller.registerComponent('btn_buy_mercenary_attack_window_' + mercenary_type, $el.button({
					template : 'tpl_simplebutton_borders',
					//caption : cost,
					icon: true,
					icon_type: 'gold',
					icon_position: 'right',
					tooltips : [
						{title : l10n.tooltips.buy_mercenaries(cost, controller.getMercenaryName(mercenary_type)), styles : {'max-width' : 300}}
					]
				}).on('btn:click', onClick.bind(null, mercenary_type, mercenary, cost)));
			});
		},

		destroy : function() {
			delete  this.my_army_textboxes;
		}
	});

	return AttackWindow;
});
