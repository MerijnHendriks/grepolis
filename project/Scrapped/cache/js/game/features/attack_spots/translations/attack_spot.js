/*globals DM*/

define("features/attack_spots/translations/attack_spot", function() {
	"use strict";

	DM.loadData({
		l10n: {
			attack_spot : {
				window_title: _("Bandits Camp"),
				tabs: [_("Tab 1")],
				reward_title: _("Rewards:"),
				defending_units: _("Defending units"),
				attacking_units: _("Your units"),
				attack: _("Attack"),
				select_all_units: _("Select all units"),
				deselect_all_units: _("Deselect all units"),
                travel_time: _("Travel Time"),
				bandits_camp : _("Bandits Camp"),
				map_tooltips: {
					attack_possible : _("Defeat the bandits on the island."),
					attack_running: _("Your units are on their way to the battleground. Wait until the fight takes place. Hover over the Troop Movements icon in the top-left corner of the screen to view detailed information about the current command."),
					collect_reward: _("You defeated all bandits. Collect your reward now."),
					cooldown_running: _("Wait for new bandits you can attack."),
					wrong_island: _("Your selected city can not attack the Bandits Camp.")
				},
				tooltips: {
					select_units: _("First select some units to attack the bandits camp."),
					simulator: _("Add units to the simulator"),
					travel_time: _("Travel times simulator"),
					expand_units: _("Show / hide unavailable units"),
					general_info: _("<b>General information</b><br><br>"),
					long_descr: _("<li>The Bandits Camp contains 100 fights in total before it vanishes completely from the map. After completing the last fight you will be granted 100 gold coins.</li><br>") +
						_("<li>You will receive battle points for every enemy unit you defeated. The amount of battle points you will receive is equal to the enemy units population costs. Check your fight reports to find out how many battle points you gained.</li><br>") +
						_("<li>To have equal conditions, every town on the island has the same travel time to the Bandits Camp independent of the visual distance.</li><br>") +
						_("<li>After every successful fight it takes some time until you can do the next fight. The cool-down timer starts as soon as you cleared the Camp and not after accepting the reward.</li><br>") +
						_("<li>You can send multiple attacks simultaneously from any city on this island, but as soon as the Camp is clear, all still ongoing movements will return immediately.</li><br>") +
						_("<li>The Bandits Camp is only placed on the island of your first city. If you lose all cities on this island, you can not further interact with the Bandits Camp, not until you reconquer a city on this island.</li><br>"),
                    unit_population: {
                        title: _("Population reference"),
                        description: _("Capacity is based on population")
                    },
					reward_bp: _("Battlepoints"),
					info_icon: _("The travel time is based on the selected units speed and the distance traveled.")
				},
				arrival_time : _("Arrival"),
				way_duration: _("Travel time"),
				cooldown_message: _("You have to wait until the time is up before you can start your next attack."),
				wrong_island: _("You have to select a city on this island to send troops to the Bandits Camp.")
			},

			attack_spot_victory: {
				window_title: _("Bandits Camp"),
				tabs: [_("Tab 1")],
				collect : _("Collect reward"),
				victory : _("Victory!"),
				reward_title: _("You successfully defeated all units. Here is your reward:")
			}
		}
	});

});
