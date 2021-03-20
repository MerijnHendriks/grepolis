/*global DM */

define('events/spawn/translations/spawn', function() {
    'use strict';

	DM.loadData({
		l10n: {
			spawn : {
				window_title: _("Hades Portal"),
                tabs: {
					index: ""
				},
				portal_tooltip: _("A menacing Hades portal opened in your city. You don't know what creatures might  step out of it. You must destroy it to protect your population."),
				start_text : _("Send your units into Hades to find the six Hades stones. Destroy the portal and earn your reward!"),
				btn_send : _("Send"),
				btn_outcome: _("Adventure report"),
				btn_destroy: _("Destroy"),
				mission_running: _("Your units are already deep down in Hades, searching for the Hades stones. You will earn rewards and maybe find a Hades stone!<br>Make sure your town has enough free population when your units return from their adventure or you might lose some."),
				mission_finished: _("The units you sent into Hades fought their way through! Now you can claim your rewards and might be able to close the Hades portal!"),
				your_reward : _("Your reward"),

				units : _("Adventurers needed"),
				travel : _("Travel time"),
				chances : _("Chances"),
				rewards : _("Rewards"),

				sub_window_reward: {
					title : _("Adventure report"),
					units_header : _("Units lost in Hades"),
					rewards_header : _("Rewards"),
					button : _("Claim"),
					reward_tooltips: {
						stone: _("Stone"),
						all_resources: _("Resource reward"),
						favor: _("Favor reward")
					}
				},

				tutorial: {
					title: _("Tutorial"),
					step_1: _("A menacing Hades portal opened in your city. You don't know what creatures might step out of it. Destroy it to protect your population and they will reward you."),
					step_2: _("You can send different groups of units on an adventure into hades to collect the 6 hades stones"),
					step_3: _("Your adventurers always have a chance of finding a Hades stone, but there is also a chance they might die. The rewards they discover get granted in every case."),
					step_4: _("There can be only one group of adventurers exploring Hades at a time."),
					step_5: _("When the adventure timer has run out check the outcome and collect the rewards."),
					step_6: _("When you have collected 6 Hades Stones you will be able to destroy the portal. The Rewards for your heroic deed will be in the advanced inventory.")
				},

				tooltips : {
					countdown: _("This event is only available for a limited period of time. Please make sure to pick up your rewards for completed missions before the event ends."),
					progressbar: _("The time your adventurers will stay in Hades."),
					units: _("You need the following units to start the adventure."),
					not_enough_units: _("You don't have enough units"),
					on_their_way: _("Adventurers are already on their way."),
                    all_stones_collected: _("You have found all the stones. <br>You cannot perform any more missions."),
					stone_empty: _("An empty slot for a Hades stone."),
					stone_collected: _("A Hades stone you have already obtained."),
					chance_die: _("The probability that your units will die in Hades."),
					chance_stone: _("Chance to find a Hades stone.")
				}
			}
		}
	});
});
