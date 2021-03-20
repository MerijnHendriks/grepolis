/* globals DM, ngettext */

define('features/olympus/translations/overview', function (require) {
	'use strict';

	DM.loadData({
		l10n: {
			olympus_overview: {
				window_title: _("Olympus"),
				tabs: [
					_("Info"),
					_("Small Temples"),
					_("Large Temples"),
					_("Olympus")
				],
				more_info: _("More info"),
				ocean: function(sea_id) {
					return s(_("Ocean: %1"), sea_id);
				},
				large_temples_captured: _("Large Temples captured:"),
				olympus_spawn_at: function (date) {
					return s(_("At %1 Olympus will spawn"), date);
				},
				olympus_jump_at: function (date) {
					return s(_("At %1 Olympus will jump"), date);
				},
				ranking: _("Ranking"),
				info: {
					headline: "",
					rewards_headline: _("To earn the following rewards, conquer and hold Olympus and ascend among Gods!"),
					tooltips: {
						winners_rank: _("A new Banner for your profile:")
					},
					rule_header: _("Olympus rules"),
					expand_text: _("Expand for more info"),
					rules: {
						paragraph_1: {
							header: _("Short description"),
							text_1: function(number_of_days) {
								return s(ngettext(
									"In the Olympus endgame, your main objective is to <b>capture</b> and <b>hold Olympus</b> for <b>%1 day</b> after it has spawned.",
									"In the Olympus endgame, your main objective is to <b>capture</b> and <b>hold Olympus</b> for <b>%1 days</b> after it has spawned.", number_of_days), number_of_days);
							},
							text_2: _("In this endgame, the world's size is constrained but all islands are open for colonization which allows you to expand and strategize."),
							text_3: _("To capture Olympus is a major challenge, but you and your Alliance can use the help of small and large temples in your quest to conquer Olympus."),
							text_4: _("These temples grant Divine Powers to whoever holds them. You and your Alliance can plan and decide on which temples and powers to target in order to reach your goal."),
							text_5: _("Additionally, the Olympus endgame is divided into 4 different stages, <b>Pre-Temple Stage</b>, <b>Small Temples</b>, <b>Large Temples</b> and <b>Olympus</b>. We will further dive into each stage below, but let's talk about the <b>Temples</b> in general first.")

						},
						paragraph_2: {
							header: _("Temples"),
							point_1: _("Temples start as neutral cities. "),
							point_2: _("All temples are occupied with neutral defensive units."),
							point_3: _("Alliances can conquer these temples as if they were normal cities."),
							point_4: _("Players who are not in an Alliance cannot conquer a temple."),
							point_5: _("Temples have divine powers that are granted to its holder (all players of Alliance)."),
							point_6: _("Alliances can only hold a limited number of temples."),
							point_7: _("To each temple a god is assigned and you can support the temple with mythical units of that god."),
							point_8: function(hours) {
								return s(ngettext(
									"After a temple is captured, a shield is cast upon the temple for <b>%1 hour</b>, protecting it from any attack during that time.",
									"After a temple is captured, a shield is cast upon the temple for <b>%1 hours</b>, protecting it from any attack during that time.", hours
								), hours);
							},
							point_9: _("Temples cannot be spied on."),
							point_10: _("Temples have no resources that can be looted."),
							point_11: _("You cannot cast spells on temples."),
							point_12: _("All units stationed in temples are visible to all other players at all times."),
							point_13: _("Once captured, temples cannot be abandoned."),
							point_14: _(
								"Once small temples are opened, a worldwide shield will be activated every" +
								" few days, protecting all small and large temples from attack."
							),
							point_15: _(
								"When the worldwide shield is activated, any attacking units are instantly" +
								" teleported back."
							)
						},
						paragraph_3: {
							header: _("Pre-Temple stage (Stage 1) "),
							text_1: _("This is the beginning of your journey for the hunt for Olympus."),
							point_1: _("Small temples are already scattered around the map."),
							point_2: _("You can view the small temples but cannot <b>attack</b>, <b>support</b> or <b>conquer</b> them in this stage. "),
							point_3: _("You can expand to any island in the world (no further islands will unlock)."),
							text_2: function(number_of_days) {
								return s(ngettext(
									"The Pre-Temple stage lasts for <b>%1 day</b>.",
									"The Pre-Temple stage lasts for <b>%1 days</b>.", number_of_days
								), number_of_days);
							}
						},
						paragraph_4: {
							header: _("Small-Temple stage (Stage 2)"),
							text_1: _("In the Small-Temple stage, all small temples will unlock and you and your Alliance will now be able to attack and conquer small temples."),
							point_1: function(number) {
								return s(ngettext(
									"This world contains <b>%1 small temple</b> distributed across the available oceans.",
									"This world contains <b>%1 small temples</b> distributed across the available oceans.", number
								), number);
							},
							point_2: function(limit) {
								return s(ngettext(
									"Every Alliance can only hold <b>%1 small temple</b>, so make sure to choose wisely where you want to concentrate your efforts.",
									"Every Alliance can only hold <b>%1 small temples</b>, so make sure to choose wisely where you want to concentrate your efforts.", limit
								), limit);
							},
							point_3: _("Temples and powers are distributed randomly across the world."),
							point_4: _("When your Alliance conquers a temple, all members receive its power in all their cities."),
							point_5: _("Some of these temples are <b>Portal Temples</b> and we will discuss this further down."),
							text_2: function(days) {
								return s(ngettext(
									"The Small-Temple stage lasts for <b>%1 day</b>.",
									"The Small-Temple stage lasts for <b>%1 days</b>.", days
								), days);
							}
						},
						paragraph_5: {
							header: _("Large-Temple stage (Stage 3)"),
							text_1: _("At the start of the Large-Temple stage, the six large temples will spawn, one for each god."),
							point_1: _("These temples will always spawn in the midway point between the center of the world and the last available island on the edge, and they are distributed in an equidistant manner. The exact location may vary based on other factors."),
							point_2: function(limit) {
								return s(ngettext(
									"Each Alliance can only hold <b>%1 of them</b>, so choose wisely.",
									"Each Alliance can only hold <b>%1 of them</b>, so choose wisely.", limit
								), limit);
							},
							point_3: _("The Large-Temple stage will end when all large temples are captured. "),
							point_4: function(number_of_days) {
								return s(ngettext(
									"If not all large temples are taken before <b>%1 day</b>, the stage will end.",
									"If not all large temples are taken before <b>%1 days</b>, the stage will end.", number_of_days
								), number_of_days);
							}
						},
						paragraph_6: {
							header: _("Olympus (Stage 4)"),
							text_1: function(days) {
								return s(ngettext(
									"To win the world, you and your Alliance need to conquer and hold Olympus for <b>%1 day</b>.",
									"To win the world, you and your Alliance need to conquer and hold Olympus for <b>%1 days</b>.", days
								), days);
							},
							point_1: function (duration, date_time) {
								return s(ngettext(
									"Olympus will spawn <b>%1 hour</b> after all large temples were conquered or at <b>%2</b>.",
									"Olympus will spawn <b>%1 hours</b> after all large temples were conquered or at <b>%2</b>.", duration
								), duration, date_time);
							},
							point_2: _("Olympus can randomly spawn anywhere within the borders of the map."),
							point_3: function(duration) {
								return s(ngettext(
									"Once spawned, Olympus will remain in that location for <b>%1 day</b>. After this period, Olympus will teleport to a random spot on the map.",
									"Once spawned, Olympus will remain in that location for <b>%1 days</b>. After this period, Olympus will teleport to a random spot on the map.", duration
								), duration);
							},
							point_4: _("When Olympus changes location, all units in Olympus will teleport back to their home cities."),
							point_5: _("After each teleport the neutral units will respawn."),
							point_6: _("After Olympus has been conquered by an Alliance, it cannot be attacked by another Alliance for <b>24 hours</b>."),
							point_7: _("The win condition cannot be achieved in one single conquest, the time your Alliance is able to hold Olympus is cumulative. To win the world, your Alliance needs to conquer Olympus multiple times.")
						},
						paragraph_7: {
							header: _("Additional Info"),
							subparagraph_1: {
								header: _("Portal Temples (Small Temple)"),
								text_1: _("Since Olympus changes place periodically, Portal Temples can prove invaluable during the Olympus stage"),
								text_2: _("Portal Temples are a special type of <b>small temple</b>:"),
								point_1: function(number) {
									return s(ngettext(
										"There are only <b>%1 of them</b> available in the world.",
										"There are only <b>%1 of them</b> available in the world.", number
									), number);
								},
								point_2: _("They do not give any direct powers until the Olympus stage."),
								point_3: _("They act as gateways from the small temple to Olympus."),
								point_4: _("When you control one of these temples, any member of your Alliance is able to send attacks or supports to Olympus through a special portal."),
								point_5: function(duration) {
									return s(ngettext(
										"The total travel time to Olympus is calculated by the travel time from your city to the Portal Temple plus the Portal Teleportation Time of <b>%1 hour</b>.",
										"The total travel time to Olympus is calculated by the travel time from your city to the Portal Temple plus the Portal Teleportation Time of <b>%1 hours</b>.", duration
									), duration);
								},
								text_3: _("<b>Note:</b> It's important to note that the Portals work only one way, in the direction of Olympus. Troops sent to Olympus through a portal will NOT return through a portal, they will take the long way home and travel the entire distance from Olympus to their home cities.")
							},
							subparagraph_2: {
								header: _("Olympus"),
								headline_1: _("Curse of Olympus"),
								point_1: function(percentage) {
									return s(_("Olympus periodically kills <b>%1% of defending units</b> within its walls. This does not include neutral units."), percentage);
								},
								point_2: _("The curse effect is cast at random."),
								headline_2: _("Olympus Rules"),
								point_3: _("If there are any movements towards Olympus when Olympus becomes shielded, the troops will instantly teleport back."),
								point_4: _("Regular movements on the way to Olympus when it changes place will be sent back the regular way."),
								point_5: _("Teleportation movements on the way to Olympus when it changes place will be instantly teleported back.")
							},
							subparagraph_3: {
								header: _("Additional Rules"),
								point_1: _("Registration ends when a certain number of players has been reached."),
								point_2: _("Temple commands do not appear in the Command Overview."),
								point_3: _("Temples are not affected by Vacation Mode."),
								point_4: _("Temples are not affected by Morale and Luck."),
								point_5: _("Night bonus does affect temples."),
								point_6: _("Temple Looting and Stone Hail research have no effect on temples.")
							},
							subparagraph_4: {
								header: _("Further details"),
								text_1:  _("Olympus wiki: ")
							}
						}
					}
				},
				small_temples: {
					headline: "",
					description: _("Small temples are an important factor for success in conquering Large temples and Olympus. Make sure your alliance is prepared to conquer them once they are open."),
					table: [
						_("Temple"),
						_("Power"),
						_("God"),
						_("Owner")
					]
				},
				large_temples: {
					headline: "",
					description: _("Capture as many Small temples as you can to prepare your alliance for this challenge. One step closer to Olympus! All 6 Large Temples need to be captured before Olympus reveals itself."),
					large_temples_not_active: _("Large Temples have not spawned yet.")
				},
				olympus: {
					headline: "",
					next_jump: _("Next jump:"),
					current_holder: function (alliance_name) {
						return s(_("Current holder: <b>%1</b>"), alliance_name);
					}
				},
				post_temple_stage: {
					headline: _("After great battles between all Greeks only one alliance was able to prove their ultimate worthiness, they can now walk freely in Olympus and feast among the gods."),
					congratulations: function (alliance_link) {
						return s(_("Congratulations %1!"), alliance_link);
					}
				},
				tooltips: {
					jump_to: _("Jump to temple"),
					open_temple_info: _("Open temple info")
				},
				filters_title: _("Filters"),
				filters: {
					god: _("God"),
					sea: _("Ocean"),
					alliance: _("Alliance")
				},
				filter_save: _("Save"),
				filter_reset: _("Reset")
			}
		}
	});
});
