/* global DM, ngettext, __ */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
			hercules2014: {
				window_title: _("Sparta vs Hades"),
				welcome_screen: {
					window_title: _("Sparta vs Hades"),
					header: _("Greetings! I am Lysander of Sparta."),
					text: _("You called for my services as war is upon us. The dead have amassed in Hades’ realm of darkness for too long and now Hades has sent them forth through one of his portals, to spread chaos and destruction. All Spartan warriors will follow your command. Rid our beautiful islands of these dreadful creatures and close the ominous portal that Hades has opened to release them.<br>You order, we follow!"),
					btn_caption: _("Assume command")
				},
				tooltips: {
					countdown: _("This event is only available for a limited time. Please make sure that you collect all earned rewards before the event ends."),
					attack_button: _("Send the selected units into battle."),
					attack_button_disabled: _("You must select some units before you can attack the enemy."),
					artillery: _("Spartan Captain"),
					artillery_description: _("The Captain boosts your soldiers’ morale and they will fight with 20% additional strength."),
					attack_button_only_hero: _("The Captain can only support an attack. You also need to select some regular units."),
					hercules_portrait: _("The Captain boosts your soldiers’ morale and they will fight with 20% additional strength."),
					hercules_cooldown_bar: _("After his last charge the Captain needs to rest. It will take a while before he is fit to fight again."),
					hercules_instant_heal: function (cost) {
						return s(_("Pay %1 gold to get the Captain ready for action right away. The price will increase by its base price with each new purchase and will then reset at midnight."), cost);
					},
					units_healthy: _("Units ready to fight:"),
					units_damaged: _("Wounded units:"),
					units_total: _("Total units:"),
					special_boost_headline: _("Special Boost"),
					buy_mercenaries: function (cost, name) {
						return s(ngettext(
							"Add 100 additional %2 to your attacking army for %1 gold. The price will increase by its base price with each new purchase and will then reset at midnight.",
							"Add 100 additional %2 to your attacking army for %1 gold. The price will increase by its base price with each new purchase and will then reset at midnight.",
							cost), cost, name);
					},
					healing_bar: function (time) {
						return s(_("Every %1, a healer will visit your soldier's camp to tend to the wounded troops so they can go into battle again"), time);
					},
					buy_healer: function (cost) {
						return s(ngettext(
							"Call the healer immediately for %1 gold to make all wounded soldiers fit for combat. The price will increase by its base price with each purchase and it will reset at midnight.",
							"Call the healer immediately for %1 gold to make all wounded soldiers fit for combat. The price will increase by its base price with each purchase and it will reset at midnight.",
							cost), cost);
					},
					cant_buy_healer: _("There is no need to call the healer as all soldiers are fit for combat."),
					daily_amount_box_empty: _("Each day up to 10 squads of Spartan soldiers can join your army. Today you have already received the maximum number of squads."),
					daily_amount_box: function (amount_left) {
						return s(ngettext(
							"Each day up to 10 squads of Spartan soldiers can join your army. Today, %1 group of soldiers can still join. You get them randomly by performing these activities:",
							"Each day up to 10 squads of Spartan soldiers can join your army. Today, %1 groups of soldiers can still join. You get them randomly by performing these activities:",
							amount_left), amount_left);
					},
					activities: {
						attack: _("Attacking & Defending"),
						construct: _("Constructing buildings"),
						research: _("Researching"),
						casting: _("Casting of divine powers"),
						recruit: _("Recruiting of units"),
						big_window: _("Maximize window size"),
						small_window: _("Default window size")
					}
				},
				buy_unit: _("Buy 100"),
				enemies: {
					unit_1: _("Swordsmen of Hades"),
					unit_2: _("Archers of Hades"),
					unit_3: _("Slingers of Hades"),
					unit_4: _("Riders of Hades"),
					unit_5: _("Hoplites of Hades")
				},
				stage: _("Battleground"),
				enemy_units_on_stage: _("Enemies on this battleground:"),
				found_today: _("Today's reinforcements"),
				stage_cooldown: _("Time until new enemies arrive:"),
				stage_window_title_cooldown: _("New enemies will arrive soon!"),
				instant_heal: _("Heal all"),
				instant_ammo: _("Summon captain"),
				getting_ammo: _("Captain returns in"),
				wounded: _("Wounded"),
				available: _("Available"),
				physician: _("Healer"),
				my_army: _("My army"),
				enemy_army: _("Enemy army"),
				attack: _("Attack"),
				reward: _("Reward:"),
				rewards: _("Rewards:"),
				onetime_reward: _("One-Off Reward:"),
				onetime_rewards: _("One-Off Rewards:"),
				onetime_once: _("This reward can only be received once."),
				onetime_culture: _("<b>Culture Level</b><br>As soon as you have conquered this battleground for the first time, your culture will advance an entire level. Culture points you have already collected for the current level will be transferred over to the next level."),
				plus_20: _("+20%"),
				hercules: _("The Captain boosts your soldiers’ morale and they will fight with 20% additional strength."),
				unit_bonus: function (bonus) {
					return s(_("<b>+%1%</b> damage against:"), bonus);
				},
				prev: _("previous"),
				next: _("next"),
				close: _("close"),
				event_explanation: _("Event explanation"),
				battle: {
					caption_army: _("Select the units you want to send into battle"),
					caption_hercules_cooldown: _("Captain is not ready"),
					caption_hercules_ready: _("Let your Captain lead the charge for +20% combat power!")
				},
				sub_window_fight_result: {
					main_title: {
						defeat: _("Defeat!"),
						victory: _("Victory!")
					},
					sub_title: {
						defeat: function (rewards_count) {
							return s(ngettext(
								"Missed reward:",
								"Missed rewards:",
								rewards_count), rewards_count);
						},
						victory: function (rewards_count) {
							return s(ngettext(
								"Your reward:",
								"Your rewards:",
								rewards_count), rewards_count);
						}
					},
					btn_retry: _("Try again"),
					your_army: _("Your army"),
					enemy_army: _("Enemy army"),
					luck: _("Luck:"),
					hercules: _("Captain:"),
					bottom_line: _("Click on the reward to collect it now, or close the window and collect it later."),
					onetime_once: _("This reward can only be received once."),
					onetime_culture: _("<b>Culture Level</b><br>As soon as you have conquered this battleground for the first time, your culture will advance an entire level. Culture points you have already collected for the current level will be transferred over to the next level.")
				},
				sub_window_last_stage: {
					title: _("Victory over Hades"),
					okay: _("OK"),
					hero_world: {
						main_text: _("<b>Congratulations, Commander!</b><br>You finally closed Hades’ dark portal. You have been victorious against his corrupted hordes. You have led the Spartan army in an epic campaign and saved the world of the living from certain doom.<br>Word of your deeds has spread far and wide, bringing you new subjects and rewards."),
						hero_text: _("Hero"),
						culture_text: _("Culture level")
					},
					normal_world: {
						main_text: _("<b>Congratulations, Commander!</b><br>You finally closed Hades’ dark portal. You have been victorious against his corrupted hordes. You have led the Spartan army in an epic campaign and saved the world of the living from certain doom.<br>The citizens throughout the realm praise your name."),
						culture_text: _("Culture level")
					}
				},
				ranking: {
					title: {
						daily: _("Daily Ranking"),
						overall: _("Overall Ranking")
					},
					name: _("Name"),
					evaluating: _("evaluating..."),
					ranking_not_active: _("Ranking is not active any more."),
					info_windows: {
						daily: {
							title: _("Daily Ranking"),
							descr: _("The winner of each daily ranking will not only receive a great reward, but also a rare award. The reward you can win will change on a daily basis. Simply collect the most Honor Points to win. Every time you win a fight on a battleground, you can earn up to 10 Honor Points."),
							header: _("Award for First Place"),
							header2: _("Today's Reward"),
							header3: _("The Daily Ranking")
						},
						overall: {
							title: _("Overall Ranking"),
							descr: _("At the end of the event, the top 10 alliances in the overall event ranking will receive fantastic, limited bonus rewards. " +
								"Each time you defeat one of the event battlegrounds you will earn points which contribute towards the event ranking. " +
								"If a player leaves an alliance during the course of the event, all points from this player will be deducted from their old alliance's total ranking points. " +
								"When a player with points joins an alliance, their points will only be added to the new alliance's total 24 hours after they have joined. "),
							header: _("Unique Rewards for the Top 10 Alliances")
						}
					},
					no_results: _("No results yet"),
					daily_ranking_tooltip: _("Prevail on the fields of battle to earn Honor Points and a reward. Every day there is a different reward for the commander with the most Honor Points.<br><br>The ranking list does not update automatically. Triumph in a battle or open the event map again to see the current standings. In case there are two players with the same score, the decisive factor is who had reached that score first.")
				}
			},
			hercules2014_collect: {
				window_title: _("Soldiers have joined you"),
				descr: _("A new squad of soldiers has arrived. They will reinforce your army and assist you in battle."),
				btn_close_window: _("To the Battleground"),
				btn_close_window_tooltip: _("To the Battleground")
			},
			tutorial: {
				okay: _("OK"),
				prev: _("Previous"),
				next: __("Adverb. Go to the next screen|Next"),
				close: _("Close"),
				1: _("Spartan brothers? Yes! Buried outside of the city years ago they rose again. Cold and dead they tried to cut their way through our ranks on behalf of Hades. We gave them eternal peace."),
				2: _("Excellent, Commander!<br>We quickly finished off that rotten pack of pale slingers that had burned the farms nearby. We have also found a number of advanced swords at the old forge, which our Swordsmen can use.<br><strong>Your Spartan Swordsmen gain a +2 bonus on their combat power.</strong>"),
				3: _("This was the first real test for our soldiers. Fighting in the streets of Mycenae and driving back the invading creatures sent by Hades got our blood boiling."),
				4: _("In an age long gone, these brave men were slain by the Harpies in the valley. Now decayed, they have fought another brave battle today but could not withstand our Spartan brothers."),
				5: _("Hundreds of undead warriors crawled out of this ancient Necropolis, heeding the call of Hades. After we slaughtered all of them, we searched the Necropolis and found some advanced shields for our Hoplites.<br><strong>Your Spartan Hoplites gain a +2 bonus on their combat power.</strong>"),
				6: _("This city was one of the first to fall into the hands of Hades' undead hordes. We were facing the empty eyes of the city’s former army. They put up a good fight, but we have prevailed once more.<br><strong>Your Spartan Slingers gain a +2 bonus on their combat power.</strong>"),
				7: _("We crossed the waters with small transport boats and attacked the undead creatures from the sea. They quickly fell under our swords and we were able to secure parts of the harbor."),
				8: _("Thousands of warriors from the Underworld were waiting for us. Now they lie shattered on the rocks of that reef. Looting the shipwreck, we found a few highly accurate Persian bows.<br><strong>Your Spartan Archers gain a +2 bonus on their combat power.</strong>"),
				9: _("We had to fight for our lives the moment we left our ships. The black sand beach was swarmed by undead warriors. We gave them hell."),
				10: _("From the ancient temple a beam of mythical light shone while a stream of foul creatures fell upon us with a piercing battle cry. Even the gods will remember this day!"),
				11: _("We fought our way up a rocky path. The constant sound of arrows and stones shattering our shields rang in our ears. Finally we beat the enemy at the crossing of the purple river.<br><strong>Your Spartan Riders get a +3 bonus on their combat power.</strong>"),
				battleground: _("Greetings, Commander! Select an available battleground to attack it with your soldiers."),
				attacking: _("When attacking, you can only send a limited number of troops into battle. Consider their individual strengths and weaknesses!"),
				attack_again: _("Our troops were unable to defeat the enemy with the first attempt. Attack again to crush the remaining forces."),
				collect_troops: _("New soldiers will join your ranks by performing common in-game activities like constructing buildings, research, attacks, recruiting, and casting spells."),
				you_won: _("Well done, you have won the battle. You may now claim your reward or come back later and collect it."),
				honor_points: _("As the victor you will also receive 1-10 Honor Points for the ranking lists and can proceed to attack the next battleground. Enemy troops will again populate battlegrounds where you have already won."),
				ranking: _("Collect Honor Points for the daily and overall rankings. The top players will be handed extra rewards."),
				hero: _("Well done! You already won on two battlegrounds, you are a born commander. Destroy all enemies at <b>Battleground 33: The ominous Portal of Hades</b> to get this exclusive hero for your empire:"),
				wounded_units: _("Some of your units were wounded during the battle. You can use the healer to bring them back into the fight."),
				heal_all: _("Heal all")
			},
			hercules2014_end_interstitial: {
				window_title: _("Sparta vs Hades"),
				welcome_screen: {
					window_title: _("Sparta vs Hades"),
					header: _("Hail, Commander!"),
					text: _("I see that our war against Hades is making excellent progress. Thanks to the blades of your brave Spartans, we drive back his undead hordes. My spies report that Hades prepares to retreat into the Underworld soon. Attack him once more with full force! Earn your deserved triumph and eternal glory! Destroy as many of his Undead as possible!<br /><br /><b>Please keep in mind to pick up your rewards on the battlegrounds before Hades withdraws into the Underworld and the event ends.</b>"),
					btn_caption: _("Back to the Battle")
				}
			},
			premium: {
				hercules2014_buy_mercenary: {
					confirmation: {
						window_title: _("Buy soldiers"),
						question: function (cost, name) {
							return s(ngettext(
								"Do you really want to buy 100 %2 for %1 gold?",
								"Do you really want to buy 100 %2 for %1 gold?",
								cost), cost, name);
						}
					}
				},
				hercules2014_buy_healer: {
					confirmation: {
						window_title: _("Buy Healer"),
						question: function (cost) {
							return s(_("Do you really want to call the healer for %1 gold to make all soldiers instantly fit for combat?"), cost);
						}
					}
				},
				hercules2014_heal_hercules: {
					confirmation: {
						window_title: _("Summon captain"),
						question: function (cost) {
							return s(_("Pay %1 gold to get the Captain fit again?"), cost);
						}
					}
				},
				common: {
					wnd_not_enough_gold: {
						descr: {
							hercules2014_buy_mercenary: _("Unfortunately, you do not have enough gold to buy soldiers. Do you want to purchase gold now?"),
							hercules2014_buy_healer: _("Unfortunately, you do not have enough gold to pay the healer. Do you want to purchase gold now?"),
							hercules2014_heal_hercules: _("Unfortunately, you don't have enough gold to summon the Captain. Do you want to buy gold now?")
						}
					}
				}
			},
			player_hints: {
				settings: {
					hercules2014_buy_mercenary: _("Buying Spartan soldiers (Event)"),
					hercules2014_buy_healer: _("Calling a Healer (Event)"),
					hercules2014_heal_hercules: _("Captain's Charge (Event)")
				}
			}

		}
	});
}());
