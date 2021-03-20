/* global jQuery */

(function($) {
	"use strict";

	$.fn.listSlider = function(params) {
		var settings = $.extend({
			enable_wheel_scrolling: false,
			is_animated: false,
			is_horizontal: true,
			scroll_item_into_view: null
		}, params);

		var $el = $(this),
			button_left, button_right;

		var $viewport = $el.find('.js-list-viewport'),
			$list = $el.find('.js-list'),
			scroll_enabled = true;

		/**
		 * Calculates total width in pixels of all elements which are
		 * displayed on the list
		 *
		 * @return {Integer}
		 */

		function getContentDimension() {
			var $nodes = $list.children(),
				result = 0;

			$nodes.each(function(index, el) {
				var $el = $(el);
				result += settings.is_horizontal ? $el.outerWidth(true) : $el.outerHeight(true);
			});

			return result;
		}

		function setContentDimension() {
			if (settings.is_horizontal) {
				$list.width(getContentDimension());
			} else{
				$list.height(getContentDimension());
			}
		}

		/**
		 * Returns width of the viewport
		 *
		 * @return {Integer}
		 */
		function getViewportDimension() {
			return settings.is_horizontal ? $viewport.width() : $viewport.height();
		}

		function getListPosition() {
			return settings.is_horizontal ? $list.position().left : $list.position().top;
		}

		function getItemDimension($item) {
			return settings.is_horizontal ? $item.outerWidth(true) : $item.outerHeight(true);
		}

		function getItemPosition($item) {
			return settings.is_horizontal ? $item.position().left : $item.position().top;
		}

		/**
		 * Hides or shows buttons depends on the position of the list
		 * and size of the viewport
		 */
		function updateButtonsVisibility() {
			var viewport_dimension = getViewportDimension(),
				content_dimension = getContentDimension(),
				list_pos = getListPosition();

			//Don't display left button when list is scrolled to the left side or when there is nothing to scroll
			var hide_left_button = list_pos === 0 || content_dimension <= viewport_dimension,
				//Don't display right button when list is scrolled to the right side or when there is nothing to scroll
				hide_right_button = list_pos === viewport_dimension - content_dimension || content_dimension <= viewport_dimension;

			button_left.toggle(!hide_left_button);
			button_right.toggle(!hide_right_button);
		}

		function updateListPosition(position) {
			if (settings.is_horizontal) {
				$list.css('left', position);
			} else {
				$list.css('top', position);
			}

			if (!settings.is_animated) {
				updateButtonsVisibility();
			}
		}

		/**
		 * Centers icons relatively to the viewport
		 */
		function alignIcons() {
			var position = 0,
				viewport_dimension = getViewportDimension(),
				content_dimension = getContentDimension();

			//If icons don't fill entire viewport
			if (viewport_dimension > content_dimension) {
				//center them
				position = (viewport_dimension - content_dimension) / 2;
			}

			updateListPosition(position);
		}

		/**
		 * Determinates whether the item is visible in the viewport or not
		 *
		 * @return {Boolean}
		 */
		function isItemVisibleInViewport($item) {
			var list_pos = getListPosition(),
				viewport_dimension = getViewportDimension(),
				pos = settings.is_horizontal ? $item.position().left : $item.position().top,
				width = getItemDimension($item),
				pos_modified = pos + list_pos;//Its done to operate only in range <0, viewport_width>

			return (pos_modified >= 0 || pos_modified + width > 0) && pos_modified < viewport_dimension;
		}

		/**
		 * Returns position of the first or last visible item in the viewport
		 *
		 * @param {String} which
		 *     Possible values:
		 *     - 'first'
		 *     - 'last'
		 */
		function getVisibleItemInViewport(which) {
			var $item, items = $list.children(), i, l = items.length;

			for (i = 0; i < l; i++) {
				if (isItemVisibleInViewport($(items[i]))) {
					$item = $(items[i]);

					if (which === 'first') {
						return $item;
					}
				}
			}

			return $item;
		}

		function toggleScrolling(value) {
			if (settings.is_animated) {
				scroll_enabled = value;
			}
		}

		function scrollTo(list_position) {
			var position = Math.min(0, list_position);
			updateListPosition(position);
		}

		function scrollToBeginning() {
			var $first_visible = getVisibleItemInViewport('first'),
				$previous_item = $first_visible.prev();

			if ($previous_item.length) {
				scrollTo(getListPosition() + getItemDimension($previous_item));
			} else {
				toggleScrolling(true);
			}
		}

		function scrollToEnd() {
			var $last_visible = getVisibleItemInViewport('last'),
				$next_item = $last_visible.next();

			if ($next_item.length) {
				scrollTo(getListPosition() - getItemDimension($next_item));
			} else {
				toggleScrolling(true);
			}
		}

		function bindEvents() {
			//Initialize left button
			button_left = $el.find('.js-button-left').button({
				template : 'empty'
			}).on('btn:click', function() {
				toggleScrolling(false);
				scrollToBeginning();
			});

			//Initialize right button
			button_right = $el.find('.js-button-right').button({
				template : 'empty'
			}).on('btn:click', function() {
				toggleScrolling(false);
				scrollToEnd();
			});

			if (settings.enable_wheel_scrolling) {
				$list.on('mousewheel', function (e, delta) {
					if (!scroll_enabled) {
						return;
					}

					toggleScrolling(false);

					if (delta < 0) {
						scrollToEnd();
					} else {
						scrollToBeginning();
					}
				});
			}

			if (settings.is_animated) {
				$list.on('webkitTransitionEnd oTransitionEnd MSTransitionEnd transitionend', function (e) {
					updateButtonsVisibility();
					toggleScrolling(true);
				});
			}
		}

		function updateContent() {
			setContentDimension();
			//Update visibility of these buttons
			updateButtonsVisibility();
			//Center icons if they don't fill entire viewport
			alignIcons();
		}

		function scrollItemIntoView() {
			var $item = settings.scroll_item_into_view,
				item_pos = 0;

			if (!$item || $item.length === 0) {
				return;
			}

			if (isItemVisibleInViewport($item)) {
				return;
			}

			item_pos = getItemPosition($item);

			if (item_pos < 0) {
				scrollTo(getListPosition() - item_pos);
			} else {
				scrollTo(getViewportDimension() - (item_pos + getItemDimension($item)));
			}

			updateButtonsVisibility();
		}

		this.toggleAnimated = function (value) {
			settings.is_animated = value;
		};

		this.updateContent = function() {
			updateContent();
		};

		/**
		 * Clears up stuff before component will be removed
		 */
		this.destroy = function() {
			button_left.destroy();
			button_right.destroy();
			$list.off();
		};

		//Initialize
		(function() {
			bindEvents();
			updateContent();
			scrollItemIntoView();
		}());

		return this;
	};
}(jQuery));
