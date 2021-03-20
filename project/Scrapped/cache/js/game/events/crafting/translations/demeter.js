/* global DM, ngettext, Game */

define('events/crafting/translations/demeter', function (require) {
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

			easter_skin_demeter: {
				player_hints: {
					settings: {
						easter_collect: _("Searching for provisions"),
						easter_buy_ingredient: _("Buying provisions"),
						easter_buy_recipe: _("Buying meals")
					}
				},
				premium: {
					easter_buy_ingredient: {
						confirmation: {
							window_title: _("Buy provision"),
							question: function (cost, ingredient_name) {
								return s(ngettext(
									"Do you really want to buy one provision for %1 gold?",
									"Do you really want to buy one provision for %1 gold?",
									cost), cost, ingredient_name);
							}
						}
					},
					easter_buy_recipe: {
						confirmation: {
							window_title: _("Buy meal"),
							question: function (cost) {
								return s(ngettext(
									"Do you really want to buy a random meal for the selected reward for %1 gold?<br><br>Please keep in mind that the recipe might be of a random level of that reward.",
									"Do you really want to buy a random meal for the selected reward for %1 gold?<br><br>Please keep in mind that the recipe might be of a random level of that reward.",
									cost), cost);
							}
						}
					}
				},
				easter_welcome: {
					welcome_screen: {
						window_title: _("In Demeter's Name!"),
						text: _("War is raging on our islands and many people are on the run. Help them and be kind to those who are in need. Go and feed the young as well as the old.<br>In return I, the goddess Demeter, will shower you with rewards for your generosity and hospitality.<br>Go and offer them something to eat."),
						btn_caption: _("To the Tavern")
					}
				},
				easter: {
					window_title: _("In Demeter's Name!"),
					tabs: {
						alchemy: _("Tavern"),
						recipes: _("Meals")
					},
					ranking: {
						info_windows: {
							daily: {
								descr: _("The winner of a daily ranking will not only receive an awesome reward, but also a rare award. The reward that can be won changes on a daily basis. Simply collect the most Hospitality Points to win. Every time you serve a meal, you will earn up to 10 Hospitality Points.")
							},
							overall: {
								descr: _("The top 10 players of the overall ranking list will receive limited bonus rewards when the event ends. The rewards are subdivided by position in the ranking list, meaning that the top 4 players will for example win special attack improvements of different strenghts and absolutely unique awards.<br>Every time you serve a meal, you will earn up to 10 Hospitality Points for the rankings.")
							}
						}, 
						ranking_tooltip: {
							title: _("Ranking info:"),
							description: [
								_("Serve a meal to receive a reward and Hospitality Points."),
								_("The Hospitality ranking list does not update automatically. Serve a meal or open the window again to see the current standings."),
								_("When two players manage to get the same score, the decisive factor is who reaches that score first.")
							]
						}
					},
					common: {
						btn_buy_for_gold_tooltip: _("Instantly adds the chosen provision.<br>The gold price will increase by its base price with each new purchase and will reset at midnight."),
						btn_caption: _("To the Tavern")
					},
					alchemy: {
						daily_progress: _("You will randomly receive provisions to prepare meals by performing the following actions in the game:"),
						found_today: _("Provisions found today"),
						tooltips: {
							countdown: _("The event will only be available until the timer runs out. Please make sure that you have spent all your provisions before the event ends."),
							question_mark: _("You do not yet know the reward for the prepared meal."),
							harmony_points: _("Every time you serve a meal, you can earn up to 10 Hospitality Points. Collect as many points as possible to climb up the daily and overall rankings.")
						},
						progressbar_tooltip: _("As soon as you have created enough meals, you will gain special rewards."),
						btn_recipe_tooltip: _("To the Meals"),
						btn_recipe: _("Meals"),
						tip2: _("Click the 'Serve' button!"),
						brew_the_ingredients: _("Serve"),
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
							culturelevel: {
								title: function (threshold) {
									return s(_("Culture Level"), threshold);
								},
								descr: function (threshold) {
									return s(ngettext(
										"Once you have created %1 reward, your culture will advance an entire level. Culture points you have already collected for the current level will be transferred over to the next level.",
										"Once you have created %1 rewards, your culture will advance an entire level. Culture points you have already collected for the current level will be transferred over to the next level.",
										threshold), threshold);
								},
								completed: _("Congratulations! You have already obtained that reward.")
							}
						},
						rewards_overlay: {
							democritus: {
								title: _("Democritus"),
								descr: _("Congratulations! Democritus joined your ranks as an exclusive hero!")
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
							window_title: _("In Demeter's Name - Tutorial"),
							step_1: _("Provide meals to create rewards for your city. Click on three types of provisions (or drag them to the plates on the table) to prepare the meal."),
							step_2: _("Then click on 'Serve' to dish up the meal."),
							step_3: _("Depending on which provisions you selected, a specific reward will be handed out. You can either use your rewards right away or store them in your inventory."),
							step_4: _("You can find new ingredients by performing common in-game activities like constructing buildings, researching, attacking, recruiting and casting spells."),
							step_5: _("If you try a new combination of provisions, it will be automatically saved in your list of known meals. Over time, the list will grow and you will be able to serve meals for particular rewards you wish to get."),
							step_6: _("Every time you serve a meal, you can earn up to 10 Hospitality Points for the rankings. There is a daily and an overall ranking. The player who collects the most points on a day will receive a special reward for that day. In addition, the top 10 players of the overall ranking list will also receive special rewards at the end of the event."),
							brew_the_ingredients: _("Serve"),
							only_show_receipts_containing: _("Show only meals with:")
						}
					},
					recipes: {
						filter_box_title: _("Show only meals with:"),
						no_recipes_for_reward: _("Unfortunately, you do not yet know any meal for this reward."),
						no_recipes_for_reward_when_filtered: _("None of the meals you know matches the current filter settings."),
						buy_recipe: _("Buy meals"),
						buy_recipe_tooltip: _("Buy a random meal for this type of reward."),
						buy_recipe_tooltip_disabled: _("You already know all meals for this reward."),
						filter_show_available: _("Show meals with the available provisions"),
						prepare_receipt: _("Prepare this meal for a hungry person to receive a reward from the goddess."),
						cant_prepare_receipt: _("You are lacking some of the required provisions."),
						random_recipes_title: ""
					}
				},
				easter_collect: {
					window_title: _("New provisions"),
					popup_text: _("You have found new provisions you can use to prepare a meal. Put them on the plate at the tavern table to get rewards for your cities."),
					okay_button: _("To the Tavern")
				},

				easter_end_interstitial: {
					welcome_screen: {
						window_title: _("In Demeter's Name!"),
						header: s(_("Hurry up, innkeeper %1!"), Game.player_name),
						text: _("There is only a short time left for you to serve meals to your guests. Make sure to use all your foodstuffs before the event ends.<br>Also, don’t forget that the winners of the overall ranking list will be determined at 8:00 p.m. server time on the final day of the event. And now go for it – there are a lot of amazing rewards still to be had for feeding the hungry!"),
						btn_caption: _("To the Tavern")
					}
				}
			}
		}
	});
});
