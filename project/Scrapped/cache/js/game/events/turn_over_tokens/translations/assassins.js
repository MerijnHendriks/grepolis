/* global DM, ngettext, Game */

(function () {
    "use strict";

    DM.loadData({
        l10n: {
            turnovertokens: {
                window_title: _("Spartan Assassins"),
                tabs: {
                    index: _("Battlefield"),
                    sanctuary: _("Trophies"),
                    shop: _("Battle Token shop")
                },
                targets: {
                    cavalry: _("Cavalry – Defeat to collect Honor Points, Battle Tokens and Cavalry Trophies."),
                    legionary: _("Legionnaire – Defeat to collect Honor Points, Battle Tokens and Legionnaire Trophies."),
                    sapper: _("Sapper – Defeat to collect Honor Points, Battle Tokens and Sapper Trophies."),
                    disabled: _("evaluating ...")
                },
                tooltips: {
                    countdown: _("This event is only available for a limited period of time. Please make sure to exchange your Battle Tokens and to pick up your rewards for completed collections before the event ends."),
                    event_explanation : _("Note on the event"),
                    arrow_bar: _("Every day at midnight, 10 new arrows are placed in your quiver and a new battlefield is generated."),
                    kill: function (minpoints, maxpoints) {
                        return s(_("Eliminate any Roman to have a random chance of earning %1 to %2 Honor Points and Battle Tokens."), minpoints, maxpoints);
                    },
                    killed_0 : _("Eliminated tribune"),
                    killed_1 : _("Eliminated centurion"),
                    killed_2 : _("Eliminated soldier"),
                    killed_3 : _("Eliminated recruit"),
                    battle_tokens: _("Your battle tokens")
                },
                sub_window_quiver_empty : {
                    title: _("Quiver empty!"),
                    main_text : function (playername) {
                        return s(_("%1, your assassins have run out of arrows. You can wait until tomorrow for the quiver to get refilled."), playername);
                    },
                    second_main_text: _("Buy 5 new arrows now to keep fighting!"),
                    btn_buy_arrow: {
                        arrows_name: _("arrows"),
                        active: function (price, baseprice) {
                            return s(_("Buy 5 arrows for %1 gold to shoot enemies on the battlefield. The price will increase by its base price (%2 gold) with each purchase and it will reset at midnight."), price, baseprice);
                        },
                        inactive: _("You have to shoot at least 5 arrows to be able to buy new arrows.")
                    }
                },
                sub_window_reward_presentation : {
                    okay_button : _("Ok"),
                    plus_1 : _("+1"),
                    enemy_down : {
                        title : _("Congratulations, bonus loot found!")
                    },
                    tooltips : {
                        trophy : {
                            legionary: _("Legionnaire Trophy – Defeat more legionnaires to complete your legionnaire collection."),
                            cavalry: _("Cavalry trophy - Defeat more cavalrymen to complete your cavalry collection."),
                            sapper : _("Sapper trophy - Defeat more sappers to complete your sapper collection.")
                        },
                        arrows : _("Bonus arrow received! Take down more Roman soldiers with it.")
                    }
                },
                units: {
                    sapper: _("Sapper"),
                    cavalry: _("Cavalry"),
                    legionary: _("Legionary")
                },
                shop_headline : _("You can use your Battle Tokens to activate rewards for your city or store them in your inventory."),
                shop_not_enough_battle_token : _("You don't have enough battle tokens in order to buy this item. Shoot soldiers on the battleground to earn more battle tokens."),
                btn_reset_target: {
                    label: _("New targets"),
                    active: _("<b>New tactical targets </b><br/> You get 15 new targets. This is a great opportunity to eliminate more Roman soldiers with the highest point values."),
                    too_poor: _("Earn more Battle Tokens to take aim at new targets or wait until tomorrow."),
                    inactive: _("Eliminate at least one of those enemies to change position and get new targets.")
                },
                btn_buy_arrow: {
                    arrows_name: _("arrows"),
                    active: function (price, baseprice) {
                        return s(_("Buy 5 arrows for %1 gold to shoot enemies on the battlefield. The price will increase by its base price (%2 gold) with each purchase and it will reset at midnight."), price, baseprice);
                    },
                    inactive: _("You have to shoot at least 5 arrows to be able to buy new arrows.")
                },
                complete: _("Complete"),
                sanctuary: {
                    btn_collect: {
                        label: _("Collect"),
                        tooltip: _("Collect")
                    },
                    cavalry: {
                        main: _("Cavalry Collection<br>Defeat more cavalrymen to earn cavalry trophies and to complete your collection."),
                        completed: _("Cavalry collection completed")
                    },
                    legionary: {
                        main: _("Legionnaire Collection <br>Defeat more legionnaires to earn legionnaire trophies and to complete your collection."),
                        completed: _("Legionary collection completed")
                    },
                    sapper: {
                        main: _("Sapper Collection <br>Defeat more sappers to earn sapper trophies and to complete your collection."),
                        completed: _("Sapper collection completed")
                    }
                },
                tutorial: {
                    btn_ok: _("OK"),
                    step1: _("Greetings, mighty ruler!<br> Let our community stand together and defeat the Roman invaders! Now choose one of the enemy warriors and I will assassinate him for you.<br> You command, we follow!"),
                    step2: _("Excellent! You will earn Battle Tokens and Honor Points for you and the entire community every time a Roman warrior is defeated."),
                    step3: _("You and all other rulers of this world collect Honor Points with every shot, in order to jointly unlock the 5 community goals.<br> In addition, coming in at first place in the daily ranking list will grant you an extra powerful reward."),
                    step4: _("Order us to aim at 15 new warriors once the remaining targets only offer minor Battle Tokens and Honor Points."),
                    step5: _("Every day at midnight, the quiver will automatically be refilled with 10 new arrows. But there is also a chance to find bonus arrows when you defeat an enemy."),
                    step6: _("What a wonderful trophy! Each of the three troop types has its own collection.<br>Complete a collection to gain extra rewards and a special award."),
                    step7: _("This is the place, where the trophies of your collections are kept. To get your hands on a trophy of a particular armor collection, you have to assassinate warriors of the corresponding troop type."),
                    step8: _("The Battle token shop offers you rewards of different value in exchange for battle tokens. Check out what is in store for you!"),
                    step9: _("Commander,<br>we have defeated the Roman legions! Our constant attacks made them run back to their ships like scared rabbits. Thanks to your leadership we were able to thwart the invasion! <br>We have saved Greece!<br><br>In case you ever need our services again, simply call us.<br>You command, we follow.")
                },
                all_units_dead: {
                    eliminated: {
                        main_text: _("Targets eliminated!"),
                        text: _("Looking for enemies ...")
                    },
                    reset: {
                        main_text: _("Change of position!"),
                        text: _("Looking for new targets ...")
                    },
                    success: _("New targets were found!")
                },
                ranking : {
                    title : {
                        daily : _("Daily Ranking")
                    },
                    name : _("Name"),
                    evaluating : _("evaluating..."),
                    ranking_not_active : _("Ranking is not active any more."),
                    info_windows : {
                        daily : {
                            title : _("Daily Ranking"),
                            descr : _("A fantastic reward and a rare award are in store for the winner of the daily rankings. The reward changes each day.<br>Collect more Honor Points than everybody else to secure first place. Every time you assassinate a Roman warrior, you receive Honor Points."),
                            header : _("Reward for First Place"),
                            header2 : _("Today's Reward"),
                            header3 : _("Daily Ranking")
                        }
                    },
                    btn_ranking_info: _("Get more information concerning the rewards."),
                    no_results : _("No results yet"),
                    daily_ranking_tooltip : _("Take down Roman invaders to collect Honor Points for the Daily Ranking List and the mutual community goals. Each day, the assassin who has gathered the most Honor Points will receive a varying reward.<br><br>The ranking list does not update automatically. To see the current points and standings, you can eliminate another Roman warrior or simply open the battlefield again. In case there are two or more players with the same score, the winner is decided by who had reached that score first.")
                }
            },
            assassins_welcome : {
                welcome_screen: {
                    window_title: _("Spartan Assassins"),
                    header: _("The island empires are under attack!"),
                    text: s(_("%1, Roman legions have arrived on our shores in great numbers!<br> They are marching against the cities of Greece!<br>All you rulers of this world have to unite your forces to stop them. The League of Assassins stands ready to help you and the other rulers to defeat the enemies.<br>You command, we follow!"), Game.player_name),
                    btn_caption: _("Issue orders"),
                    animation_text: {
                        slide_0: _("A large fleet of roman soldiers has arrived on our shores!"),
                        slide_1: _("They are marching against the cities of Greece!"),
                        slide_2: _("Unite the assassins and stop the invasion.")
                    }
                }
            },
            assassins_end_interstitial: {
                welcome_screen : {
                    window_title: _("Spartan Assassins"),
                    header : s(_("Hurry up, %1!"), Game.player_name),
                    text : _("You fought well, the Romans are already retreating!<br>There is only little time left to take down more Romans troops. Also, don’t forget to spend your Battle Tokens and to pick up the rewards for completed collections.<br>You command, we follow!"),
                    btn_caption : _("Issue orders")
                }
            },
            assassins_shop_interstitial: {
                welcome_screen: {
                    window_title: _("Spartan Assassins"),
                    header: _("Last chance for rewards!"),
                    text: s(_("%1, you are an outstanding warrior and have bested many Roman invaders today.<br> The Romans are defeated, but there is still some time left to exchange your Battle tokens for awesome rewards. Use it wisely as the Tokens will be lost once the time is over."), Game.player_name),
                    btn_caption: _("Battle Token Shop!")
                }
            },
            player_hints: {
                buy_arrows: _("Purchase arrows (Spartan Assassins)")
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
                        assassins_buy_arrows: _("Unfortunately, you do not have enough gold to buy arrows. Do you want to purchase gold now?")
                    }
                }
            }
        }
    });
}());
