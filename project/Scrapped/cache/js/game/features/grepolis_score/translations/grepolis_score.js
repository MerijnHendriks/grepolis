/* globals DM */
// translations for the Grepolis Score window
define("features/grepolis_score/translations/grepolis_score", function () {
	"use strict";

	DM.loadData({
		l10n: {
			grepolis_score: {
				window_title: _("Grepolisscore"),
				tabs: [_("Overview")],
				bb_code_tooltip: _("Display BB-Code to share your Grepolisscore"),
				earned_score : _("Earned Grepolisscore"),
				categories: {
					summary: _("Overview"),
					active_event: _("Active Event"),
					daily_awards: _("Daily Awards"),
                    end_game: _("End Game"),
					combat: _("Combat"),
					military_preparation: _("Military Preparation"),
					empire_progression: _("Empire Progression"),
					highscores: _("Highscores"),
					heroes: _("Heroes"),
					unobtainable: _("Unobtainable")
				},
				world_points_title: _("Grepolisscore of individual Worlds"),
				world_points_explanation: _("Your total Grepolisscore is determined by the Grepolisscores you earn on all worlds by attaining awards."),
				tooltip_share_bb_code: _("Display BB-Code to share your Grepolisscore"),
				tooltip_earned_score: _("Earned Grepolisscore"),
				tooltip_world_score: _("World Grepolisscore"),
				tooltip_one_world_score: _("Grepolisscore earned on this World"),
				tooltip_recent_award: _("Latest award:"),
				tooltip_recent_category_award: _("Latest award in this category:"),
				tooltip_requirements: _("Requirements"),
				tooltip_golden_award: _("<b>World first</b><br>Congratulations! You were the first player on this world to complete this award and earn its Grepolisscore"),
				main_ui : {
					tooltip_button: _("To your Grepolisscore"),
					tooltip_score : _("Grepolisscore")
				}
			}
		}
	});
});
