/*global Backbone, CM, GPWindowMgr, Tracking, Game, Layout */

(function () {
	"use strict";

	var BaseView = window.GameViews.BaseView;

	var LayoutConfigButtons = BaseView.extend({
		initialize : function(options) {
			BaseView.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			this.initializeButtonOpenSettingsWindow();
			this.initializeButtonOpenWikiPage();
			this.initializeButtonLogout();
		},

		initializeButtonOpenSettingsWindow : function() {
			var controller = this.controller;

			controller.registerComponent('btn_settings', this.$el.find('.btn_settings').button({
				template : 'internal',
				tooltips : [
					{title : this.l10n.settings}
				]
			}).on('btn:click', function() {
				SettingsWindowFactory.openSettingsWindow();
				$.Observer(GameEvents.menu.click).publish({option_id : 'settings'});
			}));
		},

		initializeButtonAudioToggle : function(e, data) {
			var controller = this.controller,
				btn_audio_toggle = this.$el.find('.btn_audio_toggle'),
				tooltip;

			if (!Game.Audio.supported()) {
				tooltip = this.l10n.not_supported;
			} else {
				tooltip = this.l10n.toggle_audio;
			}

			if (!Game.Audio.supported() ||
				Game.Audio.isMuted() ||
				Game.Audio.getSoundVolume === 0 ||
				!Game.Audio.anyCategoryEnabled() ||
				Game.isiOs() /* it is always disabled by default on iOS*/) {

				btn_audio_toggle.addClass('muted');
			}

			controller.registerComponent('btn_audio_toggle', btn_audio_toggle.button({
				template : 'internal',
				tooltips : [
					{title : tooltip}
				]
			}).on('btn:click', function() {
				if (!Game.Audio.supported()) {
					return;
				}

				if (!Game.Audio.anyCategoryEnabled() || Game.Audio.getSoundVolume() === 0 || (Game.isiOs() && !Game.Audio.categoryEnabled('background'))) {
					SettingsWindowFactory.openSettingsWindow({
						onAfterWindowLoad: function() {
							$('#player-index-sound_config').click();
						}
					});
					return;
				}

				var $this = $(this),
					is_muted = $this.hasClass('muted');

				if (Game.isiOs() && is_muted) {
					Game.Audio._enableBackground();
					Game.Audio.iOsPlayBackground();
					$this.removeClass('muted');
					return false;
				} else {
					gpAjax.ajaxPost('player', 'save_settings', {settings : {muted : !is_muted}}, true, $.noop);
					$this.toggleClass('muted', !is_muted);

					if (is_muted) {
						Game.Audio.unmute();
					} else {
						Game.Audio.mute();
					}
				}
			}));
		},
		initializeButtonOpenWikiPage : function() {
			var controller = this.controller;

			controller.registerComponent('btn_wiki', this.$el.find('.btn_wiki').button({
				template : 'internal',
				tooltips : [
					{title : this.l10n.help}
				]
			}).on('btn:click', function() {
				window.open(Game.wiki_url);
				$.Observer(GameEvents.menu.click).publish({option_id : 'help'});
			}));
		},
		initializeButtonLogout : function() {
			var controller = this.controller;

			controller.registerComponent('btn_logout', this.$el.find('.btn_logout').button({
				template : 'internal',
				tooltips : [
					{title : this.l10n.logout}
				]
			}).on('btn:click', function() {
				window.parent.postMessage('switch_world', '*');
				gpAjax.ajaxPost('player', 'logout', {}, true, function() {});
			}));
		}
	});

	window.GameViews.LayoutConfigButtons = LayoutConfigButtons;
}());
