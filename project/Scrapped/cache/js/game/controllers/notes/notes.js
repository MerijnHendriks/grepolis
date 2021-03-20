/*global DM, GameDataNotes, GameControllers */

(function() {
	'use strict';

	var Features = require('data/features'),
		EndGameTypes = require('enums/end_game_types'),
		NotesController = GameControllers.TabController.extend({
		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		rerenderPage : function() {
			this.stopListening();
			this.renderPage();
		},

		renderPage : function() {
			this.updateWindowTabs();
			this.registerEventListeners();

			if (this.hasNoNotes() || !this.isNoteNewlyCreated()) {
				this.showPreviewScreen();
			}
			else {
				this.showEditScreen();
			}

			return this;
		},

		registerEventListeners : function() {
			this.getCollection('player_notes').onNotesCountChange(this, function() {
				var notes_count = this.getNotesCount();

				this.switchTab(notes_count - 1);
				this.rerenderPage();
			}.bind(this));
		},

		getNotesCount : function() {
			return this.getCollection('player_notes').getNotesCount();
		},

		hasNoNotes : function() {
			return this.getNotesCount() === 0;
		},

		hasOnlyOneNote : function() {
			return this.getNotesCount() === 1;
		},

		hasAllPossibleNotesCreated : function() {
			return GameDataNotes.getMaxPossibeNotesCount() === this.getNotesCount();
		},

		getNotes : function() {
			return this.getCollection('player_notes').getNotes();
		},

		isNoteNewlyCreated : function() {
			return this.getActiveNoteModel().isJustCreated();
		},

		updateWindowTabs : function() {
			var notes = this.getNotes();

			for(var i = 0, l = GameDataNotes.getMaxPossibeNotesCount(); i < l; i++) {
				var note = notes[i];

				if (note) {
					this.setTabTitle(note.getTitle(), i);
					this.showTab(i);
				}
				else {
					this.hideTab(i);
				}
			}
		},

		showPreviewScreen : function() {
			this.destroyView();
			this.initializePreviewView();
		},

		showEditScreen : function() {
			this.destroyView();
			this.initializeEditView();
		},

		initializePreviewView : function() {
			this.view = new window.GameViews.NotesPreviewView({
				controller : this,
				el : this.$el
			});
		},

		initializeEditView : function() {
			this.view = new window.GameViews.NotesEditView({
				controller : this,
				el : this.$el
			});
		},

		destroyView : function() {
			if (this.view !== null) {
				this.view._destroy();
				this.view = null;
			}
		},

		getTabTitle : function() {
			var note = this.getActiveNoteModel();

			return note.getTitle();
		},

		getTabIndex : function() {
			return this.getActivePageNr();
		},

		getMemoHtml: function() {
			var player_notes = this.getCollection('player_notes');
			var player_note = player_notes.getNoteForTabIndex(this.getTabIndex());

			if (player_note) {
				return player_note.getHtml();
			}

			return '';
		},

		getMemoText : function() {
			var player_notes = this.getCollection('player_notes');
			var player_note = player_notes.getNoteForTabIndex(this.getTabIndex());

			if (player_note) {
				return player_note.getText();
			}

			return '';
		},

		getCharacterCountMessage : function(note_length) {
			var l10n = this.getl10n();
			var class_name = this.isLimitExceeded(note_length) ? 'exceeded' : '';

			return '<span class="' + class_name + '">' + l10n.note_length_exceeded.replace('%1', this.getCharactersLeft(note_length)) + '</span>';
		},

		isLimitExceeded : function(note_length) {
			var characters_left = this.getCharactersLeft(note_length);

			return characters_left < 0;
		},

		getCharactersLeft : function(note_length) {
			return GameDataNotes.getTextMaxLength() - note_length;
		},

		onNoteChractersCountChange : function(note_length) {
			//Update characters counter
			this.view.updateCharacterCounter(this.getCharacterCountMessage(note_length));

			//Disable saving if limit is exceeded
			var is_limit_exceeded = this.isLimitExceeded(note_length);
			this.getComponent('btn_save').toggleDisable(is_limit_exceeded);
		},

		getMemoTextLength : function() {
			return (this.getMemoText() || '').length;
		},

		getActiveNoteModel : function() {
			return this.getCollection('player_notes').getNoteForTabIndex(this.getTabIndex());
		},

		createNote : function(title, callbacks) {
			this.getCollection('player_notes').createNote(title, callbacks);
		},

		renameActiveNote : function(title, callback) {
			var player_note = this.getActiveNoteModel();

			player_note.rename(title, function () {
				this.setTabTitle(title, this.getActivePageNr());
				callback();
			}.bind(this));
		},

		saveNote : function(text, callback) {
			var player_note = this.getActiveNoteModel();

			player_note.save(text, callback);
		},

		deleteNote : function() {
			var player_note = this.getActiveNoteModel();
			player_note.remove();
		},

		onBtnEditClick : function() {
			this.showEditScreen();
		},

		onBtnSaveClick : function(text, _btn) {
			_btn.disable();

			this.saveNote(text, function() {
				this.showPreviewScreen();

				_btn.enable();
			}.bind(this));
		},

		onBtnCancelClick : function() {
			this.showPreviewScreen();
		},

		onBtnDeleteClick : function() {
			this.openDeleteNoteSubwindow();
		},

		onBtnRenameClick : function() {
			this.openRenameNoteSubwindow();
		},

		onBtnNewClick : function() {
			this.openNewNoteSubwindow();
		},

		getBBCodes : function() {
			var l10n = DM.getl10n('bbcodes'),
				bbcodes = ['b', 'i', 'u', 's', 'center', 'quote', 'url', 'player', 'ally', 'town', 'temple', 'size', 'img', 'color', 'report', 'award', 'island', 'table', 'font', 'reservation', 'spoiler'];

			if (Features.getEndGameType() !== EndGameTypes.END_GAME_TYPE_OLYMPUS) {
				var temple_index = bbcodes.indexOf('temple');
				bbcodes.splice(temple_index, 1);
			}

			var output = [];

			for(var i = 0, l = bbcodes.length; i < l; i++) {
				var bbcode_id = bbcodes[i];

				output.push({id : bbcode_id, name : l10n[bbcode_id].name});
			}

			return output;
		},

		getDeleteButtonTooltips : function() {
			var l10n = this.getl10n(),
				tooltips = [
					{title : l10n.tooltips.btn_delete},
					this.hasNoNotes() ? {} : {title : l10n.tooltips.btn_delete_inactive}
				];

			return tooltips;
		},

		openNewNoteSubwindow : function() {
			var l10n = this.getl10n();
			var controller = new GameControllers.SubWindowNewNoteController({
				l10n : this.getl10n(),
				window_controller : this,
				templates : {
					sub_window_new_note : this.getTemplate('sub_window_new_note')
				},
				cm_context : {
					main : this.getMainContext(),
					sub : 'sub_window_new_note'
				}
			});

			this.openSubWindow({
                title: l10n.title_new_note,
                controller : controller,
                skin_class_names : 'classic_sub_window'
            });
		},

		openRenameNoteSubwindow : function() {
			var l10n = this.getl10n();
			var controller = new GameControllers.SubWindowRenameNoteController({
				l10n: this.getl10n(),
				window_controller: this,
				templates: {
					sub_window_rename_note: this.getTemplate('sub_window_rename_note')
				},
				cm_context: {
					main: this.getMainContext(),
					sub: 'sub_window_rename_note'
				}
			});

			this.openSubWindow({
				title: l10n.title_rename_note,
				controller : controller,
				skin_class_names : 'classic_sub_window'
			});
		},

		openDeleteNoteSubwindow : function() {
			var l10n = this.getl10n();
			var controller = new GameControllers.SubWindowDeleteNoteController({
				l10n : this.getl10n(),
				window_controller : this,
				templates : {
					sub_window_delete_note : this.getTemplate('sub_window_delete_note')
				},
				cm_context : {
					main : this.getMainContext(),
					sub : 'sub_window_delete_note'

				}
			});

			this.openSubWindow({
				title: l10n.title_delete_note,
				controller : controller,
				skin_class_names : 'classic_sub_window'
			});
		},

		destroy : function() {

		}
	});

	window.GameControllers.NotesController = NotesController;
}());
