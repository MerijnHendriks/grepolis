/* global DM, Game */
define("events/grepolympia/translations/grepolympia_worldcup", function() {
	"use strict";

	DM.loadData({
		l10n: {
            grepolympia_worldcup: {
				grepolympia: {
                    window_title: _("The Greek Cup"),
                    tabs: {
                        info: _("Match")
                    },
					page_ranking: {
						rbtn_filter: {
							discipline_1: _("Match vs. Athens"),
							discipline_2: _("Match vs. Sparta"),
							discipline_3: _("Match vs. Corinth"),
							discipline_4: _("Match vs. Olympus")
						}
					},

					disciplines: {
						match_vs_athens: _("Match vs. Athens"),
                        match_vs_sparta: _("Match vs. Sparta"),
                        match_vs_corinth: _("Match vs. Corinth"),
                        match_vs_olympus: _("Match vs. Olympus")
					},
					page_matches: {
                        own_team_name: _("Grepolympians"),
                        opponent_team_town: {
                            match_vs_athens: _("Athens"),
                            match_vs_sparta: _("Spartan"),
                            match_vs_corinth: _("Corinthian"),
                            match_vs_olympus: _("Olympus")
                        },
                        opponent_team_names: {
                            match_vs_athens: _("War Owls"),
                            match_vs_sparta: _("Hoplites"),
                            match_vs_corinth: _("Pegasi"),
                            match_vs_olympus: _("Thunderbolts")
                        },
                        ranking_title: _("Greece's Best"),
                        ranking_tooltip: _("The top 15% players in the competition will play the main match. The sum of the scores of these players is the score of the Grepolympians.<br/><br/> All top 15 participants will receive the following award by the end of the match:"),
                        community_reward : _("Community reward"),
                        information_title: _("Main match"),
                        information_description: _("The top 15% players in each match will play against one of the best Greek teams in a match for glory. If the Grepolympians beat the opponents score, all participants of the event will receive the community reward.<br/><br/><i>The opponents score will be updated once during the match.</i>")
					},

                    page_athlete: {
                        tooltip_countdown: _("Time remaining until this match ends.")
                    },

					page_info: {
                        attend_btn_tooltip: function (interval_duration) {
                            return s(_("Participate in a match every %1 hours for free. You might improve your result in the current match and will definitely win some laurels that you can spend."), interval_duration);
                        },
                        close_ranking_popup: _("To the match"),
                        current_best_tooltip_test: function(team_name) {
                            return s(_("Current time your athlete was able to stay in the match against %1.<br/><br/>The longer the athlete stays in the match the more chances he has to score points. Train your athlete, spend skill points, and participate to help the Grepolympians."), team_name);
                        }
					},

					training_ground: {
                        training_points_tooltip: _("Your current training points. Reaching a new level will grant you a skill point for the current match.")
					},

					skills: {
                        skill_points_amount: _("Skill points are earned by every level up of your athlete in this match. You can spend them on your skills for this match."),
                        add_skill_point_btn_text: _("Increase your skill to achieve a better rating in the match and collect more laurels as well. Discover the most efficient skill distribution which offers the best results.")
                    },

					tutorial: {
                        fixed_steps: {
                            step_2: _("Train your athlete in every match by assigning units to his training. The units will be consumed in the process.<br/><br/>"),
                            step_3: _("By training your athlete, he will earn training points. For every 1000 training points he will get one skill point.<br/><br/>"),
                            step_4: _("Distribute your skill points between the three available skills wisely.<br/>The right combination is needed to get the maximum result when participating in a match.<br/><br/>"),
                            step_6: _("Every time you participate in a match you earn laurels based on your result too.<br/><br/>"),
                            step_7: _("You can trade your laurels in the event shop for some great rewards.<br/><br/>"),
                            step_8: _("In addition, the alliances with the best athletes will receive the alliance reward at the end of each match.<br/>The average result of the 10 best athletes of each alliance will be used to determine the best alliances.<br/><br/>"),
                            step_9: _("In each match the top 15% players will try to beat the opponents team. The opponents score will be calculated during the match, once the score is shown it wont change.<br/><br/>"),
                            step_10: _("If the top 15% players beat the opponents team, all participating players in the event will get the community reward.<br/><br/>")
                        },
                        step_1: function (duration) {
                            return s(_("Welcome to the Greek Cup of Episkyros! There will be four matches. Each match lasts for %1 hours.<br/><br/>"), duration);
                        },
                        step_5: function(duration) {
                            return s(_("Participate in the match to get the result your athlete achieved. You can participate once every %1 hours for free.<br/><br/>"), duration);
                        },
						skills: {
							strength: _("Technique")
						}
					}
				},
				grepolympia_welcome: {
					welcome_screen: {
						window_title: _("The Greek Cup"),
                        header: _("Train your athlete!"),
						text: s(_("Hello %1! Welcome to The Greek Cup. In this edition several Greek cultures gathered to have a tournament of Episkyros. <br> Train your athletes and try to beat the other teams in this thrilling tournament to win laurels. <br> Exchange them for rewards and earn glory to your alliance. <br> The top players in every match will try to beat the opposing team and bring honor to all Greece."), Game.player_name),
                        btn_caption: _("Get the ball rolling!")
					}
				},
				grepolympia_end_interstitial: {
					welcome_screen: {
                        window_title: _("The Greek Cup"),
                        header: s(_("Hurry up, %1!"), Game.player_name),
                        text: _("Your athlete has achieved some outstanding results!<br>Remember there is only a little time left to take part in the tournament and earn more laurels. Also, don’t forget to spend the laurels. The event will end soon, so use the laurels before the timer runs out!"),
                        btn_caption: _("Get the ball rolling!")
					}
				},
                player_hints: {
                    grepolympia_buy_slot: _("Unlocking training slot (Greek Cup)"),
                    grepolympia_reset_skills: _("Resetting skills (Greek Cup)"),
                    grepolympia_extra_attempt: _("Participating in the match (Greek Cup)"),
                    grepolympia_training_boost: _("Activating training bonus (Greek Cup)")
                },

                premium: {
				    grepolympia_extra_attempt: {
                        confirmation: {
                            window_title: _("Participating in the match"),
                            question: function(extra_attempt_cost) {
                                return s(_("Would you like to participate in this match again for %1 gold?"), extra_attempt_cost);
                            }
                        }
                    }
                }
			}
		}
	});
});
