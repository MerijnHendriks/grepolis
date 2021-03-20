// Translations for the Domination Era Started Notification popups
/* global DM, _ */
define("features/notification_popup/translations/domination_era_started_popup", function () {
	"use strict";

	DM.loadData({
		l10n: {
			domination_era_started: {
				window_title: "",
				tabs: [],
				domination_era_started: {
					window_title: _("The war has started"),
					banner_title: _("Domination era!"),
					description: _("The domination era has begun! Bring your alliance to power by conquering cities in domination islands. The world is in turmoil, will you be the ruler or the subject?")
				},
				common: {
					button: _("To battle!")
				}
			}
		}
	});
});