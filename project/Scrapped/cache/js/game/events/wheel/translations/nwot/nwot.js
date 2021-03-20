/* globals DM, ngettext, Game, __ */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
			nwot: {
				player_hints: {
					settings: {
						advent_buy_refill: _("Refilling the wheel (Nature's Wheel of Time)"),
                        advent_buy_spin: _("Spinning the wheel (Nature's Wheel of Time)")
					}
				},
				premium: {
					advent_buy_spin: {
						confirmation: {
							window_title: _("Spin Wheel of Time"),
							question: function (cost) {
								return s(ngettext(
									"Are you sure you want to spin the wheel for %1 gold to get a reward?",
									"Are you sure you want to spin the wheel for %1 gold to get a reward?",
									cost), cost);
							}
						}
					},
					advent_buy_refill: {
						confirmation: {
							window_title: _("Refill Wheel of Time"),
							question: function (cost) {
								return s(ngettext(
									"Are you sure you want to refill the wheel with all its rewards for %1 gold ?",
									"Are you sure you want to refill the wheel with all its rewards for %1 gold ?",
									cost), cost);
							}
						}
					}
				},
				advent_end_interstitial: {
					window_title: _("End of Time"),
					welcome_screen: {
						window_title: _("End of Time"),
						header: "",
						text: _("Greetings my Friend!<br><br>You have done well so far turning back the time in this corrupted land. I will soon leave this place. The wheel of time will leave this world with me, so make sure you take the rewards i placed there for you.<br> So long farewell. Turn back the time and bring my lady of the forest back to life."),
						btn_caption: _("To nature's wheel of time")
					}
				},
                advent_welcome: {
					window_title: _("Nature's Wheel of Time"),
					welcome_screen: {
						window_title: _("Nature's Wheel of Time"),
						header: "",
						text: s(_("Greetings %1 my mortal friend.<br><br>I am Chronos and you shall help me redeem this place from the corruption that has befallen it. This sacred glade has been taken from nature's control a long time ago. Even the beautiful lady of the forest has been turned into stone. But you, you will restore her. <br>Spin nature's wheel of time to restore this place in time."), Game.player_name),
						btn_caption: _("To nature's wheel of time")
					}
				},
				advent: {
					window_title: _("Nature's Wheel of Time"),
					tabs: {
						index: ""
					},
					welcome_screen: {
						window_title: _("Nature's Wheel of Time"),
						header: s(_("Greetings %1 my mortal friend."), Game.player_name),
						text: _("I am Chronos and you shall help me redeem this place from the corruption that has befallen it. This sacred glade has been taken from nature's control a long time ago. Even the beautiful lady of the forest has been turned into stone. But you, you will restore her. <br>Spin nature's wheel of time to restore this place in time."),
						btn_caption: _("To nature's wheel of time")
					},
					refill: _("Refill the wheel"),
					pins_tooltips: {
						current_day: _("Displays the wheel of time for the selected day"),
						collect_reward: _("This wheel holds a reward which you have not collected yet."),
						buy_spin: _("You can get more rewards from this wheel by spending gold."),
						no_more_spins: _("You have already collected all rewards from this wheel, however you can refill it by spending some gold."),
						free_spin: _("Free spin!")
					},
					advisors_tooltips: _("Collect the five sacred branches from the wheels of time to make use of the services of all five advisors for one week for free. This reward can be received only once."),
					advisors_tooltips_unlocked: _("You have already collected the five sacred branches needed and got all advisors for one week free of charge."),
					hero_tooltip: _("Collect the five sacred branches from the wheels of time to get the new exclusive hero. This reward can be received only once."),
					percentage_tooltip: _("The chances on the wheel are recalculated every time a reward is collected. The percentages shown will not display decimal values but they are taken into account when the spin is made."),
					hero_tooltip_unlocked: _("You have already collected the five sacred branches needed and got the exclusive hero."),
					buttons: {
						btn_spin_part1: _("Free spin!"),
						btn_spin_part2: _("Click here to win a random reward from this wheel of time."),
						btn_stop: _("Stop"),
						btn_spin_for_gold_part1: _("Spin for gold"),
						btn_spin_for_gold_part2: function (cost) {
							return s(ngettext(
								"By spending %1 gold you will receive an additional reward from this wheel.",
								"By spending %1 gold you will receive an additional reward from this wheel.",
								cost), cost);
						},
						btn_refill_free: __("Zero Cost|Free")
					},
					advisors: {
						ok: _("Ok"),
						header: _("Congratulations"),
						subheader: _("Advisors obtained"),
						description: _("Well done! You have collected the five rare sacred branches. Therefore you are rewarded with all five advisors one week for free.")
					},
					hero: {
						subheader: _("Hero unlocked"),
						description: _("Well done! You have collected the five sacred branches you will be rewarded with the gift of life. The new exclusive hero shall be at your service.")
					},
					countdown_tooltip: _("The event will end after the indicated time has run out. Please make sure that you have collected all pending rewards before."),
					all_shards_collected: _("Congratulations! You get one week of free services from your advisors."),
					all_shards_collected_hero: _("Congratulations! You earned yourself the new exclusive hero."),
					tooltips: {
						refill: _("Refill the wheel with all of its rewards now!<br><br>The price for this feature increases by its base price after each use. However, it resets at midnight."),
						remaining: _("You are unable to refill this wheel right now because all the rewards are still available."),
						blocked: _("You cannot refill this wheel right now because you can still claim a reward.")
					}
				}
			}
		}
	});
}());