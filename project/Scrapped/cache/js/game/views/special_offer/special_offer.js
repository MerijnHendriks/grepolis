/* global Timestamp, us */
(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var SpecialOfferView = View.extend({
		initialize: function () {
			View.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getOfferl10n();
			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('index'), {
				l10n : this.l10n,
				discount_type : this.controller.getDiscountType(),
				discount_string : this.controller.getDiscountString(),
				offer_has_timer : this.controller.hasTimer(),
				css_theme : this.controller.getCssTheme()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.controller.unregisterComponents();

			if (this.controller.hasTimer()) {
				this.controller.registerComponent('special_offer_countdown', this.$el.find('.cd_offer_timer').countdown2({
					value : this.controller.getTimerEndTime() - Timestamp.now(),
					display : 'day_hr_min_sec'
				}).on('cd:finish', function() {
					this.controller.closeWindow();
				}.bind(this)));
			}

			this.controller.registerComponent('btn_accept', this.$el.find('.btn_accept').button({
				caption : this.l10n.buy_gold,
				tooltips : [],
				css_classes : 'instant_buy type_free'
			}).on('btn:click', function() {
				this.controller.onWindowClicked();
			}.bind(this)));
		},

		destroy : function() {

		}
	});

	window.GameViews.SpecialOfferView = SpecialOfferView;
}());
