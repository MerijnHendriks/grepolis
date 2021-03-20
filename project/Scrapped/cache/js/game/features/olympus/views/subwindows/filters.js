define('features/olympus/views/subwindows/filters', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView;

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
			this.registerApplyButton();
			this.registerResetButton();
		},

		createGodFilters: function () {
			var gods = this.controller.getAllGods();
			gods.forEach(function (god) {
				var $god_filter = $(us.template($('#tpl_filter_checkbox').html(),
					{filter: god, image_filter: 'filter_image'}
				));
				this.$el.find('.god_filters .list').append($god_filter);
				this.unregisterComponent('god_filter_checkbox_' + god, 'olympus_filters_god');
				this.registerComponent('god_filter_checkbox_' + god, $god_filter.checkbox({
					checked: this.controller.getActiveFilters('gods').indexOf(god) > -1,
					caption: ''
				}), 'olympus_filters_god');
			}.bind(this));
		},

		createSeaFilters: function () {
			var seas = this.controller.getAllSeaIdsThatHaveSmallTemples();
			seas.forEach(function (sea) {
				var $sea_filter = $(us.template($('#tpl_filter_checkbox').html(),
					{filter: sea, image_filter: ''}
				));
				this.$el.find('.sea_filters .list').append($sea_filter);
				this.unregisterComponent('sea_filter_checkbox_' + sea, 'olympus_filters_sea');
				this.registerComponent('sea_filter_checkbox_' + sea, $sea_filter.checkbox({
					checked: this.controller.getActiveFilters('sea').indexOf(sea) > -1,
					caption: sea
				}), 'olympus_filters_sea');
			}.bind(this));
		},

		registerAllianceFilterCheckbox: function (alliance_id, $alliance_filter, alliance_name) {
			this.unregisterComponent('alliance_filter_checkbox_' + alliance_id, 'olympus_filters_alliance');
			this.registerComponent('alliance_filter_checkbox_' + alliance_id,
				$alliance_filter.find('.filter_checkbox').checkbox({
					checked: true,
					caption: alliance_name
				}), 'olympus_filters_alliance');
		},

		registerClickEventForCheckboxDeleteButton: function ($alliance_filter, alliance_id) {
			$alliance_filter.find('.delete_checkbox_filter').off('click').on('click', function () {
				this.controller.deleteAllianceFilter(alliance_id, $alliance_filter);
				this.unregisterComponent('alliance_filter_checkbox_' + alliance_id, 'olympus_filters_alliance');
				$alliance_filter.remove();
				if (this.getComponent('alliance_input').isDisabled()) {
					this.getComponent('alliance_input').enable();
				}
			}.bind(this));
		},

		addNewAllianceFilter: function (data) {
			var $alliance_list_filters = this.$el.find('.alliance_filters .list');
			if ($alliance_list_filters.children().length === 4) {
				this.getComponent('alliance_input').disable();
			}

			var alliance_id = data.data[1],
				alliance_name = data.data[0];

			if (this.getComponent('alliance_filter_checkbox_' + alliance_id, 'olympus_filters_alliance')) {
				return;
			}
			var $alliance_filter = $(us.template($('#tpl_filter_checkbox_delete_button').html(),
				{filter: alliance_id, value: alliance_name, image_filter: ''}
			));
			$alliance_list_filters.append($alliance_filter);
			this.registerAllianceFilterCheckbox(alliance_id, $alliance_filter, alliance_name);
			this.registerClickEventForCheckboxDeleteButton($alliance_filter, alliance_id);
		},

		createAllianceFilters: function () {
			var $alliance_input = this.$el.find('.alliance_filters .alliance_input');

			this.unregisterComponent('alliance_input');
			this.registerComponent('alliance_input', $alliance_input.textbox({
				focus: true,
				placeholder: this.l10n.filters.alliance,
				autocompletion : true,
				autocompletion_type : 'game_alliance',
				autocompletion_with_id : true,
				autocompletion_limit : 10,
				autocompletion_format_output : this.addNewAllianceFilter.bind(this)
			}));

			if (Object.keys(this.controller.getActiveFilters('alliance')).length > 0) {
				Object.keys(this.controller.getActiveFilters('alliance')).forEach (function (data) {
					this.addNewAllianceFilter({data: [this.controller.getActiveFilters('alliance')[data], data]});
				}.bind(this));
			}
		},

		render: function () {
			this.renderTemplate(this.$el, 'filters', {
				l10n: this.l10n
			});
			this.createAllianceFilters();
			this.createSeaFilters();
			this.createGodFilters();
		},

		uncheckAllCheckBoxesForFilter: function (filters) {
			for (var property in filters) {
				if (filters.hasOwnProperty(property) && filters[property].isChecked()) {
					filters[property].check(false);
				}
			}
		},

		registerApplyButton: function () {
			this.unregisterComponent('apply_filters_button');
			this.registerComponent('apply_filters_button', this.$el.find('.apply_filter_btn').button({
				caption: this.l10n.filter_save
			}).on('btn:click', function () {
				this.controller.updateActiveFilter();
			}.bind(this)));
		},

		registerResetButton: function () {
			this.unregisterComponent('reset_filters_button');
			this.registerComponent('reset_filters_button', this.$el.find('.reset_filter_btn').button({
				caption: this.l10n.filter_reset
			}).on('btn:click', function () {
				this.uncheckAllCheckBoxesForFilter(this.controller.getComponents('olympus_filters_sea', 'olympus_filters_sea'));
				this.uncheckAllCheckBoxesForFilter(this.controller.getComponents('olympus_filters_god', 'olympus_filters_god'));
				this.uncheckAllCheckBoxesForFilter(this.controller.getComponents('olympus_filters_alliance', 'olympus_filters_alliance'));
			}.bind(this)));
		}
	});
});
