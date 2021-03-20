/* global Game */
define('features/color_picker/views/color_picker', function() {
	'use strict';

	var Views = require_legacy('GameViews');
	var DefaultColors = require('helpers/default_colors');
	var FILTERS = require('enums/filters');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function() {
			this.renderTemplate(this.$el, 'index', {
				l10n : this.l10n
			});

			this.registerViewComponents();
		},

		registerViewComponents: function() {
			var type = this.controller.getType(),
				id = this.controller.getId(),
				additional_id = this.controller.getAdditionalId(),
				default_color = DefaultColors.getDefaultColor(type, id, additional_id),
				callback = this.controller.getCallback(),
				default_color_text = this.l10n.default_color_text;

			if (typeof callback !== 'function') {
				if (Game.dev) {
					throw 'Callback must be a function';
				}
			}

			/**
			 * When the type is alliance or player (not player himself and his alliance) there should be a different default text
			 */
			if (type === FILTERS.FILTER_TYPES.ALLIANCE) {
				default_color_text = this.l10n.default_color_text_alliance;
			} else if (type === FILTERS.FILTER_TYPES.PLAYER && id !== Game.player_id) {
				default_color_text = this.l10n.default_color_text_player;
			}

			this.unregisterComponents();
			this.registerComponent('color_picker', this.$el.find('.color_picker_window').colorpicker({
				l10n : {
					default_btn : this.l10n.default_btn,
					save_color : this.l10n.save_color,
					default_color_text : default_color_text,
					preview_text: this.l10n.preview_text
				},
				type : this.controller.getColorPickerType(),
				color: this.controller.getCurrentColor() || default_color,
				default_color: default_color,
				changeColor: function(new_color, remove_custom_color) {
					callback(new_color, remove_custom_color);
					this.getComponent('color_picker').trigger('cp:color:changed', new_color);
				}.bind(this)
			}).on('cp:color:changed', function(e, color) {
				this.controller.closeWindow();
			}.bind(this)));
		}
	});
});
