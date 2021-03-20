/* global HelperBrowserEvents, HelperDragDrop, Timestamp, GameDataHercules2014, BuyForGoldWindowFactory,
NotificationLoader, us */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var Hercules2014View = View.extend({
		zoom : 1,

		is_my_army_hidden: false,

		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render : function() {
			var unlocked_stage_id = this.controller.getHighestUnlockedStageId();

			// initialze main template
			this.$el.html(us.template(this.controller.getTemplate('main'), {
				l10n : this.l10n
			}));

			this.$viewport = this.$el.find('.js-hercules2014-viewport');
			this.$draggable_layer = this.$viewport.find('.js-hercules2014-dragdrop');

			// this.$el also includes subwindows which are open, this helps limit operations to the main screen
			this.$main_view = this.$el.find('.hercules2014_map');

			this.initializeCountdown();
			this.initializeDroppedUnits();
			this.initializeUnits();
			this.initializeBuyByGoldButtons();
			this.initializeHealerBox();
			this.initializeStages();
			this.registerStageTooltips();
			this.initializeMercenaryTooltip();
			this.registerEventListeners();
			this.registerEventInfoButton();
			this.centerViewportOnStage(unlocked_stage_id);
		},

		/**
		 * open event Info window
		 */
		registerEventInfoButton : function() {
			this.controller.unregisterComponent('btn_info_overlay');
			this.controller.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
				template : 'internal',
				tooltips : [
					{title: this.l10n.event_explanation}
				]
			}).on('btn:click', function() {
				this.controller.showLinearTutorial();
			}.bind(this)));
		},

		/**
		 * Registers event listeners
		 */
		registerEventListeners : function() {
			// ToDo refactor this method
			var controller = this.controller,
				subctx = this.controller.getSubContext(),
				onStartEventName = HelperBrowserEvents.getOnStartEventName(subctx),
				onStopEventName = HelperBrowserEvents.getOnStopEventName(subctx),
				onClickEventName = HelperBrowserEvents.getOnClickEventName(subctx),
				dragStopHandler = function() {
					this.controller.showRanking();
					this.showMyArmy();
				}.bind(this),
				onMouseWheelEventName = HelperBrowserEvents.getOnMouseWheelEventName(subctx),
				$map = this.$viewport.find('.hercules_map'),
				hideRankingAndMyArmyAfterDelay = us.debounce(function() {
					var is_still_dragged = this.$draggable_layer.hasClass('dragging');
					if (is_still_dragged) {
						this.controller.hideRanking();
						this.hideMyArmy();
					}
				}.bind(this), 200),
				$dragdrop = this.$viewport.find('.dragdrop');

			this.dragDropHandler = HelperDragDrop.getDragDropEventHandler(this.$viewport, subctx, null, dragStopHandler);

			// handle clicks on stages
			$map.on(onClickEventName, '.click_area', function(event) {
				var $target = $(event.currentTarget).parent(),
					stage_id = $target.data('stage_id');

				if (!$dragdrop.hasClass('dragging')) {
					controller.openStageWindow(stage_id, event);
				}
			});

			this.$viewport.on(onStartEventName, '.js-hercules2014-dragdrop', function(event) {
				this.dragDropHandler(event);
				hideRankingAndMyArmyAfterDelay();
				this.controller.saveMapViewPosition($dragdrop.css('translate'));
			}.bind(this));

			// used when moving the cursor out of the window while dragging
			this.$viewport.on(onStopEventName, '.js-hercules2014-dragdrop', function(event) {
				this.controller.showRanking();
				this.showMyArmy();
			}.bind(this));

			// zooming
			this.$viewport.on(onMouseWheelEventName, '.js-hercules2014-dragdrop', this._zoomEventHandler.bind(this, this.$viewport, $dragdrop));

			this.initializeResize($map);
		},

		_zoomEventHandler : function($viewport, $draggable, event, delta) {
			var width_ratio = $viewport.width() / $draggable.width(),
				height_ratio = $viewport.height() / $draggable.height(),
				min = Math.max(width_ratio, height_ratio), // max zoom out should still contain only map
				max = 1.0,
				old_zoom = $draggable.data('zoom-factor') || 1,
				pos = [0,0];

			var new_zoom = old_zoom + delta / 20;
			new_zoom = Math.min(max, Math.max(min, new_zoom));

			// snap back to boundaries
			var translate = $draggable.css('translate');
			if (translate !== 0) {
				pos = translate.split(',').map(function(el){ return parseInt(el,10); });
			}
			var viewport_width = $viewport.outerWidth(),
				viewport_height = $viewport.outerHeight(),
				draggable_width = $draggable.outerWidth(),
				draggable_height = $draggable.outerHeight(),
                draggable_offset = $draggable.offset(),
				origin = {
					x: 0, y: 0
				},

				limited_pos = HelperDragDrop.getLimitedPosition(
					pos[0], pos[1],
					viewport_width, viewport_height,
					draggable_width, draggable_height,
                    draggable_offset,
					new_zoom
				);

			// TODO fix focus point of zoom (origin)
			// console.log(origin);

			$draggable.css({
				scale: new_zoom,
				transformOrigin: origin.x + 'px ' + origin.y + 'px',
				translate: [
					limited_pos.x - origin.x * (1-new_zoom),
					limited_pos.y - origin.y * (1-new_zoom)
				]
			});
			//console.log(new_zoom, origin.x + 'px ' + origin.y + 'px', limited_pos.x - origin.x * (1-new_zoom), limited_pos.y - origin.y * (1-new_zoom));
			$draggable.data('zoom-factor', new_zoom);

			return false;
		},

		/*
		 * Initialize Event Countdown
		 */
		initializeCountdown : function() {
			this.controller.unregisterComponent('countdown');
			this.controller.registerComponent('countdown', this.$main_view.find('.countdown_box .middle').countdown2({
				value : this.controller.getEventEndAt() - Timestamp.now(),
				display : 'event',
				tooltip: {title: this.l10n.tooltips.countdown}
			}));
		},

		/**
		 * Initialize Unit Container with mercenaries, except the healer
		 */
		initializeUnits : function() {
			var $mercenaries_box = this.$main_view.find('.hercules2014_map .mercenaries_box'),
				func = this.controller.getArmyAmountsFor.bind(this.controller),
				html = this.controller.getMercenariesBoxHtml(func);

			$mercenaries_box.append(html);
		},

		/**
		 * Initialize the display of the stages
		 */
		initializeStages : function() {
			var stages = this.controller.getAllStages(),
				$map = this.$main_view.find('.hercules_map'),
				$stages = $('<div class="stages">');

			for (var i = 0, l = stages.length; i < l; i++) {
				var stage = stages[i],
					stage_css_class = this.controller.getStageCSSClass(stage.id),
					$stage,
					stage_level = this.controller.getStageLevel(stage.id),
					special_stage = (stage.story_id && stage_level < 2 ) ? true : false;

				$stage = $(us.template(this.controller.getTemplate('stage'), {
					l10n : this.l10n,
					stage: stage,
					stage_css_class: stage_css_class,
					special_stage: special_stage
				}));

				$stages.append($stage);
			}

			$map.append($stages);
		},

		registerStageTooltips: function() {
			this.$el.find('.click_area').each(function(i, el) {
				var $el = $(el),
					stage_id = $el.parent().data('stage_id'),
					stage_tooltip = this.controller.getStageTooltip(stage_id);

				$el.tooltip(stage_tooltip, {'max-width' : 'initial'});
			}.bind(this));
		},

		/**
		 * Initialize the healer
		 */
		initializeHealerBox : function() {
			var healer_timestamp = this.controller.getHealerTimestamp(),
				healer_cost = this.controller.getHealerCost(),
				$mercenaries_box = this.$main_view.find('.mercenaries_box');

			$mercenaries_box.append(us.template(this.controller.getTemplate('healer'), {
				l10n : this.l10n
			}));

			var healer_tooltip = this.controller.getHealerTooltip();

			// register Healer Progressbar
			this.controller.unregisterComponent('healer_progressbar');
			var pg = this.controller.registerComponent('healer_progressbar', $mercenaries_box.find('.pb_healer_timer').singleProgressbar({
				max : GameDataHercules2014.getHealerCooldownDuration(),
				value : healer_timestamp - Timestamp.now(),
				liveprogress : true,
				type : 'time',
				countdown : true,
				template : 'tpl_pb_single_nomax'
			}).on('pb:cd:finish', function() {
				NotificationLoader.resetNotificationRequestTimeout(100);
			}.bind(this)));

			pg.parents('.progressbar_container').tooltip(healer_tooltip, {width: 350});
			this.$el.find('.healer .headline').tooltip(healer_tooltip, {width: 350});

			var controller = this.controller, l10n = this.l10n;

			var onClick = function(e, _btn) {
				BuyForGoldWindowFactory.openBuyHercules2014HealerWindow(_btn, controller, healer_cost);
			};

			this.$main_view.find('.btn_buy_healer').each(function(index, el) {
				var $el = $(el);

				controller.unregisterComponent('btn_buy_healer');
				controller.registerComponent('btn_buy_healer', $el.button({
					template : 'tpl_simplebutton_borders',
					caption : controller.getHealerCost(),
					disabled: !(controller.areArmyUnitsWounded()),
					state: !(controller.areArmyUnitsWounded()),
					icon: true,
					icon_type: 'gold',
					icon_position: 'right',
					tooltips : [
						{title : l10n.tooltips.buy_healer(controller.getHealerCost())},
						{title : l10n.tooltips.cant_buy_healer}
					]
				}).on('btn:click', onClick.bind(null)));
			});
		},

		/**
		 * Initialize and register all mercenary buy gold buttons
		 */
		initializeBuyByGoldButtons : function() {
			var controller = this.controller,
				l10n = this.l10n;

			var onClick = function(mercenary_type, mercenary, cost, e, _btn) {
				BuyForGoldWindowFactory.openBuyHercules2014MercenaryWindow(_btn, mercenary_type, mercenary, cost, controller);
			};

			//Buy mercenaries button
			this.$main_view.find('.btn_buy_mercenary').each(function(index, el) {
				var $el = $(el),
					mercenary_type = $el.data('type'),
					mercenary = controller.getMercenary(mercenary_type),
					cost = controller.getMercenaryCost(mercenary_type),
					component_name = 'btn_buy_mercenary_' + mercenary_type;

				controller.unregisterComponent(component_name);
				controller.registerComponent(component_name, $el.button({
					template : 'tpl_simplebutton_borders',
					caption : cost,
					icon: true,
					icon_type: 'gold',
					icon_position: 'right',
					tooltips : [
						{title : l10n.tooltips.buy_mercenaries(cost, controller.getMercenaryName(mercenary_type)),  styles : {width : 400}}
					]
				}).on('btn:click', onClick.bind(null, mercenary_type, mercenary, cost)));
			});
		},

		/**
		 * unregister, rerender and re-register all mercenarie related infos + healer components
		 */
		reRenderMercenariesArea : function() {
			var $mercenaries_box = this.$main_view.find('.mercenaries_box');

			$mercenaries_box.empty();

			this.initializeUnits();
			this.initializeHealerBox();
			this.initializeBuyByGoldButtons();
			this.initializeMercenaryTooltip();
		},

		// Re-Render the Stages states on the map
		reRenderMap : function() {
			this.$main_view.find('.stages').empty();
			this.initializeStages();
			this.registerStageTooltips();
		},

		initializeMercenaryTooltip : function() {
			var controller = this.controller;

			this.$el.find('.hercules2014_map .mercenary .mercenary_image').each(function(idx, val) {
				var $el = $(val),
					type = $el.data('type');

				$el.tooltip(controller.getMercenaryTooltip(type), {'max-width': 'initial'}, false);
			});

			this.$el.find('.hercules2014_map .mercenary .ct_right .wounded').tooltip(this.l10n.wounded);
			this.$el.find('.hercules2014_map .mercenary .ct_right .healthy').tooltip(this.l10n.available);
		},

		centerViewportOnStage : function(stage_id) {
			var $stage = this.$main_view.find('.stage[data-stage_id='+ stage_id +']');

            if (!$stage) {
                return;
            }

			var stage_position = $stage.position(),
				left = 0,
				top = 0;

			var viewport = {
				width : this.$viewport.outerWidth(),
				height : this.$viewport.outerHeight()
			};

			var viewport_center = {
				left: Math.floor(this.$viewport.width() / 2),
				top: Math.floor(this.$viewport.height() / 2)
			};

			// maximum values that the map can be moved
            var max_offset = {
            	left: this.$draggable_layer.width() - viewport.width,
            	top: this.$draggable_layer.height() - viewport.height
			};

            // position of the stage center on the map
            stage_position = {
            	left: stage_position.left + Math.floor($stage.width() / 2),
                top : stage_position.top + Math.floor($stage.height() / 2)
			};

            // offset of the map when the stage is centered
            var stage_center_offset = {
            	left: stage_position.left - viewport_center.left,
            	top: stage_position.top - viewport_center.top
			};

            left = (viewport_center.left < stage_position.left) ? stage_center_offset.left : left;
            left = (max_offset.left < left) ?  max_offset.left : left;
            
            top = (viewport_center.top < stage_position.top) ? stage_center_offset.top : top;
            top = (max_offset.top < top) ?  max_offset.top : top;

			this.$draggable_layer.css({
				transform: 'translate(' + (-left) + 'px, ' + (-top) + 'px)'
			});
		},

		/**
		 * initialize top area with the dropped daily units
		 */
		initializeDroppedUnits : function() {
			var $container = this.$el.find('.frame_daily_units'),
				amount = this.controller.getDroppedUnitsSum(),
				max_amount = GameDataHercules2014.getMaxAmountofDropUnits();

			$container.append(us.template(this.controller.getTemplate('banner'), {
				l10n : this.l10n,
				amount: amount
			}));

			var $el = $('<div>');
			var amount_left = max_amount - amount;
			var tooltip_html = us.template(this.controller.getTemplate('collecting_tooltip'), {
				l10n : this.l10n,
				amount_box_text : amount_left === 0 ? this.l10n.tooltips.daily_amount_box_empty : this.l10n.tooltips.daily_amount_box(amount_left)
			});
			$el.append(tooltip_html);

			var func = this.controller.getCollectedTodayAmountsFor.bind(this.controller),
				html = this.controller.getMercenariesBoxHtml(func);
			$el.find('.mercenaries_box').append(html);

			$container.tooltip($el.html(), {width: 460, 'max-width': 460});
		},

		hideMyArmy: function() {
			if (!this.is_my_army_hidden) {
				this.$el.find('.frame_my_army').transition({translate: ['-50%', '110px']});
				this.is_my_army_hidden = true;
			}
		},

		showMyArmy: function() {
			if (this.is_my_army_hidden) {
				this.$el.find('.frame_my_army').transition({translate: ['-50%', 0]});
				this.is_my_army_hidden = false;
			}
		},

		/**
		 * re-render the top area with the dropped daily units
		 */
		reRenderDroppedUnits : function() {
			var $container = this.$el.find('.frame_daily_units');
			$container.empty();

			this.initializeDroppedUnits();
		},

		reValidateMapIsInBounds: function() {
			// the following code is a mean hack to trigger a behaviour in dragdrop.js that would need to be extracted
			// it basically fakes a drag-drop with 0 movement to trigger the bounds check for the map
			var fake_event = {
				delegateTarget: this.$viewport,
				currentTarget: this.$draggable_layer,
				type: 'mousedown',
				clientX: 0,
				clientY: 0,
				preventDefault: function() {},
				// next is for zoom
				pageX: 0,
				pageY: 0
			};

			this._zoomEventHandler(this.$viewport, this.$draggable_layer, fake_event, 0);
		},

		initializeResize: function($map) {
			var $el = this.$el.find('.btn_resize'),
				original_size = {width: 771, height: 580},
				wm = this.controller.getWindowModel(),
				MAIN_UI_WIDTH = 300,
				MAIN_UI_HEIGHT = 100,

				// Toggles between the maximized and small window.
				// Window will be centered after resizing and button
				// When was_window_resize is true, it will always go to the small window
				resize = function(ev, el, was_window_resize) {
					var current_size = {width: wm.getWidth(), height: wm.getHeight()},
						still_original_size = us.isEqual(current_size, original_size),
						should_size_up = still_original_size,
						// leave some room for main UI
						optimum_width = $(window).width() - MAIN_UI_WIDTH,
						optimum_height = $(window).height() - MAIN_UI_HEIGHT,
						max_width = $map.width(),
						max_height = $map.height();

					if (was_window_resize) {
						should_size_up = !still_original_size;
					}

					wm.setHeight(should_size_up ? us.clamp(original_size.height, optimum_height, max_height) : original_size.height);
					wm.setWidth(should_size_up ? us.clamp(original_size.width, optimum_width, max_width) : original_size.width);
					// center window
					wm.requestPositionReset();
					this.reValidateMapIsInBounds();

					$el.toggleClass('minimize', should_size_up);
					$el.tooltip(should_size_up ? this.l10n.tooltips.activities.small_window : this.l10n.tooltips.activities.big_window);

				}.bind(this),
				resizeToSmall = resize.bind(this, null, null, true);
				this.registerComponent('btn_resize', $el.button({
					template: 'empty',
					tooltips: [
						{title: this.l10n.tooltips.activities.big_window}
					]
				}).on('btn:click', resize));

			window.addEventListener('resize', resizeToSmall);
		},

		destroy : function() {
		}
	});

	window.GameViews.Hercules2014View = Hercules2014View;
}());
