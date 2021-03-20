/* global DM, ngettext, Game */

define('events/crafting/translations/easter_hen', function(require) {
	"use strict";

	DM.loadData({
		l10n: {
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

			easter_skin_easter_hen: {
				player_hints: {
					settings: {
						easter_collect: _("Collecting new feed (Easter event)"),
						easter_buy_ingredient: _("Buying feed for the hen (Easter event)"),
						easter_buy_recipe: _("Buying recipes (Easter event)")
					}
				},
				premium: {
					easter_buy_ingredient: {
						confirmation: {
							window_title: _("Buy feed for the hen"),
							question: function (cost, ingredient_name) {
								return s(ngettext(
									"Do you really want to buy one additional chunk of this feed type for %1 gold?",
									"Do you really want to buy one additional chunk of this feed type for %1 gold?",
									cost), cost, ingredient_name);
							}
						}
					},
					easter_buy_recipe: {
						confirmation: {
							window_title: _("Buy recipe"),
							question: function (cost) {
								return s(ngettext(
									"Do you really want to buy a random recipe for the selected reward for %1 gold?<br><br>Please keep in mind that the recipe might be of a random level of that reward.",
									"Do you really want to buy a random recipe for the selected reward for %1 gold?<br><br>Please keep in mind that the recipe might be of a random level of that reward.",
									cost), cost);
							}
						}
					}
				},
				easter_welcome: {
                    welcome_screen: {
                        window_title: _("The Mythical Hen"),
                        text: _("In one of his adventures, the hero Jason has captured a Mythical Hen and gave it to you as a gift. He found out that the hen is able to lay magical eggs at a certain time of the year. In your wisdom you have hidden the hen from the eyes of the people - until today... You know that now the time has come to feed her the right ingredients, so she may lay her magical eggs containing the most powerful rewards in Ancient Greece. Good luck!"),
                        btn_caption: _("To the Mythical Hen")
                    }
				},
				easter: {

					window_title: _("Easter event"),
                    tabs: {
                        alchemy: _("Mythical Hen"),
                        recipes: _("Recipe Book")
                    },
					ranking: {
						info_windows: {
							daily: {
								descr: _("The winner of each daily ranking will not only receive a fantastic reward, but also a rare award. The obtainable reward changes on a daily basis. Simply collect the most Harmony Points to win. Every time you feed your hen, you can earn up to 10 Harmony Points.")
							},
							overall: {
								descr: _("The top 10 players in the overall ranking list will receive fantastic, limited bonus rewards as soon as the event ends. The rewards are subdivided by position in the ranking list, meaning that the top 4 players will for example win special attack improvements of different strengths and absolutely unique awards. Every time you feed your hen, you can earn up to 10 Harmony Points for the rankings.")
							}
						},
						ranking_tooltip: {
							title: _("Ranking info:"),
							description: [
								_("Feed the hen to receive a reward and Harmony Points."),
								_("The ranking list does not update automatically. Feed the hen or open the window again to see the current standings."),
								_("When two players manage to get the same score, the decisive factor is who reaches that score first.")
							]
						}
					},
					common: {
						btn_buy_for_gold_tooltip: _("Instantly adds one more chunk of the chosen feed.<br>The gold price will increase by its base price with each new purchase and will reset at midnight."),
						btn_caption: _("To the Mythical Hen")
					},
					alchemy: {
						daily_progress: _("You will randomly receive chicken feed for your hen by performing the following actions in the game:"),
						found_today: _("Feed found today"),
						tooltips: {
							countdown: _("The event will only be available until the timer runs out. Please make sure that you spend all your feed before the event ends."),
							question_mark: _("You do not yet know the reward for the prepared recipe."),
							harmony_points: _("Every time you feed your hen, you can earn up to 10 Harmony Points. Collect as many points as possible to climb up the daily and overall ranking.")
						},
						progressbar_tooltip: _("As soon as you have created enough eggs, you will gain special rewards."),
						btn_recipe_tooltip: _("To the recipe book"),
						btn_recipe: _("Recipe Book"),
						tip2: _("Click the 'Feed' button!"),
						brew_the_ingredients: _("Feed"),
						rewards: {
							curator: {
								title: function (threshold) {
									return s(_("Administrator"), threshold);
								},
								descr: function (threshold) {
									return s(ngettext(
										"Once you have created %1 reward, you will get the administrator for 2 weeks for free.",
										"Once you have created %1 rewards, you will get the administrator for 2 weeks for free.",
										threshold), threshold);
								},
								completed: _("Congratulations! You have already obtained that reward.")
							},
							hero: {
								title: function (threshold) {
									return s(_("Hero Mihalis"), threshold);
								},
								descr: function (threshold) {
									return s(ngettext(
										"Once you have created %1 reward, you will get the exclusive hero Mihalis, including a hero slot.",
										"Once you have created %1 rewards, you will get the exclusive hero Mihalis, including a hero slot.",
										threshold), threshold);
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
							}
						},
						rewards_overlay: {
							hero: {
								title: _("Mihalis"),
								descr: _("Congratulations! Mihalis joined your ranks as an exclusive hero!")
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
							window_title: _("The Mythical Hen - Tutorial"),
							step_1: _("To create a reward you will first need to feed the Hen. Click on three types of feed to add them to the food bowl."),
							step_2: _("Then simply click on the 'Feed' button to feed the hen. This will create an egg with a surprise reward."),
							step_3: _("Depending on which types of feed you have selected, the hen will produce an egg with a specific reward. You can either use your rewards immediately or store them in your inventory for later. Every player has their unique recipes for every reward, do not try to share them."),
							step_4: _("You can find new types of feed by performing common in-game activities like constructing buildings, researching, attacking, recruiting and casting spells."),
							step_5: _("If you try a new feed combination, it will be automatically saved in your recipe book. Over time, your collection of recipes will grow and you will be able to create an egg with a particular reward you wish to get. Unique recipes are created randomly for each player, so be sure to explore yours."),
							step_6: _("Every time you feed your hen, you can earn up to 10 Harmony Points for the rankings. There will be a daily and an overall ranking. The player who collected the most points in the daily ranking list, will receive a special reward for that day. The same applies to the top 10 players of the overall ranking at the end of the event."),
							brew_the_ingredients: _("Feed"),
							only_show_receipts_containing: _("Show only recipes with:")
						}
					},
					recipes: {
						filter_box_title: _("Show only recipes with:"),
						no_recipes_for_reward: _("Unfortunately, you do not yet know any recipe for this reward."),
						no_recipes_for_reward_when_filtered: _("None of the recipes you know matches the current filter settings."),
						buy_recipe: _("Buy recipe"),
						buy_recipe_tooltip: _("Buy a random recipe for this type of reward."),
						buy_recipe_tooltip_disabled: _("You already know all recipes for this reward."),
						filter_show_available: _("Show recipes with available feed"),
						prepare_receipt: _("Prepare the feed for the Mythical Hen to receive a reward."),
						cant_prepare_receipt: _("You are lacking some of the required ingredients.")
					}
				},
				easter_collect: {
					window_title: _("New feed found"),
					popup_text: _("You have found new feed for your Mythical Hen. Feed her to get rewards for your city."),
					okay_button: _("To the Mythical Hen")
				},

				easter_end_interstitial: {
					welcome_screen: {
						window_title: _("The Mythical Hen"),
						header: s(_("Hurry up, %1!"), Game.player_name),
						text: _("There is only a short time left for you, your hen and her magical eggs. Make sure to use up the leftover feed in before the event ends. Also, don’t forget that the winners of the overall ranking list will be determined at 8:00 p.m. servertime on the final day of the event. And now go for it – there are a lot of amazing rewards still to be had from the magical eggs!"),
						btn_caption: _("To the Mythical Hen")
					}
				}
			}
		}
	});
});
