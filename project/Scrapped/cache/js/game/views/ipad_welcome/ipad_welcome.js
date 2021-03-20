(function () {
	"use strict";

	var View = window.GameViews.BaseView;

	var IpadWelcomeView = View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('main'), {
				l10n : this.controller.getl10n()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.registerComponent('btn_dont_show_tip', this.$el.find('.btn_dont_show_tip').button({
				template : 'empty'
			}).on('btn:click', this.controller.onBtnDontShowTipClick.bind(this.controller)));
		},

		destroy : function() {

		}
	});

	window.GameViews.IpadWelcomeView = IpadWelcomeView;
}());
