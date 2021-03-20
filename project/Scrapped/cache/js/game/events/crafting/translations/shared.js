/* global DM, Game */

define('events/crafting/translations/shared', function() {
	"use strict";

	DM.loadData({
		l10n: {
			crafting: {
				easter_welcome: {
                    welcome_screen: {
                        header: s(_("Welcome, %1!"), Game.player_name)
                    }
				},
				easter: {
					ranking: {
						title: {
							daily: _("Daily Ranking"),
							overall: _("Overall Ranking")
						},

						name: _("Name"),
						evaluating: _("evaluating.."),
						ranking_not_active: _("Ranking is not active any more."),
						info_windows: {
							daily: {
								title: _("Daily Ranking"),
								header: _("Award for First Place"),
								header2: _("Today's Reward"),
								header3: _("The Daily Ranking")
							},
							overall: {
								title: _("Overall Ranking"),
								header1: _("Unique Rewards for the Top 10 Players")
							}
						},
						no_results: _("No results yet")
					},
					alchemy: {
						activities: {
							attack: _("Attacking & defending"),
							construct: _("Constructing and upgrading buildings"),
							research: _("Researching"),
							casting: _("Casting divine powers"),
							recruit: _("Recruiting")
						},
						btn_brew_tooltip: _("Click here to create your reward."),
						tip_title: _("Complete Island Quests to collect additional ingredients."),
						tip1: _("Select 3 ingredients!"),
						tip3: _("Collect your reward!"),
						info: _("Info"),
						congratulations: _("Congratulations!"),
						btn_accept_reward: _("OK"),
						tutorial: {
							show_all_receipts: "",
							show_only_available_receipts: "",
							daily_ranking: _("Daily Ranking"),
							overall_ranking: _("Overall Ranking"),
							name: _("Name")
						}
					},
					recipes: {
						filter_show_all: _("Show all"),
						price: _("Price"),
						no_results: _("No results"),
						only_three: _("Uncheck another checkbox first"),
						random_recipes_title: _("Each player has unique recipes, try different combinations to find the best rewards.")
					},
					active_reward_available_error_message : _("You have to collect your current reward to get another one.")
				}
			}
		}
	});
});
