define('features/olympus/controllers/subwindows/filters', function () {
	'use strict';

	var SubWindowController = window.GameControllers.SubWindowController,
		FiltersSubWindowView = require('features/olympus/views/subwindows/filters'),
		GameDataGods = require('data/gods');

	return SubWindowController.extend({
		view: null,

		initialize: function () {
			SubWindowController.prototype.initialize.apply(this, arguments);
		},

		render: function ($el) {
			this.$el = $el;
			this.initializeView();
		},

		setActiveFilters: function (filters, filters_type) {
			var active_filters = this.window_controller.getActiveFiltersByType(filters_type);

			for (var property in filters) {

				if (filters.hasOwnProperty(property)) {
					var filter_value = filters[property].data('filter'),
						filter_index = active_filters.indexOf(filter_value);

					if (filters[property].isChecked() && filter_index === -1) {
						active_filters.push(filter_value);
					} else if (!filters[property].isChecked() && filter_index > -1) {
						active_filters.splice(filter_index, 1);
					}
				}
			}
		},

		deleteAllianceFilter: function (alliance_id, $alliance_filter) {
			if (!$alliance_filter) {
				$alliance_filter = this.getComponent('alliance_filter_checkbox_' + alliance_id, 'olympus_filters_alliance').parent();
			}
			this.unregisterComponent('alliance_filter_checkbox_' + alliance_id, 'olympus_filters_alliance');
			$alliance_filter.remove();
			if (this.getComponent('alliance_input').isDisabled()) {
				this.getComponent('alliance_input').enable();
			}
		},

		setActiveAllianceFilters: function (filters) {
			if (Object.keys(filters).length) {
				var active_alliance_filters = this.window_controller.getActiveFiltersByType('alliance');

				for (var property in filters) {

					if (filters.hasOwnProperty(property)) {

						var filter_value = filters[property].data('filter'),
							filter_name = filters[property].data('value'),
							is_already_active = active_alliance_filters.hasOwnProperty(filter_value);

						if (filters[property].isChecked() && !is_already_active) {
							var alliance_filter = {};
							alliance_filter[filter_value] = filter_name;
							active_alliance_filters[filter_value] = filter_name;
						} else if (!filters[property].isChecked()){
							this.deleteAllianceFilter(filter_value);
							if (is_already_active) {
								delete active_alliance_filters[filter_value];
							}
						}
					}
				}
			} else {
				this.window_controller.active_filters.alliance = {};
			}
		},

		updateActiveFilter: function () {
			this.setActiveFilters(this.getComponents('olympus_filters_sea'), 'sea');
			this.setActiveFilters(this.getComponents('olympus_filters_god'), 'gods');
			this.setActiveAllianceFilters(this.getComponents('olympus_filters_alliance'));
			this.window_controller.applyFilters();
			this.close();
		},

		initializeView: function () {
			this.view = new FiltersSubWindowView({
				controller: this,
				el: this.$el
			});
		},

		getActiveFilters: function (type) {
			return this.window_controller.getActiveFiltersByType(type);
		},

		getAllGods: function () {
			return GameDataGods.getAllGods();
		},

		sortAscByOceanId: function (seaId_a, seaId_b) {
			return (seaId_a < seaId_b) ? -1 : seaId_a === seaId_b ? 0 : 1;
		},

		getAllSeaIdsThatHaveSmallTemples: function () {
			var sea_ids = this.window_controller.getAllSeaIdsThatHaveSmallTemples();
			sea_ids.sort(this.sortAscByOceanId);
			return sea_ids;
		},

		destroy: function () {
			this.unregisterComponents('olympus_filters_alliance');
			this.unregisterComponents('olympus_filters_god');
			this.unregisterComponents('olympus_filters_sea');
		}
	});
});
