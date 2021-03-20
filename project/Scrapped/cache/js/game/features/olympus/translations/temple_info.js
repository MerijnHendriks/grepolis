/* globals DM */

define('features/olympus/translations/temple_info', function (require) {
	'use strict';

	DM.loadData({
		l10n: {
			olympus_temple_info: {
				window_title: "",
				small_temple_title: function (temple_name) {
					return s(_("Small Temple %1"), temple_name);
				},
				large_temple_title: function (god_name) {
					return s(_("Large Temple of %1"), god_name);
				},
				tabs: [
					_("Temple Info"),
					_("Defense"),
					_("Ranking")
				],
				owner: _("Owner"),
				no_owner: _("No owner"),
				troops_support: _("Troops in the temple"),
				no_movements: _("No active commands on this Temple"),
				pre_temple_stage_info: function (date) {
					return s(_("Temples are not open yet. Small temples will be available at: %1"), date);
				},
				attack: _("Attack"),
				portal_attack: _("Portal Attack"),
				portal_support: _("Portal Support"),
				support: _("Support"),
				tooltips: {
					jump_to: _("Jump to this temple"),
					bb_code: _("Temple BBcode"),
					simulator: _("Add to simulator"),
					powers_list_button: _("Click for more Info")
				},
				states: {
					under_siege: function (alliance_link, date) {
						return s(_("A conquest has begun! %1 is holding a siege on this temple. Siege ends: %2"), alliance_link, date);
					},
					under_protection: function (date) {
						return s(_("This temple is under protection until: %1"), date);
					}
				},
				next_shield_toggle: function (date) {
					return s(_("Temple shield will be activated at: %1"), date);
				},
				defense: _("Defense"),
				troops_from: function (home_town_link) {
					return s(_("Troops from %1"), home_town_link);
				},
				return_all_units: _("Return all units"),
				return_some_units: _("Return some units"),
				return_all_units_for_all_towns: _("Return all units to their home city"),
				capacity: _("Capacity:"),
				next_jump: _("Next jump:"),
				olympus_curse: {
					title: _("Olympus Curse:"),
					description: _("5% of the units stationed in Olympus are destroyed every hour.")
				},
				command_types: {
					attack_takeover: _("Temple takeover"),
					attack_sea: _("Sea attack"),
					support: _("Support")
				},
				ranking: {
					rank: _("Rank"),
					alliance_name: _("Alliance"),
					seconds_held: _("Held Olympus"),
					owned_temples: _("Temples"),
					dissolved_alliance: _("Dissolved alliance"),
					search: _("Search"),
					search_tooltip: _("Search: Jump to the page of the alliance you searched for."),
					search_placeholder: _("Alliance"),
					no_result: _("No entries found"),
					jump_to_my_rank: _("My rank"),
					jump_to_my_rank_tooltip: _("My rank: Jump to the page of your alliance's ranking entry.")
				}
			}
		}
	});
});
