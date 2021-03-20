
define('tutorial/arrow_animation', function() {

	'use strict';

	// Simple feature flag the animation
	var feature_animate_arrow = true;

	return {
		removed_arrow_data : null,
		$fake_arrow : null,

		getDegreesForDirection : function(direction) {
			switch (direction) {
				case 'n':
					return 0;
				case 'ne':
					return 45;
				case 'e':
					return 90;
				case 'se':
					return 135;
				case 's':
					return 180;
				case 'sw':
					return 225;
				case 'w':
					return 270;
				case 'nw':
					return 315;
			}
		},

		getOffsetForDirection : function(direction) {
			switch (direction) {
				case 'n':
					return 0;
				case 'ne':
					return 45;
				case 'e':
					return 90;
				case 'se':
					return 135;
				case 's':
					return 180;
				case 'sw':
					return 225;
				case 'w':
					return 270;
				case 'nw':
					return 315;
			}
		},

		getRotationDegrees : function(start_direction, end_direction) {
			var start_degrees = this.getDegreesForDirection(start_direction),
				end_degrees = this.getDegreesForDirection(end_direction);

			var diff = end_degrees - start_degrees;

			return (diff < 0 ? '-' : '+') + '=' + Math.abs(diff);
		},

		saveRemovedArrowOffset : function(offset, direction) {
			this.removed_arrow_data = {
				offset : offset,
				direction : direction
			};
		},

		animateMovementToArrow : function($arrow) {
			// bail if feature is disabled ...
			if (!feature_animate_arrow) {
				return;
			}

			// ... or no data is saved
			if (this.removed_arrow_data === null) {
				return;
			}

			var arrow_offset = $arrow.offset(),
				removed_arrow_offset = this.removed_arrow_data.offset;

			var start_direction = this.removed_arrow_data.direction;
			var end_direction = $arrow.data('direction');

			var $fake_arrow = this.$fake_arrow;

			$arrow.css('visibility', 'hidden');

			if ($fake_arrow === null) {
				$fake_arrow = this.$fake_arrow = $('<div></div>');
				$('body').append(this.$fake_arrow);
			}

			$fake_arrow.removeClass().addClass('helper_arrow d_' + start_direction);

			$fake_arrow.show();

			$fake_arrow.css({
				top : removed_arrow_offset.top,
				left : removed_arrow_offset.left,
				zIndex : 10000
			});
			$arrow.hide();

			//var arrow_position_modifier = getArrowPositionModifier(end_direction);
			var arrow_position_modifier = {
				left : 0, top : 0
			};

			var pos_x = arrow_offset.left - removed_arrow_offset.left + arrow_position_modifier.left;
			var pos_y = arrow_offset.top - removed_arrow_offset.top + arrow_position_modifier.top;

			//console.log('start_direction', start_direction, 'end_direction', end_direction, this.getRotationDegrees(start_direction, end_direction), pos_x, pos_y, removed_arrow_offset);

			if (pos_x === 0 && pos_y ===0 ) {
				$arrow.css('visibility', 'visible');
				$fake_arrow.hide();
				$arrow.show();
				return;
			}

			$fake_arrow.transition({
				x : pos_x,
				y : pos_y,
				rotate : this.getRotationDegrees(start_direction, end_direction),
				duration : 1000,
				complete : function() {
					$arrow.css('visibility', 'visible');
					$fake_arrow.hide();
					$arrow.show();
				}
			});
		}
	};

});
