/* global Game, us, GPWindowMgr */

define('tutorial/arrow_view', function(require) {
	'use strict';

	var arrows_sizes = {
		// vertical dimension
		arrow_v: {width: 52, height: 85},
		// horizontal dimension
		arrow_h: {width: 85, height: 52},
		// diagonal dimension
		arrow_d: {width: 78, height: 78}
	};

	var templates, controller, model;

	var moveAnimation = require('tutorial/arrow_animation');

	/**
	 * View Singleton
	 */
	return {
		initialize : function(model_instance, template_data, controller_instance) {
			model = model_instance;
			controller = controller_instance;
			templates = template_data;
		},

		/*
		 * Build a guiding arrow
		 * @param {Object} o - main settings object
		 * @param {String} setId - ID of set which this helper belongs to
		 * @param {Object} helper - helper object
		 * @param {String} groupId - optional - ID of group the set belongs to
		 *
		 * @param {String|DOM element|jQobject} helper.selector - element to which we want to point
		 * @param {Array} helper.direction - one of ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
		 * @param {Object} helper.offset - manual offset of the arrow, {x: num, y: num}. May specify only one parameter
		 * @param {String | DOM element | jQobject} helper.parent - parent to which should the arrow be injected and from which should it's position be calculated
		 *
		 * @return {jQobject} rendered arrow
		 *
		 */
		renderArrow: function (o) {
			if (!$(o.helper.selector).length) { // be sure that you can display the helper
				return false;
			}

			var $parent, $arrow, $el,
				opt = {
					offset: {x: 0, y: 0},
					animate: true,
					animation_type: 'bounce',
					direction: 'n',
					show_once: false,
					focus_window: false
				},
				position;

			if(o.helper.options) {
				$.extend(o.helper, o.helper.options);
				delete o.helper.options;
			}

			$.extend(true, opt, o.helper);

			if(o.helper.custom_filter){
				if (Game.dev) {
					console.warn('please fix UserGuideStepMarker.filter and this place to avoid new Function', o.helper.custom_filter);
				}
				var filterFn = new Function('$el', o.helper.custom_filter);
				$el = $(filterFn.call(null, $(o.helper.selector))).first();
				if(!$el.length) {
					return false;
				}
			} else {
				$el = $(o.helper.selector).first();
			}

			var size = $.extend(true, {}, arrows_sizes, {el : {width: $el.width(), height: $el.height()}});

			position = $el.position();

			//Change coordinate system in which element is relative to
			if (opt.parent_dom) {
				if (typeof (opt.parent_dom) === 'string') {
					$parent = $el.closest(opt.parent_dom);
				} else {
					$parent = $(opt.parent_dom);
				}

				position = $el.positionTo($parent);
			}

			// position the arrow centered next to the specfied element

			switch (opt.direction) {
				case 'nw':
					position.top = position.top + size.el.height;
					position.left = position.left + size.el.width;
					break;

				case 'n':
					position.top = position.top + size.el.height;
					position.left = position.left + (size.el.width / 2) - (size.arrow_v.width / 2);
					break;

				case 'ne':
					position.top = position.top + size.el.height;
					position.left = position.left - size.arrow_d.width;
					break;

				case 'e':
					position.top = position.top + ((size.el.height / 2) - (size.arrow_h.height / 2));
					position.left = position.left - size.arrow_h.width;
					break;

				case 'se':
					position.top = position.top - size.arrow_d.height;
					position.left = position.left - size.arrow_d.width;
					break;

				case 's':
					position.top = position.top - size.arrow_v.height;
					position.left = position.left + ((size.el.width / 2) - (size.arrow_v.width / 2));
					break;

				case 'sw':
					position.top = position.top - size.arrow_d.height;
					position.left = position.left + size.el.width;
					break;

				case 'w':
					position.top = position.top + ((size.el.height / 2) - (size.arrow_h.height / 2));
					position.left = position.left + size.el.width;
					break;
			}

			/*var arrow_position_modifier = getArrowPositionModifier(opt.direction);
			position.top = position.top + arrow_position_modifier.top;
			position.left = position.left + arrow_position_modifier.left;*/

		    /*
			 * during a tick animation we can exit here, if the arrow DOM element is still present
			 * if not, we do a complete re-render
			 */
			if (o.re_position && $('.set_' + o.setId).length === 0) {
				debug('arrow_view.js: tutorial arrow wants to animate, but got removed from DOM. Is you parentDOM property in the guide_steps_helpers.js correct for this step? Arrow gets re-added!');
			}

			if (o.re_position && $('.set_' + o.setId).length > 0) {
				$('.set_' + o.setId).css({
					'top': position.top + opt.offset.y,
					'left': position.left + opt.offset.x
				});

				return;
			}

			/*
			 * this code runs only the first time the arrow renders for a step
			 */

			$arrow = $(us.template($(templates.arrow).html().trim(), {
				setId: 'set_' + o.setId,
				groupId: o.groupId ? 'group_' + o.groupId : '',
				direction: opt.direction,
				animate: opt.animate,
				animation_type: opt.animation_type
			}));
			// @dev
//			console.log(position.left + (size.el.width / 2) - (size.arrow.width / 2), position.left, (size.el.width / 2), (size.arrow.width / 2))
			$arrow.css({
				'top': position.top + opt.offset.y,
				'left': position.left + opt.offset.x
			});

			moveAnimation.saveRemovedArrowOffset($arrow.offset(), opt.direction);

			$arrow.on({
				'bounce': function () {
					$(this).addClass('animate bounce');
					return this;
				},
				'stopBounce': function () {
					$(this).removeClass('animate bounce');
					return this;
				},
				'blink': function (e, opt) {
					$(this).addClass('animate blink');
					return this;
				},
				'stopBlink': function () {
					$(this).removeClass('animate blink');
					return this;
				}
			});

			$arrow.remove = function () {
				$(this).remove();
			};

			$arrow.bounce = function () {
				$(this).trigger('bounce');
			};

			$arrow.blink = function (opt) {
				$(this).trigger('blink');
			};

			$arrow.stopAnimation = function () {
				$(this).trigger('stopBlink').trigger('stopBounce');
			};

			if (opt.focus_window && !o.re_render) {
				if(GPWindowMgr.getOpenFirst(GPWindowMgr[opt.focus_window])) {
					GPWindowMgr.getOpenFirst(GPWindowMgr[opt.focus_window]).toTop();
				}
			}

			if (opt.parent_dom) {
				$parent.append($arrow);
			} else {
				$el.parent().append($arrow);
			}

			$arrow.css({
				'top': position.top + opt.offset.y,
				'left': position.left + opt.offset.x
			});

			// left in helper builder so that this setting could be changed by backend
			if (opt.show_once && !o.re_render) {
				controller.addBurnout({setId: o.setId, helperNo: o.helperNo});
			}

			$arrow.data('$self', $arrow);

			moveAnimation.animateMovementToArrow($arrow);

			return $arrow;
		},

		/*
		 * Build a highlighter
		 *
		 * @param {object} o - main settings object
		 * @param {string} setId - ID of set which this helper belongs to
		 * @param {object} helper - helper object
		 * @param {string} groupId - optional - ID of group the set belongs to
		 *
		 * @param {string|DOM element|jQobject} helper.selector - element to which we want to point
		 * @param {object} helper.expand - manual size change of the highlighter, {x: num, y: num}. May specify only one parameter
		 * @param {bool} helper.fix_position - to force-set position: relative on the target
		 * @param {object} helper.expand - {x:num, y:num} to change sizing of the highlighter
		 *
		 * @return {jQobject} rendered highlighter
		 */
		renderHighlighter: function (o) {
			if (!$(o.helper.selector).length) { // be sure that you can display the helper
				return false;
			}

			var $parent, $highlight, $el, $clone,
				//default settings
				opt = {
					animate: true,
					animation_type: 'blink',
					leave: false,
					count: 3,
					block: false,
					fix_position: false,
					show_once: true,
					block_click: false,
					focus_window: false,
					expand: {x: 0, y: 0},
					offset: {x: 0, y: 0}
				},
				position,
				recoverOriginalElState;

			if(o.helper.options) {
				$.extend(o.helper, o.helper.options);
				delete o.helper.options;
			}

			$.extend(true, opt, o.helper);

			if(o.helper.custom_filter){
				var filterFn = new Function('$el', o.helper.custom_filter);
				$el = $(filterFn.call(null, $(o.helper.selector))).first();
				if(!$el.length) {
					return false;
				}
			} else {
				$el = $(o.helper.selector).first();
			}

			position = $el.position();

			//Change coordinate system in which element is relative to
			if (opt.parent_dom) {
				if (typeof (opt.parent_dom) === 'string') {
					$parent = $el.closest(opt.parent_dom);
				} else {
					$parent = $(opt.parent_dom);
				}

				position = $el.positionTo($parent);
			}

			recoverOriginalElState = function () {
				if (opt.fix_position) {
					$el.css('position', $el.data('helper-highlight-stored-position'));
				}
				if(opt.block_click || $el.data('$el-copy')) {
					$el.removeClass('hiddenByGameHelpers');
					$el.data('$el-copy').remove();
				}

			};

			$highlight = $(us.template($(templates.highlight).html(), {
					setId: 'set_' + o.setId,
					groupId: o.groupId ? 'group_' + o.groupId : '',
					animate: opt.animate,
					animation_type: opt.animation_type
				}));

			$highlight.css({
					width: $el.outerWidth() - 10 + opt.expand.x,
					height: $el.outerHeight() - 10 + opt.expand.y,
					top: position.top + parseInt(($el.css('margin-top') === 'auto'?0:$el.css('margin-top')), 10) + 5 - (opt.expand.y / 2) + opt.offset.y,
					left: position.left + parseInt(($el.css('margin-left') === 'auto'?0:$el.css('margin-left')), 10) + 5 - (opt.expand.x / 2) + opt.offset.x
				}).on({
					'blink': function (e, blink_options) {
						if (blink_options) {
							if (blink_options.count && blink_options.count !== 3) {
								$(this).css({
									'-webkit-animation-iteration-count -moz-animation-iteration-count -ms-animation-iteration-count -o-animation-iteration-count animation-iteration-count': (blink_options.count * 2) + 1// full animation loop = 2 animation runs  +1 fade out
								});
							}
							if (blink_options.leave) {
								$(this).off('.animation');
							} else {
								$highlight.on({
									'animationend.animation webkitAnimationEnd.animation MSAnimationEnd.animation oAnimationEnd.animation': function (e) {
										$highlight.remove();
									}
								});
							}
						}
						$(this).addClass('animate blink');
					},
					'stopBlink': function (){
						$(this).off('.animation').removeClass('animate blink').removeAttr('style');
					}
				});

			$highlight.remove = function () {
				$(this).remove();
				recoverOriginalElState();
			};

			$highlight.blink = function (opt) {
				$(this).trigger('blink');
			};

			$highlight.stopAnimation= function () {
				$(this).trigger('stopBlink');
			};

			if (opt.count !== 3) { //default in css
				$highlight.css({
					'-webkit-animation-iteration-count -moz-animation-iteration-count -ms-animation-iteration-count -o-animation-iteration-count animation-iteration-count': opt.count * 2 + 1 // full animation loop = 2 animation runs + 1 fade out
				});
			}
			if (!opt.leave){
				$highlight.on({
					'animationend.animation webkitAnimationEnd.animation MSAnimationEnd.animation oAnimationEnd.animation': function (e){
						$highlight.remove();
					}
				});
			}

			if (opt.focus_window && !o.re_render) {
				if(GPWindowMgr.getOpenFirst(GPWindowMgr[opt.focus_window])) {
					GPWindowMgr.getOpenFirst(GPWindowMgr[opt.focus_window]).toTop();
				}
			}

			if (opt.parent_dom) {
				$parent.append($highlight);
			} else {
				$el.parent().append($highlight);
			}

			// set z-indexing so that highlighted elements might be clickable
			if (!opt.block){
				$el.css('z-index', 1);
			}

			if(opt.block_click) {
				$clone = $el.clone(true)
					.off('click mousedown mouseup touchstart touchend')
					.on('click mousedown mouseup touchstart touchend', function(e){e.stopImmediatePropagation(); e.preventDefault();})
					.insertAfter($el);
				$clone.attr('id', $clone.attr('id') + '_clone').attr('style', window.getComputedStyle?window.getComputedStyle($el[0], null).cssText:window.getIEComputedStyle($el[0], null).cssText);
				$el.addClass('hiddenByGameHelpers');
				$el.data('$el-copy', $clone);
			}

			if (opt.fix_position) {
				$el.data('helper-highlight-stored-position', $el.css('position')).css('position', 'relative');
			}

			 if (opt.show_once && !o.re_render){
				controller.addBurnout({setId: o.setId, helperNo: o.helperNo});
			 }

			 $highlight.data('$self', $highlight);

			return $highlight;
		},

		/*
		 * Start animations on currently displayed helpers
		 * pass no parameter to turn on animations on ALL displayed sets
		 *
		 * @param {object} o - settings object
		 * @param setId {string | array} - ID of set to remove the animations from
		 */
		startAnimation: function (o) {
			if (o.setId) {
				if ($.isArray(o.setId)) {
					$.each(o.setId, function (i, setId) {
						if (model.getSetById(setId)){
							$('.helpers.set_' + setId).addClass('animate');
						} else {
							console.error('No set for id:', setId);
						}
					});
					console.info('Animations started for sets:', o.setId);
				} else {
					if (model.getSetById(o.setId)){
						$('.helpers.set_' + o.setId).addClass('animate');
						console.info('Animations started for set:', o.setId);
					} else {
						console.error('No set for id:', o.setId);
					}
				}
			} else {
				$('.helpers').addClass('animate');
				console.info('Animations started for all helpers');
			}
		},

		/*
		 * Stop animations on currently displayed helpers
		 * pass no parameter to turn off animations on ALL displayed sets
		 *
		 * @param {object} o - settings object
		 * @param setId {string | array} - ID of set to remove the animations from
		 */
		stopAnimation: function (o) {
			o = o || {};

			if (o.setId) {
				if ($.isArray(o.setId)) {
					$.each(o.setId, function (i, setId) {
						if (model.getSetById(setId)){
							$('.helpers.set_' + setId).removeClass('animate');
						} else {
							console.error('No set for id:', setId);
						}
					});
					console.info('Animations stopped for sets', o.setId);
				} else {
					$('.helpers.set_' + o.setId).removeClass('animate');
					console.info('Animations stopped for set:', o.setId);
				}
			} else {
				$('.helpers').removeClass('animate');
				console.info('Animations stopped for all helpers');
			}
		},

		removeHelpersForSet: function (setId) {
			$('.helpers.set_' + setId).each(function(i, el){
				var $el = $(el);

				//moveAnimation.saveRemovedArrowOffset($el.offset(), $el.data('direction'));

				$el.data('$self').remove();
			});
		},
		removeHelpersForGroup: function (groupId) {
			$('.helpers.group_' + groupId).each(function(i, el) {
				var $el = $(el);

				//moveAnimation.saveRemovedArrowOffset($el.offset(), $el.data('direction'));

				$el.data('$self').remove();
			});
		},

		destroy : function () {
			$('.helpers').each(function(i,el){
				var $el = $(el);

				//moveAnimation.saveRemovedArrowOffset($el.offset(), $el.data('direction'));

				$el.data('$self').remove();
			});
		}
	};

});
