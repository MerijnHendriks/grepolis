/* globals DM, ngettext, __ */

define('events/rota/translations/translations', function () {
	'use strict';

	DM.loadData({
		l10n: {
			rota: {
				window_title: _("Tyche's Wheel of Fortune"),
				tabs: {
					index: ""
				},
				rewards_list: {
					title: _("Available rewards"),
					chance: function (chance) {
						return s(_("%1% chance"), chance);
					}
				},
				open_tutorial: _("Open tutorial"),
				btn_spin: function (cost) {
					return s(_("Spin %1"), cost);
				},
				btn_reset: function (cost) {
					return s(_("Reset %1"), cost);
				},
				btn_currency_shop: _("Get more Tyche coins"),
				inventory: _("Inventory"),
				daily_special: _("Daily special"),
				btn_grand_prize_collect: _("Collect"),
				grand_prize_overlay_text: _("Congratulations!</br>Get your Grand Prize!"),
				insufficient_currency: _("Not enough Tyche coins"),
				inventory_full_overlay_text: _("Make more space in inventory before spinning."),
				inventory_full_double_overlay_text: _("Double reward is active, make at least 2 spaces in your inventory before spinning."),
				wheel_empty_overlay_text: _("Reset wheel to refill for free!"),
				collected_items_indicator: {
					tooltip: {
						headline: _("Tyche Coins collected today!"),
						description: _("Everyday Tyche will assess our celebration efforts and grant us coins! We can use these to participate in the event."),
						drops_left: function (drops_left) {
							return s(ngettext(
								"She will still grant us coins %1 time. We will gain her attention by:",
								"She will still grant us coins %1 times. We will gain her attention by:",
								drops_left
							), drops_left);
						},
						no_drops_left: _("She has already granted us the maximum amount of coins for today."),
						activity_list: {
							activity_1: _("Attacking & Defending"),
							activity_2: _("Constructing buildings"),
							activity_3: _("Researching"),
							activity_4: _("Casting divine powers"),
							activity_5: _("Recruiting units")
						}
					}
				},
				shop: {
					title: _("Shop"),
					tooltip: function (amount, cost) {
						return s(_("Buy %1 Tyche coins for %2 gold."), amount, cost);
					},
					description: function (amount) {
						return s(_("Buy %1 Tyche coins"), amount);
					},
					more: function (value) {
						return s(_("%1% more"), value);
					}
				},
				tutorial: {
					step_1: _("Welcome mortal! Your efforts in organizing festivals for this season have not gone unnoticed by the Gods. Tyche will now allow you to spin the Wheel of Fortune as a reward for your efforts."),
					step_2: _("This is Tyche's Wheel of Fortune."),
					step_3: _("The wheel has many special powers available for you to uncover. The daily special is the most unique of these powers, it changes every day so be sure to get it before it's gone!"),
					step_4: function (cost) {
						return s(_("You can spin the wheel here, each spin cost %1 Tyche coins"), cost);
					},
					step_5: function (cost) {
						return s(_("You can also reset the wheel. It costs %1 Tyche coins and doing so will also instantly spin the wheel.<br />Additionally when you reset the wheel that has been completely cleared, you can reset it for a lower cost."), cost);
					},
					step_6: _("All rewards won will first go in the Event Inventory here. Make sure you collect them!"),
					step_7: _("Each time you spin the wheel our illustrators complete another section of the grand prize canvas. This magnificent painting is to be sent to all corners of Greece, to show others the glory of your celebrations."),
					step_8: _("This bar shows how far your illustrators have progressed with their work on the current painting."),
					step_9: _("Once a painting is completed, it will be shipped throughout the Aegean, and you will receive a grand prize as thanks for your hard work!"),
					step_10: _("Every spin of the wheel will also fill your Divine Mana here. When full, your next spin will grant you double the rewards! So, make sure you have enough space in your inventory for all those awesome prizes!"),
					step_11: _("Tyche has blessed you with some coins to get you started! Go ahead and give fortune a chance!"),
					next_btn: __("Adverb. Go to the next screen|Next"),
					prev_btn: _("Previous"),
					close_btn: _("Close")
				},
				event_time_left: _("Time left until the end of the event."),
				short_animation: _("Short animation")
			},
			rota_event_welcome_interstitial: {
				welcome_screen: {
					window_title: _("Tyche's Wheel of Fortune"),
					header: _("The festive season is upon us once again!"),
					text: _("Your cities are preparing great feasts to celebrate this festive season.<br />Their efforts have not gone unnoticed by the gods! They have assigned Tyche to reward the loyal followers.<br />Show your dedication to the gods and Tyche's fortune shall smile upon you!"),
					btn_caption: _("Prepare Festival!")
				}
			},
			rota_event_end_interstitial: {
				welcome_screen: {
					window_title: _("Tyche's Wheel of Fortune"),
					header: _("Great Festivals!"),
					text: _("You have truly shown your dedication. The gods smile upon your cities and their divine powers are channeling through your citizens.<br /><i>Don't forget to collect any rewards that are still in the event inventory, before the end of the event.</i>"),
					btn_caption: _("Close")
				}
			},
			player_hints: {
				buy_event_currency: _("Buy Tyche coins (Tyche's Wheel of Fortune)"),
				settings: {
					collected_items: _("Tyche coin bundle (Tyche's Wheel of Fortune)")
				}
			},
			premium: {
				buy_event_currency: {
					confirmation: {
						window_title: _("Buy Tyche coins"),
						question: function (amount, cost) {
							return s(_("Do you really want to buy %1 Tyche coins for %2 gold?"), amount, cost);
						}
					}
				}
			},
			collected_items: {
				button: _("Collect"),
				checkbox: _("Do not show this window again"),
				window_title: _("Tyche coin awards!"),
				text: _("Use these coins in the event to win amazing rewards!"),
				headline: _("You have received Tyche coins!")
			}
		}
	});
});
