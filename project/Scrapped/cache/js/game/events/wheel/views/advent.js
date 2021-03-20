/*global GameDataPremium, Timestamp, BuyForGoldWindowFactory, TM, GameDataAdvent, GameModels, us, TooltipFactory, Promise */

(function() {
	'use strict';

	var View = window.GameViews.BaseView,
    	ContextMenuHelper = require('helpers/context_menu');

	var Advent = {
		//Keps all slots nodes
		$slots : null,
		//Keeps spin button node
		$btn_spin : null,
		//Keeps stop button node
		$btn_stop : null,
		//Keeps spin for gold button node
		$btn_spin_for_gold : null,
		//Keeps advisors box (with shards) node
		$advisors_box : null,
		//Keeps "wheel of fortune" node
		$wheel_of_fortune : null,
		//Keeps reference to the "spin gold price" node
		$gold_price_indicator : null,
		// snowball_glow
		$snowball_glow : null,
		//Keeps node which represents collectable reward
		$appended_reward : null,//centered reward is virtually moved to the center
		// yellow glow behind reward in the middle
		$reward_glow : null,
		$animated_shard: null,
		$animated_shard_4: null,

		sub_context_wheel : 'wheel',

		initialize: function (options) {
			this.controller = options.controller;
			this.l10n = this.controller.getl10n();

			this.render();
		},

		/**
		 * Renders main layout
		 */
		render: function () {
			var controller = this.controller,
				spots = controller.getSpotsCollection();

			this.$el.html(us.template(controller.getTemplate('main'), {
				l10n : this.l10n,
				spots : spots,
				view: this,
				heroes_enabled: controller.isHeroRewardEnabled(),
				hero_name: controller.getHeroName()
			}));

			this.$advisors_box = this.$el.find('.advisors_box');
			this.$wheel_of_fortune = this.$el.find('.wheel_of_fortune');
			this.$snowball_glow = this.$el.find('.snowball_glow');
			this.$reward_glow = this.$el.find('.reward_glow');
			this.$animated_shard = this.$el.find('.animated_shard');
			this.$animated_shard_4 = this.$el.find('.animated_shard_4');

			this.renderAdvisors();
			this.initializeComponents();
		},

		/**
		 * Rerenders advisors box
		 */
		rerenderAdvisors : function() {
			this.renderAdvisors();
		},

		/**
		 * Renders Advisors box
		 */
		renderAdvisors : function() {
			var has_all_shards = this.controller.getCollectedShardsCount() === GameDataAdvent.getMaxAmountOfShards();

			this.$advisors_box.toggleClass('has_all_shards', has_all_shards);
			this.$el.find('.advent_content').toggleClass('has_hero_reward', this.controller.isHeroRewardEnabled());

			this.renderTemplate(this.$advisors_box, 'advisors', {
				collected_shards_count : this.controller.getCollectedShardsCount(),
				number_of_advisors : GameDataPremium.getNumberOfAdvisors()
			});

			if (has_all_shards) {
				this.$advisors_box.tooltip(
					this.controller.isHeroRewardEnabled() ? this.l10n.hero_tooltip_unlocked : this.l10n.advisors_tooltips_unlocked
				);
			} else {
				this.$advisors_box.tooltip(
					this.controller.isHeroRewardEnabled() ? this.l10n.hero_tooltip : this.l10n.advisors_tooltips);
			}
		},

		/**
		 * Rerenders advisors box
		 */
		rerenderWheel : function() {
			this.controller.unregisterComponents(this.sub_context_wheel);
			this.renderWheel();
		},

		/**
		 * Renders Advisors box
		 */
		renderWheel : function() {
			var controller = this.controller;

			if (this.$appended_reward) {
				this.$appended_reward.remove();
				this.$appended_reward = null;
			}

			this.$wheel_of_fortune.html(us.template(controller.getTemplate('wheel'), {
				l10n : this.l10n,
				wheel : controller.getWheel(),
				collected_shards_count : controller.getCollectedShardsCount(),
				// show_shard defines if shards are shown at all
				show_shard : controller.getCollectedShardsCount() < GameDataAdvent.getMaxAmountOfShards(),
				// where to place the shard
				position_of_the_shard : GameDataAdvent.getShardPositionOnTheWheel(),
				event_skin : controller.getEventSkin(),
				free_refill_power_active : controller.getFreeRefillPowerActive(),
				free_refill_already_used: controller.getFreeRefillAlreadyUsed()
			}));

			this.$slots = this.$wheel_of_fortune.find('.slot');
			this.$btn_spin = this.$wheel_of_fortune.find('.btn_spin');
			this.$btn_stop = this.$wheel_of_fortune.find('.btn_stop');
			this.$btn_spin_for_gold = this.$wheel_of_fortune.find('.btn_spin_for_gold');
			this.$gold_price_indicator = this.$wheel_of_fortune.find('.gold_price_indicator');

			this.$wheel_of_fortune.find('.slot .shard_icon').tooltip(
				controller.isHeroRewardEnabled() ? this.l10n.hero_tooltip : this.l10n.advisors_tooltips
			);
			this.$wheel_of_fortune.find('.wheel_chance').tooltip(
				this.l10n.percentage_tooltip
			);

			if (controller.getFreeRefillPowerActive()) {
				this.$wheel_of_fortune.find('.wheel_free_refill').tooltip(
					TooltipFactory.createPowerTooltip('wheel_free_refill', {},
						controller.getFreeRefillPowerConfiguration())
				);
			}

			this.$reward_glow.hide();

			this.initializeWheelComponents();
			this.initializeRefillButton();
		},

		/**
		 * Updates spots states
		 */
		updateSpotStates : function() {
			this.controller.getSpotsCollection().each(function(spot_model) {
				var $spot = this.$el.find('.pin_' + spot_model.getNumber()),
					spot_state = spot_model.getState();

				$spot.removeClass('current_day collect_reward buy_spin no_more_spins');
				$spot.addClass(spot_state);
				$spot.find('.day_number').remove();

				if (spot_state !== 'collect_reward') {
					$spot.append('<div class="day_number" data-spot_index="' + spot_model.getNumber() + '">' + spot_model.getNumber() + '</div>');
				}

				switch (spot_state) {
					case 'current_day':
						$spot.tooltip(this.l10n.pins_tooltips.current_day, { width: 400 });
						break;
					case 'collect_reward':
						$spot.tooltip(this.l10n.pins_tooltips.collect_reward, { width: 400 } );
						break;
					case 'buy_spin':
						if (spot_model.isFreeSpin()) {
							$spot.tooltip(this.l10n.pins_tooltips.free_spin, { width: 400 } );
						} else {
							$spot.tooltip(this.l10n.pins_tooltips.buy_spin, { width: 400 } );
						}
						break;
					case 'no_more_spins':
						if (spot_model.isFreeSpin()) {
							$spot.tooltip(this.l10n.pins_tooltips.free_spin, { width: 400 } );
						} else {
							$spot.tooltip(this.l10n.pins_tooltips.no_more_spins, { width: 400 } );
						}
						break;
					default:
						$spot.tooltip().destroy();
				}
			}.bind(this));
		},

		/**
		 * a spot is visible, when the wheel has been spun at least once.
		 * This is not represented in the data directly, but has to be
		 * figured out.
		 */
		isDecoShowableForSpot : function(spot_index) {
			var spot = this.controller.getSpot(spot_index);

			// if a reward is in the center, true
			if (spot.getRewardToTake() !== undefined) {
				return true;
			}
			// if spun count of any reward != 0, true
			if (spot.isAnyRewardSpun()) {
				return true;
			}

			return false;
		},

		initializeComponents : function() {
			var _self = this, controller = this.controller;

			//Clicking spots handler
			this.$el.on('click.' + this.controller.getEventSkin(), '.clickable_box, .day_number', function(e) {
				var $el = $(e.currentTarget),
					spot_index = $el.data('spot_index'),
					spot = controller.getSpot(spot_index);

				_self.$snowball_glow.hide();
				// Allow user to select different wheel only when animation is finished
				// and spot is not from the future
				if (spot !== null && !_self.controller.isAnimationInProgress()) {
					_self.controller.showWheel(spot_index);
				}
				$el.parent().parent().find('.hover_glow').removeClass('selected');
				$el.parent().find('.hover_glow').addClass('selected');
			});

			this.initializeCountdown();

			this.updateSpotStates();

		},

		initializeCountdown : function() {
			this.controller.unregisterComponent('advent_countdown');
			this.controller.registerComponent('advent_countdown', this.$el.find('.countdown_box .middle').countdown2({
				value : this.controller.getEventEndAt() - Timestamp.now(),
				display : 'readable_seconds_with_days',
				tooltip : {title: this.l10n.countdown_tooltip}
			}));
		},

		initializeWheelComponents : function() {
			var controller = this.controller,
				current_spot = controller.getCurrentSpot();

			this.$btn_spin.hide();
			this.$btn_stop.hide();
			this.$btn_spin_for_gold.hide();
			this.$gold_price_indicator.hide();

			if (current_spot.getNotCollectedRewardsCount() > 0) {
				//If there is no reward to take
				if (current_spot.getRewardToTake() === undefined) {
					//Show "spin for free" button
					if (current_spot.isFreeSpin()) {
						controller.registerComponent('btn_spin', this.$btn_spin.button({
							template : 'empty',
							tooltips : controller.getButtonSpinTooltips()
						}).on('btn:click', function() {
							controller.startSpinning();
						}).show(), this.sub_context_wheel);
					}
					//Show "buy spin for gold" button
					else {

						var buySpin = function(e, _btn) {
							BuyForGoldWindowFactory.openBuyAdventSpinWindow(_btn, controller.getCurrentSpot(), function() {
								controller.startSpinning();
							});
						};

						controller.registerComponent('btn_spin_for_gold', this.$btn_spin_for_gold.button({
							template : 'empty',
							tooltips : controller.getButtonSpinForGoldTooltips()
						}).on('btn:click', buySpin).show(), this.sub_context_wheel);

						controller.registerComponent('btn_spin_for_gold_2', this.$gold_price_indicator.button({
							template : 'tpl_simplebutton_borders',
							caption : current_spot.getPriceForSpin(),
							icon: true,
							icon_type: 'gold',
							icon_position: 'right',
							tooltips : controller.getButtonSpinForGoldTooltips()
						}).on('btn:click', buySpin).show(), this.sub_context_wheel);

					}
				}
				else {
					//Move the reward to the middle
					if (!controller.isAnimationInProgress()) {
						this.moveRewardToTheMiddle();
					}
				}

				//Initialize "stop animation" button which is hidden as default, and managed by separate functions
				controller.registerComponent('btn_stop', this.$btn_stop.button({
					template : 'empty',
					tooltips : controller.getButtonStopTooltips()
				}).on('btn:click', controller.onStopSpinningButtonClick.bind(controller)), this.sub_context_wheel);

				//Reward tooltips
				//TODO: make nicer - see halloween_alchemy.js
				this.$el.find('.reward').on('mouseover', function(e) {
					var $reward = $(e.currentTarget),
						reward_no = $reward.data('reward-no'),
						rewards = controller.getWheel().getRewards(),
						reward = new GameModels.RewardItem(rewards[reward_no]);

					$reward.tooltip(TooltipFactory.createPowerTooltip(reward.getPowerId(), {}, reward.getConfiguration())).showTooltip(e);
				});
			}
		},

		initializeRefillButton : function() {
			var controller = this.controller,
				_self = this,
				current_spot = controller.getCurrentSpot(),
				refill_button_data = controller.getRefillButtonStateAndTooltips(),
				state = refill_button_data.state,
				tooltips = refill_button_data.tooltips,
				refill_cost = this.controller.getRefillCost(),
				has_refill_cost = refill_cost !== 0,
				caption = has_refill_cost ? refill_cost : this.l10n.buttons.btn_refill_free;

			controller.unregisterComponent('btn_refill', this.sub_context_wheel);
			controller.registerComponent('btn_refill', this.$el.find('.btn_refill').button({
				template : 'tpl_simplebutton_borders',
				caption : caption,
				disabled: state,
				state: state,
				icon: has_refill_cost,
				icon_type: 'gold',
				icon_position: 'right',
				tooltips : tooltips
			}).on('btn:click', function(e, _btn) {
				BuyForGoldWindowFactory.openAdventBuyRefillForGoldWindow(_btn, refill_cost, function() {
					current_spot.refill(refill_cost, function() {
						_self.rerenderWheel();
						_self.updateSpotStates();
					});
				});
			}), this.sub_context_wheel);
		},

		/**
		 * rerender Refill Button to dynamically update state and tooltips
		 */
		reRenderRefillButton : function() {
			this.initializeRefillButton();
		},

		/**
		 * Shows wheel of fortune with the spot data loaded to the "wheel" object
		 */
		showWheel : function() {
			this.$wheel_of_fortune.addClass('show');
			this.$wheel_of_fortune.slideDown();
			this.rerenderWheel();
		},

		/**
		 * Initializes spinner which shows spin animation
		 *
		 * @param timer_props
		 */
		initializeSpinner : function(timer_props) {
			var _self = this, controller = this.controller, wheel = this.controller.getWheel(),
				interval = wheel.getCurrentSpeed();

			//If there is no reward to draw, then don't animate anything
			if (controller.getCurrentSpot().getNotCollectedRewardsCount() <= 1) {
				//Just call callback function
				this.controller.onVeryEndOfTheSpinAnimation();
				return;
			}

			this.controller.setAnimationInProgress(true);

			TM.unregister('Advent:Spinner');

			if (interval > 0) {
				TM.register('Advent:Spinner', interval, function () {
					var wheel = this.controller.getWheel(),
						position = wheel.getIndicatorPosition(),
						next_position = wheel.getIndicatorNextPosition();

					//Update class names to indicate selected slot
					this.$slots[position].className = 'slot slot_' + position;
					this.$slots[next_position].className = 'slot slot_' + next_position + ' selected';

					wheel.setIndicatorPosition(next_position);
					wheel.setTick(wheel.getTick() + 1);

					//Change speed of the wheel if needed
					if (wheel.isTimeToSlowDown()) {
						_self.controller.slowDownSpinning();
					}
				}.bind(this), timer_props);
			}
		},

		onStartSpinning : function() {
			this.$btn_spin_for_gold.hide();
			this.$gold_price_indicator.hide();
			this.$btn_spin.hide();
			this.$el.find('.pin').hide();
		},

		onStopSpinning : function() {
			return new Promise(function(resolve, reject) {
				this.$el.find('.pin').show();
				resolve();
			}.bind(this));
		},

		moveRewardToTheMiddle : function() {
			return new Promise(function(resolve, reject) {
				var current_spot = this.controller.getCurrentSpot(),
					reward_to_take = current_spot.getRewardToTake();

				this.$snowball_glow.show();
				var reward_position = reward_to_take.position,
					$reward = this.$wheel_of_fortune.find('.slot_' + reward_position + ' .reward'),
					offset = $reward.offset(), window_offset = $('.classic_window.' + this.controller.getEventSkin() + ' .js-window-content').offset();

				this.$appended_reward = $reward.appendTo(this.$el.find('.advent_content')).css({
					top : offset.top - window_offset.top,
					left :  offset.left - window_offset.left,
					position : 'absolute',
					zIndex : 25
				});

				this.$appended_reward.transition({
					top: 171,
					left: 524
				}, 1000, 'easeInOutSine', function() {
					if (this.$appended_reward) {
						this.$reward_glow.show();
					}
					resolve();
				}.bind(this));

				this.controller.unregisterComponent('rwd_reward');
				this.registerComponent('rwd_reward', this.$appended_reward.reward({
                    reward: current_spot.getRewardToTake(),
                    disabled: false
                }).on('rwd:click', function (event, reward, position) {
                	ContextMenuHelper.showRewardContextMenu(event, reward, position);
                }.bind(this)));

				this.reRenderRefillButton();
			}.bind(this));
		},

		/**
		 * Removes reward which is placed in the middle of the wheel
		 */
		removeRewardFromTheMiddle : function() {
			this.$el.find('.reward_to_pick').remove();
			this.$snowball_glow.hide();
			this.$reward_glow.hide();
		},

		removeShardFromTheWheel : function(shard_number) {
			this.$wheel_of_fortune.find('.shard_icon_' + shard_number).remove();
		},

		animateShard : function(shard_number, $animated_shard) {
			return new Promise(function(resolve){
				// DANGER: magic numbers
				var shake = function(deg) {
						return new Promise(function(resolveShake) {
							$animated_shard.transition({
								rotate: deg + 'deg',
								duration: 80,
								complete: resolveShake
							});
						});
					},
					shrinkMove = function() {
						return new Promise(function(resolveShrinkMove) {
							var offsets = [381, 431, 489, 547, 607];
							$animated_shard.transition({
								left: offsets[shard_number],
								top: 339,
								scale: 0.25,
								duration: 800,
								complete: resolveShrinkMove
							});
						});
					},
					hide = function() {
						$animated_shard.hide();
						if (this.controller.hasCollectedAllShards()){
							var indices = us.range(GameDataAdvent.getMaxAmountOfShards());
							indices.forEach(this.removeShardFromTheWheel.bind(this));
						}
					}.bind(this);

				$animated_shard
					.removeAttr('style')
					.addClass('shard_'+shard_number)
					.show()
					.css({scale: 0.25});

				$animated_shard.transition({
					scale: 1,
					easing: 'linear',
					duration: 350,
					complete: function() {
						shake(-4.5)
						.then(shake.bind(null, 4.5))
						.then(shake.bind(null, -4.5))
						.then(shrinkMove)
						.then(hide)
						.then(resolve);
					}
				});

				var shard_index = this.controller.getRewardPositionForTheSpin() === 2 ? 0 : 1;
				this.removeShardFromTheWheel(shard_index);
			}.bind(this));
		},

		showDecoration : function(spot_number) {
			this.$el.find('.deco_' + spot_number).addClass('show_deco');
		},

		showAdvisorsOverlay : function() {
			var $overlay = this.$el.find('.advisors_overlay');

			$overlay.show();

			this.unregisterComponent('btn_advisors_ok');
			this.registerComponent('btn_advisors_ok', $overlay.find('.btn_ok').button({
				template : 'tpl_simplebutton_borders',
				caption : this.l10n.advisors.ok
			}).on('btn:click', function() {
				$overlay.hide();
			}));
		},

		reRender: function () {
			this.render();
		},

		destroy: function () {
			TM.unregister('Advent:Spinner');
			this.$el.off('.' + this.controller.getEventSkin());
		}
	};

	window.GameViews.Advent = View.extend(Advent);
}());
