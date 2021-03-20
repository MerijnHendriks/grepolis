/* globals DM, __ */

define('events/grid_event/translations/translations', function () {
	'use strict';

	DM.loadData({
		l10n: {
			gridevent: {
				window_title: "",
				tabs: {
					index: ""
				},
				tutorial: {
					step_1: "",
					step_2: "",
					step_3: "",
					step_4: "",
					step_5: "",
					step_6: "",
					step_7: "",
					step_8: "",
					step_9: "",
					step_10: "",
					step_11: "",
					next_btn: __("Adverb. Go to the next screen|Next"),
					prev_btn: _("Previous"),
					close_btn: _("Close")
				},
				tooltips: {
					event_time_left: _("Time left until the end of the event."),
					event_info_button: _("Event information")
				}
			},
			player_hints: {
				buy_event_currency: ""
			},
			premium: {
				buy_event_currency: {
					confirmation: {
						window_title: "",
						question: function () {
							return "";
						}
					}
				},
				grid_event_reset_grid: {
					confirmation: {
						window_title: "",
						question: function () {
							return "";
						}
					}
				}
			}
		}
	});
});