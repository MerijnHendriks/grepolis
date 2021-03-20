/*global BBCode, GameDataNotes */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	window.GameViews.NotesEditView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.render();
		},

		render : function() {
			this.unregisterComponents();

			this.$el.html(us.template(this.controller.getTemplate('edit'), {
				bb_codes : this.controller.getBBCodes(),
				character_count_message : this.controller.getCharacterCountMessage(this.controller.getMemoTextLength())
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			var l10n = this.controller.getl10n();
			var $el = this.$el;

			var wnd = {
				getJQElement: function() {
					return $el;
				}
			};

			this.registerComponent('txta_notes_text', this.$el.find('.txta_notes_text').textarea({
				value: this.controller.getMemoText(),
				maxlength: GameDataNotes.getTextMaxLength(),
				cols : 57,
				rows : 16
			}).on('txta:change:value', function(e, new_value) {
				var str_length = (new_value || '').length;

				this.controller.onNoteChractersCountChange(str_length);
			}.bind(this)).focus());

			//Register Buttons
			this.registerComponent('btn_save', this.$el.find('.btn_save').button({
				caption : l10n.btn_save,
				tooltips : [
					{title : l10n.tooltips.btn_save}
				]
			}).on('btn:click', function(e, _btn) {
				var text = this.getNoteString();

				this.controller.onBtnSaveClick(text, _btn);
			}.bind(this)));

			this.registerComponent('btn_cancel', this.$el.find('.btn_cancel').button({
				caption : l10n.btn_cancel,
				tooltips : [
					{title : l10n.tooltips.btn_cancel}
				]
			}).on('btn:click', this.controller.onBtnCancelClick.bind(this.controller)));

			//Register BBCodes
			this.bbcode = new BBCode(wnd, this.$el.find('.bb_button_wrapper'), '.txta_notes_text textarea');
		},

		updateCharacterCounter : function(message) {
			this.$el.find('.character_counter').html(message);
		},

		getNoteString : function() {
			var textarea = this.getComponent('txta_notes_text');

			return textarea.getValue();
		},

		destroy : function() {
			//Unregister becuase this view is destroyed manually
			this.unregisterComponents();
		}
	});
}());
