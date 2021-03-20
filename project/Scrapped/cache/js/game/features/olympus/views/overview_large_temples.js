/* globals GameEvents */

define('features/olympus/views/overview_large_temples', function () {
	'use strict';

	var OverviewTabsView = require('features/olympus/views/overview_tabs'),
		OlympusStages = require('enums/olympus_stages'),
		DateHelper = require('helpers/date'),
		WMap = require('map/wmap'),
		OlympusWindowFactory = require('features/olympus/factories/olympus_window_factory'),
		TooltipFactory = require('factories/tooltip_factory'),
		AllianceLinkHelper = require('helpers/alliance_link');

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
		
		render: function () {
			this.renderTemplate(this.$el, 'overview_large_temples', {
				l10n: this.l10n,
				tab_type: this.controller.model.getType()
			});

			this.renderLargeTempleHeader();

			this.$el.find('.silhouette').tooltip(this.l10n.large_temples.large_temples_not_active);

			this.renderOverviewTabs();
			this.registerInfoButton();
			this.renderByStage();
		},

		renderLargeTempleHeader: function () {
			var is_large_temple_stage_active = this.controller.isLargeTempleStageActive(),
				is_small_temple_stage_active = this.controller.isSmallTempleStageActive(),
				start_date = this.controller.getNextOlympusStageStartTime();

			start_date = DateHelper.timestampToDateTime(start_date);

			this.renderHeader({
				l10n: this.l10n,
				small_temple_stage_active: is_small_temple_stage_active,
				large_temple_stage_active: is_large_temple_stage_active,
				olympus_active: false,
				start_date: start_date
			});

			if (is_small_temple_stage_active) {
				this.registerSmallTempleStageCountdown();
			}
		},

		registerSmallTempleStageCountdown: function () {
			var min = this.controller.getNextOlympusStageStartTime(OlympusStages.PRE_TEMPLE_STAGE),
				max = this.controller.getNextOlympusStageStartTime();

			this.registerStartCountdown(min, max);
		},

		renderByStage: function () {
			var $body_content = this.$el.find('.curtain_big'),
				large_temple_stage_reached = this.controller.hasReachedLargeTempleStage();

			if (large_temple_stage_reached) {
				this.renderTemplate($body_content, 'large_temple_list_slider', {});
				this.registerLargeTempleProgress();
				this.renderLargeTemples();
			} else {
				this.renderTemplate($body_content, 'large_temple_silhouette', {
					l10n: this.l10n
				});
			}
		},

		renderLargeTemples: function () {
			var $list = this.$el.find('.js-list'),
				temples = this.controller.getLargeTemples(),
				$template;

			if ($list.length === 0) {
				return;
			}

			$list.empty();

			temples.forEach(function (temple) {
				$template = $(this.getTemplate('large_temple_list_item', {
					god: temple.getGod()
				}));

				this.registerLargeTempleButtons($template, temple);
				this.renderOwnerFlag($template, temple.getAllianceId(), temple.getAllianceName());

				$template.find('.tooltip_area').tooltip(
					TooltipFactory.getOlympusTempleTooltip(temple)
				);
				$list.append($template);
			}.bind(this));

			this.registerLargeTempleSlider();
			AllianceLinkHelper.registerOpenAllianceProfileClick($list, true);
		},

		renderOwnerFlag: function ($el, alliance_id, alliance_name) {
			if (!alliance_id) {
				return;
			}

			var template = this.getTemplate('alliance_flag', {
				alliance_id: alliance_id,
				alliance_name: alliance_name,
				flag_color: this.getOwnerFlagColor(alliance_id)
			});
			$el.append(template);
			$el.find('.owner_flag').tooltip(this.l10n.olympus.current_holder(alliance_name));
		},

		registerLargeTempleSlider: function () {
			this.unregisterComponent('large_temple_slider');
			this.registerComponent('large_temple_slider', this.$el.find('.large_temples_slider').listSlider({
				enable_wheel_scrolling: true,
				is_animated: true
			}));
		},

		registerLargeTempleButtons: function ($el, temple) {
			var $btn_jump_to = $el.find('.btn_jump_to'),
				$btn_temple_info = $el.find('.btn_temple_info');

			$btn_jump_to.off().on('click', function () {
				var coords = {
					ix: temple.getIslandX(),
					iy: temple.getIslandY()
				};

				WMap.mapJump(coords, false, function () {
					$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
				});
			}.bind(this));
			$btn_jump_to.tooltip(this.l10n.tooltips.jump_to);

			$btn_temple_info.off().on('click', function () {
				OlympusWindowFactory.openTempleInfoWindow(temple.getId());
			});
			$btn_temple_info.tooltip(this.l10n.tooltips.open_temple_info);
		}
	});
});
