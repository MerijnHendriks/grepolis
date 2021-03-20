/* globals Timestamp */

define('features/olympus/views/overview_tabs', function () {
	'use strict';

	var GameViews = require_legacy('GameViews'),
		AllianceFlagHelper = require('helpers/alliance_flag'),
		AllianceLinkHelper = require('helpers/alliance_link');

	return GameViews.BaseView.extend({
		initialize: function () {
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.updatel10nByOlympusStage();
		},

		updatel10nByOlympusStage: function () {
			this.l10n = this.controller.getl10nByOlympusStage();
		},

		renderOverviewTabs: function () {
			var tabs_collection = this.controller.window_model.tabs_collection,
				active_tab = this.controller.getActivePageNr(),
				$tabs = this.$el.find('.tabs');

			tabs_collection.sortBy('index').forEach(function (tab) {
				var tab_element = document.createElement('div'),
					text_element = document.createElement('div'),
					tab_index = tab.getIndex();

				text_element.innerText = this.l10n.tabs[tab_index];

				tab_element.className = 'tab' + (active_tab === tab_index ? ' active' : '');
				tab_element.appendChild(text_element);
				tab_element.setAttribute('details', tab_index);
				$tabs.append(tab_element);
			}.bind(this));
		},

		registerStartCountdown: function (min, max) {
			var diff = max - min,
				value = Timestamp.now() - min;

			this.unregisterComponent('pg_start');
			this.registerComponent('pg_start', this.$el.find('.progress_start').singleProgressbar({
				min: 0,
				value: value,
				max: diff,
				type: 'time',
				countdown: true,
				countdown_settings: {
					timestamp_end: max,
					display: 'seconds_in_last48_hours_with_left_word'
				}
			}));
		},

		registerLargeTempleProgress: function () {
			this.unregisterComponent('large_temple_progress');
			this.registerComponent('large_temple_progress', this.$el.find('.progress_start').singleProgressbar({
				caption: this.l10n.large_temples_captured,
				min: 0,
				max: this.controller.getLargeTemplesSpawnAmount(),
				value: this.controller.getLargeTemplesOwnedCount()
			}));
		},

		updateLargeTempleProgress: function () {
			var progress = this.getComponent('large_temple_progress');

			if (progress) {
				progress.setValue(this.controller.getLargeTemplesOwnedCount());
			}
		},

		getOwnerFlagColor: function (alliance_id) {
			var custom_colors = this.controller.getCustomColors();
			return AllianceFlagHelper.getFlagColorForAlliance(alliance_id, custom_colors);
		},

		renderHeader: function (options) {
			var active_tab = this.controller.getActiveTabType(),
				$tab_header = this.$el.find('.tab_header');

			if (this.controller.isPostTempleStageActive()) {
				var alliance_link = AllianceLinkHelper.getAllianceLink(
					this.controller.getWinningAllianceId(),
					this.controller.getWinningAllianceName()
				);

				this.renderTemplate($tab_header, 'overview_post_temple_header', {
					l10n: this.l10n,
					alliance_link: alliance_link
				});

				AllianceLinkHelper.registerOpenAllianceProfileClick($tab_header);
			} else {
				this.renderTemplate($tab_header, 'overview_' + active_tab + '_header',  options);
			}
		}
	});
});
