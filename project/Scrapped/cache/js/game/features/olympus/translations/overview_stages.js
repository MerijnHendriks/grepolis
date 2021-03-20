/* globals DM */

define('features/olympus/translations/overview_stages', function (require) {
	'use strict';

	DM.loadData({
		l10n: {
			pre_temple_stage: {
				info: {
					headline: _("Small temples will be open soon, scout the world for the best ones and prepare.")
				},
				small_temples: {
					headline: _("Small temples are already scattered around the world, but they are not open yet.")
				},
				large_temples: {
					headline: _("Prepare your alliance and prove your worth when small temples are open.")
				},
				olympus: {
					headline: _("Olympus will spawn when the gods deem you worthy.")
				}
			},
			small_temple_stage: {
				info: {
					headline: _("Small temples are open, capture them and harness their powers!")
				},
				small_temples: {
					headline: _("Small temples are now open. Conquer as many as you can and prepare for the Large temples!")
				},
				large_temples: {
					headline: _("Large Temples will spawn when you've proven worthy! Be warned these temples are more challenging and provide more powers!")
				},
				olympus: {
					headline: _("Olympus will spawn when the gods deem you worthy.")
				}
			},
			large_temple_stage: {
				info: {
					headline: _("Large temples have spawned, capture them and prepare for Olympus.")
				},
				small_temples: {
					headline: _("Large temples have spawned. Capture them now but don't forget to defend your Small temples.")
				},
				large_temples: {
					headline: _("Large temples have spawned, choose wisely and conquer them to prepare for Olympus.")
				},
				olympus: {
					headline: _("Choose wisely and prepare, Olympus will spawn after all the Large temples are captured, or the time runs out.")
				}
			},
			olympus_stage: {
				info: {
					headline: _("Olympus has spawned, capture it and prove your worthiness above all other Greeks.")
				},
				small_temples: {
					headline: _("Olympus has spawned. Use Small Temples with portals to get your troops to Olympus faster.")
				},
				large_temples: {
					headline: _("Holding large temples has a great impact when trying to conquer Olympus. Do not underestimate the powers provided by these temples.")
				},
				olympus: {
					headline: _("Capture and hold Olympus to ascend and win this world. Olympus will change locations when the timer reaches zero.")
				}
			}
		}
	});
});
