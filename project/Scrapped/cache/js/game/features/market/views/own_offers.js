/*global define, us, GoToPageWindowFactory, ITowns, GameDataBuildings, Game, readableRatio */

define('market/views/own_offers', function () {
	'use strict';

	var View = window.GameViews.BaseView,
		SortableTable = window.SortableTable,
        ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
        MarketHelper = require('market/helper/market');

	return View.extend({
		initialize: function () {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

			this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			if (this.controller.hasMarket()) {
				var offers = this.controller.getOffersCollection();
				this.renderTemplate(this.$el, 'own_offers', {
					l10n: this.controller.getl10n(),
					are_there_more_offers: offers && offers.length > 1
				});

				this._renderOffers(offers);

				this.unregisterComponents();
				this.registerViewComponents(offers);
				MarketHelper.showMarketTabs(this.controller);
			} else {
				this.$el.html(us.template(this.controller.getTemplate('no_building'), GameDataBuildings.getNoBuildingTemplateData('market')));
				this.controller.hideAllTabs();
			}
		},

		registerViewComponents : function(offers) {
			this._registerPagination();
			this._registerDeleteButtons();
			this._registerTradeButtons();
			this._registerFilterDropdown();
			this.manipulateCurrentCityRows();
			this.registerTableTooltips();
			this.registerTableSorting();
            if (offers && offers.length > 1) {
                this._registerDeleteAllButton();
            }
		},

		destroy : function() {

		},

		registerTableSorting: function() {
			var $table = this.$el.find('table'),
				sortFunction = function(value, order, cb) {
					this.controller.sortBy(value, order, cb);
					cb();
				}.bind(this),
				sort_key = this.controller.getSortKey() || 'created_at',
				sort_order = this.controller.getSortOrder() || 'desc';

			this.table_sorter = new SortableTable($table, sortFunction, sort_key, sort_order);
		},

		registerTableTooltips: function() {
			var l10n = this.l10n;

			// delete buttons
			this.$el.find('.table-content .btn_delete').each(function() {
				$(this).tooltip(l10n.delete_offer);
			});

			// trade detail buttons
			this.$el.find('.table-content .btn_details:not(.disabled)').each(function() {
				$(this).tooltip(l10n.trade_details);
			});

			this.$el.find('.table-content .btn_details.disabled').each(function() {
				$(this).tooltip(l10n.trade_details_disabled);
			});

			this._registerInfoTooltips();
		},

		renderOffers: function() {
			this._renderOffers(this.controller.getOffersCollection());
			this.manipulateCurrentCityRows();
			this.registerTableTooltips();
			this._registerPagination();
		},

		_removeOfferRow: function(offer, cb) {
			this.$el.find('.table-content').find('tr[data-offer-id="' + offer.id + '"]')
				.children('td')
				.animate({ padding: 0 })
				.wrapInner('<div />')
				.children()
				.slideUp(function() {
					$(this).closest('tr').remove();
					cb();
				});
		},

		_registerPagination: function() {
			var controller = this.controller,
				offers = this.controller.getOffersCollection();

			this.unregisterComponent('pagination');

			controller.registerComponent('pagination', this.$el.find('.pagination').pager({
				activepagenr : offers.state.currentPage,
				per_page : offers.state.pageSize,
				total_rows : offers.state.totalRecords
			}).on('pgr:page:switch', function(e, page_nr) {
				controller.fetchPage(page_nr);
			}).on('pgr:page:select', function(e, _pager, activepagenr, number_of_pages) {
				GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
			}));
		},

		_registerDeleteButtons: function() {
			// delegated click handler
			this.$el.find('.table-content').on('click', '.btn_delete', function(e) {
				var id = $(e.target).parents('tr').data('offer-id'),
					offer = this.controller.getOfferById(id),
					animateRemoval = this._removeOfferRow.bind(this, offer, this.renderOffers.bind(this));

				if (offer) {
					this.controller.deleteOffer(offer, animateRemoval);
				}
			}.bind(this));
		},

		_registerTradeButtons: function() {
			// delegated click handler
			this.$el.find('.table-content').on('click', '.btn_details', function(e) {
				var $btn = $(e.target),
					id = $btn.parents('tr').data('offer-id'),
					offer = this.controller.getOfferById(id);

				if (offer && offer.getTownId() !== Game.townId) {
					this.controller.openOfferDetails(offer);
				}
			}.bind(this));
		},

		/**
		 * Remove travel time and grey out trade buttons on same city
		 */
		manipulateCurrentCityRows: function() {
			this.$el.find('.table-content tr').each(function(i,el) {
				var $row = $(el),
					id = $row.data('offer-id'),
					offer = this.controller.getOfferById(id);

				if (offer && offer.getTownId() === Game.townId) {
					// remove travel time from same city offers
					var $delivery_time = $row.find('.delivery_time');
					$delivery_time.text('--:--:--');
					// grey out the trade buttons
					var $btn_details = $row.find('.btn_details');
					$btn_details.addClass('disabled');
				}
			}.bind(this));
		},

		_registerInfoTooltips: function() {
			var l10n = this.l10n,
				ctrl = this.controller;

			this.$el.find('.table-content .info_icon').each(function() {
				var id = $(this).parents('tr').data('offer-id'),
					offer = ctrl.getOfferById(id),
					template = us.template(ctrl.getTemplate('own_offer_row_tooltip'), {
						l10n: l10n,
						offer: offer
					});
				$(this).tooltip(template);
			});
		},

		_registerFilterDropdown: function() {
			var l10n = this.l10n,
				ctrl = this.controller,
				all_option = [{value : 'all', name : l10n.town_filter_all}],
				towns = ITowns.getTowns(),
				towns_options = Object.keys(towns).map(function(id) {
					return {
						value: id,
						name: towns[id].getName()
					};
				}),
				options = all_option.concat(us.sortBy(towns_options, 'name'));

			this.registerComponent('town_filter', this.$el.find('#town_filter').dropdown({
				list_pos : 'right',
				value : ctrl.getCurrentTownFilter(),
				options : options
			}).on('dd:change:value', function(e, new_val, old_val) {
				ctrl.filterByTownId(new_val);
			}));
		},

        _registerDeleteAllButton: function() {
            this.registerComponent('delete_all_market_offers', this.$el.find('.delete_all_market_offers').button({
				caption: this.l10n.delete_all_market_offers
			}).on('btn:click', function() {
                ConfirmationWindowFactory.openDeleteAllMarketOffers(this.controller.deleteAllMarketOffers.bind(this.controller));
            }.bind(this)));
		},

		_renderOffers: function(offers_collection) {
			var pagination = this.getComponent('pagination'),
				delete_all_offers = this.getComponent('delete_all_market_offers'),
				$table_content = this.$el.find('.table-content');
			if (offers_collection.length > 0) {
				var table_html = offers_collection.models.map(this._renderOffer.bind(this)).join('');
				$table_content.empty().html(table_html);

				if (pagination) {
					pagination.show();
				}
				if (delete_all_offers) {
					if (offers_collection.length > 1) {
                        delete_all_offers.show();
					} else {
                        delete_all_offers.hide();
					}
                }
			} else {
				this.renderTemplate($table_content, 'no_own_offers_message', {
					l10n: this.controller.getl10n()
				});
				if (pagination) {
					pagination.hide();
				}
				if (delete_all_offers) {
                    delete_all_offers.hide();
				}
			}
		},

		_renderOffer: function(offer) {
			var splitted_ratio = readableRatio(offer.getRatio()).split(':'),
				ratio_l = splitted_ratio[0],
				ratio_r = splitted_ratio[1];

			return us.template(this.controller.getTemplate('own_offer_row'), {
				l10n: this.controller.getl10n(),
				offer: offer,
				ratio_l: ratio_l,
				ratio_r: ratio_r
			});
		}
	});
});
