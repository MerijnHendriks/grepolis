/* global DM, _, s */

(function () {
	"use strict";

	DM.loadData({
		l10n: {
			community_goals : {
				title : _("Community goals"),
				progress_tooltip : function(points, total) {
					return s(_("Honor Points of the community <br><b>%1 / %2</b>"), points, total);
				},
				infobutton_tooltip : _("Team up with all other players on this world and collect Honor Points to unlock great community rewards.<br>Once a goal is reached, the corresponding effect will be activated in all cities of the participating players."),
				calculating: _("Calculating")
			},
			community_goal_reached: {
                window_title: _("Community goal reached"),
                tabs: [
					_("")
				],
				okay_button : _("OK")
			}
		}
	});
}());
