/*globals _, DM */
(function() {
	"use strict";

	DM.loadData({
		'l10n': {
			'survey' : {
				"window_title" : _('Survey'),
				"your_opinion" : _('How accurate are the following statements?'),
				"give_your_opinion" : _('Rate the following features'),
				"vote_your_candidate" : _('Select your favorite candidate'),
				"avg_votes" : _('Average rating of the following features'),
				"feedback" : _('Do you have any suggestions or thoughts on this topic which you would like to share with the Grepolis team?'),
				"daily_refresh" : _('The results are updated once a day'),
				"btn_dont_send_feedback" : _('Do not send feedback'),
				"btn_send_feedback" : _('Send feedback'),
				"btn_dont_send_vote" : _("Don't participate"),
				"btn_send_vote" : _('Send rating'),
				"btn_council_vote" : _('Vote'),
				"btn_council_abstain" : _('Abstain'),
				'votes': {
					'v_0' : _("Don't rate"),
					'v_1' : _('Miserable'),
					'v_2' : _('Poor'),
					'v_3' : _('Average'),
					'v_4' : _('Good'),
					'v_5' : _('Excellent')
				},
				'votes_feedback': {
					'v_1' : _('Not at all'),
					'v_2' : _('Generally not'),
					'v_3' : _('Partially'),
					'v_4' : _('Generally true'),
					'v_5' : _('Completely true')
				},
				'votes_coucil_voting' : {
					'v_1' : _('Not selected'),
					'v_2' : _('Select')
				}
			}
		}
	});
}());
