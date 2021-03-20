/*global DM */

define('events/spawn/translations/hydra', function() {
    'use strict';

    DM.loadData({
        l10n: {
            hydra: {
                spawn: {
                    window_title: _("The Hydra"),
                    tabs: {index: ""},
                    portal_tooltip: _("A wild Hydra appeared in front of your city, destroy it before it damages your ships and your city."),
                    start_text : _("Send your units to fight and defeat the Hydra. You need to burn six Hydra heads to defeat it and earn your reward."),
                    btn_send : _("Send"),
                    btn_outcome: _("Battle report"),
                    btn_destroy: _("Burn heads"),
                    mission_running: _("Your units are already fighting the wild Hydra, trying to capture one of its heads. You will earn rewards and maybe capture a Hydra's head!<br>Make sure your city has enough free population when your units return from their adventure or you might lose some."),
                    mission_finished: _("The units you sent to fight the Hydra were successful! Now you can claim your rewards and might be able to burn the wild Hydra!"),
                    your_reward : _("Your reward"),

                    units : _("Units needed"),
                    travel : _("Travel time"),
                    chances : _("Chances"),
                    rewards : _("Rewards"),

                    sub_window_reward: {
                        title : _("Battle report"),
                        units_header : _("Units lost in battle."),
                        rewards_header : _("Rewards"),
                        button : _("Claim"),
                        reward_tooltips: {
                            stone: _("Hydra Head"),
                            all_resources: _("Resource reward"),
                            favor: _("Favor reward")
                        }
                    },
                    tutorial: {
                        title: _("Tutorial"),
                        step_1: _("A wild Hydra appeared in the bay. While it is there it threatens your city and its citizens. You must burn the Hydras heads to keep your population safe, after defeating it you will be rewarded."),
                        step_2: _("You can send different groups of units to battle the Hydra and capture 6 of its heads."),
                        step_3: _("Your armies always have a chance of capturing a head, but there is also a chance that they may die in battle. But winning or losing, there are always rewards for their battles."),
                        step_4: _("You can only send one group of units to fight the Hydra."),
                        step_5: _("When the battle timer runs out, check the results and collect the rewards."),
                        step_6: _("When you have captured 6 of the Hydra's heads you will be able to burn them and banish the creature. The Rewards for your heroic deed will be in the advanced inventory.")
                    },

                    tooltips : {
                        countdown: _("This event is only available for a limited period of time. Please make sure to pick up your rewards for completed missions before the event ends."),
                        progressbar: _("The time your armies will take to fight the Hydra."),
                        units: _("You need the following units to fight the Hydra."),
                        not_enough_units: _("Not enough units."),
                        on_their_way: _("Your units are already fighting the wild Hydra."),
                        all_stones_collected: _("You have captured 6 Hydra heads.<br>You cannot perform any more missions."),
                        stone_empty: _("An empty slot for a Hydra's head"),
                        stone_collected: _("A Hydra's head you have already obtained."),
                        chance_die: _("The probability that your units will die fighting against the Hydra."),
                        chance_stone: _("Chance to capture one of the Hydra's head.")
                    }
                }
            }
        }
    });
});
