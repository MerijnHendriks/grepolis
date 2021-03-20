/* globals DM */

(function() {
	"use strict";

	DM.loadData({
		l10n: {
			daily_login : {
				window_title: _("Daily reward"),
				description: _("Choose your daily bonus between resources, favor and a random item for your selected city."),
				tabs: [_("Daily reward")],

				tooltips : {
					your_best_series : _("<b>Your best login series</b><br/>This number shows your best login series on this world."),
					resources : _("Add these resources to your selected city."),
					favor : _("Add the favor to the god of your selected city."),
					no_god : _("You have to worship a god in the selected city to be able to accept this gift."),
					gold : _("Gold"),
					day_description : function (day) {
						if(day > 1) {
							return s(_("Log in %1 days in a row to get one of the following rewards:"), day);
						} else {
							return s(_("On the first login day you can choose one of the following rewards:"), day);
						}

					},
					resources_for_day : function (res) {
						return s(_("%1 of each resource"), res);
					},
					favor_for_day : function (favor) {
						return s(_("%1 favor"), favor);
					},
					day : _("Day"),
					mystery_box_day : _("Random reward from the mystical goblet"),
					mystery_box : _("Break the mystical goblet and get a random item."),
					mystery_box_open : _("Click on the item to use it for your selected city or store it in your inventory."),
					no_longer_available :_("This reward is no longer available. Please use or store the reward from the mystical goblet."),
					reward_for_the_day : function(day) {
						return s(_("Reward for day %1"), day);
					},
					choose_between : function(resources, favor) {
						return s(_("Choose between:<br />%1 of each resource<br />or<br />%2 favors"), resources, favor);
					},
					icon: _("Daily Reward")
				}
			}
		}
	});
}());
