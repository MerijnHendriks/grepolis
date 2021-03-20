(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var NotesPreviewView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.unregisterComponents();

			this.$el.html(us.template(this.controller.getTemplate('preview'), {
				html : this.controller.getMemoHtml()
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();
			var has_no_notes = this.controller.hasNoNotes();
			var has_only_one_note = this.controller.hasOnlyOneNote();
			var has_all_possible_notes_created = this.controller.hasAllPossibleNotesCreated();

			this.registerComponent('btn_edit', this.$el.find('.btn_edit').button({
				caption : l10n.btn_edit,
				disabled : has_no_notes,
				tooltips : [
					{title : l10n.tooltips.btn_edit}
				]
			}).on('btn:click', this.controller.onBtnEditClick.bind(this.controller)));

			this.registerComponent('btn_delete', this.$el.find('.btn_delete').button({
				caption : l10n.btn_delete,
				disabled : has_no_notes || has_only_one_note,
				state : has_no_notes || has_only_one_note,
				tooltips : this.controller.getDeleteButtonTooltips()
			}).on('btn:click', this.controller.onBtnDeleteClick.bind(this.controller)));

			this.registerComponent('btn_rename', this.$el.find('.btn_rename').button({
				caption : l10n.btn_rename,
				disabled : has_no_notes,
				tooltips : [
					{title : l10n.tooltips.btn_rename}
				]
			}).on('btn:click', this.controller.onBtnRenameClick.bind(this.controller)));

			this.registerComponent('btn_new', this.$el.find('.btn_new').button({
				caption : l10n.btn_new,
				disabled : has_all_possible_notes_created,
				state : has_all_possible_notes_created,
				tooltips : [
					{title : l10n.tooltips.btn_create},
					{title : l10n.tooltips.btn_create_inactive}
				]
			}).on('btn:click', this.controller.onBtnNewClick.bind(this.controller)));
		},

		destroy : function() {
			//Unregister becuase this view is destroyed manually
			this.unregisterComponents();
		}
	});

	window.GameViews.NotesPreviewView = NotesPreviewView;
}());
