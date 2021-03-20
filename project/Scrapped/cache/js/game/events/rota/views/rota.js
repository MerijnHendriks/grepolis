/* globals GameEvents, HumanMessage, TM, LocalStore */

define('events/rota/views/rota', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		ContextMenuHelper = require('helpers/context_menu'),
		CURRENCY_INDICATOR = 'currency_indicator',
		SPIN_BUTTON = 'spin_button',
		RESET_BUTTON = 'reset_button',
		OVERLAY_BUTTON = 'overlay_button',
		OVERLAY_COMPONENTS = 'overlay_components',
		DOUBLE_REWARD_PROGRESS = 'double_reward_progress',
		GRAND_PRIZE_PROGRESS = 'grand_prize_progress',
		GRAND_PRIZE_PREVIEW_AMOUNT = 3,
		FAST_CYCLES = 10,
		MIN_SPIN_CYCLES = 15,
		MAX_SPIN_CYCLES = 25,
		SPINNING_WHEEL_THRESHOLD = 5,
		FOCUS_ITEM_POSITION = 3,
		SHORT_ANIMATION_KEY = 'wheel_event_short_animation';

	return BaseView.extend({
		inventory_offset: {},
		wheel_offset: {},
		reward_offset: {},
		spin_cycles: {},

		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.wheel_spin_animation = true;
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'index', {
				inventory_limit: this.controller.getInventoryLimit(),
				l10n: this.l10n,
				has_painting_elements: this.controller.hasPaintingElements()
			});

			if (LocalStore.get(SHORT_ANIMATION_KEY) === null) {
				LocalStore.set(SHORT_ANIMATION_KEY, false, this.controller.getEventTimeLeft());
			}

			this.renderWheel();
			this.renderEventInventory();
			this.registerCurrencyIndicator();
			this.registerSpinButton();
			this.registerResetButton();
			this.registerRewardsListButton();
			this.registerDoubleRewardProgress();
			this.registerDailySpecialReward();
			this.registerCurrencyShopButton();
			this.registerGrandPrizeProgress();
			this.registerGrandPrizePreview();
			this.registerEventCountdown();
			this.renderPainting();
			this.registerShortAnimationCheckbox();
			this.registerTutorialButton();

			this.initializeAnimationData();
			this.updateOverlayAndButtons();
		},

		registerTutorialButton: function () {
			this.unregisterComponent('tutorial_button');
			this.registerComponent('tutorial_button', this.$el.find('.btn_tutorial').button({
				template: 'internal',
				tooltips: [{ title: this.l10n.open_tutorial }]
			}).on('btn:click', this.controller.showTutorial.bind(this.controller)));
		},

		registerShortAnimationCheckbox: function () {
			this.unregisterComponent('short_animation');
			this.registerComponent('short_animation', this.$el.find('.short_animation').checkbox({
				caption: this.l10n.short_animation,
				checked: LocalStore.get(SHORT_ANIMATION_KEY)
			}).on('cbx:check', function (e, $el, checked) {
				LocalStore.set(SHORT_ANIMATION_KEY, checked, this.controller.getEventTimeLeft());
				this.updateSpinCyclesData();
			}.bind(this)));
		},

		registerEventCountdown: function () {
			var $countdown = this.$el.find('.countdown');

			this.unregisterComponent('event_countdown');
			this.registerComponent('event_countdown', $countdown.countdown2({
				value: this.controller.getEventTimeLeft(),
				display: 'event',
				tooltip: { title: this.l10n.event_time_left }
			}));
		},

		renderPainting: function (fade_in) {
			var context = this.getCanvasContext(),
				elements = this.controller.getPaintingElements(),
				$canvas = $(context.canvas),
				$clone;


			this.loadImages(elements, function () {
				$canvas.parent().removeClass('blank');

				if (fade_in) {
					$clone = this.cloneCanvas($canvas);
					$canvas.hide().detach();
				}

				elements.forEach(function (element) {
					this.renderPaintingElement(context, element);
				}.bind(this));

				if ($clone) {
					$canvas.appendTo($clone.parent()).fadeIn(400, 'linear', function () {
						$clone.remove();
					});
				}
			}.bind(this));
		},

		cloneCanvas: function ($canvas) {
			var $clone = $canvas.clone(),
				context = this.getCanvasContext($clone),
				old_canvas = $canvas[0];

			$clone.addClass('clone');

			context.width = old_canvas.width;
			context.height = old_canvas.height;

			context.drawImage($canvas[0], 0, 0);

			$clone.appendTo($canvas.parent());

			return $clone;
		},

		loadImages: function (elements, callback) {
			var images_loaded = 0;

			elements.forEach(function (element) {
				var image = new Image();
				element.image = image;

				image.addEventListener('load', function () {
					images_loaded++;

					if (images_loaded === elements.length && typeof callback === 'function') {
						callback();
					}
				});

				image.src = this.controller.getPaintingImagePath(element.getImageId());
			}.bind(this));
		},

		renderPaintingElement: function (context, element) {
			var x = element.getX(),
				y = element.getY();

			context.drawImage(element.image, x, y);
		},

		fadeInPaintingElement: function () {
			this.renderPainting(true);
		},

		resetPainting: function () {
			var context = this.getCanvasContext(),
				$canvas = $(context.canvas);

			this.reset_painting_in_progress = true;

			$canvas.fadeOut(400, function () {
				context.clearRect(0, 0, context.canvas.width, context.canvas.height);
				$canvas.show();
				$canvas.parent().addClass('blank');
				this.controller.clearPaintingElements();

				this.reset_painting_in_progress = true;
			}.bind(this));
		},

		getCanvasContext: function ($canvas) {
			var canvas;

			if ($canvas && $canvas.length > 0) {
				canvas = $canvas[0];
			} else {
				canvas = document.getElementsByClassName('rota_painting')[0];
			}

			return  canvas.getContext('2d');
		},

		initializeAnimationData: function () {
			var $wheel = this.$el.find('.wheel');

			this.inventory_offset = this.$el.find('.inventory_items').position();
			this.wheel_offset = $wheel.position();
			this.reward_offset = $wheel.find('.reward_icon').first().position();

			this.updateSpinCyclesData();
		},

		updateSpinCyclesData: function () {
			var short_animation = LocalStore.get(SHORT_ANIMATION_KEY);

			this.spin_cycles.min = !short_animation ? MIN_SPIN_CYCLES : 0;
			this.spin_cycles.max = !short_animation ? MAX_SPIN_CYCLES : 0;
		},

		registerDailySpecialReward: function () {
			this.unregisterComponent('daily_special_reward');
			this.registerComponent('daily_special_reward', this.$el.find('.daily_special_reward').reward({
				reward: this.controller.getDailySpecialReward(),
				size: 45
			}));
		},

		registerCurrencyIndicator: function () {
			var $indicator = this.$el.find('.currency_indicator');

			this.unregisterComponent(CURRENCY_INDICATOR);
			this.registerComponent(CURRENCY_INDICATOR, $indicator.numberChangeIndicator({
				caption: this.controller.getAvailableCurrency()
			}));
		},

		registerSpinButton: function () {
			var disabled = !this.controller.canSpinWheel();

			this.unregisterComponent(SPIN_BUTTON);
			this.registerComponent(SPIN_BUTTON, this.$el.find('.btn_spin').button({
				caption: this.l10n.btn_spin(this.controller.getSpinCost()),
				disabled: disabled,
				state: disabled,
				icon: true,
				icon_type: 'tyche_coin',
				css_classes: this.controller.getAvailableCurrency() < this.controller.getSpinCost() ? 'blocked' : ''
			}).on('btn:click', this.handleSpinClick.bind(this)));
		},

		handleSpinClick: function () {
			if (this.controller.getAvailableCurrency() < this.controller.getSpinCost()) {
				HumanMessage.error(this.l10n.insufficient_currency);

				return;
			}

			var $viewport = this.$el.find('.wheel .viewport'),
				resolve = function (data) {
					this.winning_slot_position = data.slot_position;
				}.bind(this);

			this.winning_slot_position = null;
			this.controller.handleSpinClick(resolve, this.resetWheel.bind(this));
			this.wheel_start_offset = $viewport.position().left;
			this.spin_animation_running = true;
			this.updateOverlayAndButtons();

			if (this.wheel_spin_animation) {
				this.startWheelAnimation($viewport);
			} else if (this.highlight_animation) {
				this.startHighlightAnimation($viewport);
			} else {
				this.handleSingleReward($viewport.children().first());
			}
		},

		handleResetResponse: function () {
			this.resetWheel();
			this.handleSpinClick();
		},

		resetWheel: function () {
			this.renderWheel();
			this.updateOverlayAndButtons();
		},

		handleSingleReward: function ($item) {
			$item.addClass('focus');

			TM.unregister('single_reward_timer');
			TM.register('single_reward_timer', 500, function () {
				if (this.winning_slot_position) {
					TM.unregister('single_reward_timer');
					this.animateRewardToInventory($item);
				}
			}.bind(this));
		},

		startWheelAnimation: function ($viewport) {
			var max_cycles = this.getSpinCycles(),
				$start_item = $viewport.find('.wheel_item.focus'),
				start_left = this.wheel_start_offset + $start_item.outerWidth();

			$start_item.removeClass('focus');

			$viewport.animate({
				left: '-=' + start_left + 'px'
			}, 600, 'easeInBack', function () {
				this.moveViewport($viewport);
				this.animateWheelSpin($viewport, max_cycles, 1);
			}.bind(this));
		},

		stopWheelAnimation: function ($viewport, $stop_item) {
			$viewport.animate({
				left: this.wheel_start_offset + 'px'
			}, 600, 'easeOutBack', function () {
				$stop_item.addClass('focus');
				TM.once('reward_animation', 500, this.animateRewardToInventory.bind(this, $stop_item));
			}.bind(this));
		},

		animateWheelSpin: function ($viewport, cycles, count) {
			if (!this.spin_animation_running) {
				return;
			}

			$viewport.animate({
					left: '-=98px'
			}, {
				duration: this.getCycleDuration(count),
				easing: 'linear',
				done: function () {
					this.moveViewport($viewport);

					var $stop_item = $viewport.find('.wheel_item:nth-child(' + FOCUS_ITEM_POSITION + ')');

					if (count >= cycles && this.winning_slot_position === $stop_item.data('index')) {
						this.stopWheelAnimation($viewport, $stop_item);
					} else {
						this.animateWheelSpin($viewport, cycles, ++count);
					}
				}.bind(this)
			});
		},

		moveViewport: function ($viewport) {
			$viewport.find('.wheel_item:last').after($viewport.find('.wheel_item:first'));
			$viewport.css({left: 0});
		},

		animateRewardToInventory: function ($item) {
			var $reward = $item.find('.reward_icon'),
				$reward_clone = $reward.clone(),
				$inventory_item = this.$el.find('.inventory_items .item.invisible'),
				parent_position = $item.parent().position(),
				item_position = $item.position(),
				clone_position = {
					left: this.wheel_offset.left + parent_position.left + item_position.left + this.reward_offset.left,
					top: this.wheel_offset.top + parent_position.top + item_position.top + this.reward_offset.top
				},
				transform = {
					x: this.inventory_offset.left + $inventory_item.position().left - clone_position.left,
					y: this.inventory_offset.top + $inventory_item.position().top - clone_position.top
				};

			$reward_clone.addClass('cloned').css(clone_position).appendTo(this.$el.find('.rota_main_bottom'));

			transform.x -= $reward.outerWidth() * 0.25;
			transform.y -= $reward.outerHeight() * 0.25;

			$reward.remove();
			$reward_clone.transition({
				x: transform.x,
				y: transform.y,
				scale: 0.5
			}, 500, 'ease', function () {
				var $next_item = $item.next();

				$reward_clone.remove();
				$inventory_item.removeClass('invisible');

				$item.remove();
				$next_item.addClass('focus');

				this.spin_animation_running = false;
				this.updateWheelStyle();
				this.updateOverlayAndButtons();
			}.bind(this));
		},

		startHighlightAnimation: function ($viewport) {
			var $item = $viewport.children().first();
			this.animateHighlight($item, this.getSpinCycles(), 1);
		},

		animateHighlight: function ($item, cycles, count) {
			if ($item.length === 0 || !this.spin_animation_running) {
				return;
			}

			var item_index = $item.data('index');

			if (count >= cycles && item_index === this.winning_slot_position) {
				TM.once('reward_animation', 500, this.animateRewardToInventory.bind(this, $item));
			} else {
				TM.once('highlight_animation', this.getCycleDuration(count, 200), function () {
					var $next_item = $item.next().length !== 0 ? $item.next() : $item.siblings().first();
					$item.removeClass('focus');
					$next_item.addClass('focus');
					this.animateHighlight($next_item, cycles, ++count);
				}.bind(this));
			}
		},

		registerResetButton: function (is_overlay) {
			var disabled = !this.controller.canResetWheel(),
				$btn = this.$el.find('.btn_reset'),
				name = RESET_BUTTON,
				context;

			if (is_overlay) {
				$btn = this.$el.find('.btn_overlay');
				name = OVERLAY_BUTTON;
				context = OVERLAY_COMPONENTS;
			}

			this.unregisterComponent(name);
			this.registerComponent(name, $btn.button({
				caption: this.l10n.btn_reset(this.controller.getResetCost()),
				disabled: disabled,
				state: disabled,
				icon: true,
				icon_type: 'tyche_coin',
				css_classes: this.controller.getAvailableCurrency() < this.controller.getResetCost() ? 'blocked' : ''
			}).on('btn:click', this.controller.handleReset.bind(this.controller)), context);
		},

		registerRewardsListButton: function () {
			this.unregisterComponent('btn_rewards_list');
			this.registerComponent('btn_rewards_list', this.$el.find('.btn_rewards_list').button({
				template: 'internal',
				tooltips: [{ title: this.l10n.rewards_list.title }]
			}).on('btn:click', this.controller.openRewardsListSubWindow.bind(this.controller)));
		},

		registerCurrencyShopButton: function () {
			this.unregisterComponent('btn_currency_shop');
			this.registerComponent('btn_currency_shop', this.$el.find('.buy_currency_button').button({
				template: 'empty',
				tooltips: [{ title: this.l10n.btn_currency_shop }]
			}).on('btn:click', this.controller.openCurrencyShop.bind(this.controller)));
		},

		registerGrandPrizeCollectButton: function () {
			var grand_prize = this.controller.getGrandPrizeToCollect();

			this.unregisterComponent('overlay_reward_button');
			this.registerComponent('overlay_reward_button',	this.$el.find('.btn_overlay').reward({
				reward: grand_prize,
				template: 'tpl_button',
				template_data: {
					caption: this.l10n.btn_grand_prize_collect,
					icon: false
				}
			}).on('rwd:click', function (event, reward, position) {
				ContextMenuHelper.showContextMenu(event, position, {
					data: {
						event_group: GameEvents.active_happening.reward,
						data: reward,
						id: reward.data('power_id')
					}
				});
			}), OVERLAY_COMPONENTS);
		},

		updateOverlay: function () {
			var $overlay = this.$el.find('.overlay'),
				$text = $overlay.find('.text'),
				$btn = $overlay.find('.btn_overlay'),
				show_button = false;

			if (this.spin_animation_running) {
				return;
			}

			this.unregisterComponents(OVERLAY_COMPONENTS);

			if (this.controller.isGrandPrizeReadyToCollect()) {
				$text.html(this.l10n.grand_prize_overlay_text);
				this.registerGrandPrizeCollectButton();
				show_button = true;
			} else if (!this.controller.hasEnoughFreeInventorySlots()) {
				if (this.controller.isDoubleRewardActive()) {
					$text.html(this.l10n.inventory_full_double_overlay_text);
				} else {
					$text.html(this.l10n.inventory_full_overlay_text);
				}
			} else if (this.controller.isWheelEmpty()) {
				$text.html(this.l10n.wheel_empty_overlay_text);
				this.registerResetButton(true);
				show_button = true;
			} else {
				$overlay.removeClass('active');
				return;
			}

			$btn.toggleClass('active', show_button);
			$overlay.toggleClass('text_only', !show_button);
			$overlay.addClass('active');
		},

		registerGrandPrizePreview: function () {
			var rewards = this.controller.getGrandPrizes();

			for (var i = 0; i < GRAND_PRIZE_PREVIEW_AMOUNT; i++) {
				this.unregisterComponent('grand_reward_preview_' + i);
				this.registerComponent(
					'grand_reward_preview_' + i,
					this.$el.find('.grand_prize_preview_' + i).reward({reward: rewards[i], size: i === 0 ? 60 : 30})
				);
			}
		},

		renderWheel: function () {
			var $viewport = this.$el.find('.wheel .viewport'),
				fragment = document.createDocumentFragment(),
				items = this.controller.getRewards(),
				sub_context = 'wheel_items';

			this.spin_animation_running = false;
			$viewport.stop(true, true).empty().removeAttr('style');
			this.unregisterComponents(sub_context);

			items.forEach(function (item, index) {
				var el = document.createElement('div');

				el.className = 'wheel_item';

				if (this.controller.isDailySpecialReward(item)) {
					el.className += ' daily_special';
				}

				if (items.length >= SPINNING_WHEEL_THRESHOLD) {
					el.className += index === (FOCUS_ITEM_POSITION - 1) ? ' focus' : '';
				}

				el.setAttribute('data-index', item.slot_position);

				this.registerComponent('wheel_item_' + item.slot_position, $(el).reward({
					reward: item.data
				}), sub_context);

				fragment.appendChild(el);
			}.bind(this));

			$viewport.append(fragment);

			this.initializeAnimationData();
			this.updateWheelStyle();
		},

		updateWheelStyle: function () {
			var $wheel = this.$el.find('.wheel'),
				$viewport = $wheel.find('.viewport'),
				item_width = $viewport.children().first().outerWidth(),
				item_count =  $viewport.children().length;

			$viewport.width(item_width * item_count);

			if (item_count < SPINNING_WHEEL_THRESHOLD) {
				this.$el.find('.wheel_mask').hide();
				$wheel.addClass('highlight');
				$viewport.css({left: 0});
				$viewport.children().removeClass('focus');
				this.wheel_spin_animation = false;
				this.highlight_animation = item_count > 1;
			} else {
				$wheel.removeClass('highlight');
				this.wheel_spin_animation = true;
				this.highlight_animation = false;
			}
		},

		renderEventInventory: function () {
			var $inventory = this.$el.find('.inventory_items'),
				$cloned_inventory = $inventory.clone(),
				item_ids = this.controller.getEventInventoryItemIds();

			$inventory.empty();
			item_ids.forEach(function (id, index) {
				var $item = $cloned_inventory.find('.item[data-item_id="' + id + '"]'),
					is_new_item = $item.length === 0;

				if (is_new_item) {
					$item = $('<div class="item" ></div>');
					$item.attr('data-item_id', id);

					if (this.spin_animation_running) {
						$item.addClass('invisible');
					}
				}

				this.unregisterComponent('inventory_item_' + id);
				this.registerComponent('inventory_item_' + id, $item.reward({
					reward: this.controller.getEventInventoryItemProperties(id),
					size: 30
				}).on('rwd:click', function (event, reward, position) {
					var data = {
						event_group: GameEvents.active_happening.inventory,
						data: reward,
						id: reward.data('item_id')
					};

					ContextMenuHelper.showContextMenu(event, position, {data: data});
				}));

				$inventory.append($item);
			}.bind(this));

			this.updateOverlayAndButtons();
		},

		registerDoubleRewardProgress: function () {
			var element = this.$el.find('.double_reward_progress');
			element.addClass('size_' + this.controller.getOriginalSize());

			this.unregisterComponent(DOUBLE_REWARD_PROGRESS);
			this.registerComponent(
				DOUBLE_REWARD_PROGRESS,
				element.singleProgressbar({
					type: 'integer',
					max: this.controller.getDoubleRewardThreshold(),
					value: this.controller.getDoubleRewardProgress()
				})
			);

			this.updateDoubleRewardMarker();
		},

		updateDoubleRewardMarker: function () {
			this.$el.find('.double_reward_marker').toggleClass('active', this.controller.isDoubleRewardActive());
		},

		updateDoubleRewardProgress: function () {
			var bar = this.getComponent(DOUBLE_REWARD_PROGRESS);
			if (bar) {
				bar.setValue(this.controller.getDoubleRewardProgress());
			}
			this.updateDoubleRewardMarker();
		},

		registerGrandPrizeProgress: function () {
			var element = this.$el.find('.grand_prize_progress');
			element.addClass('size_' + this.controller.getGrandPrizeThreshold());

			this.unregisterComponent(GRAND_PRIZE_PROGRESS);
			this.registerComponent(
				GRAND_PRIZE_PROGRESS,
				element.singleProgressbar({
					type: 'integer',
					max: this.controller.getGrandPrizeThreshold() - 1,
					value: this.controller.getGrandPrizeProgress()
				})
			);
		},

		updateGrandPrizeProgress: function () {
			var bar = this.getComponent(GRAND_PRIZE_PROGRESS);
			if (bar) {
				bar.setValue(this.controller.getGrandPrizeProgress());
			}
		},

		updateCurrency: function () {
			var component = this.getComponent(CURRENCY_INDICATOR);
			if (component) {
				component.setCaption(this.controller.getAvailableCurrency());
			}
		},

		updateButtons: function () {
			var spin_button = this.getComponent(SPIN_BUTTON),
				can_spin_wheel = this.controller.canSpinWheel() &&
					!this.spin_animation_running &&
					this.$el.find('.wheel_item').length > 0;

			if (spin_button) {
				spin_button.disable(!can_spin_wheel);

				if (this.controller.getAvailableCurrency() < this.controller.getSpinCost()) {
					spin_button.addClass('blocked');
				} else {
					spin_button.removeClass('blocked');
				}
			}

			var reset_button = this.getComponent(RESET_BUTTON),
				reset_button_caption = this.l10n.btn_reset(this.controller.getResetCost()),
				can_reset_wheel = this.controller.canSpinWheel() &&
					!this.spin_animation_running;

			if (reset_button) {
				reset_button.disable(!can_reset_wheel);
				reset_button.setCaption(reset_button_caption);

				if (this.controller.getAvailableCurrency() < this.controller.getResetCost()) {
					reset_button.addClass('blocked');
				} else {
					reset_button.removeClass('blocked');
				}
			}

			var overlay_button = this.getComponent(OVERLAY_BUTTON);

			if (overlay_button && this.controller.isWheelEmpty()) {
				overlay_button.disable(!can_reset_wheel);
				overlay_button.setCaption(reset_button_caption);
			}
		},

		updateOverlayAndButtons: function () {
			this.updateOverlay();
			this.updateButtons();
		},

		getSpinCycles: function () {
			return Math.floor(
				Math.random() * (this.spin_cycles.max - this.spin_cycles.min + 1)
			) + this.spin_cycles.min;
		},

		getCycleDuration: function (count, base_duration) {
			var duration = base_duration ? base_duration : 100,
				max_duration = duration * 5;

			if (count > FAST_CYCLES) {
				count -= FAST_CYCLES;
				duration += (count * 5) * 3.5;
			}

			return duration <= max_duration ? duration : max_duration;
		},

		destroy: function () {
			this.spin_animation_running = false;
			this.$el.stop(true, true);
			TM.unregister('hightlight_animation');
		}
	});
});
