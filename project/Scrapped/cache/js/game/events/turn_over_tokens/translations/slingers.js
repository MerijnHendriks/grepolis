/* global DM, ngettext, Game */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
            turn_over_tokens_slingers: {
                turnovertokens: {
                    window_title: _("Trial of the Slingers"),
                    tabs: {
                        index: _("The Trial"),
                        sanctuary: _("Egg collection"),
                        shop: _("Shard Shop")
                    },
                    targets: {
                        cavalry: _("Yellow pottery - Destroy to collect Honor Points, Shards and yellow eggs for the yellow collection."),
                        legionary: _("Orange pottery - Destroy to collect Honor Points, Shards and orange eggs for the orange collection."),
                        sapper: _("White pottery - Destroy to collect Honor Points, Shards and white eggs for the white collection."),
                        disabled: _("evaluating ...")
                    },
                    tooltips: {
                        countdown: _("This event is only available for a limited period of time. Please make sure to exchange your Shards and to pick up your rewards for completed collections before the event ends."),
                        event_explanation: _("Note on the event"),
                        arrow_bar: _("Every day at midnight, you get 10 new stones for your ammo pouch and new targets are put up."),
                        kill: function (minpoints, maxpoints) {
                            return s(_("Destroy any pottery for a random chance of earning %1 to %2 Honor Points and Shards."), minpoints, maxpoints);
                        },
                        killed_0: _("Highest number of Shards found"),
                        killed_1: _("Large amount of Shards found"),
                        killed_2: _("Medium amount of Shards found"),
                        killed_3: _("Low amount of Shards found"),
                        battle_tokens: _("Your Shards")
                    },
                    sub_window_quiver_empty: {
                        title: _("Out of Stones!"),
                        main_text: function (playername) {
                            return s(_("%1, you have run out of ammunition. You have to wait until midnight to get more stones."), playername);
                        },
                        second_main_text: _("Or buy +5 new stones now to keep shooting!"),
                        btn_buy_arrow: {
                            arrows_name: _("stones"),
                            active: function (price, baseprice) {
                                return s(_("Buy +5 stones for %1 gold to smash more pottery. The price will increase by its base price of %2 gold with each purchase and it will reset at midnight."), price, baseprice);
                            },
                            inactive: _("You have to shoot at least 5 stones to be able to buy new ammunition.")
                        }
                    },
                    sub_window_reward_presentation: {
                        okay_button: _("Ok"),
                        plus_1: _("+1"),
                        enemy_down: {
                            title: _("Congratulations, bonus loot found!")
                        },
                        tooltips: {
                            trophy: {
                                legionary: _("Orange egg – Destroy more orange pottery to complete your orange egg collection."),
                                cavalry: _("Yellow egg – Destroy more yellow pottery to complete your yellow egg collection."),
                                sapper: _("White egg – Destroy more white pottery to complete your white egg collection.")
                            },
                            arrows: _("Bonus stone received! Prove your skill with it and smash even more pottery!")
                        }
                    },
                    units: {
                        sapper: _("White Eggs"),
                        cavalry: _("Yellow Eggs"),
                        legionary: _("Orange Eggs")
                    },
                    shop_headline: _("Use your Shards to obtain items which will then be stored in your inventory."),
                    shop_not_enough_battle_token: _("You don't have enough Shards to buy this item. Smash more pottery to earn additional Shards."),
                    btn_reset_target: {
                        label: _("New targets"),
                        active: _("<b>New targets </b><br/> You get 15 new targets. This is a great opportunity to smash more pottery, earning you high amounts of Shards and points."),
                        too_poor: _("Earn more Shards to set up new targets or wait until midnight."),
                        inactive: _("Destroy at least one piece of pottery to put up new targets.")
                    },
                    btn_buy_arrow: {
                        arrows_name: _("stones"),
                        active: function (price, baseprice) {
                            return s(_("Buy +5 stones for %1 gold to smash more pottery. The price will increase by its base price of %2 gold with each purchase and it will reset at midnight."), price, baseprice);
                        },
                        inactive: _("You have to shoot at least 5 stones to be able to buy new ammunition.")
                    },
                    complete: _("Complete"),
                    sanctuary: {
                        btn_collect: {
                            label: _("Collect"),
                            tooltip: _("Collect")
                        },
                        cavalry: {
                            main: _("Yellow Egg Collection<br>Destroy more yellow pottery to earn yellow eggs and to complete your yellow egg collection."),
                            completed: _("Yellow Egg Collection completed.")
                        },
                        legionary: {
                            main: _("Orange Egg Collection<br>Destroy more orange pottery to earn orange eggs and to complete your orange egg collection."),
                            completed: _("Orange Egg Collection completed.")
                        },
                        sapper: {
                            main: _("White Egg Collection<br>Destroy more white pottery to earn white eggs and to complete your white egg collection."),
                            completed: _("White Egg Collection completed.")
                        }
                    },
                    tutorial: {
                        btn_ok: _("OK"),
                        step1: _("Greetings, Mentor!<br> Let's start the trial, smash the pottery and make my family proud!<br>Now choose one piece of pottery for me. I will shoot a stone at it with my slingshot and break it as you have shown me."),
                        step2: _("Excellent! You will earn Shards and Honor Points for you and the entire community every time you smash pottery."),
                        step3: _("You and all other mentors of this world collect Honor Points with every shot, in order to jointly unlock the 5 community goals.<br> In addition, coming in at first place in the daily ranking list will grant you an extra powerful reward."),
                        step4: _("Put up 15 new pottery when the remaining targets offer only minor Shards and Honor Points."),
                        step5: _("Every day at midnight, our ammunition pouch will automatically be refilled with 10 new stones. But there is also a chance to find bonus stones when we destroy pottery."),
                        step6: _("What a wonderful egg! Each of the three differently colored pottery comes with its own Egg collection.<br>Complete a collection to gain extra rewards and a special award."),
                        step7: _("This is the place where the eggs of your three collections are kept. To get an egg of a particular color, you have to destroy pottery of the corresponding color."),
                        step8: _("The Shard shop offers you rewards of different value in exchange for your Shards. Check out what it has in store!"),
                        step9: _("My Mentor,<br>I have smashed all pottery! Our constant training made me gather a lot of Shards for us! Thanks to your teaching skills my family will be very proud of us both. <br>I'll be an honorable, great slinger in the Greek army one day.<br><br>I passed the trial with honor.")
                    },
                    all_units_dead: {
                        eliminated: {
                            main_text: _("Pottery destroyed!"),
                            text: _("New targets are put up...")
                        },
                        reset: {
                            main_text: _("Put up new targets!"),
                            text: _("Putting up new targets...")
                        },
                        success: _("New targets in place!")
                    },
                    ranking: {
                        title: {
                            daily: _("Daily Ranking")
                        },
                        name: _("Name"),
                        evaluating: _("evaluating..."),
                        ranking_not_active: _("Ranking is not active any more."),
                        info_windows: {
                            daily: {
                                title: _("Daily Ranking"),
                                descr: _("A fantastic reward and a rare award are in store for the winner of the daily rankings. The reward changes every day.<br>Collect more Honor Points than everybody else to secure first place. Every time you destroy pottery, you receive Honor Points."),
                                header: _("Award for First Place"),
                                header2: _("Today's Reward"),
                                header3: _("Daily Ranking")
                            }
                        },
                        btn_ranking_info: _("Get more information concerning the rewards."),
                        no_results: _("No results yet"),
                        daily_ranking_tooltip: _("Destroy more pottery to collect Honor Points for the Daily Ranking List and the mutual community goals.<br>Each day, the slinger who has collected the most Honor Points will receive a varying reward.<br><br>The ranking list does not update automatically. To see the current points and standings, you can destroy another pottery or simply open the shooting range again. In case there are two or more players with the same score, the winner is decided by who had reached that score first.")
                    }
                },
                assassins_welcome: {
                    welcome_screen: {
                        window_title: _("Trial of the Slingers"),
                        header: _("Prove your skills!"),
                        text: s(_("%1, all Greek families descend from famous warriors who served in the armed forces. So they decided to test their kids' slingshot skills and those of their teachers.<br>In the pursuit of special rewards, the number of Shards of each piece of broken pottery will be testament to the skills of your student and yourself.<br>Exchange them for rewards and complete your rare egg collections."), Game.player_name),
                        btn_caption: _("Take aim!"),
                        animation_text: {
                            slide_0: _("All Greek families pass on their war stories to the next generation."),
                            slide_1: _("You are a master slinger, teaching young Greeks the art of the slingshot."),
                            slide_2: _("You prepare them for their future battles. Make every shot count.")
                        }
                    }
                },
                assassins_end_interstitial: {
                    welcome_screen: {
                        window_title: _("Trial of the Slingers"),
                        header: s(_("Hurry up, %1!"), Game.player_name),
                        text: _("Your slinging skills are outstanding!<br> Remember there is only little time left to destroy more pottery and earn more Shards. Also, don’t forget to spend the Shards and pick up your rewards for completed collections. The event will end soon, so use the shards before the timer runs out!<br>Take aim!"),
                        btn_caption: _("Sling it")
                    }
                },
                assassins_shop_interstitial: {
                    welcome_screen: {
                        window_title: _("Trial of the Slingers"),
                        header: _("Last chance for rewards!"),
                        text: s(_("%1, you are an outstanding teacher and helped your scholar to become an expert with the slingshot.<br> The trial is over, but there is still some time left to exchange your Shards for awesome rewards. Use it wisely as the Shards will be lost once the time is over."), Game.player_name),
                        btn_caption: _("Shard Shop!")
                    }
                },
                player_hints: {
                    buy_arrows: _("Purchase stones (Trial of the Slingers)")
                },
                premium: {
                    assassins_buy_arrows: {
                        confirmation: {
                            window_title: _("Buy stones"),
                            question: function (cost, num, name) {
                                return s(ngettext(
                                    "Do you really want to buy %2 %3 for %1 gold?",
                                    "Do you really want to buy %2 %3 for %1 gold?",
                                    cost), cost, num, name);
                            }
                        }
                    },
                    wnd_not_enough_gold: {
                        descr: {
                            assassins_buy_arrows: _("Unfortunately, you do not have enough gold to buy stones. Do you want to purchase gold now?")
                        }
                    }
                }
            }
		}
	});
}());