/* global DM, ngettext, __ */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
            premium: {
                advent_buy_spin: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                },
                advent_buy_refill: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                }
            },
            advent: {
                player_hints: {
                    settings: {
                        advent_buy_refill: _("Refilling the wheel (Advent Calendar)"),
                        advent_buy_spin: _("Spinning the wheel (Advent Calendar)")
                    }
                },
                premium: {
                    advent_buy_spin: {
                        confirmation: {
                            window_title: _("Spin Wheel of Fortune"),
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
                            window_title: _("Refill Wheel of Fortune"),
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
                    welcome_screen: {
                        window_title: _("Event is ending"),
                        header: "",
                        text: _("Greetings!<br><br>I will soon turn my attention to other matters because the world of mortals is beginning to bore me. I will then no longer reward your prayers. Except perhaps with a smile from Mount Olympus."),
                        btn_caption: _("To the advent calendar")
                    }
                },
                advent_welcome: {
                    welcome_screen: {
                        window_title: _("Tyche's advent calendar"),
                        header: "",
                        text: _("Greetings, ruler!<br><br>I am Tyche, the goddess of fortune. I thought I would once again meddle in the fates of mortals. I will reward you greatly should you send me your prayers each day!"),
                        btn_caption: _("To the advent calendar")
                    }
                },
                advent: {
                    window_title: _("Tyche's advent calendar"),
                    tabs: {
                        index: ""
                    },
                    welcome_screen: {
                        window_title: _("Tyche's advent calendar"),
                        header: _("Greetings, mortal."),
                        text: _("I - Tyche, the Goddess of fortune - have chosen you to take my unique offer. On a mountain, not far from your town, you will find a sacred tree. You can pray to me from there, which shall reward you greatly!"),
                        btn_caption: _("Open calendar")
                    },
                    refill: _("Refill the wheel"),
                    pins_tooltips: {
                        current_day: _("Opens the Wheel of Fortune for the selected day"),
                        collect_reward: _("This wheel holds a reward which you have not collected yet."),
                        buy_spin: _("You can get more rewards from this wheel by spending gold."),
                        no_more_spins: _("You have already collected all rewards from this wheel, however you can refill it by spending some gold."),
                        free_spin: _("Free spin!")
                    },
                    advisors_tooltips: _("Collect the five winter crystals from the Wheels of Fortune to make use of the services of all five advisors for one week for free. This reward can be received only once."),
                    advisors_tooltips_unlocked: _("You have already collected the five winter crystals needed and got all advisors for one week free of charge."),
                    hero_tooltip: _("Collect the five winter crystals from the Wheels of Fortune to get the new exclusive hero. This reward can be received only once."),
                    percentage_tooltip: _("The chances on the wheel are recalculated every time a reward is collected. The percentages shown will not display decimal values but they are taken into account when the spin is made."),
                    hero_tooltip_unlocked: _("You have already collected the five winter crystals needed and got the new exclusive hero."),
                    buttons: {
                        btn_spin_part1: _("Free spin!"),
                        btn_spin_part2: _("Click here to win a random reward from this Wheel of Fortune."),
                        btn_stop: _("Stop"),
                        btn_spin_for_gold_part1: _("Spin for gold"),
                        btn_spin_for_gold_part2: function (cost) {
                            return s(ngettext(
                                "By spending %1 gold you will receive an additional reward from this Wheel of Fortune.",
                                "By spending %1 gold you will receive an additional reward from this Wheel of Fortune.",
                                cost), cost);
                        },
                        btn_refill_free: __("Zero Cost|Free")
                    },
                    advisors: {
                        ok: _("Ok"),
                        header: _("Congratulations"),
                        subheader: _("Advisors obtained"),
                        description: _("Well done! You have collected the five rare winter crystals. Therefore you are rewarded with all five advisors one week for free.")
                    },
                    hero: {
                        subheader: _("Hero unlocked"),
                        description: _("Well done! You have collected the five winter crystals you will be rewarded with the gift of life. The new exclusive hero shall be at your service.")
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