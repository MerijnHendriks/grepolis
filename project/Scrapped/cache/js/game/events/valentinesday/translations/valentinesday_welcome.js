/*global DM, Game, _*/
(function() {
	"use strict";

	DM.loadData({
		l10n : {
			valentine_welcome : {
				window_title : _(""),
				tabs : [],
				welcome_screen : function(end_date, resources_max) {
					return {
                        window_title: _("Kiss of Love"),
                        header: s(_("%1, my darling!"), Game.player_name),
                        text: s(
                            _("I am Thessalonike, the mermaid. <br />Consider yourself lucky to find me on this day of love.<br /><br />If you catch me I will bestow a bonus on your active city. Depending on your luck, you can get up to %2 resources of each type every time you catch me.<br /><br />You can find me every now and then in one of your cities. Every time you find me, you will be rewarded with a mermaid's kiss, this will grant you a great fortune!<br /><br />Love,<br />Thessalonike"),
                            end_date,
                            resources_max
                        ),
                        btn_caption: _("Ok")
                    };
				}
			}
		}
	});
}());
