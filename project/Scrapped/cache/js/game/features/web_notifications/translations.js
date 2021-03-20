define("features/web_notifications/web_notifications", function() {
	"use strict";

	var DM = require_legacy("DM");

	DM.loadData({
		l10n: {
			web_notifications : {
				categories: {
					combat: _("Combat"),
					communication: _("Communication"),
					island: _("Island"),
					resources: _("Resources"),
					city: _("City")
				},
				attack_reminder: {
					title: _("Start your attack"),
					body: _("Attention! You need to start your planned attack.")
				},
				attack_incoming: {
					title: _("Attack warning!"),
					body: _("Your city is being attacked!")
				},
				hero_healed: {
					title: _("Hero"),
					body: _("Your hero has recovered from his wounds.")
				},
				report_arrived: {
					title: _("New report"),
					body: _("Take a look at your report.")
				},
				message_arrived: {
					title: _("New message"),
					body: _("Take a look at the message.")
				},
				alliance_message_arrived: {
					title: _("News in alliance forum"),
					body: _("Join the discussion.")
				},
				island_quest_satisfied: {
					title: _("Quest completed"),
					body: _("Go and collect your reward.")
				},
				island_quest_added: {
					title: _("Quest"),
					body: _("A new quest is available for you to start")
				},
				storage_full: {
					title: _("Storage full"),
					body: _("Use your resources or your production will be wasted.")
				},
				favor_full: {
					title: _("Favor at maximum"),
					body: _("Use your favor to crush your enemies.")
				},
				trade_arrived: {
					title: _("Trade completed"),
					body: _("Resources have arrived in your city.")
				},
				building_upgraded: {
					title: _("Construction completed"),
					body: _("Start a new construction or upgrade.")
				},
				barracks_unit_order_done: {
					title: _("Recruitment complete"),
					body: _("Your new units are waiting for orders.")
				},
				docks_unit_order_done: {
					title: _("Construction complete"),
					body: _("Your new units are waiting for orders.")
				},
				research_completed: {
					title: _("Research completed"),
					body: _("Start a new research.")
				},
				advisor_running_out: {
					title: function(advisor_id) {
						return s(_("%1 is leaving soon"), advisor_id);
					},
					body: _("Prolong the service of your advisor or you'll lose their benefits.")
				}
			}
		}
	});
});
