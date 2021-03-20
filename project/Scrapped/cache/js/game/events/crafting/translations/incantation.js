/*global _, DM, ngettext, Game*/

define('events/crafting/translations/incantation', function(require) {
	"use strict";

	var recipes_tab = {
		filter_box_title : _("Show only incantations including:"),
		no_recipes_for_reward : _("Unfortunately you don't know an incantation for this reward yet."),
		no_recipes_for_reward_when_filtered : _("None of your known incantations is matching the current filter settings."),
		buy_recipe : _("Buy incantation"),
		buy_recipe_tooltip : _("Buy a random incantation for this type of reward."),
		buy_recipe_tooltip_disabled : _("You already know all incantations available for this reward."),
		filter_show_available : _("Show incantations with the available offerings"),
		prepare_receipt : _("Perform this incantation and conjure up the reward."),
		cant_prepare_receipt : _("You cannot prepare the required offerings, because you are lacking some of them."),
		random_recipes_title: _("Each player has unique incantations, try different combinations to find the best rewards.")
	};

	DM.loadData({
		l10n : {
			premium: {
				easter_buy_ingredient: {
					confirmation: {
						window_title: "",
						question: ""
					}
				},
				easter_buy_recipe: {
					confirmation: {
						window_title: "",
						question: ""
					}
				}
			},

			easter_skin_incantation: {
				player_hints: {
					settings: {
						easter_collect: _("Collecting new offerings"),
						easter_buy_ingredient: _("Buying offerings for the incantation"),
						easter_buy_recipe: _("Buying incantations")
					}
				},
				premium: {
					easter_buy_ingredient: {
						confirmation: {
							window_title: _("Buy offerings"),
							question: function (cost, ingredient_name) {
								return s(ngettext(
									"Do you really want to buy one additional offering for %1 gold?",
									"Do you really want to buy one additional offering for %1 gold?", cost), cost, ingredient_name);
							}
						}
					},

					easter_buy_recipe: {
						confirmation: {
							window_title: _("Buy incantation"),
							question: function (cost, has_level) {
								var has_level_l10n = _("Please keep in mind that the recipe might be of a random level of that reward."),
									question_l10n = s(ngettext(
										"Do you really want to buy a random incantation for the selected reward for %1 gold?",
										"Do you really want to buy a random incantation for the selected reward for %1 gold?", cost), cost),
									level_info = has_level ? " " + has_level_l10n : "";

								return question_l10n + level_info;
							}
						}
					}
				},
				easter_welcome: {
                    welcome_screen: {
                        window_title: _("Incantation Circle"),
                        header: s(_("Welcome, young apprentice %1!"), Game.player_name),
                        text: _("Ancient spirits roam Greece in these eerie days, allowing you to perform powerful rituals. In dark incantation circles you can conjure powers of immense value.<br>All you need are the required offerings and knowledge of the correct incantations!<br>Please, follow me and let us begin."),
                        btn_caption: _("To the Incantation Circle")
                    }
				},
				easter : {
					window_title: _("Incantation Circle"),
                    tabs: {
                        alchemy: _("Incantation Circle"),
                        recipes: _("Incantations")
                    },
					ranking: {
						info_windows: {
							daily: {
								descr: _("The winner of each daily ranking will not only receive a fantastic reward, but also a rare award. The obtainable reward changes on a daily basis. Simply collect the most Blood Points to win. Every time you perform an incantation, you can earn up to 10 Blood Points.")
							},
							overall: {
								descr: _("The top 10 players in the overall ranking list will receive fantastic, limited bonus rewards as soon as the event ends. The rewards are subdivided by position in the ranking list, meaning that the top 4 players will for example win special attack improvements of different strenghts and absolutely unique awards. Every time you perform an incantation, you can earn up to 10 Blood Points for the rankings.")
							}
						},
						ranking_tooltip: {
							title: _("Ranking info:"),
							description: [
								_("Perform an incantation to receive a reward and Blood Points."),
								_("The blood ranking list does not update automatically, perform an incantation or open the window again to see the current standings."),
								_("When two players manage to get the same score, the decisive factor is who reaches that score first.")
							]
						}
					},
					common: {
						btn_buy_for_gold_tooltip: _("Instantly adds one of the chosen offerings.<br>The gold price will increase by its base price with each new purchase and will reset at midnight."),
						btn_caption: _("To the Incantation Circle")
					},
					alchemy: {
						daily_progress: _("You will randomly receive offerings for the Incantation Circle by performing the following actions in the game:"),
						found_today: _("Offerings found today"),
						tooltips: {
							countdown: _("The event will only be available until the timer runs out. Please make sure that you spend all your offerings before the event ends."),
							question_mark: _("You do not yet know the reward for the chosen incantation."),
							harmony_points: _("Every time you perform an incantation, you can earn up to 10 Blood Points. Collect as many points as possible to climb up the daily and overall rankings.")
						},
						progressbar_tooltip: _("As soon as you have created enough incantations, you will gain special rewards."),
						btn_recipe_tooltip: _("To the incantations"),
						btn_recipe: _("Incantations"),
						tip2: _('Click the "Brew" button!'),
						brew_the_ingredients: _("Conjure"),
						rewards: {
							curator: {
								title: function (threshold) {
									return _("Administrator");
								},
								descr: function (threshold) {
									return s(_("Once you have created %1 rewards, you will get the administrator for 2 weeks for free."), threshold);
								},
								completed: _("Congratulations! You have already obtained that reward.")
							},
							culturelevel: {
								title: function (threshold) {
									return _("Culture Level");
								},
								descr: function (threshold) {
									return s(_("Once you have created %1 rewards, your culture will advance an entire level. Culture points you have already collected for the current level will be transferred over to the next level."), threshold);
								},
								completed: _("Congratulations! You have already obtained that reward.")
							},
							hero: {
								title: function (threshold) {
									return _("Hero Melousa", threshold);
								},
								descr: function (threshold) {
									return s(ngettext(
										"Once you have created %1 reward, you will get the exclusive hero Melousa, including a hero slot.",
										"Once you have created %1 rewards, you will get the exclusive hero Melousa, including a hero slot.",
										threshold), threshold);
								},
								completed: _("Congratulations! You have already obtained that reward.")
							}
						},
						rewards_overlay: {
							hero: {
								title: _("Melousa"),
								descr: _("Congratulations! Melousa joined your ranks as an exclusive hero!")
							},
							coins: {
								title: _("Coins of Heroes"),
								descr: _("Congratulations! You have obtained 30 Coins of War and 30 Coins of Wisdom!")
							},

							curator: {
								title: _("Administrator"),
								descr: _("Congratulations! You got the administrator for two weeks for free!")
							},

							culturelevel: {
								title: _("Culture level"),
								descr: _("Congratulations! Your culture has advanced an entire level!")
							}
						},

						tutorial: {
							window_title: _("The Incantation Circle - Tutorial "),
							step_1: _("Perform an incantation to create a reward for your city. Click on three types of offerings or drag them to the Incantation Circle to start conjuring the reward."),
							step_2: _('Then click on the "Conjure" button to start the Incantation. The incantation will be performed conjuring a surprise reward.'),
							step_3: _("Depending on which types of offerings you had selected, a specific reward will be summoned. You can either use your rewards immediately or store them in your inventory. Every player has their unique incantations for every reward."),
							step_4: _("You can find new offerings by performing common in-game activities like constructing buildings, researching, attacking, recruiting and casting spells."),
							step_5: _("If you try a new combination of offerings, it will be automatically saved in your Incantations. Over time, your collection of incantations will grow and you will be able to perform an incantation with the particular reward you wish to get. Unique incantations are created randomly for each player, so be sure to explore yours."),
							step_6: _("Every time you perform an incantation, you can earn up to 10 Blood Points for the rankings. There is a daily and an overall ranking. The player who collected the most points in the daily ranking list, will receive a special reward for that day. The same applies to the top 10 players of the overall ranking at the end of the event."),
							brew_the_ingredients: _("Conjure"),
							only_show_receipts_containing: recipes_tab.filter_box_title
						}
					},
					recipes: recipes_tab
				},
				easter_collect: {
					window_title: _("New offering found"),
					popup_text: _("You have found a new offering to use in your incantations. Put them on the altar in the Incantation Circle to get rewards for your city."),
					okay_button: _("To the Incantation Circle")
				},

				easter_end_interstitial: {
					welcome_screen: {
						window_title: _("Incantation Circle"),
						header: s(_("Hurry up, young apprentice %1!"), Game.player_name),
						text: _("There is only a short time left for you to perform the dark incantations. Make sure to use all your offerings before the event ends.<br>Also, don’t forget that the winners of the overall ranking list will be determined at 8:00 p.m. servertime on the final day of the event. And now go for it – there are a lot of amazing rewards still to be had from the incantations!"),
						btn_caption: _("To the Incantation Circle")
					}
				}
			}
		}
	});
});
