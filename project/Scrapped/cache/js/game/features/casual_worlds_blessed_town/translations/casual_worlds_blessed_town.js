/* global DM */
define("features/casual_worlds_blessed_town/translations/casual_worlds_blessed_town", function () {
    "use strict";

    DM.loadData({
        l10n: {
            casual_worlds_blessed_town: {
                header_description : {
                    blessed: _("This city has the blessing of protection from Tyche, the goddess of luck. While blessed, no matter how many attacks this city receives, it will never be conquered."),
                    normal: _("This city is not protected by Tyche's blessing of protection.")
                },
                power_tooltip: _("Tyche's blessing of protection."),
                change_blessed_town: _("You can move the altar of Tyche and its' priests to a different city and with that, her blessing."),
                select_new_town: _("Select new city to receive Tyche's Blessing:"),
                change_blessing_question: function(town_name) {
                    return s(_("Do you want to change the blessing from %1?"), town_name);
                },
                change_blessed_town_btn: _("Change blessed city"),
                waiting_text: function(isCooldownActive, waiting_time) {
                    var text;
                    if (isCooldownActive) {
                        text = s(_("You can only change the blessed city again on %1."), waiting_time);
                    } else {
                        text = s(_("After changing the blessed city you need to wait %1 days to be able to do it again."), waiting_time);
                    }
                    return text;
                }
            }
        }
    });
});
