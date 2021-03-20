/* globals Promise */

define('events/spawn/views/spawn_window', function() {
	'use strict';

	var BaseView = window.GameViews.BaseView;
	var Timestamp = require('misc/timestamp');

	var SpawnWindowView = BaseView.extend({
		initialize: function () {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.render();

			window.spawnView = this;
		},

		render : function() {
			this.renderTemplate(this.$el, 'spawn_window', {
				partials: ['_missions'],
				l10n : this.l10n,
				units_model: this.controller.getUnitsInTownModel(),
				missions: this.getMissionsToShow(),
				mission_running: this.controller.getRunningMission() || null,
				stones_collected: this.controller.getNumberOfStones(),
				all_stones_collected: this.controller.allStonesCollected()
			});

			this.showStartText();
			this.registerViewComponents();
			this.initializeCountdown();
		},

		renderMissions: function() {
			this.showStartText();
			this.unregisterComponents('missions');
			this.renderTemplate(this.$el.find('.missions'), '_missions', {
				l10n : this.l10n,
				missions: this.getMissionsToShow(),
				units_model: this.controller.getUnitsInTownModel(),
				mission_running: this.controller.getRunningMission() || null,
				all_stones_collected: this.controller.allStonesCollected()
			});
			this.registerMissionComponents();
			if (!this.controller.getRunningMission()) {
				this.$el.find('.missions').removeClass('one_line');
			}
		},

		/**
		 * @return {[SpawnMission]} - an array of all missions or an array containing only the running mission
		 */
		getMissionsToShow: function() {
			var running_mission = this.controller.getRunningMission();
			return running_mission ? [running_mission] : this.controller.getMissions();
		},

		registerViewComponents: function() {
			this.unregisterComponents();
			this.unregisterComponents('missions');
			this.unregisterComponents('send_buttons');
			this.registerMissionComponents();
			this.registerEndReward();
			this.registerDestroyPortalButton();
		},

		registerMissionComponents: function() {
			this.registerSendButtons(this.controller.allStonesCollected());
			this.registerTooltips();
			this.registerProgressbars();
			this.registerOutcomeButton();
			if (!this.controller.getRunningMission()) {
				this.registerScrollbar();
			}
		},

		showStartText : function() {
			var $start_text = this.$el.find('.start_text');

			if (typeof this.controller.getRunningMission() !== 'undefined') {
				$start_text.hide();
			} else {
				$start_text.show();
			}
		},

		registerProgressbars: function() {
			this.getMissionsToShow().forEach(this._registerProgressbar.bind(this));
		},

		_registerProgressbar: function(mission, index) {
			var progressbar = this.$el.find('.pb_mission')[index],
				name = 'mission_progressbar_' + index,
				reFetch = this.controller.reFetchMissions.bind(this.controller);

			this.controller.registerComponent(name, $(progressbar).singleProgressbar({
				value :  mission.getTimeLeft(),
				max : mission.getCooldown(),
				type : 'time',
				countdown : mission.isRunning() && !mission.isFinished(),
				liveprogress: true,
				liveprogress_interval: 1,
				template : 'tpl_pb_single_nomax',
				tooltips : {
					idle : {template : this.l10n.tooltips.progressbar}
				}
			}).on('pb:cd:finish', reFetch), 'missions');
		},

		registerOutcomeButton: function() {
			var showOutcome = this.controller.openRewardSubWindow.bind(this.controller);
			this.registerComponent('btn_outcome', this.$el.find('.btn_outcome').button({
				caption: this.l10n.btn_outcome,
				tooltips: []
			}).on('btn:click', showOutcome), 'missions');
		},

		registerScrollbar: function() {
			this.unregisterComponent('mission_scrollbar');
			this.registerComponent('mission_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'blue',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				scroll_position: 0,
				min_slider_size : 16
			}), 'missions');
		},

		registerSendButtons: function(disable_all) {
			var $send_buttons = $(this.$el.find('.btn_send')),
				onSendClick = function(index) {
					this.controller.doSendMission(index).then(null, this.registerSendButtons.bind(this));
					// disable all buttons
					this.registerSendButtons(true);
				};

			this.unregisterComponents('send_buttons');

			$send_buttons.each(function(i, btn) {
				var index = parseInt($(btn).attr('data-id'), 10),
					running = $(btn).attr('data-running') === 'true',
					missing_units = this.controller.hasMissingUnits(index),
					disable_tooltip = running ? this.l10n.tooltips.on_their_way : this.l10n.tooltips.not_enough_units,
					disabled = running || disable_all === true || missing_units;

				this.registerComponent('btn_send_'+index, $(btn).button({
					caption: this.l10n.btn_send,
					tooltips: [
						{ title: '' },
						{ title: this.controller.allStonesCollected() ? this.l10n.tooltips.all_stones_collected : disable_tooltip }
					],
					disabled: disabled,
					state: disabled
				}).on('btn:click', onSendClick.bind(this, index)),
				'send_buttons');

			}.bind(this));
		},

		registerTooltips: function() {
			// 'units needed for mission' tooltip
			this.$el.find('.js-unit :not(.red)').parent().tooltip(this.l10n.tooltips.units);
			this.$el.find('.js-unit .red').parent().tooltip(this.l10n.tooltips.not_enough_units);
			this.$el.find('.stones .stone.collected').tooltip(this.l10n.tooltips.stone_collected);
			this.$el.find('.stones .stone:not(.collected)').tooltip(this.l10n.tooltips.stone_empty);
			this.$el.find('.chance_die').tooltip(this.l10n.tooltips.chance_die);
			this.$el.find('.chance_stone').tooltip(this.l10n.tooltips.chance_stone);
			this.$el.find('.reward_res').tooltip(this.l10n.sub_window_reward.reward_tooltips.all_resources);
			this.$el.find('.reward_favor').tooltip(this.l10n.sub_window_reward.reward_tooltips.favor);
		},

		registerEndReward: function() {
			var end_reward_data = this.controller.getEndRewardData();

			this.unregisterComponent('reward');
			this.registerComponent('reward', this.$el.find('.reward').reward({
				reward: end_reward_data.reward,
				template: 'tpl_reward_badge',
				disabled: !this.controller.allStonesCollected(),
				amount: end_reward_data.amount
			}));
		},

		registerDestroyPortalButton: function() {
			var $btn_destroy = this.$el.find('.btn_destroy'),
				$game_border = this.$el.find('.hades .game_border'),
				destroyCityPortal = this.controller.sendDestroyCityPortalEvent.bind(this.controller),
				wait = function(time) {
					return function() {
						return new Promise(function(resolve) {
							setTimeout(resolve, time);
						});
					};
				};

			$game_border.removeClass('height_fix');
			this.registerComponent('btn_send_', $btn_destroy.button({
				caption: this.l10n.btn_destroy
			}).on('btn:click', function(e, btn) {
				btn.disable();
				this.controller.destroyPortal()
						.then(wait(2000))
						.then(destroyCityPortal);
			}.bind(this)));
		},

		showDestroyPortalButton: function() {
			var $game_border = this.$el.find('.hades .game_border'),
				$wrapper = this.$el.find('.destroy_button_wrapper'),
				wrapper_height = $wrapper.css('height');

			$game_border.removeClass('height_fix');
			this.$el.addClass('with_destroy_btn');
			$wrapper.css('height', 0).show().transition({height: wrapper_height}, 2000);
			this.registerEndReward();
			this.registerScrollbar();
		},

		destroyHeader: function() {
			var self = this,
				$stone_wrapper = this.$el.find('.stones'),
				$filling = $stone_wrapper.find('.glow_filling'),
				$glow_big = $stone_wrapper.find('.glow_big'),
				$glow_horizontal = $stone_wrapper.find('.glow_horizontal'),
				filling_width = $filling.css('width');

			return new Promise(function(resolve) {
				// fill gaps between stones
				$filling.css('width', 0).show().transition({
					width: filling_width,
					duration: 2000,
					complete: function() {
						// hide reward
						self.unregisterComponent('reward');
						self.$el.find('.reward').hide();
						// light flash
						$glow_big.css({scale: 0, opacity: 0}).show().transition({
							scale: 1,
							opacity: 1,
							duration: 500,
							complete: function() {
								$glow_big.transition({opacity: 0});
							}
						});
						// horizontal light
						$glow_horizontal.css({scale: [0], opacity: 0}).show().transition({
							scale: 1,
							opacity: 1,
							duration: 800,
							complete: function() {
								$glow_horizontal.transition({scale: 0});
								// reveal broken header
								$stone_wrapper.transition({
									opacity: 0,
									duration: 200,
									complete: resolve
								});
							}
						});
					}
				});
			});
		},

		openTutorial: function() {
			this.controller.openEventTutorialWindow(
					this.l10n.tutorial.title,
					this.getTemplate('tutorial', {l10n: this.l10n})
			);
		},

		/*
		 * Initialize event countdown
		 */
		initializeCountdown: function () {
			this.registerComponent('countdown', this.$el.find('.countdown_box .middle').countdown2({
				value : this.controller.getEventEndAt() - Timestamp.now(),
				display : 'event',
				tooltip: {title: this.l10n.tooltips.countdown}
			}));

			this.$el.find('.btn_info_overlay').click(this.openTutorial.bind(this));
		},

		animateStone : function() {
			return new Promise(function(resolve){
				var $stone = this.$el.find('.animated_stone'),
					closeSubWindow = this.controller.closeSubWindow.bind(this.controller),
                    $original_stone = this.$el.find('.reward.stone'),
                    stone_offset = $original_stone.offset(),
                    $slot = this.$el.find('.stones .stone:not(.collected):first'),
                    slot_offset = $slot.offset(),
                    offset_diff = {
                        left: stone_offset.left - slot_offset.left,
                        top: stone_offset.top - slot_offset.top
                    },
					shake = function(deg) {
						return new Promise(function(resolveShake) {
							$stone.transition({
								rotate: deg + 'deg',
								duration: 80,
								complete: resolveShake
							});
						});
					},
					shrinkMove = function() {
						return new Promise(function(resolveShrinkMove) {
							$stone.transition({
								translate: [-offset_diff.left, -offset_diff.top],
								scale: 1,
								duration: 800,
								complete: resolveShrinkMove
							});
						});
					},
					addCollectedStone = function() {
						// to make sure the stone stays even if model is not yet updated
						$slot.addClass('collected');
					},

					showDestroyButton = function() {
						if (this.controller.allStonesCollected()) {
							this.showDestroyPortalButton();
						}
					}.bind(this),
					hide = function() {
						$stone.removeClass('visible_stone');
					};

				$stone
					.removeAttr('style')
					.offset(stone_offset)
					.addClass('visible_stone');

				$stone.transition({
					scale: 2,
					translate: [0, 0],
					easing: 'linear',
					duration: 350,
					complete: function() {
						closeSubWindow();
						shrinkMove()
						.then(shake.bind(null, -4.5))
						.then(shake.bind(null, 4.5))
						.then(shake.bind(null, -4.5))
						.then(addCollectedStone)
						.then(hide)
						.then(showDestroyButton)
						.then(resolve);
					}
				});

				$original_stone.hide();
			}.bind(this));
		},

		destroy : function() {

		}
	});

	return SpawnWindowView;
});
