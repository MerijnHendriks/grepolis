/* global gpAjax, Layout, GPWindowMgr */
define('helpers/alliance', function() {
	'use strict';

	var Features = require('data/features');
	var HelperAlliance = {

		joinAlliance: function(alliance_id, callback, is_joining_open_alliance) {
			gpAjax.ajaxPost('alliance', 'join', {alliance_id: alliance_id, is_joining_open_alliance: is_joining_open_alliance}, true, callback);
		},

		applyToAlliance: function(alliance_id, message, callback) {
			gpAjax.ajaxPost('alliance', 'send_application', {alliance_id: alliance_id, message: message}, true, callback);
		},

		acceptApplication: function(application_id, callback) {
			gpAjax.ajaxPost('alliance', 'accept_application', {id: application_id}, true, callback);
		},

		rejectApplication: function(application_id, callback) {
			gpAjax.ajaxPost('alliance', 'reject_application', {id: application_id}, true, callback);
		},

		withdrawApplication: function(application_id, callback) {
			gpAjax.ajaxPost('alliance', 'withdraw_application', {id: application_id}, true, callback);
		},

		leaveAlliance: function(callback) {
			var cleanUpWindows = function() {
				$('#chat_link').remove();
				var chat_w = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_CHAT);
				if (chat_w) {
					chat_w.close();
				}
				var forum_w = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_ALLIANCE_FORUM);
				if (forum_w) {
					forum_w.close();
				}
				Layout.allianceForum.close();

				callback();
			};

			var message = _('Do you really want to leave the alliance?');

			if (Features.isOlympusEndgameActive()) {
				message += '</br>';
				message += _('Leaving will dissolve any temple sieges you are currently leading');
			}

			Layout.showConfirmDialog(_('Leave alliance'), message, function() {
				gpAjax.ajaxPost('alliance', 'leave', {}, false, cleanUpWindows);
			});
		},

		acceptInvitation: function(invitation_id, callback) {
			gpAjax.ajaxPost('alliance', 'join', {alliance_id: invitation_id}, true, callback);
		},

		rejectInvitation: function(invitation_id, callback) {
			gpAjax.ajaxPost('alliance', 'reject_invitation', {id: invitation_id}, true, callback);
		},

		withdrawInvitation: function(invitation_id, callback) {
			gpAjax.ajaxPost('alliance', 'cancel_invitation', {id: invitation_id}, true, callback);
		}
	};

	return HelperAlliance;
});
