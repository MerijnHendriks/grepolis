/*global define, us, GoToPageWindowFactory, GameDataBuildings, readableRatio */

define('market/views/all_offers', function () {
	'use strict';

	var View = window.GameViews.BaseView;
	var Offer = window.GameModels.ResourceOffer;
	var SortableTable = window.SortableTable;
	var DIFF_VALUE = 0.2;
    var MarketHelper = require('market/helper/market');
	var Timestamp = require('misc/timestamp');
    var PREMIUM_EXCHANGE_FLAG_TYPE = 'premium_exchange';

	return View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.l10n;
			this.render();
		},

		render : function() {
			if (this.controller.hasMarket()) {
				this.renderTemplate(this.$el, 'all_offers', {
					l10n: this.controller.getl10n(),
					filter_resources : this.controller.getFilterResources(),
					gold_trade_enabled : this.controller.isPremiumExchangeEnabled()
				});

				this.renderOffers();
				this.controller.unregisterComponents();
				this.registerCapacityBar();
				this.registerFilterButtons('get');
				this.registerFilterButtons('pay');
				this.registerTradeSliderSpinner();
				this.registerResetButton();
				this.registerPagination();
				this.registerDetailButtons();
				this.registerQuickTradeButtons();
				this.registerAllianceTooltips();
				this.registerTableSorting();

				this.$el.find('.table-content').on('click', '.flag', function(e) {
					var id = $(e.target).parents('tr').data('offer-id'),
						offer = this.controller.getOfferById(id);

					if (offer.getAllianceName() && offer.getAllianceId()) {
						window.Layout.allianceProfile.open(offer.getAllianceName(), offer.getAllianceId());
					}
				}.bind(this));

				MarketHelper.showMarketTabs(this.controller);
			} else {
				this.renderNoMarketView();
				this.controller.hideAllTabs();
			}
		},

		renderNoMarketView: function() {
			this.$el.html(us.template(this.controller.getTemplate('no_building'), GameDataBuildings.getNoBuildingTemplateData('market')));
		},

		renderOffers : function() {
			var offers_collection = this.controller.getOffersCollection();
			if (offers_collection.length === 0 && offers_collection.getMarketData().offers_total > 0) {
				var activePage = this.getComponent('pagination').getActivePage();
				if (activePage > 0) {
					this.controller.fetchPage(activePage - 1);
					return;
				}
			}
			this._renderOffers(offers_collection);
			this.registerPagination();
		},

		registerTableSorting: function() {
			var $table = this.$el.find('table'),
				sortFunction = function(value, order, cb) {
					this.controller.sortBy(value, order, cb);
					cb();
				}.bind(this),
				sort_key = this.controller.getSortKey(),
				sort_order = this.controller.getSortOrder();

			this.table_sorter = new SortableTable($table, sortFunction, sort_key, sort_order);
		},

		registerCapacityBar : function() {
			this.registerComponent('progressbar_capacity', this.$el.find('.js-capacity').singleProgressbar({
				extra : this.controller.getAvailableCapacity(),
				max: this.controller.getMaxCapacity(),
				caption: this.l10n.capacity
			}));
		},

		updateCapacityBar : function(amount) {
			if(this.getComponent('progressbar_capacity')) {
				this.getComponent('progressbar_capacity').setExtra(amount);
			}
		},

		registerPagination: function() {
			var controller = this.controller,
				offers = this.controller.getOffersCollection();

			this.unregisterComponent('pagination');

			this.registerComponent('pagination', this.$el.find('.pagination').pager({
				activepagenr : offers.state.currentPage,
				per_page : this.controller.getMaxPageSize(),
				total_rows : offers.state.totalRecords
			}).on('pgr:page:switch', function(e, page_nr) {
				controller.fetchPage(page_nr);
			}).on('pgr:page:select', function(e, _pager, activepagenr, number_of_pages) {
				GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
			}));
		},

		/**
		 * given an array of resources (strings), converts to an array { value: <resource name>, tooltip : l10n.resource_name}
		 */
		_convertResourceToValueHashes : function(resource_array) {
			return resource_array.map(function(resource) {
				return {
					value: resource,
					tooltip: this.l10n.resources_tooltips[resource]
				};
			}.bind(this));
		},

		/**
		 * filter buttons work like radiobuttons - only 1 per group can be active
		 * @param {String} group the radiobutton group (we have two)
		 */
		registerFilterButtons : function(group) {
			var filter_resources = this.controller.getFilterResources(),
				resource_options = this._convertResourceToValueHashes(filter_resources);

			var filter_values = this.controller.getFilters(),
				value = (group === 'get') ? filter_values.demand_type : filter_values.offer_type;

			this.registerComponent('rb_filter_' + group, this.$el.find('.filter_resources.' + group).radiobutton({
				value : value,
				template: 'tpl_radiobutton_resource_filter',
				options: resource_options
			}).on('rb:change:value', function() {
				this.controller.onFiltersChanged();
			}.bind(this)));
		},

		/**
		 * Convert a ratio from backend to the value range used in the slider
		 */
		_fractionRatioToSliderRatio : function(ratio) {
			if(ratio >= 1) {
				return Math.round((ratio - 1) / DIFF_VALUE);
			} else {
				return -1 * (Math.round((1/ratio - 1) / DIFF_VALUE));
			}
		},

		/**
		 * Convert a ratio value from the slider (integers) to a fraction used in the backend
		 */
		_sliderRatioToFractionRatio : function(value) {
			var ratio = 1;
			value *= -1;
			if (value <= -1 ) {
				// this is the left side of the slider 3:1 .. 1:1 represented as [1 .. 3]
				ratio = (-1 * value * DIFF_VALUE) + 1;
				// cap at 3
				if (ratio > 3) {
					ratio = 3;
				}
			} else if (value > -1 && value < 1) {
				// center position, avoid the 0 at all costs
				ratio = 1;
			} else {
				// this is the right side of the slider 1:1 .. 1:3 represented as fraction [0.3 .. 1]
				ratio = 1 / ((value * DIFF_VALUE) + 1);
				// cap ratio to never exec 1:3
				if (ratio < 1/3) {
					ratio = 1/3;
				}
			}

			return ratio;
		},

		getSliderStepByValue: function(value) {
			var basic_step = 1800;

			if(value  >=  43200)	{
				return basic_step * 4;
			}
			else if (value >=  21600) {
				return basic_step * 2;
			}
			else {
				return basic_step;
			}
		},

		getNewValueChangedByMouse: function(min, max, step_nr, step) {
			return Math.max(min, Math.min(max, step_nr * step));
		},

		registerTradeSliderSpinner : function () {
			var filter_values = this.controller.getFilters(),
				duration_value = filter_values.max_delivery_time,
				value = this._fractionRatioToSliderRatio(filter_values.max_ratio);

			this.registerComponent('trade_ratio', this.$el.find('.trade_ratio_wrapper').sliderSpinner({
				name: 'ratio',
				callback: function () {
					this.controller.onFiltersChanged();
				}.bind(this),
				template : 'tpl_spinner_slider',
				value : value,
				step : 1,
				max : 10,
				min : -10,
				type : 'ratio',
				readonly: true,
				snap: true,
				displayFunc : function(value) {
					var ratio = this._sliderRatioToFractionRatio(value);

					// beware: the display of the ratio and the fraction from the backend are inverse to
					// each other (this is true for the market, but not true of farming villages),
					// so I send 1/ratio for display
					return window.readableRatio(1/ratio);
				}.bind(this),
				tooltip: this.l10n.ratio_filter
			}));

			this.registerComponent('trade_duration', this.$el.find('.trade_duration_wrapper').sliderSpinner({
				name: 'duration',
				callback: function () {
					this.controller.onFiltersChanged();
				}.bind(this),
				template: 'tpl_spinner_slider',
				value : duration_value,
				step:  function (elem, value) {
					return this.getSliderStepByValue(value);
				}.bind(this),
				max: 172800,
				min: 1800,
				type: 'time',
				mouseValueChangeFunc: function(min, max, step_nr, step) {
					return this.getNewValueChangedByMouse(min, max, step_nr, step);
				}.bind(this),
				readonly: true,
				tooltip: this.l10n.duration_filter
			}));
		},

		registerResetButton : function() {
			this.registerComponent('btn_reset_filters', this.$el.find('.btn_reset_filters').button({
				template: 'tpl_simplebutton_borders',
				caption: this.l10n.reset_filter,
				tooltips : []
			}).on('btn:click', function() {
				this.controller.resetFilters();
			}.bind(this)));
		},


		/**
		 * set time / duration spinner from seconds
		 */

		setDurationSpinnerFromSeconds : function(seconds) {
			var duration_spinner = this.getComponent('trade_duration'),
				time_as_string = duration_spinner.formatTime(Timestamp.toDate(seconds));

			duration_spinner.setValue(time_as_string);
		},

		// update UI elements from given state
		setFilters : function(filters) {
			this.controller.getComponent('trade_ratio').setValue(filters.max_ratio * 1/DIFF_VALUE);
			this.setDurationSpinnerFromSeconds(filters.max_delivery_time);
			this.controller.getComponent('rb_filter_get').setValue(filters.demand_type);
			this.controller.getComponent('rb_filter_pay').setValue(filters.offer_type);
		},

		/**
		 * return the state and content of all filters
		 */
		getFilters : function() {
			var demand_type = this.controller.getComponent('rb_filter_get').getValue(),
				offer_type = this.controller.getComponent('rb_filter_pay').getValue(),
				max_ratio = this.controller.getComponent('trade_ratio').getValue(),
				max_delivery_time = this.controller.getComponent('trade_duration').getTimeValueAsSeconds();

			return {
				demand_type : demand_type,
				offer_type: offer_type,
				max_ratio : this._sliderRatioToFractionRatio(max_ratio),
				max_delivery_time : max_delivery_time,
				visibility: Offer.VISIBILITY_ALL,  // TODO there is no UI representation for this yet
				order_by: this.table_sorter.getSortKey(),
				order_direction: this.table_sorter.getOrder()
			};
		},

		registerDetailButtons: function() {
			var l10n = this.l10n;
			// tooltips
			this.$el.find('.table-content .btn_details').each(function() {
				$(this).tooltip(l10n.trade_details);
			});

			// delegated click handler
			this.$el.find('.table-content').on('click', '.btn_details', function(e) {
				var id = $(e.target).parents('tr').data('offer-id'),
					offer = this.controller.getOfferById(id);

				this.controller.openOfferDetails(offer);
			}.bind(this));
		},

		registerQuickTradeButtons: function() {
			var l10n = this.l10n;
			// tooltips
			this.$el.find('.table-content .btn_quick_trade').each(function() {
				$(this).tooltip(l10n.btn_quick_trade);
			});
			
			// delegated click handler
			this.$el.find('.table-content').on('click', '.btn_quick_trade', function(e) {
				var id = $(e.target).parents('tr').data('offer-id'),
					offer = this.controller.getOfferById(id);

					if (this.isPremiumExchangeOffer(offer)) {
						this.controller.requestPremiumExchangeOffer(offer);
					} else {
						this.controller.handleQuickTrade(offer);
					}
			}.bind(this));
		},

		registerAllianceTooltips: function() {
			this.$el.find('.table-content .flag_color').each(function(i, el) {
				var $this = $(el),
					id = $this.parents('tr').data('offer-id'),
					offer = this.controller.getOfferById(id),
					alliance_name = offer.getAllianceName();

				if (alliance_name) {
					$this.tooltip(alliance_name);
				}
			}.bind(this));

		},

		_renderOffers: function(offers_collection) {
			var pagination;

			if (offers_collection.length > 0) {
				var table_html = offers_collection.models.map(this._renderOffer.bind(this)).join('');
				this.$el.find('.table-content').html(table_html);
				pagination = this.getComponent('pagination');
				if (pagination) {
					pagination.show();
				}
			} else {
				this.renderTemplate(this.$el.find('.table-content'), 'no_foreign_offers_message', {
					l10n: this.controller.getl10n()
				});
				pagination = this.getComponent('pagination');
				if (pagination) {
					pagination.hide();
				}
			}
			this.updateCapacityBar(offers_collection.market_data.available_capacity);
		},

		_renderOffer: function(offer) {
			var splitted_ratio = readableRatio(offer.getRatio()).split(':'),
				ratio_l = splitted_ratio[0],
				ratio_r = splitted_ratio[1],
				player_name =  '',
				row_class = '';

			if (this.isPremiumExchangeOffer(offer)) {
				player_name = offer.getPlayerName();
				row_class = PREMIUM_EXCHANGE_FLAG_TYPE;
			} else {
				player_name = offer.getPlayerLink();
			}

			return us.template(this.controller.getTemplate('other_offer_row'), {
				l10n: this.controller.getl10n(),
				offer: offer,
				ratio_l: ratio_l,
				ratio_r: ratio_r,
				custom_flag_color_html : offer.getCustomFlagColorInlineHtml(),
				is_premium_exchange_offer: this.isPremiumExchangeOffer(offer),
				player_name: player_name,
				row_class: row_class
			});
		},

		isPremiumExchangeOffer: function (offer) {
			return offer.getFlagType() === PREMIUM_EXCHANGE_FLAG_TYPE;
		},

		destroy : function() {
			this.$el.find('.table-content').off();
		}
	});
});