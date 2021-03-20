/*global _ */

(function() {
	"use strict";

	DM.loadData({
		l10n: {
			notes : {
				window_title: _("Notes"),
				tabs: [],
				btn_create : _("Create"),
				btn_edit : _("Edit"),
				btn_save : _("Save"),
				btn_cancel : _("Cancel"),
				btn_delete : _("Delete"),
				btn_rename : _("Rename"),
				btn_new : _("New"),
				btn_yes : _("Yes"),
				btn_no : _("No"),
				title_new_note : _("New note"),
				title_delete_note : _("Delete note"),
				title_rename_note : _("Rename your note"),
				lbl_new_note : _("New note"),
				lbl_rename_note : _("New name"),
				new_note_default_value : _("Note"),
				question_delete_note : _("Do you really want to delete this note?"),
				tooltips : {
					btn_create : _("Create a new note"),
					btn_create_inactive : s(_("You cannot create more than %1 notes"), Game.constants.notes.max_notes),
					btn_rename : _("Rename the current note"),
					btn_delete : _("Delete the current note"),
					btn_delete_inactive : _("You cannot delete your last note"),
					btn_edit : _("Edit the current note"),
					btn_save : _("Save changes"),
					btn_cancel : _("Cancel without saving")
				},

				default_note_tab_name : _("Note 1"),

				note_length_exceeded : _("%1 characters remaining")
			}
		}
	});
}());
