/*global us */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowDeleteNoteView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('sub_window_delete_note'), {
				l10n : this.controller.getl10n()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();

			this.registerComponent('btn_yes', this.$el.find('.btn_yes').button({
				caption : l10n.btn_yes
			}).on('btn:click', this.controller.onBtnYesClick.bind(this.controller)));

			this.registerComponent('btn_no', this.$el.find('.btn_no').button({
				caption : l10n.btn_no
			}).on('btn:click', this.controller.onBtnNoClick.bind(this.controller)));
		},

		destroy : function() {

		}
	});

	window.GameViews.SubWindowDeleteNoteView = SubWindowDeleteNoteView;
}());
