// Translations for the Notification popups
/* global DM, _, s */
define("features/notification_popup/translations/notification_popup", function () {
    "use strict";

    DM.loadData({
        l10n: {
            notification_popup: {
                window_title: "",
                tabs: [],
                domination_value_reached: {
                    window_title: _("Objective reached"),
                    banner_title: _("Domination reached!"),
                    description: function (alliance_name, own_alliance) {
                        if (own_alliance) {
                            return s(_("Your alliance %1 has reached the domination objective. You can now start Last stand. Prepare for the last battle and do your best to secure your rule over the world!"), alliance_name);
                        } else {
                            return s(_("%1 has reached the domination objective. They can now start Last stand, prepare to break their attempt if you don't want to become subjects to their rule!"), alliance_name);
                        }
                    }
                },
                domination_last_stand_started: {
                    banner_title: _("Last stand has started!"),
                    description: function (alliance_name, last_stand_duration, own_alliance) {
                        if (own_alliance) {
                            return s(_("%1 has started Last stand! You have %2 days until the world submits to your rule. Defend your cities and show the people of Greece your strength."), alliance_name, last_stand_duration);
                        } else {
                            return s(_("%1 has started Last stand! You have %2 days to break their domination. Conquer their cities in domination islands to prevent them from winning."), alliance_name, last_stand_duration);
                        }
                    }
                },
                domination_last_stand_failed: {
                    banner_title: _("Last stand failed!"),
                    description: function (alliance_name, own_alliance) {
                        if (own_alliance) {
                            return s(_("%1 has failed to hold Last stand! Gather your armies, conquer your enemies and start again. Don't let your enemies prevail."), alliance_name);
                        } else {
                            return s(_("%1 has failed to hold Last stand! Unable to sustain the attacks of their enemies, %1 will have to restart their efforts to achieve World Domination."), alliance_name);
                        }
                    }
                },
                domination_world_won: {
                    window_title: _("World domination"),
                    banner_title: _("Domination Victors"),
                    description: function (alliance_name, domination_value, own_alliance) {
                        if (own_alliance) {
                            return s(_("%1 has been successful in dominating the world! With %2% of the cities in domination islands your alliance was able to hold Last stand and proclaim yourselves the Domination Victors. The world is now in peace under your rule."), alliance_name, domination_value);
                        } else {
                            return s(_("%1 has been successful in dominating the world! With %2% of the cities in domination islands, %1, was able to hold Last stand and proclaim themselves the Domination Victors. The world is now in peace under their rule."), alliance_name, domination_value);
                        }
                    },
                    button: _("Close")
                },
                olympus_small_temple_stage_started: {
                    window_title: _("Small Temples"),
                    banner_title: _("Small Temples open"),
                    description: _("The gods have opened their temples, but they do not come without a challenge. Fight the defenders and conquer the temples to harness their powers and prove your alliance's worth.")
                },
                olympus_large_temple_stage_started: {
                    window_title: _("Large Temples"),
                    banner_title: _("Large Temples emerged"),
                    description: _("From the depths of the oceans Large Temples have emerged, one temple for each god. It seems your valor is not yet proven, go now and conquer the Large Temples. The powers they provide are even more impressive.")
                },
                olympus_olympus_stage_started: {
                    window_title: _("Olympus"),
                    banner_title: _("Olympus sighted"),
                    description: _("It is unbelievable! The gods' pantheon is here, among humans. This is the ultimate test, you must control Olympus to show your complete devotion. But beware, mortals cannot stay in Olympus for too long.")
                },
                olympus_post_temple_stage_started: {
                    window_title: _("The blessing of the Gods"),
                    banner_title: _("The Gods are pleased"),
                    description: function (alliance_name, own_alliance) {
                        if (own_alliance) {
                            return s(_("Your alliance %1 has proven themselves the most devoted alliance by holding Olympus longer than any other Alliance. The Gods have showered your alliance with their blessings and now allow you to walk freely in Olympus."), alliance_name);
                        } else {
                            return s(_("%1 has proven themselves the most devoted alliance by holding Olympus longer than any other Alliance. The Gods have showered them with their blessings and now allow them to walk freely in Olympus."), alliance_name);
                        }
                    },
                    button: _("Close")
                },
                olympus_olympus_jumped: {
                    window_title: _("Olympus"),
                    banner_title: _("Olympus has teleported"),
                    description: _("The gods are playing with us, Olympus has changed places. It looks like the gods want to test the devotion of Greeks all across the land, let's show them distance does not affect our belief.")
                },
                olympus_olympus_conquered: {
                    window_title: _("Olympus"),
                    banner_title: _("Olympus was conquered"),
                    description: function (alliance_name, own_alliance) {
                        if (own_alliance) {
                            return s(_("Your alliance %1 has conquered Olympus! Hold it against the enemies and prove to the Gods that you are deserving of their blessing."), alliance_name);
                        } else {
                            return s(_("%1 has taken control of Olympus! If we want to prove our devotion to the gods we need to take it from them."), alliance_name);
                        }
                    }
                },
                common: {
                    button: _("To battle!"),
                    window_title: _("Last stand")
                }
            }
        }
    });
});
