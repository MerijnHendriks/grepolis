/*global define, _, s, ngettext */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
			academy : {
				window_title: "",
				tabs: [_("Research"), _("Reset")],

				researches_queue : _("Research queue"),
				research_points : _("Research points"),
				building_view : _("Building view"),
				tooltips : {
					research_points_bubble : {
						part1 : function(research_points) {
							return s(ngettext("You currently have %1 research point.", "You currently have %1 research points.", research_points), research_points);
						},
						part2 : function(research_points_for_library) {
							return s(_("Your library is being demolished, therefore you have %1 research points less available."), research_points_for_library);
						},
						part3 : function(research_points_pro_level) {
							return s(_("You receive %1 research points for every academic level. You can use these research points to research technologies. It's not possible to research all of the technologies in one city."), research_points_pro_level);
						},
						part4 : function(research_points_for_library, max_research_points) {
							return s(ngettext(
								"An academy that has been fully upgraded gives you %2 available research point. A library will add another %1 points.",
								"An academy that has been fully upgraded gives you %2 available research points. A library will add another %1 points.", max_research_points), research_points_for_library, max_research_points);
						},
						part5 : _("This pointer indicates your academic level. The pointer moves one step ahead with each new upgrade level of your academy.")
					}
				}
			}
		}
	});
}());
