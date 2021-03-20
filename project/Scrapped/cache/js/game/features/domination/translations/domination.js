// Translations for the Domination window
/* global DM */
define("features/domination/translations/domination", function () {
	"use strict";

	DM.loadData({
		l10n: {
			domination: {
				window_title: _("Domination"),
				tabs: [
					_("Info"),
					_("Domination"),
					_("Ranking")
				],
				alliance_status: _("Alliance Status"),
				alliance_status_empty: _("Your alliance status will be available after the next ranking update."),
				current_world_dominance: _("Current domination:"),
				total_alliance_towns: function (alliance_name) {
					return s(_("Total valid cities controlled by %1:"), alliance_name);
				},
				world_status: _("World Status"),
				valid_towns: {
					total: _("Total valid cities in the world:"),
					free: _("Total valid cities without alliances:")
				},
				btn_world_view: _("Go to World View"),
				tooltips: {
					alliance_status_info: _("Conquer cities in valid islands to increase your alliances Domination."),
					winners_rank: _("A new icon for your fighters rank:")
				},
				last_stand_title: _("Last stand"),
				last_stand: {
					not_reached: _("Reach world domination to enable Last Stand"),
					activated: _("Hold your domination until time runs out"),
					activation_possible: _("Time left before last stand starts automatically:")
				},
				last_stand_button: _("Start Last Stand"),
				last_stand_info_tooltip: function (duration_days, planning_days) {
					return s(_("When your alliance reaches the Domination objective, the alliance leader is allowed to start Last Stand. When Last Stand is activated, your alliance needs to hold the Domination value at or above the objective for %1 days to win the world. Last stand will be automatically activated if the leader does not activate it within %2 days of reaching the Domination objective."), duration_days, planning_days);
				},
				no_alliance_label: _("Join an alliance now and take part on the battle for world domination."),
				join_alliance: _("Join Alliance"),
				ranking: {
					rank: _("Rank"),
					alliance_name: _("Alliance Name"),
					owned_cities: _("Valid cities"),
					domination_percentage: _("Domination"),
					jump_to_my_rank: _("My rank"),
					jump_to_my_rank_tooltip: _("My rank: Jump to the page of your alliance's ranking entry."),
					search: _("Search"),
					search_tooltip: _("Search: Jump to the page of the alliance you searched for."),
					search_placeholder: _("Alliance"),
					no_result: _("No entries found"),
					row_highlight: function (domination_started_date) {
						return s(_("This alliance started Last Stand on: %1"), domination_started_date);
					},
					next_rank_update: _("Time before the next ranking update.")
				},
				progress_title: {
					pre_domination: _("The battle for world domination has not yet started."),
					domination: _("The battle for world domination has started."),
					post_domination: _("The battle for world domination has ended.")
				},
				progress_time: _("Starting date and time:"),
				domination_short_description: function (percentage, days) {
					return s(_("The first alliance to achieve a domination of %1% and hold it for %2 days, will become the victor of the world and receive the following rewards:"), percentage, days);
				},
				post_domination_description: _("All players in the alliance will be awarded with the following rewards"),
				domination_rule_header: _("Domination Rules"),
				expand_text: _("Expand for more info"),
				rules: {
					description: _("In this endgame, the alliances battle for world domination. To do that you will need to think strategically, and hammer your opponents into submission until you can finally call the world yours."),
					paragraph_1: {
						header: _("Objective:"),
						point_1: _("Capture and hold a high percentage of cities in the world.")
					},
					paragraph_2: {
						header: _("Domination Era:"),
						point_1: _("The domination era starts after a period of time has passed, this varies with the speed and setting of the world. The pre-domination time should be enough for you and your alliance to solidify but not long enough that you will feel safe."),
						point_2: _("Once the Domination Era starts, the system will sweep the islands of the world selecting what is and what isn't a valid island. You can find more information about this below."),
						point_3: function (domination_value) {
							return s(_("Domination Era lasts until an alliance is able to capture and control %1% of valid cities shown in the Domination tab."), domination_value);
						}
					},
					paragraph_3: {
						header: _("Domination objective:"),
						point_1: function (domination_value) {
							return s(_("Domination objective starts of as %1%."), domination_value);
						},
						point_2: _("This value will start to decrease after some time has passed in the world, this time is predetermined by the speed and settings of the world."),
						point_3: _("Domination objective decreases based on the current progress of the top alliances until it becomes close enough to be reachable."),
						point_4: function (decrease_time) {
							return s(_("Once the value starts decreasing, it will do so every %1 days"), decrease_time);
						}
					},
					paragraph_4: {
						header: _("Valid islands:"),
						point_1: _("The system will sweep the entire world from the center out, checking for substantial player presence and marking the valid islands. The system stops once it reaches a predetermined percentage of player presence."),
						point_2: _("Only cities (including ghost towns) in these islands will be considered for the total domination value."),
						point_3: _("Only large islands (islands with farming villages) will be marked as valid.")
					},
					paragraph_5: {
						header: _("Last stand:"),
						point_1: function (last_standing_start) {
							return s(_("Once an alliance reaches the domination value, it will be eligible to start Last stand. Said alliance has %1 days to activate Last stand, or it will start automatically. If the world enters peace time during this time, the automatic last stand start will be extended by the duration of the peace time."), last_standing_start);
						},
						point_2: function (last_standing_duration) {
							return s(_("Once activated, the alliance will have to hold their domination value above the objective for the period of %1 days. If successful, this alliance becomes the winner of the world."), last_standing_duration);
						},
						point_3: _("While Last stand is active, cities located on valid islands belonging to the alliance members can be attacked even during vacation mode."),
						point_4: _("If the domination value falls bellow the objective at any time, last stand is instantly deactivated and the alliance loses the ability to turn it on until it reaches the objective again."),
						point_5: _("If the world enters peace time alliances are not allowed to start Last stand."),
						point_6: _("If an alliance has already started Last stand when the world enters peace time, the duration of peace time will be added to the total duration of Last stand.")
					},
					paragraph_6: {
						header: _("World end:"),
						point_1: _("When an alliance is declared the winner, the world enters peace time."),
						point_2: function (end_peace) {
							return s(_("Peace time lasts %1 days and the world is then closed."), end_peace);
						},
						point_3: _("It may take a few hours before all rewards are handed out to the winners.")
					}
				},
				winner_status: function (valid_cities) {
					return s(_("has dominated the world with %1% of the total valid cities."), valid_cities);
				},
				peace_time: function (alliance_link) {
					return s(_("The world is now in peace under the rule of %1, no battle can be fought."), alliance_link);
				},
				world_closing: function (date) {
					return s(_("This world will close on %1"), date);
				}
			},
			domination_popup: {
				window_title: "", //GP-23009 add with ticket
				tabs: []
			}
		}
	});
});
