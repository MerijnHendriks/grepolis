/*global us, GameDataNotes */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var SubWindowRenameNoteView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);
			this.render();
		},

		render : function() {
			this.$el.html(us.template(this.controller.getTemplate('sub_window_rename_note'), {
				l10n : this.controller.getl10n()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();

			this.registerComponent('txt_note_name', this.$el.find('.txt_note_name').textbox({
				value : this.controller.getTabTitle(),
				max : GameDataNotes.getTitleMaxLength(),
				type : 'text',
				live : true
			}).focus().selectAll());

			this.registerComponent('btn_rename_note', this.$el.find('.btn_rename_note').button({
				caption : l10n.btn_rename
			}).on('btn:click', function() {
				var textbox = this.getComponent('txt_note_name');
				this.controller.onBtnRenameClick(textbox.getValue());
			}.bind(this)));

			this.registerComponent('btn_cancel', this.$el.find('.btn_cancel').button({
				caption : l10n.btn_cancel
			}).on('btn:click', this.controller.onBtnCancelClick.bind(this.controller)));
		},

		destroy : function() {

		}
	});

	window.GameViews.SubWindowRenameNoteView = SubWindowRenameNoteView;
}());
