/* globals DM */

define("features/world_wonder_donations/translations/world_wonder_donations", function() {
	"use strict";

	DM.loadData({
		l10n: {
			world_wonder_donations : {
				window_title: _("Member Donations"),
				tabs: [_("Tab 1")],

				total_donations_title: _("Total donations"),
				total_donations_count_title: _("Donations"),
				total_donations_count_description: _("This contains all donations made to the selected wonders by all players who are or were part of this alliance."),

				rank: _("Rank"),
				towns: _("Cities"),
				player_name: _("Player name"),
				wood: _("Wood"),
				stone: _("Stone"),
				silver: _("Silver coins"),
				total: _("Total"),
				percent: _("%"),

				all: _("All wonders"),
				colossus_of_rhodes: _("Colossuses"),
				great_pyramid_of_giza: _("Pyramids"),
				hanging_gardens_of_babylon: _("Hanging Gardens "),
				statue_of_zeus_at_olympia: _("Statues of Zeus"),
				temple_of_artemis_at_ephesus: _("Temples of Artemis"),
				mausoleum_of_halicarnassus: _("Mausoleums"),
				lighthouse_of_alexandria: _("Lighthouses"),
				no_entries: _("No donations have been made, yet :("),

				search_player_label: _("Player:"),
				search_player_button_label: _("Search"),
				search_player_not_found: _("This player is not a member of your alliance. You can only see the donations of an alliance member.")
			}
		}
	});
});
