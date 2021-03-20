/*global define */

define('no_gold_dialog/views/no_gold', function () {
	'use strict';

	var View = window.GameViews.BaseView;

	return View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.l10n;
			this.render();
		},

		render : function() {
			this.renderTemplate(this.$el, 'index', {
				l10n: this.controller.getl10n(),
				view: this
			});

			this.controller.unregisterComponents();
			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.registerComponent('btn_buy_gold', this.$el.find('.btn_buy_gold').button({
				caption: this.l10n.get_gold_now
			}).on('btn:click', function() {
				this.controller.openShop();
			}.bind(this)));
		},

		destroy : function() {
		}
	});
});
