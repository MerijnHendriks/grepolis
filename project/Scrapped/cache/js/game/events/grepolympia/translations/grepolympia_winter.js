/* global DM, Game */
define("events/grepolympia/translations/grepolympia_winter", function() {
	"use strict";

	DM.loadData({
		l10n: {
			grepolympia_winter : {
				grepolympia: {
					window_title: _("Winter Grepolympia"),
					page_ranking: {
						rbtn_filter: {
							discipline_1: _("Discipline 1: Shield luge"),
							discipline_2: _("Discipline 2: Biathlon"),
							discipline_3: _("Discipline 3: Figure skating"),
							discipline_4: _("Discipline 4: Ski jump")
						}
					},

					disciplines: {
						shield_luge: _("Shield luge"),
						winter_biathlon: _("Biathlon"),
						figure_skating: _("Figure skating"),
						ski_jump: _("Ski jump")
					},
					page_matches: {
                        own_team_name: "",
                        opponent_team_town: {
                            shield_luge : "",
                            winter_biathlon : "",
                            figure_skating: "",
                            ski_jump: ""
                        },
                        opponent_team_names: {
                            shield_luge : "",
                            winter_biathlon : "",
                            figure_skating: "",
                            ski_jump: ""
                        },
                        opponent_team_tooltips: {
                            shield_luge : "",
                            winter_biathlon : "",
                            figure_skating: "",
                            ski_jump: ""
                        }
					},

					tutorial: {
						step_1: function (duration) {
							return s(_("Welcome to Winter Grepolympia! There will be four olympic disciplines. Each of them lasts for %1 hours.<br/><br/>"), duration);
						},
						skills: {
							endurance: _("Performance"),
							strength: _("Technique"),
							speed: _("Balance")
						}
					}
				},
				grepolympia_welcome: {
					welcome_screen: {
						window_title: _("Winter Grepolympia"),
						text: s(_("Hello %1! Welcome to Winter Grepolympia. In this edition the best athletes from all over the world come together to compete against each other in winter diciplines.<br>Train your athlete and take part in four exciting competitions to win laurels.<br>Exchange them for rewards and earn glory for your alliance."), Game.player_name)
					}
				},
				grepolympia_end_interstitial: {
					welcome_screen: {
						window_title: _("Winter Grepolympia")
					}
				},
                player_hints: {
                    grepolympia_buy_slot : _("Unlocking training slot (Winter Grepolympia)"),
                    grepolympia_reset_skills : _("Resetting skills (Winter Grepolympia)"),
                    grepolympia_extra_attempt : _("Participating in competition (Winter Grepolympia)"),
                    grepolympia_training_boost : _("Activating training bonus (Winter Grepolympia)")
                }
			}
		}
	});
});
