/* globals Game */

define('features/olympus/views/overview_small_temples', function () {
	"use strict";

	var OverviewTabsView = require('features/olympus/views/overview_tabs'),
		OlympusStages = require('enums/olympus_stages'),
		DateHelper = require('helpers/date'),
		AllianceLinkHelper = require('helpers/alliance_link'),
		SortOrders = require('enums/sort_orders'),
		active_sorting_order = SortOrders.ASC;

	return OverviewTabsView.extend({
		initialize: function (options) {
			OverviewTabsView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		updateSmallTemplesRow: function (model) {
			var id = model.getId(),
				$owner = this.$el.find('tr[data-id="' + id + '"] .owner');

			if ($owner.length > 0) {
				$owner.text(model.getAllianceName());
			}
		},

		renderSmallTemplesTable: function () {
			var $temples_table = this.$el.find('.table_content');
			$temples_table.html('');

			this.controller.getSmallTemplesData(active_sorting_order).forEach(function (data) {
				var template = us.template(this.controller.getTemplate('small_temple_row'), {
					id: data.id,
					temple: data.link + '<br />' + this.l10n.ocean(data.sea_id),
					power: data.power,
					god: data.god,
					owner: data.owner
				});

				$temples_table.append(template);
			}.bind(this));
		},

		registerStartCountdownForStage: function (small_temple_stage_active) {
			var min = Game.world_start_timestamp,
				max = this.controller.getNextOlympusStageStartTime();

			if (small_temple_stage_active) {
				min = this.controller.getNextOlympusStageStartTime(OlympusStages.PRE_TEMPLE_STAGE);
			}

			this.registerStartCountdown(min, max);
		},

		registerInfoButton: function () {
			this.unregisterComponent('info_button');
			this.registerComponent('info_button', this.$el.find('.btn_info').button({
				template: 'internal'
			}).on('btn:click', function () {
				this.controller.switchTab(0);
			}.bind(this)));
		},

		registerOpenFiltersSubwindow: function () {
			this.unregisterComponent('open_filters_window_btn');
			this.registerComponent('open_filters_window_btn', this.$el.find('.open_filters_window_btn').button({
				caption: this.l10n.filters_title
			}).on('btn:click', function () {
				this.controller.openFiltersSubWindow();
			}.bind(this)));
		},

		registerFiltersAppliedCheckbox: function () {
			this.unregisterComponent('apply_filters_checkbox');
			this.registerComponent('apply_filters_checkbox', this.$el.find('.apply_filters_checkbox').checkbox({
				caption: '',
				disabled: !this.controller.areThereAnyActiveFilters(),
				checked: false
			}).on("cbx:check", function(event) {
				if (!this.controller.update_filters) {
					this.controller.should_filters_be_applied = !this.controller.should_filters_be_applied;
				}
				this.controller.update_filters = false;
				this.renderSmallTemplesTable();
				this.registerScrollbar();
			}.bind(this)));
		},

		registerAllianceLinks: function () {
			AllianceLinkHelper.registerOpenAllianceProfileClick(this.$el.find('.table_content'));
		},

		setSortingOrderForTemples: function ($temple_column) {
			$temple_column.removeClass(active_sorting_order);
			if (active_sorting_order === SortOrders.DESC) {
				active_sorting_order = SortOrders.ASC;
			} else {
				active_sorting_order = SortOrders.DESC;
			}
			$temple_column.addClass(active_sorting_order);
		},

		registerSortableTableHeader: function () {
			var $temple_column = this.$el.find('.sortable thead th.temple');
			$temple_column.off('click').on('click', function () {
				this.setSortingOrderForTemples($temple_column);
				this.renderSmallTemplesTable();
			}.bind(this));
		},

		registerScrollbar: function () {
			this.unregisterComponent('small_temples_scrollbar', this.sub_context);
			this.registerComponent('small_temples_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'purple',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				elements_to_scroll_position: 'relative',
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				min_slider_size: 16,
				hide_when_nothing_to_scroll: true,
				prepend: true
			}), this.sub_context);
		},

		render: function () {
			var pre_temple_stage_active = this.controller.isPreTempleStageActive(),
				small_temple_stage_active = this.controller.isSmallTempleStageActive(),
				start_date = this.controller.getNextOlympusStageStartTime();

			start_date = DateHelper.timestampToDateTime(start_date);

			this.renderTemplate(this.$el, 'overview_small_temples', {
				l10n: this.l10n,
				tab_type: this.controller.model.getType(),
				pre_temple_stage_active: pre_temple_stage_active,
				active_sorting_order : active_sorting_order
			});

			this.renderHeader({
				l10n: this.l10n,
				start_date: start_date,
				pre_temple_stage_active: pre_temple_stage_active,
				small_temple_stage_active: small_temple_stage_active
			});

			this.renderOverviewTabs();
			this.renderSmallTemplesTable();

			if (pre_temple_stage_active || small_temple_stage_active) {
				this.registerStartCountdownForStage(small_temple_stage_active);
			}

			this.registerScrollbar();
			this.registerInfoButton();
			this.registerOpenFiltersSubwindow();
			this.registerFiltersAppliedCheckbox();
			this.registerAllianceLinks();
			this.registerSortableTableHeader();
		}
	});
});
