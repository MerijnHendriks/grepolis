/* global _, GPWindowMgr */
(function() {
	'use strict';

	var MailingList = {
		recipient_list: null,

		init: function() {
			$('#recipient_list a.cancel').tooltip(_('Remove'));
			$('#mailing_list a.cancel').tooltip(_('Delete list'));
		},

		addRecipient: function(list_id, tab_number) {
			var name = $('#recipient_list_form_' + tab_number + ' input').val();
			var params = {'recipient_name':name, 'list_id':list_id, 'tab_number':tab_number};
			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'add_recipient', params);
		},

		removeRecipient: function(recipient_id, list_id) {
			var params = {'recipient_id': recipient_id, 'list_id': list_id};
			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'remove_recipient', params);
		},

		createList: function() {
			var params = {'list_name':$('#create_list_name_form input').val()};
			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'create_list', params);
		},

		removeList: function(id) {
			var params = {'list_id':id};
			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'remove_list', params);
		},

		editListName: function(number){
			$('#list_' + number).hide();
			$('#list_edit_' + number).show();
			$('#create_list_button').hide();
			$('#create_list_name_form').hide();
		},

		saveListName: function(id) {
			var list_name = $('#mailing_list_' + id + '_name_input input').val();
			var params = {'list_id':id, 'list_name':list_name};
			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'rename_list', params);
		},

		setRecipients: function(elem) {
			var list_id = $(elem).val(),
				recipients = [],
				list = MailingList.recipient_list;

			if (list_id > 0 && list[list_id]) {
				$.each(list[list_id].data, function(i, obj) {
					recipients[recipients.length] = obj.recipient_name;
				});

				$('#message_recipients').val(recipients.join('; '));
			} else {
				$('#message_recipients').val('');
			}
		}
	};

	window.MailingList = MailingList;
}());
