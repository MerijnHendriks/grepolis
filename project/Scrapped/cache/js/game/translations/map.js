/*global _, s, DM, ngettext*/

(function() {
	"use strict";

	DM.loadData({
		l10n: {
			map : {
				tooltips: {
					found_town : _("Here you can found a new city"),
					invite_friend : _("Invite a friend to build a city here"),
					found_or_invite :  _("Invite a friend to build a city here<br/>or found a new city"),
					wonder_popup : _("Construction site for a World Wonder"),
					not_conquered : _("Not conquered"),
					in_your_possession : _("In your possession"),
					revolt : _("There is a revolt"),
					domination_area_marker: {
						headline: _('Domination Island'),
						text: _('Any city on this island is counted for the domination value of an alliance.<br />Cities founded on open spots are also valid.')
					}
				},
				view_quest_details : _("View quest details"),

				reserved_for_you : _("Reserved for you"),
				reserved_for : function(player_name) {
					return s(_("This city is reserved for %1"), player_name);
				},
				reserved_for_alliance : function(player_name, alliance_name) {
					return s(_("This city is reserved for %1 (%2)"), player_name, alliance_name);
				},
				can_reserve : _("This city has been entered and can be reserved"),
				reserved_by_alliance : _("This city was entered by a friendly alliance"),

				points : function(points) {
					return s(ngettext("%1 point", "%1 points", points), points);
				},
				town_protection_end :  _("Protected until"),
				tooltip_colonization : function(time) {
					return s(_("Colonization will start in %1"), time);
				},
				tooltip_foundation : function(time) {
					return s(_("Founding of city will be complete in %1"), time);
				}
			}
		}
	});
}());
