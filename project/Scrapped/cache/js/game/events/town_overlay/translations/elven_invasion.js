/* globals DM*/

define('events/town_overlay/translations/town_overlay', function (require) {
    "use strict";

    DM.loadData({
        l10n: {
            elven_invasion: {
                town_overlay: {
                    window_title: _("Visitors from a different dimension"),
                    header: _("Newcomers arrived in Greece!"),
                    text: _("<i>'Greetings from a distant world! We have traveled far and wide to reach this promised land. We come to share our culture and knowledge with you through the power of love. Open your gates to us... or perhaps your citizens will.'</i><br /><br />The Elves are a new playable race that will be available soon in Grepolis. They hail from a distant land, Elvenar, and bring with them mythical creatures of their own. The Elves are a peaceful race who conquer their enemies with the power of peace and love. Be sure not to underestimate their rainbows, a powerful weapon of Elven design which is sure to touch the hearts of your citizens.<br /><br />As you can see, the influence of these unwelcome invaders has already defiled the gods!<br /><br />For now the elves are just scouting our islands, but it wont be long before they start building their own colonies. Prepare now! Show these newcomers how the Greeks welcome unwanted visitors!"),
                    btn_caption: _("Welcome the visitors!"),
                    tooltip: _("Elven ship")
                }
            }
        }
    });
});