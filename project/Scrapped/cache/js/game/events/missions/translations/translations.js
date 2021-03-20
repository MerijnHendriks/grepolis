/* global _, DM, __ */
define('events/missions/translations/translations', function() {
	'use strict';

	DM.loadData({
		l10n: {
			missions: {
                window_title: "",
				tabs: {
                    collection:_("Main"),
                    index: _("Missions")
                },
                missions_headline: "",
                index_headline: _("Missions available"),
                details_headline: function(mission_title) {
                    return s(_("Mission - %1"), mission_title);
                },
                send_units_button: _("Send Units"),
                hint_headline: _("Hint"),
                swap_headline: _("Swap mission"),
                unit_bonus: _("Unit bonus"),
                send_units: {
                    title: _("Unit selection"),
                    headline: _("Choose the units you want to send on this mission."),
                    button: _("Send"),
                    capacity: _("Capacity"),
                    tooltips: {
                        capacity: function (min_capacity, max_capacity) {
                            return s(_("You need to send between %1 and %2 population for this mission."), min_capacity, max_capacity);
                        },
                        send_button: _("Send the selected units and start the selected mission.")
                    }
                },
                ranking_box : {
                    headline: _("Overall Ranking"),
                    btn_ranking_info_tooltip: _("Get more information concerning the daily rankings and rewards."),
                    name: _("Name"),
                    evaluating: _("evaluating..."),
                    ranking_not_active: _("Ranking is not active any more."),
                    no_results: _("No results yet")
                },
                reward_box : {
                    current_reward: _("Current Reward"),
                    next_reward: _("Next reward"),
                    description: "",
                    show_more: _("More Rewards")
                },
                reward_ranking_box : {
                    headline: _("Hall of Heroes")
                },
                daily_ranking : {
                    title: _("Daily Ranking"),
                    description: _("Only the top 3 players each day get the listed rewards and awards. Complete the missions with optimal unit selection to get the most points and reach the top of the rankings.")
                },
                overall_ranking : {
                    title: _("Overall Ranking"),
                    description: _("At the end of the event the top 50 players will get the listed rewards and awards. Complete the missions with optimal unit selection to get the most points and reach the top of the rankings.")
                },
                skip_cooldown : function(cost) {
                    return s(_("Skip"), cost);
                },
                cooldown: "",
                collect_reward: "",
                collect_reward_subwindow: {
                    title : function(level) {
                        return s(_("Box number %1 closed"), level);
                    },
                    headline: _("Your Reward!"),
                    collect_message: _("Click the reward to collect it now, or close the window and do it later on the rewards list.")
                },
                rewards_list_subwindow: {
                    title : _("Upcoming Rewards"),
                    reward_text: function(nr) {
                        return s(_("Box number %1"), nr);
                    },
                    not_avail: _("Not available yet"),
                    surprise_text: _("Extra rewards"),
                    surprise_available: _("Available for finishing more boxes")
                },
                buy_units: function (amount) {
                    return s(_("Buy %1"), amount);
                },
                mission_running: {
                    boost_mission: _("Reduce mission duration"),
                    army_sent: _("Army sent"),
                    base_chance: _("Base chance"),
                    unit_bonus: _("Unit bonus"),
                    total_chance: _("Total chance"),
                    mission_report: _("Mission report"),
                    free: __("Zero Cost|Free"),
                    ready: _("Ready"),
                    tooltips: {
                        base_chance : _("Base chance is the chance provided from the mission selection."),
                        unit_bonus: _("Unit bonus is calculated by the units you select to send on the mission. Look out for the hints."),
                        total_chance: _("Total chance is the sum of Base chance and Unit bonus."),
                        report_disabled : _("Mission is currently in progress")
                    }
                },
                tooltips: {
                    mission_type_attack: _("Attack mission"),
                    mission_type_escort: _("Escort mission"),
                    mission_type_scout: _("Scout mission"),
                    duration_icon: _("Duration"),
                    base_chance_icon: _("Base chance"),
                    success_chance: "",
                    event_info_btn: _("Event information"),
                    event_timer_tooltip: _("This event only runs for a certain time. Please make sure to collect all rewards you have earned before the event ends."),
                    swap_mission_button: function(price) {
				        return s(_("Pay %1 gold to swap this mission for a new one."), price);
                    },
                    send_units_button: _("Select the units you want to send on this mission. A bonus chance will be calculated based on that selection."),
                    collect_reward_button: "",
                    buy_units: function (amount ,unit_name, cost) {
                        return s(_("Buy %1 %2 for %3 gold."), amount, unit_name, cost);
                    }
                },
                hints: {
                    1: "",
                    2: "",
                    3: "",
                    4: "",
                    5: "",
                    6: ""
                },
                mission_result_subwindow: {
                    result_success: "",
                    result_failure: "",
                    result_captured: "",
                    result_escaped: "",
                    result_reward_1: "",
                    result_reward_2: "",
                    result_rewards_text: "",
                    mission_report: "",
                    close_button_text: _("Close report")
                },
                tutorial: {
                    step_1: "",
                    step_2: "",
                    step_3: "",
                    step_4: "",
                    step_5: "",
                    step_6: "",
                    step_7: "",
                    step_8: "",
                    step_9: "",
                    next_btn: __("Adverb. Go to the next screen|Next"),
                    prev_btn: _("Previous"),
                    close_btn: _("Close")
                }
			},
            premium: {
                missions_swap_mission: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                },
                missions_boost_mission: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                },
                missions_skip_cooldown: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                },
                missions_buy_event_units: {
                    confirmation: {
                        window_title: "",
                        question: ""
                    }
                }
            },
            missions_welcome: {
                welcome_screen: {
                    window_title: "",
                    header: "",
                    text: "",
                    btn_caption: ""
                }
            },
            missions_end_interstitial: {
                welcome_screen: {
                    window_title: "",
                    header: "",
                    text: "",
                    btn_caption: ""
                }
            }
		}
	});
});
