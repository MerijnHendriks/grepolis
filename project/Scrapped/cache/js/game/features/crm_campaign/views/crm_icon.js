/* global Timestamp, us */
(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	// maps remaining seconds to css classes
	var COLOR_STOPS = {
		// 5 minutes
		300 : 'red glow',
		// 15 minutes
		900: 'orange'
	};

	var CrmIconView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			var $tpl = $('#tpl_crm_icon').html();

			this.$el.prepend(us.template($tpl, us.extend({
				l10n : this.l10n,
				icon_class : this.controller.getIconType(),
				model_id : this.controller.getModelId(),
				tab_id : this.controller.getTabId()
			})));

			this.$crm_icon = this.$el.find('.crm_icon[data-model_id="' + this.controller.getModelId() + '"]');
            this.$crm_icon.tooltip(this.controller.getTooltip());

            this.registerViewComponents();
		},

		removeIcon : function() {
			$('.crm_icon[data-model_id="' + this.controller.getModelId() + '"]').remove();
		},

		reRender : function() {
			this.removeIcon();
			this.render();
		},

		registerViewComponents : function() {
			this.$crm_icon.on('click', function(e) {
				this.controller.iconClicked(e);
			}.bind(this));

			if (this.controller.hasTimer()) {
				this.initializeTimer();
			}
		},

		/**
		 * Adds css classes to the icon to highlight it specifically at the color_stop thresholds
		 * @param e - jquery event (not used, but given by countdown component)
		 * @param {number} seconds_left
		 */
		changeTextColor: function(e, seconds_left) {
			var special_css_class = COLOR_STOPS[seconds_left],
				all_special_classes = us.values(COLOR_STOPS).join(' ');

			if (special_css_class) {
				this.$el.removeClass(all_special_classes);
				this.$el.addClass(special_css_class);
			}
		},

		initializeTimer : function() {
			var $timer =  this.$crm_icon.find('.timer_box'),
				$countdown = $timer.find('.cd_offer_timer'),
				component_id = 'crm_icon_countdown_' + this.controller.getModelId(),

				colorConditions = function(seconds_left) {
					return !!COLOR_STOPS[seconds_left];
				},

				getNextBiggest = function(remaining_time) {
					var stops = us.keys(COLOR_STOPS).sort();
					for (var i=0; i< stops.length; i++) {
						var val = stops[i];
						if (remaining_time <= val) {
							return val;
						}
					}
				},

				remaining_time = this.controller.getTimerEndTime() - Timestamp.now(),

				countdown_component = $countdown.countdown2({
					value : remaining_time,
					display : 'day_hr_min_sec',
					only_non_zero : true,
					condition : colorConditions
				}).on('cd:finish', function() {
					this.controller.unregisterComponent(component_id);
					this.$crm_icon.remove();
					this.controller.removeIcon();
				}.bind(this))
				.on('cd:condition', this.changeTextColor.bind(this));

            this.controller.unregisterComponent(component_id);
			this.controller.registerComponent(component_id, countdown_component);

			this.changeTextColor(null, getNextBiggest(remaining_time));

			$timer.show();
		},

		destroy : function() {

		}
	});

	window.GameViews.CrmIconView = CrmIconView;
}());
