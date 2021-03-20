/*global DM */

(function() {
	"use strict";

	DM.loadData({
		l10n: {
			update_notification : {
				window_title: _("Maintenance"),
				tabs: [],
				updating: {
					caption: _("Game is currently being updated"),
					message: _("The game server is currently down for maintenance. We will be right back. Please do not refresh your browser, otherwise you will be logged out of this world. We will let you know when the update is done.<br><br>Thank you for your patience.")
				},
				updated: {
					caption: _("Game has been updated"),
					message: _("The game server has been successfully updated. Please refresh your browser to continue playing."),
				},
				refresh: _("Refresh")
			}
		}
	});
})();
