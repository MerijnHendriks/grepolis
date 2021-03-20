define('features/olympus/controllers/overview_small_temples', function (require) {
	"use strict";

	var OverviewController = require('features/olympus/controllers/overview'),
		OverviewSmallTemplesView = require('features/olympus/views/overview_small_temples'),
		TempleSizes = require('enums/temple_sizes'),
		WMap = require('map/wmap'),
		OlympusHelper = require('helpers/olympus'),
		TooltipFactory = require('factories/tooltip_factory'),
		SortOrders = require('enums/sort_orders'),
		AllianceLinkHelper = require('helpers/alliance_link'),
		FiltersSubController = require('features/olympus/controllers/subwindows/filters');

	return OverviewController.extend({
		active_filters: {
			alliance: {},
			sea: [],
			gods: []
		},
		should_filters_be_applied: false,
		update_filters: false,

		initialize: function () {
			OverviewController.prototype.initialize.apply(this, arguments);
			this.resetFilterData();
		},

		renderPage: function () {
			this.temples = this.getCollection('temples');

			this.view = new OverviewSmallTemplesView({
				controller: this,
				el: this.$el
			});

			this.registerOlympusStageTimer();
			this.registerEventListeners();
			this.registerOlympusStageChangeListener();
		},

		registerEventListeners: function () {
			this.stopListening();
			this.getCollection('temples').onAllianceIdChange(this, this.handleAllianceIdChange.bind(this));
		},

		areThereAnyActiveFilters: function () {
			return this.getActiveFiltersByType('gods').length > 0 ||
				this.getActiveFiltersByType('sea').length > 0 ||
				Object.keys(this.getActiveFiltersByType('alliance')).length > 0;
		},

		applyFilters: function () {
			var checkbox_filter = this.getComponent('apply_filters_checkbox');
			this.update_filters = true;
			if (this.areThereAnyActiveFilters()) {
				checkbox_filter.enable();
				this.should_filters_be_applied = true;
				this.getComponent('apply_filters_checkbox').check(true);
			} else {
				checkbox_filter.disable();
				this.should_filters_be_applied = false;
				this.getComponent('apply_filters_checkbox').check(false);
			}
		},

		getSeaIdForTemple: function (temple) {
			return WMap.getSea(temple.getIslandX(), temple.getIslandY()).join('');
		},

		sortAscendingByName: function (temple_a, temple_b) {
			return (temple_a.getName() < temple_b.getName()) ? -1 : temple_a.getName() === temple_b.getName() ? 0 : 1;
		},

		sortAscendingByOceanId: function (temple_a, temple_b) {
			var sea_a = this.getSeaIdForTemple(temple_a);
			var sea_b = this.getSeaIdForTemple(temple_b);
			return (sea_a < sea_b) ? -1 : sea_a === sea_b ? this.sortAscendingByName(temple_a, temple_b) : 1;
		},

		sortDescendingByOceanId: function (temple_a, temple_b) {
			var sea_a = this.getSeaIdForTemple(temple_a);
			var sea_b = this.getSeaIdForTemple(temple_b);
			return (sea_a < sea_b) ? 1 : sea_a === sea_b ? this.sortAscendingByName(temple_a, temple_b) : -1;
		},

		sortTemples: function (small_temples, sortOrder) {
			if (sortOrder === SortOrders.ASC) {
				small_temples.sort(this.sortAscendingByOceanId.bind(this));
			}
			if (sortOrder === SortOrders.DESC) {
				small_temples.sort(this.sortDescendingByOceanId.bind(this));
			}
			return small_temples;
		},

		getSortedTemples: function (sortOrder) {
			var small_temples = this.temples.getTemplesBySize(TempleSizes.SMALL);
			return this.sortTemples(small_temples, sortOrder);
		},

		checkGodsFilter: function (temple) {
			return this.getActiveFiltersByType('gods').length > 0 ? this.getActiveFiltersByType('gods').indexOf(temple.getGod()) > -1 : true;
		},

		checkSeaFilter: function (temple) {
			var sea_id = parseInt(this.getSeaIdForTemple(temple), 10);
			return this.getActiveFiltersByType('sea').length > 0 ? this.getActiveFiltersByType('sea').indexOf(sea_id) > -1 : true;
		},

		checkAllianceFilter: function (temple) {
			return Object.keys(this.getActiveFiltersByType('alliance')).length > 0 ? this.getActiveFiltersByType('alliance').hasOwnProperty(temple.getAllianceId()) : true;
		},

		getFilteredTemples: function (temples) {
			var filtered_temples = temples;
			filtered_temples = filtered_temples.filter(function (temple) {
				return this.checkGodsFilter(temple) && this.checkSeaFilter(temple) && this.checkAllianceFilter(temple);
			}.bind(this));

			return filtered_temples;
		},

		getActiveFiltersByType: function (type) {
			return this.active_filters[type];
		},

		getAllSeaIdsThatHaveSmallTemples: function () {
			var small_temples = this.temples.getTemplesBySize(TempleSizes.SMALL),
				sea_ids = [];
			small_temples.forEach(function (model) {
				var seaId = parseInt(this.getSeaIdForTemple(model), 10);
				if (sea_ids.indexOf(seaId) === -1) {
					sea_ids.push(seaId);
				}
			}.bind(this));
			return sea_ids;
		},

		openFiltersSubWindow: function () {
			var controller = new FiltersSubController({
				window_controller: this,
				l10n: this.l10n,
				templates: {
					filters: this.getTemplate('filters')
				},
				collections: {
				},
				cm_context: {
					main: this.getMainContext(),
					sub: 'sub_window_filters'
				}
			});

			this.openSubWindow({
				title: this.l10n.filters_title,
				controller: controller,
				skin_class_names: 'classic_sub_window'
			});
		},

		getSmallTemplesData: function (sortOrder) {
			var result = [],
				temples = this.getSortedTemples(sortOrder);

			if (this.should_filters_be_applied) {
				temples = this.getFilteredTemples(temples);
			}

			temples.forEach(function (model) {
				var sea_id = this.getSeaIdForTemple(model),
					temple_link = OlympusHelper.generateTempleLink({
						id: model.getId(),
						x: model.getIslandX(),
						y: model.getIslandY(),
						name: model.getName()
					}),
					powers = OlympusHelper.getTemplePowersArray(model),
					alliance_id = model.getAllianceId(),
					alliance_name = model.getAllianceName(),
					alliance_link = AllianceLinkHelper.getAllianceLink(alliance_id, alliance_name);

				result.push({
					id: model.getId(),
					link: temple_link.outerHTML,
					power: TooltipFactory.getOlympusTemplePowerList(powers, model),
					god: model.getGod(),
					owner: alliance_link,
					sea_id: sea_id
				});
			}.bind(this));

			return result;
		},

		resetFilterData: function () {
			this.active_filters = {
				alliance: {},
				sea: [],
				gods: []
			};
			this.should_filters_be_applied = false;
			this.update_filters = false;
		},

		destroy: function () {
			this.resetFilterData();
		}
	});
});
