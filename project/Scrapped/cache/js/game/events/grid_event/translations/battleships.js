/* globals DM, ngettext, __ */

define('events/grid_event/translations/battleships', function () {
	'use strict';

	DM.loadData({
		l10n: {
			battleships: {
				gridevent: {
					window_title: _("Aegean Battleships"),
					tutorial: {
						step_1: _("Ahoy, Captain! You arrived just in time. The enemy ships are gathering and we have a chance to thin their numbers.<br /><br />Our scouts found a large concentration of ships in this area, but we don't know their exact locations!"),
						step_2: function (turn_cost) {
							return s(_("Start by taking a shot, by clicking on one of the spots in the pool. One shot costs %1 ammunition.<br /><br />Each shot you take will give you a reward, even if you don't hit anything! Try your best to sink the ships to collect even better rewards."), turn_cost);
						},
						step_3: _("Every time you get a reward for shooting, the reward is moved to your event inventory. Theses rewards will remain in your event inventory until you use, discard or store them.<br /><br />Remember, you can only take a shot if you have space for the reward in your event inventory."),
						step_4: _("When you hit an enemy ship you move one step closer to claiming a Sink reward. Each ship carries their own rewards and you can claim them by hitting all of its parts.<br /><br />If you sink all the ships in the pool you can choose to look for a whole new wave of enemies for free."),
						step_5: _("You can see the size of each ship on the right side of the screen in the Sink rewards section. Ships can be positioned both horizontally and vertically.<br /><br />Remember the hit marks on this section do not represent the spot where the ship was hit, they only mark the number of hits you've successfully landed on a ship!"),
						step_6: _("Make sure you sink the ships with the rewards you like before a new wave of enemies arrives.<br /><br />Every day a new wave of enemies will appear, and any surviving ships will depart your shores taking their rewards with them. This also happens when you actively search for a new wave of enemies."),
						step_7: _("In every wave of enemies there will be one daily special reward. Each day of the event will have its own daily special reward. You can find the daily special multiple times if you search for new enemies."),
						step_8: _("For each shot you take you spend ammunition. You can also spend ammunition to find a new wave of enemies. More ammunition can be obtained by performing regular actions like casting spells, attacking, building and researching."),
						step_9: _("For every shot you take, you'll also be rewarded with a map piece. Map Pieces are rewarded even if you don't hit a ship<br /><br />Use Map Pieces to navigate your way across the treasure map, moving closer to the Grand Prize. Every map piece you spend will move you between 1 and 3 steps closer to the Grand prize."),
						step_10: _("You can obtain the Grand Prize several times throughout the event, collecting the best rewards! Just be sure to take your shots and spend your map pieces to move closer to the Grand Prize."),
						step_11: _("You can get more ammunition by performing regular actions in the game. But, you can always buy more in the Ammunition shop in the top right corner.")
					},
					shop: {
						title: _("Buy ammunition"),
						tooltip: function (amount, cost) {
							return s(_("Buy %1 ammunition for %2 gold."), amount, cost);
						}
					},
					rewards_list: {
						title: _("Available rewards"),
						description: _("This is the list of rewards present in the current wave of enemies. Every time a new wave of enemies arrives, all the rewards are randomized and listed here for your information. The order they are listed here has no correlation to their position in the grid.")
					},
					figure_rewards: _("Sink rewards"),
					shot_costs: function (costs) {
						return s(_("<b>Shot cost:</b> %1"), costs);
					},
					btn_reset_grid: function (costs) {
						return costs > 0 ? costs : __("Zero Cost|Free");
					},
					btn_reset_grid_label: _("New wave"),
					gridevent_harpy_scout: {
						title: _("Scout"),
						description: _("Immediately choose 2 spots to see the prize and if there is a ship in the location.")
					},
					gridevent_double_reward: {
						title: _("Double prize"),
						description: _("If you find the double prize in a shot, the next spot you shoot will give you 2 of whatever prize you find.<br /><br />This power can accumulate a maximum of 3 times.<br /><br />This does not apply to grand prizes and sink rewards.")
					},
					tooltips: {
						progression_currency: _("<b>Map pieces</b><br /><br />Use map pieces to move your ship closer to the Grand Prize."),
						turn_currency: _("<b>Ammunition</b><br /><br />Use ammunition to shoot the enemies or to search for a new wave of enemies."),
						sink_rewards: {
							info_icon: {
								headline: _("Sink rewards"),
								list: [
									_("You get a sink reward for hitting all of the spots of a single ship."),
									_("When you hit a ship this list shows what ship was hit, but not on which spot."),
									_("Each ship contains different possible rewards."),
									_("Sink rewards get randomized every time a new wave of enemies comes in.")
								]
							}
						},
						grand_prize: {
							info_icon: {
								headline: _("Grand prize"),
								list: [
									_("You can achieve the grand prizes by moving your ship 20 spots on the map below."),
									_("To move the ship you must spend map pieces."),
									_("1 map piece will move the ship between 1 and 3 spots in the map."),
									_("You get one map piece every time you take a shot.")
								]
							}
						},
						daily_special: {
							info_icon: {
								headline: _("Daily special"),
								list: [
									_("Every day of the event there is one special prize hidden among the enemies."),
									_("This prize can be found in any of the spots on the grid - it has no relation to the ships' positions or sink rewards."),
									_("Every time there is a new wave of enemies, you can find the Daily special again. You are not limited to finding this prize once per event day.")
								]
							}
						},
						reset_grid_timer: _("Time until the next wave of enemies arrives."),
						btn_open_shop: _("Get more ammunition"),
						btn_reset_grid: _("Search for a new wave of enemies. This will reset all the spots and ships allowing you to get even more prizes."),
						btn_reset_grid_disabled_no_ammunition: _("You don't have enough ammunition to get a new wave of enemies."),
						btn_reset_grid_disabled_no_progress: _("Unable to find new enemies at this time."),
						btn_spend_shards: _("Spend 1 map piece to move your ship."),
						btn_spend_disabled_no_map_pieces: _("Spend 1 map piece to move your ship."),
						btn_spend_disabled_no_progress: _("Currently unable to progress."),
						player_grid: {
							turn_available: _("Shoot this spot."),
							multiplier_turn_available: function(reward_quantity_multiplier) {
								return s(_("Shoot this spot and receive %1 times the reward you find."),
									reward_quantity_multiplier);
							},
							'turn_unavailable': _("You don't have enough ammunition to take a shot."),
							blocked_inventory: _("You don't have enough event inventory space to take a shot."),
							scouting: _("Scout this spot to see the prize and if there is a ship here.")
						},
						player_grid_spot: {
							uncovered_spot: {
								miss: _("You missed."),
								hit: _("You hit a ship.")
							},
							sea_monster:  _("You have defeated a hydra."),
							big_transporter: _("You have sunk a transport boat."),
							small_transporter: _("You have sunk a fast transport ship."),
							bireme: _("You have sunk a bireme."),
							trireme: _("You have sunk a trireme."),
							demolition_ship: _("You have sunk a fire ship."),
							attack_ship: _("You have sunk a light ship.")
						}
					},
					grand_prize_journey: {
						title: _("Grand prize journey"),
						description: _("How far will this map piece take your fleet?"),
						button: _("Close")
					},
					collected_items_indicator: {
						tooltip: {
							headline: _("Today's ammunition production"),
							description: _("Each day your engineers produce up to 10 bundles of ammunition."),
							drops_left: function (drops_left) {
								return s(ngettext(
									"Today %1 bundle can still be produced. You get ammunition bundles randomly by performing these activities:",
									"Today %1 bundles can still be produced. You get ammunition bundles randomly by performing these activities:",
									drops_left
								), drops_left);
							},
							no_drops_left: _("Today your engineers have already produced the maximum amount of ammunition bundles."),
							activity_list: {
								activity_1: _("Attacking & Defending"),
								activity_2: _("Constructing buildings"),
								activity_3: _("Researching"),
								activity_4: _("Casting divine powers"),
								activity_5: _("Recruiting units")
							}
						}
					},
					reward: {
						sink_reward: {
							title: _("You have destroyed your target!"),
							headline: {
								sea_monster:  _("You have defeated a hydra and found the following reward."),
								big_transporter: _("You have sunk a transport boat and found the following reward."),
								small_transporter: _("You have sunk a fast transport ship and found the following reward."),
								bireme: _("You have sunk a bireme and found the following reward."),
								trireme: _("You have sunk a trireme and found the following reward."),
								demolition_ship: _("You have sunk a fire ship and found the following reward."),
								attack_ship: _("You have sunk a light ship and found the following reward.")
							}
						},
						grand_prize: {
							title: _("Grand prize"),
							headline: _("After a long journey your ships have found a grand reward. Use it wisely."),
							next: __("Adjective. The next item/s|Next")
						},
						daily_special: {
							title: _("Daily special")
						},
						description: _("Collect, use, or discard the reward to continue playing.")
					}
				},
				grid_event_welcome_interstitial: {
					welcome_screen: {
						window_title: _("Aegean Battleships"),
						header: _("Look at the horizon! Ships!"),
						text: _("Enemy ships are getting dangerously close to our shores.<br />Prepare the siege weapons! Get the engineers building as much ammunition as they can, we will need it.<br /><br />We need you to command our siege weapons and find the ships, before they reach our citizens.<br /><br />Every shot counts!"),
						btn_caption: _("Let's go")
					}
				},
				grid_event_end_interstitial: {
					welcome_screen: {
						window_title: _("Aegean Battleships"),
						header: _("Great job captain, the invaders seem to be fleeing!"),
						text: _("Take the fight to them and destroy as many enemy ships as you can before they leave. Our citizens will be forever grateful. Greece will soon be safe from these invaders. But for how long?<br /><br /><i>Dont forget to collect any rewards that are still in the event inventory, before the end of the event.</i>"),
						btn_caption: _("Close")
					}
				},
				player_hints: {
					buy_event_currency: _("Buy ammunition (Aegean Battleships)"),
					settings: {
						collected_items: _("Ammunition bundle (Aegean Battleships)")
					}
				},
				premium: {
					buy_event_currency: {
						confirmation: {
							window_title: _("Buy ammunition"),
							question: function (amount, cost) {
								return s(_("Do you really want to buy %1 ammunition for %2 gold?"), amount, cost);
							}
						}
					},
					grid_event_reset_grid: {
						confirmation: {
							window_title: _("New wave"),
							question: _("Are you sure you want to search for a new wave of enemies?")
						}
					}
				},
				collected_items: {
					button: _("Collect"),
					checkbox: _("Do not show this window again"),
					window_title: _("New ammunition bundle!"),
					text: _("Use the ammunition to participate in the Aegaen Battleships event."),
					headline: _("Your engineers have finished another bundle of ammunition.")
				}
			}
		}
	});
});
