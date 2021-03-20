/* global __, DM, Game */
define("events/grepolympia/translations/grepolympia", function() {
	"use strict";

	DM.loadData({
		l10n: {
			grepolympia: {
				window_title: _("Grepolympia"),
				tabs: {
					matches: _("Current score"),
                    info: _("Competition"),
        			training: _("Training grounds"),
                    ranking: _("Ranking"),
        			shop: _("Shop")
				},

				shop_headline: _("Spend your laurels to receive great rewards."),
				shop_not_enough_battle_token: function (show_what_to_do_description) {
					if (show_what_to_do_description) {
						return _("You do not have enough laurels to buy this item. Participate more often to earn additional laurels.");
					}
					return _("You do not have enough laurels to buy this item.");
				},
				shop_laurel_icon: _("These are your laurels. The more often you participate, the more laurels you will earn."),

				laurels_competition_screen: _("You can trade the laurels you earned in the shop for some great items."),

				page_athlete: {
					tooltip_countdown: _("Time remaining until this discipline ends.")
				},

				page_info: {
					info: _("Info"),
					award_title: _("Awards"),
					laurel: _("Competition reward"),
					to_your_athlete: _("Go to athlete"),
					discipline: _("Discipline:"),
					week: _("Discipline"),
					reward_title: function (top_alliance_number) {
						return s(_("Top %1 alliance reward"), top_alliance_number);
					},
					alliance_score_title: _("Alliance score"),
					alliance_score_table_name: _("Name"),
					go_to_athlete: _("Go to athlete"),
					award_1: _("Train your athlete to receive this award! How many skill points will you collect?"),
					award_2: _("Only the 500 best athletes will receive this award. What will be your ranking at the end of the discipline?"),
					rank: _("Rank"),
					effect_power: _("Effect strength"),
					close_ranking_popup: _("To the competition"),
					not_enough_gold_extra_attempt: _("With this premium feature, you have the opportunity to participate again in a competition to improve your ranking and earn more laurels."),
					attend_immediately: function (extra_attempt_cost) {
						return s(_("Participate for %1 gold"), extra_attempt_cost);
					},
					attend: _("Participate"),
					attend_btn_tooltip: function (interval_duration) {
						return s(_("Participate in a discipline every %1 hours for free. You might improve your result in the current discipline and will definitely win some laurels that you can spend."), interval_duration);
					},
					attend_again_in: _("Next free attempt in"),
					ally_ranking: _("The rank in the alliance ranking is determined by the average of the 10 best athletes of your alliance."),
					reward_table_title: _("The strength of the effect is based on the rank of your alliance:"),
					rank_table_header: _("Rank"),
					effect_strength_table_header: _("Effect strength"),
					alliance_reward_explanation: _("The effect is tied to your alliance. Players who leave the alliance will lose it and players who join the alliance will gain it.")
				},

				general_info: _("Train your athlete and try to get as many points as possible. The 10 best athletes of your alliance will contribute to the total alliance score."),

				page_ranking: {
					name: _("Name"),
					player: _("Player"),
					alliance: _("Alliances"),
					meters: __("Average Meters|Avg. Meters"),
					discipline: _("Discipline:"),
					rbtn_filter: {
						discipline_1: _("Discipline 1: Hoplite race"),
						discipline_2: _("Discipline 2: Archery"),
						discipline_3: _("Discipline 3: Javelin throwing"),
						discipline_4: _("Discipline 4: Chariot race")
					},
					rbtn_source: {
						player: _("Player"),
						alliance: _("Alliances - The rank is calculated using the average of the ten best athletes")
					},
					rank: _("Rank"),
					no_results: _("No entries found."),
					search: _("Search")
				},

				page_matches: { //GP-23396  remove if we are not going to implement this tab into other skins and move to new translation greplympia_worldcup file
                    name: _("Name"),
					rank: _("Rank"),
					time: _("Time"),
					score: _("Score"),
                    own_team_name: "",
                    opponent_team_town: {
                        hoplite_race: "",
                        archery: "",
                        javelin_throwing: "",
                        chariot_race: ""
                    },
                    opponent_team_names: {
                        hoplite_race: "",
                        archery: "",
                        javelin_throwing: "",
                        chariot_race: ""
                    },
                    opponent_team_tooltips: {
                        hoplite_race: "",
                        archery: "",
                        javelin_throwing: "",
                        chariot_race: ""
                    },
					ranking_title: "",
					ranking_tooltip: "",
					community_reward: "",
					information_title: "",
					information_description: ""
				},

				attend_info_popup: {
					you_scored: _("You scored"),
					your_rank: _("Your rank"),
					previous_score: _("Your previous best score"),
					attend_info_popup_title: _("Current result"),
					laurels: _("Laurels")
				},

				current_ranking: {
					your_ranking: _("Your rank")
				},

				disciplines: {
					hoplite_race: _("Hoplite race"),
					archery: _("Archery"),
					javelin_throwing: _("Javelin throwing"),
					chariot_race: _("Chariot race")
				},

				skills: {
					skillpoints_available: _("Free skill points"),
					reset_skills: function (reset_skill_cost) {
						return s(_("Reset for %1"), reset_skill_cost);
					},
					reset_skills_tooltip: function (reset_skill_cost) {
						return s(_("Reset your skill points for %1 gold and reassign them!"), reset_skill_cost);
					},
					premium_window: {
						skillpoints_reset_message: function (reset_skill_cost) {
							return s(_("Do you really want to reset your skill points for %1 gold?"), reset_skill_cost);
						},
						skillpoints_reset_message_no_gold: _("You don't have enough gold to reset your skill points.")
					},
					skill_points_amount: _("Skill points are earned by every level up of your hero in this discipline. You can spend them on your skills in this discipline."),
					add_skill_point_btn_text: _("Increase your skill to achieve a better rating in the discipline and collect more laurels as well. Discover the most efficient skill distribution which offers the best results.")
				},

				top_ranking: {
					player_ranking: _("Player"),
					alliance_ranking: _("Alliances"),
					no_results: _("No entries found.")
				},

				training_ground: {
					title: function (discipline_name, athlete_level) {
						return s(_("Athlete: %1 level %2"), discipline_name, athlete_level);
					},
					units_pick: {
						training_points: _("Training points:"),
						max_per_slot: _("Slot limit:"),
						time_per_unit: _("Time:"),
						per_unit: _("Unit"),
						units: _("Units")
					},
					no_units: _("You need to assign units to this slot in order to train your athlete and level him up. Currently you don't have any units in your city to do so."),
					buy_slot: _("Slot"),
					bonus_active: _("Training bonus active"),
					bonus_not_active: _("+20% training points"),
					buy_bonus: function (buy_bonus_costs) {
						return s(_("Buy for %1"), buy_bonus_costs);
					},
					buy_bonus_tooltip: function (training_bonus_percentage, training_bonus_duration) {
						return s(_("Activate the training bonus and your athlete will receive %1% more training points over the next %2 hours."), training_bonus_percentage, training_bonus_duration);
					},
					training_points_tooltip: _("Your current training points. Reaching a new level will grant you a skill point for the current discipline."),
					training_points: function (training_points) {
						return training_points;
					},
					buy_slot_tooltip: _("Expand the waiting queue for your training by one more slot so you can train longer."),
					buy_slot_tooltip_tip: _("Note: Additional training slots last until the end of the event."),
					buy_additional_slot_question: function (extra_slot_cost) {
						return s(_("Are you sure you want to expand the waiting queue for your training by one more space for %1 gold?"), extra_slot_cost);
					},
					buy_additional_slot_question_tip: _("Note: Additional training spaces are only valid for the current discipline and athlete. As soon as the next discipline starts, these spaces become invalid and have to be unlocked again."),

					add_troops_btn: {
						part1: _("Click to order units to the training area to train your athlete."),
						part2: _("Note: The units are sacrificing their lives to give your athletes new strength. Your units will not return to your city.")
					}
				},

				your_ranking: _("Your current best"),
				attend: _("Participate"),

				tutorial: {
					title: _("Tutorial"),
					fixed_steps: {
						step_2: _("Train your athlete in every discipline by assigning units to his training. The units will be consumed in the process.<br/><br/>"),
						step_3: _("By training your athlete, he will earn training points. For every 1000 training points he will get one skill point.<br/><br/>"),
						step_4: _("Distribute your skill points between the three available skills wisely.<br>The right combination is needed to get the maximum result when participating in a discipline.<br/><br/>"),
						step_6: _("Every time you participate in a discipline you earn laurels based on your result too.<br/><br/>"),
						step_7: _("You can trade your laurels in the event shop for some great rewards.<br/><br/>"),
						step_8: _("In addition, the alliances with the best athletes will receive the alliance reward at the end of each discipline.<br>The average result of the 10 best athletes of each alliance will be used to determine the best alliances.<br/><br/>")
					},
					step_1: function(duration) {
						return s(_("Welcome to Grepolympia! There will be four olympic disciplines. Each of them lasts for %1 hours.<br/><br/>"), duration);
					},
					step_5: function(duration) {
						return s(_("Participate in the competition to get the result you made in the competition. You can participate once every %1 hours for free.<br/><br/>"), duration);
					},
					skills: {
						endurance: _("Speed"),
						strength: _("Strength"),
						speed: _("Endurance")
					}
				}
			},
			grepolympia_welcome: {
				welcome_screen: {
					window_title: _("Grepolympia"),
					header: _("Train your athlete!"),
					text: s(_("Hello %1! Grepolympia is a traditional event in Grepolis. The best athletes from all over the world come together to compete against each other.<br>Train your athlete and take part in four exciting competitions to win laurels.<br>Exchange them for rewards and earn glory for your alliance."), Game.player_name),
					btn_caption: _("Ready, set, go!")
				}
			},
			grepolympia_end_interstitial: {
				welcome_screen: {
					window_title: _("Grepolympia"),
					header: s(_("Hurry up, %1!"), Game.player_name),
					text: _("Your athlete has achieved some outstanding results!<br>Remember there is only little time left to take part in the competitions and earn more laurels. Also, don’t forget to spend the laurels. The event will end soon, so use the laurels before the timer runs out!"),
					btn_caption: _("Ready, set, go!")
				}
			},
            player_hints: {
                grepolympia_buy_slot: _("Unlocking training slot (Grepolympia)"),
                grepolympia_reset_skills: _("Resetting skills (Grepolympia)"),
                grepolympia_extra_attempt: _("Participating in competition (Grepolympia)"),
                grepolympia_training_boost: _("Activating training bonus (Grepolympia)")
            },

			premium: {
                grepolympia_reset_skills: {
                    confirmation: {
                        window_title: _("Resetting skills"),
                        question: function(reset_skill_cost) {
                            return s(_("Do you really want to reset your skill points for  %1 gold?"), reset_skill_cost);
                        }
                    }
                },

                grepolympia_training_boost: {
                    confirmation: {
                        window_title: _("Activating training bonus"),
                        question: function(buy_bonus_cost) {
                            return s(_("Do you want to activate the training bonus for %1 gold?"), buy_bonus_cost);
                        }
                    }
                },

                grepolympia_buy_slot: {
                    confirmation: {
                        window_title: _("Unlocking training slot"),
                        question: function(buy_training_slot_cost) {
                            return s(_("Do you want to unlock an additional training slot for %1 gold?"), buy_training_slot_cost);
                        }
                    }
                },

                grepolympia_extra_attempt: {
                    confirmation: {
                        window_title: _("Participating in competition"),
                        question: function(extra_attempt_cost) {
                            return s(_("Would you like to take part in another competition for %1 gold?"), extra_attempt_cost);
                        }
                    }
                }
			}
		}
	});
});
