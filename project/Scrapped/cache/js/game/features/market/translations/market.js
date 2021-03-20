/* global DM, _, s, ngettext */
(function () {
	"use strict";

	DM.loadData({
		l10n: {
			market : {
				tabs : [
                    _("Gold exchange"),
					_("Offers by others"),
					_("Your own offers"),
                    _("Create offer")
				],
				create_offer: _("Create offer"),
				you_offer: _("You offer"),
				you_get: _("You get"),
				you_pay: _("You pay"),
				buyer_gets: _("Buyer gets"),
				buyer_pays: _("Buyer pays"),
				ratio: _("Ratio"),
				max_delivery_time: _("Maximum delivery time"),
				delivery_time: _("Delivery time"),
				visible_for: _("Visible for"),
				created_at: _("Set"),
				city: _("City"),
				player: _("Player"),
				reset_filter: _("Reset filter"),
				trade: _("Trade"),
				slider_info: _("Adjust the trade amount with the slider"),
				trade_details: _("Trade Details"),
				ratio_filter: _("Set maximum ratio"),
				duration_filter: _("Set maximum delivery time"),
				btn_quick_trade: _("Accept offer now"),
				trade_details_disabled: _("Trade not possible, the selected city created that offer."),
				delete_offer: _("Delete this offer"),
				max_exchange_ratio: function(min, max) {
					return s(_("The ratio is too high or too low. Please choose a ratio between %1 and %2."), min, max);
				},
				min_trading_sum: function(val) {
					return s(_("You need to offer or demand at least %1 resources or 1 gold."), val);
				},
				not_enough_resources: _("You do not own enough resources to create this offer."),
				min_trading_sum_no_premium: function(val) {
					return s(_("You need to offer or demand at least %1 resources."), val);
				},
				confirmation_title: _("Trading gold"),
				confirmation_question: function(offer) {
					return s(_("Do you really want to offer %1 gold on the marketplace?"), offer);
				},
				confirmation_question_accept : function(offer) {
					return s(_("Do you really want to spend %s gold, in order to accept this offer?"), offer);
				},

				not_enough_capacity: function(available_capacity) {
					return s(ngettext(
						"You only have trade capacity for %1 resources left.",
						"You only have trade capacity for %1 resources left.", available_capacity), available_capacity);
				},
				capacity : _("Capacity:"),
				disable_dialog : _("Do not show this window again"),
				remove : _("Remove"),
				building_view : _("Building view"),
				resources_tooltips : {
					all: _("All resources"),
					all_but_gold : _("All resources but gold"),
					wood: _("Only wood"),
					iron: _("Only silver coins"),
					stone: _("Only stone"),
					gold: _("Only gold")
				},
				ratio_filter_tooltip: _("Set maximum ratio"),
				delivery_filter_tooltip: _("Set maximum delivery time"),
				show_offers_from: _("Show offers from:"),
				town_filter_all: _("All your towns"),
				//TODO there is also a backend options and translation, we should decide which one to use
				visibility: {
					all: _("All"),
					alliance: _("Alliance"),
					pact: _("Alliance pact"),
					not_enemy: _("All but enemies")
				},
				no_offers : {
					foreign : {
						line1 : _("There are no foreign offers in the trading area of your selected city at the moment."),
						line2 : _("Select another city or check here again at a later time.")
					},
					own : {
						line1: _("You're not offering any merchandise to trade at the moment.")
					}
				},
                delete_all_market_offers: _("Delete all"),
                exchange_title: function (sea_id) {
                    return s(_("Ocean %1 exchange"), sea_id);
                },
                estimated_price: function (price, pagenr) {
                    var texts = [
                        s(_("Estimated buying price is %1"), price),
                        s(_("Estimated selling price is %1"), price)
                    ];

                    return texts[pagenr];
				},
				enter_desired_amount: _("Enter the desired amount to get the estimated price."),
				premium_exchange_tabs: {
					buy: _("Buy resources"),
					sell: _("Sell resources")
				},
                find_best_rates: _("Find best rates"),
                exchange_rules: {
                    header: _("Exchange rules"),
                    expand_text: _("Expand for more info"),
                    description: _("Use the Gold Exchange to trade gold for resources and vice versa."),
                    paragraph_1: {
                        header: _("Exchange stock and capacity"),
                        description: _("There is one Gold Exchange for every ocean. Every Exchange has its own capacity, indicating how many resources of each type it can hold. An Exchange's current stock and its capacity will determine the current rate for trading. Resources are traded at lower rates when the stock is full and high rates when it is low. When an Exchange's stock is full, no more resources of that type may be sold to it. When an exchange's stock is empty, no more resources of that type can be bought from it.")
                    },
                    paragraph_2: {
                        header: _("Placing a trade order"),
                        description: _("You can enter trade orders into the desired resource field and see an estimate of how much it is worth, based on the resources' current rates. To purchase use the 'Buy resources' tab, and to sell use the 'Sell resources' tab.")
                    },
                    paragraph_3: {
                        header: _("Confirming a trade order"),
                        description: function (duration) {
                            return s(_("When you are satisfied with the price and amount of resources click the 'Find best rates' button, the Exchange will suggest a trade to you, with matched values rounded to the nearest full gold coin. When you accept this offer, the resources will be transferred between you and the Exchange. Buying resources from the exchange will require your city's trade capacity to send the Gold. Selling resources to the exchange will require your city's trade capacity to send the resources. In both cases the delivery time will be %1."), duration);
                        }
                    },
                    paragraph_4: {
                        header: _("Taxation and growth"),
                        description: _("When buying resources from the Exchange, a small portion of the proceeds will be put aside automatically to increase its capacity for the traded resource. Each day, Exchanges on other continents will also shift around capacity and stock to mitigate differences in their trading rates.")
                    }
                },
                tooltips: {
                    info: _("Rates may change if there are significant changes to the current stock and capacity."),
                    current_stock: _("This is the exchange stock, it is the current amount of resources available to be purchased."),
					max_capacity: _("This is the exchange capacity, it is the maximum amount of resources the exchange can currently hold."),
					find_best_rates_button: {
						enabled: "",
						disabled: _("Enter the desired amount to find the best rate for your transaction."),
						buy: {
							trade: _("Amount adjusted to fit current available trading capacity."),
							stock: _("Amount adjusted to fit current available gold exchange stock."),
							storage: _("Amount adjusted to fit the maximum resources your warehouse can hold.")
						},
						sell: {
							trade: _("Amount adjusted to fit current available trading capacity."),
							resources: _("Amount adjusted to fit current available resources."),
							capacity: _("Amount adjusted to fit current available gold exchange capacity.")
						}
					}
                },
                confirm_order: {
					title: _("Review order"),
					your_order: _("Your order"),
					best_match: _("Best match"),
					trade_duration: _("Trade duration:"),
					trade_cost: _("Trade cost:"),
					rates_change_warning: _("Warning! The rates have changed!"),
					offer: {
						buy: _("Buy"),
						sell: _("Sell")
					},
					for_gold:  _("For"),
					button: _("Confirm order")
				}
			},
            premium: {
                delete_all_market_offers: {
                    confirmation: {
                        window_title: _("Delete all market offers"),
                        question: _("Do you really want to delete all the market offers on the current page?")
                    }
                }
            }
		}
	});
}());
