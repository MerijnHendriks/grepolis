/*global DM, ngettext */

define('features/god_selection/translations/translations', function() {
	'use strict';

	DM.loadData({
		l10n: {
            god_selection: {
                window_title: _("Temple"),
                tabs: [
                    _("Temple"),
                    _("Artifacts")
                ],
                divine_powers: _("Divine powers"),
                mythical_units: _("Mythical units"),
                change_god: _("Change god"),
                worship: _("Worship"),
                activate: _("Activate"),
                favor_caption: _("Favor: "),
                fury_caption: _("Fury: "),
                favor_replenished: _("Favor replenished earliest at: "),
                favor_max_capacity: _("You are at maximum capacity of Favor"),
                fury_replenished: _("You gain Fury by sacrificing your units using the Ares Sacrifice spell."),
                favor_production_boost: function (boost) {
                    return s(_("%1% favor production"), boost);
                },
                mythical_units_boost: function (boost) {
                    return s(_("%1% stronger mythical units"), boost);
                },
                tooltips: {
                    buy_priest: function (price) {
                        s(_("You can summon the high priestess for %1 gold!"), price);
                    }
                },
                not_worshipping: {
                    title: _("You are not worshiping a god"),
                    text: _("You are currently not praying to a god. You may select a god.")
                },
                select_god: _("Select a deity"),
                artifacts: {
                    locked: _("Not owned"),
                    athenas_cornucopia: {
                        name: _("Athena's Cornucopia"),
                        description: _("A blessed Cornucopia, presented by Athena herself, for strategy prowesses in the war for domination."),
                        effect: _("Effect: Increase the storage capacity of warehouses in all cities by 10%."),
                        condition: _("Can be aquired by winning a domination world.")
                    },
                    zeus_spark: {
                        name: _("Zeus' Spark"),
                        description: _("A spark of Zeus' bolt collected by priests at the end of the World Wonders age."),
                        effect: _("Effect: Adds 50 capacity to all gods' favor storage."),
                        condition: _("Can be acquired by being the first alliance to build 4 wonders in a World Wonder world.")
                    },
                    golden_fleece: {
                        name: _("The Golden Fleece"),
                        description: _("The Golden Fleece, gods' reward for proving your worth and holding Olympus against all enemies."),
                        effect: _("Effect: Training heroes costs 10% less coins."),
                        condition: _("Can be acquired by winning an Olympus world.")
                    }
                }
            },
            premium: {
                god_selection_confirmation: {
                    confirmation: {
                        window_title: _("Confirm new god selection"),
                        headline: function(god_name) {
                            return s(_("Worship %1 in this city"), god_name);
                        },
                        question: _("Are you sure that you want to select this god?"),
                        effects_headline: _("This has the following effects:"),
                        effects: function (god_name, prev_god_id, lose_all_fury) {
                            return [
                                _("You will lose all of this city's mythical units except divine envoys."),
                                _("All construction orders for mythical units still in the construction queue will be canceled. You will receive 50% of the resources back."),
                                _("All mythical units supporting you are returning with all troops to their native city."),
                                s(_("You will lose your entire %1 with %2."),
                                    lose_all_fury ?
                                        _('favor and fury') :
                                        _('favor'),
                                    god_name
                                )
                            ];
                        },
                        passive: function (god_name, passive_names, passive_names_count) {
                            return s(
                                ngettext(
                                    "You will lose the passive power provided by %1: %2",
                                    "You will lose any passive power provided by %1: %2",
                                    passive_names_count
                                ), god_name, passive_names);
                        },
                        lost_units: _("The following units will be lost:"),
                        town_units: _("Units in city"),
                        supporting_units: _("Units outside"),
                        confirm:
                            _("Change god"),
                        cancel:
                            _("Cancel")
                    }
                }
            }
        }
    });
});
