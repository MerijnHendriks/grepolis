/* global _, DM, ngettext */
define('events/missions/translations/pandora', function() {
    'use strict';

    DM.loadData({
        l10n: {
            missionsskinpandora: {
                missions: {
                    window_title: _("Pandora's Box"),
                    tabs: {
                        collection: _("The Box")
                    },
                    missions_headline: _("Capture the evil spirits"),
                    collect_reward: _("Close the box"),
                    cooldown: _("Pandora's box will open in:"),
                    skip_cooldown : function(cost) {
                        return s(_("Open %1"), cost);
                    },
                    hints: {
                        1: _("To fight Keres you will need <strong>sharp</strong> weapons and <strong>ranged</strong> support - do not let her get too close!"),
                        2: _("Kakodaimones are fast and tricky. The most effective units against them are <strong>fast</strong> or <strong>ranged</strong>."),
                        3: _("Ascalaphus hides in the crops and attacks from afar. <strong>Protect</strong> the villagers and retaliate from a <strong>distance</strong>."),
                        4: _("Keep Taraxippoi away with units capable of <strong>attacking and defending</strong>. It's also important to have some <strong>ranged units</strong>."),
                        5: _("Speed is the key for this mission. Send units that can <strong>move fast</strong> and <strong>carry a lot</strong> before the spirit takes all your silver!"),
                        6: _("Thrasus acts rash and insolent. You will need <strong>fast units</strong> to follow him and have others ready to <strong>attack on sight</strong>.")
                    },
                    reward_box : {
                        description: _("Capture the spirits and close the box to receive this reward")
                    },
                    mission_result_subwindow: {
                        result_success: _("Mission Successful!"),
                        result_failure: _("Mission Failed!"),
                        result_captured: _("Spirit Captured"),
                        result_escaped: _("The evil spirit escaped."),
                        result_reward_2: _("Honor points"),
                        result_rewards_text: _("Mission rewards"),
                        mission_report: _("Mission report")
                    },
                    tutorial: {
                        step_1: _("As you have seen, Pandora's Box has been opened, and we must <b>capture the spirits</b> that escaped."),
                        step_2: _("You must capture <b>7 dark spirits</b> to be able to close the box. You can do that by <b>completing missions</b>."),
                        step_3: _("There are three types of missions: <b>Attacking, Escorting, and Scouting</b>. These missions will take different amounts of time and have different base chances of success."),
                        step_4: _("Every day <b>volunteers</b> will join your ranks. There is a chance they join when you perform <b>regular game actions</b>. Up to <b>10 groups</b> of volunteers will join every day."),
                        step_5: _("But more importantly, each mission requires <b>different units</b> for optimal success. Pay attention to <b>mission descriptions for hints</b> on what units to send."),
                        step_6: _("The <b>unit selection and ratio</b> is very important, for they determine the <b>Unit Bonus</b> for the success rate."),
                        step_7: _("<b>All units sent to capture the spirits are destroyed by their evil forces</b>, but if they are successful the priests will capture the spirits and return them to the box."),
                        step_8: _("Every time you close a box, the dark spirits grow angrier and stronger. Be prepared to send more and more units as you close more boxes."),
                        step_9: _("As the difficulty rises, so do the rewards. There are <b>4 special rewards</b> during the event, which are given out on boxes <b>10, 20, 30 and 40</b>. Completing missions also gives you Honor Points, the top 50 players on the ranking will get <b>special rewards</b>.")
                    },
                    mission_running: {
                        text_1 : _("Perform ritual now"),
                        text_2 : _("Ritual will be ready in"),
                        capturing_chance: _("Capturing chance"),
                        tooltips : {
                            boost_mission_progress: _("The priestess is preparing the ritual."),
                            boost_mission_ready: _("The ritual can now be performed."),
                            boost_mission: function(cost) {
                                return s(_("Pay %1 gold and perform a ritual to reduce the current duration of the mission by half."), cost);
                            },
                            boost_mission_free: _("Perform a ritual to reduce the current duration of the mission by half.")
                        }
                    },
                    tooltips: {
                        mission_capacity: _("Mission capacity"),
                        success_chance: _("Capture Chance"),
                        collect_reward_button: _("Close the box to claim the reward."),
                        skip_cooldown_button: function(cost) {
                            return s(_("Pay %1 gold to open a new box immediately."), cost);
                        }
                    },
                    collected_items_indicator: {
                        tooltip: {
                            headline: _("Today's volunteers"),
                            description: _("Each day up to 10 groups of volunteer soldiers will join the effort to find the evil spirits."),
                            drops_left: function (drops_left) {
                                return s(ngettext(
                                    "Today %1 group can still join. You get them randomly by performing these activities:",
                                    "Today %1 groups can still join. You get them randomly by performing these activities:",
                                    drops_left
                                ), drops_left);
                            },
                            no_drops_left: _("Today, you have already received the maximum number of volunteers."),
                            activity_list: {
                                activity_1: _("Attacking & defending"),
                                activity_2: _("Constructing buildings"),
                                activity_3: _("Researching"),
                                activity_4: _("Casting divine powers"),
                                activity_5: _("Recruiting units")
                            }
                        }
                    }
                },
                player_hints: {
                    settings: {
                        swap_mission: _("Swap mission (Pandora's Box)"),
                        boost_mission: _("Perform mission duration ritual (Pandora's Box)"),
                        skip_cooldown: _("Open box (Pandora's Box)"),
                        buy_units: _("Purchase units (Pandora's Box)"),
                        collected_items: _("New volunteers (Pandora's Box)")
                    }
                },
                premium: {
                    missions_swap_mission: {
                        confirmation: {
                            window_title: _("Swap mission"),
                            question: function (swap_mission_cost) {
                                return s(_("Do you really want to spend %1 gold to swap this mission for a different one?"), swap_mission_cost);
                            }
                        }
                    },
                    missions_boost_mission: {
                        confirmation: {
                            window_title: _("Mission duration ritual"),
                            question: function (boost_mission_cost) {
                                return s(_("Do you really want to spend %1 gold to half the current mission duration? "), boost_mission_cost);
                            }
                        }
                    },
                    missions_skip_cooldown: {
                        confirmation: {
                            window_title: _("Open Pandora's Box"),
                            question: function (skip_cooldown_cost) {
                                return s(_("Do you really want to spend %1 gold to open Pandora's Box immediately?"), skip_cooldown_cost);
                            }
                        }
                    },
                    missions_buy_event_units: {
                        confirmation: {
                            window_title: _("Purchase volunteers"),
                            question: function (amount, unit_name, cost) {
                                return s(_("Do you really want to buy %1 %2 for %3 gold?"), amount, unit_name, cost);
                            }
                        }
                    }
                },
                missions_welcome: {
                    welcome_screen: {
                        window_title: _("Pandora's Box"),
                        header: _(""),
                        text: _("In ancient times Pandora's Box was opened, releasing all evils into the world. This is known by all Greeks. <br>As dawn breaks, an ominous box lies in front of the temple. Next to it, the High Priestess kneels, in tears: '<i>Mighty gods, hear me! Help us to get rid of this foul artifact, and do not let the evils that lie within torment our citizens.</i>' As she ends her prayer, the box opens and dark spirits escape. Only one of great power can open Pandora's Box... Who was it? <br>It doesn't matter now, you must capture whatever came out of Pandora's Box and close it again!"),
                        btn_caption: _("Prepare the troops")
                    }
                },
                missions_plot_interstitial: {
                    welcome_screen: {
                        window_title: _("The Ultimatum"),
                        header: _(""),
                        text: _("A thunderous voice is heard all across Greece: '<i>No one can defy the will of the gods!</i>'. Now it is clear who opened the box, and the sunlight shines upon a face in the sky. Your citizens look at each other in disbelief. What could simple mortals have done to anger the king of the gods? Why is Zeus punishing us with Pandora's Box? His booming voice is heard again: '<i>You can close this box as often as you like, but only I can seal it. You have two days to prove your valor, otherwise, all of Greece will be doomed. Forever!</i>' Then, with a flash of lightning, Zeus vanishes."),
                        btn_caption: _("Prove your valor")
                    }
                },
                missions_end_interstitial: {
                    welcome_screen: {
                        window_title: _("The Judgement"),
                        header: _(""),
                        text: _("Now that the second day of Zeus' ultimatum comes to an end, a violent lightning bolt suddenly strikes down from the sky and hits Pandora's Box. With a bright flash, the box vanishes, as if it had never been there. <br>The people celebrate, the armies lie down in the dust to rest, but one question remains... What was it that brought Zeus' wrath upon the Greeks? And will it happen again?"),
                        btn_caption: _("Close")
                    }
                },
                collected_items: {
                    button: _("OK"),
                    checkbox: _("Do not show this window again"),
                    window_title: _("Volunteers join the hunt"),
                    text: _("A new group of volunteers joined the hunt for the evil spirits, use them wisely.")
                }
            }
        }
    });
});
