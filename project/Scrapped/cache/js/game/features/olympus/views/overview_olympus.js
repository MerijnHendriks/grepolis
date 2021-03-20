define('features/olympus/views/overview_olympus', function () {
	'use strict';

	var OverviewTabsView = require('features/olympus/views/overview_tabs'),
		DateHelper = require('helpers/date'),
		AllianceLinkHelper = require('helpers/alliance_link'),
		ContextMenuHelper = require('helpers/context_menu'),
		TooltipFactory = require('factories/tooltip_factory'),
		OlympusWindowFactory = require('features/olympus/factories/olympus_window_factory');

	return OverviewTabsView.extend({
		initialize: function (options) {
			OverviewTabsView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		registerInfoButton: function () {
			this.unregisterComponent('info_button');
			this.registerComponent('info_button', this.$el.find('.btn_info').button({
				template : 'internal'
			}).on('btn:click', function() {
				this.controller.switchTab(0);
			}.bind(this)));
		},

		registerOpenRankingButton: function (enabled) {
			var is_post_temple_stage_active = this.controller.isPostTempleStageActive();

			this.unregisterComponent('ranking_button');
			this.registerComponent('ranking_button', this.$el.find('.btn_open_ranking').button({
				caption: this.l10n.ranking,
				disabled: !(enabled || is_post_temple_stage_active)
			}).on('btn:click', function () {
				if (this.controller.isPeaceTimeActive() || is_post_temple_stage_active) {
					OlympusWindowFactory.openRankingWindow();
				} else {
					OlympusWindowFactory.openTempleInfoWindow(
						this.controller.getOlympusTempleId(),
						true
					);
				}
			}.bind(this)));
		},

		render: function () {
			var is_large_temple_stage_active = this.controller.isLargeTempleStageActive(),
				is_olympus_stage_active = this.controller.isOlympusStageActive();

			this.renderTemplate(this.$el, 'overview_olympus', {
				l10n: this.l10n,
				olympus_stage_active: is_olympus_stage_active
			});

			this.renderOlympusHeader(is_large_temple_stage_active, is_olympus_stage_active);

			this.renderOverviewTabs();
			this.registerInfoButton();
			this.registerOpenRankingButton(is_olympus_stage_active);

			if (is_large_temple_stage_active) {
				this.registerLargeTempleProgress();
			} else if (is_olympus_stage_active) {
				this.registerOlympusJumpCountdown();
				this.registerOlympusImageClick();
				this.renderOwner();
			}
		},

		renderOlympusHeader: function (is_large_temple_stage_active, is_olympus_stage_active) {
			var start_date;

			if (is_large_temple_stage_active) {
				start_date = this.controller.getNextOlympusStageStartTime();
			} else if (is_olympus_stage_active) {
				start_date = this.controller.getNextOlympusJumpTimestamp();
			}

			is_large_temple_stage_active = is_large_temple_stage_active || this.controller.isLargeTempleStageActive();
			is_olympus_stage_active = is_olympus_stage_active || this.controller.isOlympusStageActive();
			start_date = DateHelper.timestampToDateTime(start_date);

			this.renderHeader({
				l10n: this.l10n,
				large_temple_stage_active: is_large_temple_stage_active,
				olympus_stage_active: is_olympus_stage_active,
				start_date: start_date
			});
		},

		registerOlympusJumpCountdown: function () {
			var last_jump = this.controller.getLastOlympusJumpTimestamp(),
				next_jump = this.controller.getNextOlympusJumpTimestamp();

			this.registerStartCountdown(last_jump, next_jump);
		},

		registerOlympusImageClick: function () {
			var $olympus = this.$el.find('.olympus_background'),
				temple = this.controller.getOlympusTemple();

			if (this.controller.isPeaceTimeActive() || this.controller.isPostTempleStageActive()) {
				$olympus.toggleClass('active', false);
				return;
			}

			$olympus.toggleClass('active', true).off().on('click', function (event) {
				ContextMenuHelper.showContextMenu(event, {}, {
					context_menu: 'temple',
					data: this.controller.getOlympusDataForContextMenu()
				});
			}.bind(this));
			$olympus.tooltip(TooltipFactory.getOlympusTempleTooltip(temple));
		},

		renderOwner: function () {
			var data = this.controller.getOwnerAllianceData(),
				$owner_flag;

			if (!data.id) {
				return;
			}

			this.renderTemplate(this.$el.find('.brazier'), 'alliance_flag', {
				flag_color: this.getOwnerFlagColor(data.id),
				alliance_id: data.id,
				alliance_name: data.name
			});

			$owner_flag = this.$el.find('.owner_flag');

			AllianceLinkHelper.registerOpenAllianceProfileClick($owner_flag);
			$owner_flag.tooltip(this.l10n.olympus.current_holder(data.name));
		}
	});
});
