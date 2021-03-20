define('events/grid_event/views/sub-windows/grand_prize_journey', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'grand_prize_journey', {
				l10n: this.l10n
			});

			this.registerCloseButton();
			this.startAnimation();
		},

		registerCloseButton: function () {
			var $button = this.$el.find('.button_close');

			this.unregisterComponent('grand_prize_journey_close_btn');
			this.registerComponent('grand_prize_journey_close_btn', $button.button({
				caption: this.l10n.button
			}).on('btn:click', function () {
				this.controller.closeMe();
			}.bind(this)));
		},

		startAnimation: function() {
			var $inner_part = this.$el.find('.inner_part');
			var loop = function() {
				$inner_part
					.transition({
						rotate: '360deg'
					}, 1000, 'linear', function() {
						$inner_part.css('transform', 'none');
						var position_css_class = this.controller.getRotationCssClass();
						if (position_css_class) {
							$inner_part.addClass(position_css_class);
							this.controller.resetRotationPosition();
							this.controller.registerAutoCloseTimer();
						} else {
							loop();
						}
					}.bind(this));
			}.bind(this);
			loop();
		}
	});
});