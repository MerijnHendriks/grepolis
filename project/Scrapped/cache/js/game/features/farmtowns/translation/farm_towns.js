/* global DM, _, s */
(function () {
	"use strict";

	DM.loadData({
		l10n: {
			farm_town : {
				window_title: _("Farming village info"),
				tabs : [
					_("Demand")
				],
				not_on_same_island: _("Your active city is not on this island."),
				minutes : _("minutes"),
				hours : _("hours"),
				capacity: _("Capacity"),
				level: _("Level"),
				upgrade_complete_in: _("Upgrade complete in:"),
				collect: _("Collect"),
				accept: _("Accept"),
				unlock_village: _("Build a farming village"),
				trade_possibilities: _("Trade possibilities"),
				trade_you_get: _("You get"),
				trade_you_pay: _("You pay"),
				ratio: _("Ratio"),
				trade_description: _("Here you can build a new farming village. Farming villages frequently produce resources and recruit units for you. As soon as you have a marketplace, you can also trade resources with the villagers."),
				unlock: _("Unlock"),
				upgrade : _("Upgrade"),
				build : _("Build"),
				build_button : {
					disabled : _("You don't have enough battle points. You gain more battle points by killing units, either from quests or from other players.")
				},
				ruin : _("Ruin"),
				in_your_possession: _("In your possession"),
				trade : _("Trade"),
				costs : _("Costs"),
				arrival_time : _("Arrival"),
				way_duration: _("Travel time"),
				available_battle_points : _("<b>Available battle points</b><br/>You earn battle points by killing enemy units. The amount of battle points you receive depends on the population place the unit needs. You can use battle points for holding victory processions in the Agora or for erecting farming villages on the islands."),
				upgrade_time : _("Upgrade time"),
				cool_down_time : _("Next collection in"),
				market_required : _("Requires a marketplace in your city."),
				not_enough_capacity : _("You have not enough free capacity to trade."),
				not_enough_resources : _("You don't own enough resources."),
				input_offer_to_high : _("You can not offer more than 3000 resources."),
				input_offer_to_low : _("You have to offer at least 100 resources."),
				requirements : _("Requirements"),
				upgrade_advantages: _("Upgrade advantages"),
				tooltips: {
					battlepoints_needed : _("You don't have enough battle points. You gain more battle points by killing units, either from quests or from other players."),
					trade_tab : _("The farming village offers you resources to trade. The trade ratio will go down with every trade interaction but it will recover slightly over time."),
					max_resource_per_day : _("Remaining amount of resources for today"),
					you_get: _("You get"),
					cooldown_time: _("Next collection in"),
					plus_resources : function(amount) {
						 return s(_("Average +%1% resources per collection"), amount);
					},
					daily_collectable : function(amount) {
						 return s(_("+%1 daily collectible resources"), amount);
					},
                    collect_resources: _("Collect resources to your city periodically"),
					accept_units: _("Accept units to your city periodically"),
                    trade_resources: _("Trade your excess resources"),
					hymn_to_aphrodite: _('Hymn to Aphrodite increases farm trade output by 10%.')
				},
				tabs_title : {
					resources : _("Collect resources"),
					units : _("Accept units from the villagers"),
					trade : _("Trade with the villagers")
				},
				advisor_banner : {
					captain : s(_("Manage all farming villages with the aid of the %1 captain %2 with just one click."), '<a href="#premium.captain" class="link_to_captain">', '</a>'),
					advantage : _("<b>Farming villages overview</b>"),
					activate : function(cost) {
						return s(_("Activate %1"), cost);
					}
				},
				locked_card : function(type, level) {
					if(type === 'resources') {
						return s(_("Requires warehouse level %1 in your city."), level);
					} else {
						return s(_("Requires farm level %1 in your city."), level);
					}

				}
			}
		}
	});
}());
