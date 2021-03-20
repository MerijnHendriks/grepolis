/* global GPWindowMgr, RecaptchaWindowFactory, gpAjax, Layout, _, Game, CM */
(function() {
	'use strict';

	var Message = {
		id: null,
		folder_id: null,
		part: null,
		recaptcha_required: false,
		post_id: 0,
		drag_and_drop_for_ios : false,

		registerEvents: function() {
			$('#btn_message_sent').unbind().bind('click', function() {
				Message.create('new', true);
			});
			$('#btn_message_preview').unbind().bind('click', function() {
				GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).sendMessage('messagePreview', 'new');
			});
			$('#btn_message_preview_sent').unbind().bind('click', function() {
				Message.create('new', true);
			});
			$('#btn_message_preview_edit').unbind().bind('click', function() {
				Message.edit('new');
			});
		},

		sendMessage : function(captcha_value) {
			var params = {
				message : $('#message_new_message').val(),
				recipients : $('#message_recipients').val(),
				subject : $('#message_subject').val(),
				captcha : captcha_value
			};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'create', params, function() {
				GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).sendMessage('setMessageData', {});	// clear data like recepients, subject and message
			});
		},

		replyMessage : function() {
			var params = {
				answer : $('#message_reply_message').val(),
				id : Message.id
			};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'reply', params);
		},

		handleMessage : function(type, captcha_value) {
			if (type === 'new') {
				this.sendMessage(captcha_value);
			} else if (type === 'reply') {
				this.replyMessage();
			}
		},

		create: function (type, show_captcha) {
			var _self = this;

			if (show_captcha && Message.recaptcha_required) {
				RecaptchaWindowFactory.openRecaptchaWindow(function(payload) {
					_self.handleMessage(type, payload);
				});
			}
			else {
				this.handleMessage(type);
			}
		},

		isMassmail: function () {
			var recipients = $('#message_recipients').val().split(';');
			var recipient_count = 0;

			$.each(recipients, function (id, recipient) {
				if ($.trim(recipient).length > 0) {
					recipient_count++;
				}
			});

			return recipient_count > 1;
		},

		edit: function (part) {
			$('#message_' + part + '_preview').hide();
			$('#message_' + part + '_create').show();
			Message.registerEvents();
		},

		reply: function () {
			var create = $('#message_reply_create');

			create.show();
			$('#message_reply_preview').hide();
			$('#message_message_list').addClass('reply_message');
		},

		markAll: function (status) {
			$('.message_date INPUT[type="checkbox"]').prop('checked', status);
		},

		setRecipients: function (recipients) {
			var _recipients = [];

			$.each(recipients, function (id, recipient) {
				$.merge(_recipients, [recipient.name]);
			});

			$('#message_recipients').val(_recipients.join('; '));
		},

		toggleMenu: function () {
			var folder_menu_messages = $('#folder_menu_messages'),
				folders = folder_menu_messages.find('.hor_scrollbar_cont span.folder'),
				folders_len = folders.length,
				row = 1,
				per_row = Math.ceil(folders_len / 3),
				size = 0,
				sizes = [0, 0, 0];

			folder_menu_messages.toggle();

			//Find the biggest row size
			folders.each(function (index, obj) {
				if (index + 1 >= row * per_row && row < 3) {
					sizes[row - 1] = size;
					size = 0;
					row++;
				}

				size += $(this).outerWidth();

				if (index === folders_len - 1) {
					sizes[row - 1] = size;
				}
			});

			$('#folder_menu_messages .hor_scrollbar_cont').width(Math.max(sizes[0], sizes[1], sizes[2]));

			$('#message_list').toggleClass('with_menu');
		},

		editFolder: function (folder_id) {
			Message.folder_id = folder_id;
			var params = {folder_id: folder_id};

			$('#message_folder #folder_name_' + folder_id).css('display', 'block');
			$('#message_folder #save_folder_name_' + folder_id).css('display', 'block');
			$('#message_folder #folder_link_' + folder_id).css('display', 'none');

			gpAjax.ajaxGet('message', 'getFolder', params, true, function (data) {
				$('#message_folder #folder_name_' + folder_id).val(data.folder.name);
			});
		},

		saveFolder: function () {
			var params = {folder_id: Message.folder_id, name: $('#message_folder #folder_name_' + Message.folder_id).val()};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'saveFolder', params);
		},

		newFolder: function () {
			var params = {folder_id: false, name: $('#message_folder #new_folder_name').val()};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'saveFolder', params);
		},

		delFolder: function (folder_id) {
			var params = {folder_id: folder_id};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'delFolder', params);
		},

		openReportAffrontDialog: function (post_id) {
			this.post_id = post_id;
			$('#message_report_affront_dialog').show();
			$('#message_message_list').hide();
		},

		closeReportAffrontDialog: function () {
			this.post_id = 0;
			$('#message_report_affront_dialog').hide();
			$('#message_message_list').show();
		},

		/**
		 * Adds a player to the list of blocked players via Ajax.
		 *
		 */
		addBlockedPlayer: function () {
			var input = $('input[name="player_name"]'),
				params = {'player_name': input.val()};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'add_blocked_player', params);
		},

		/**
		 * Removes a player from the list of blocked players via Ajax.
		 *
		 */
		removeBlockedPlayer: function (blocked_player_id) {
			var params = {'blocked_player_id': blocked_player_id};

			GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE).requestContentPost('message', 'remove_blocked_player', params);
		},

		/**
		 * Removes all messages
		 */
		deleteAllMessages : function () {
			Layout.showConfirmDialog(_('Delete all messages'), _('Do you want to delete all messages in this folder?'), function () {
				Layout.newMessage.getWnd().sendMessage('submitForm', 'message_form', 'delete_all_of_folder');
			});
		},

		/**
		 * Returns selected messages on the list
		 */
		getSelectedMessages : function () {
			var counter = 0, parent = $('<div></div>');
			$('#message_list .message_date input:checked').each(function () {
				parent.append($(this).parent().parent().clone());
				counter++;
			});

			return [counter, parent];
		},

		/**
		 * Removes selected messages from the list
		 */
		removeSelectedMessages : function () {
			$('#message_list .message_date input:checked').each(function () {
				$(this).parent().parent().remove();
			});
		},

		/**
		 * Returns a list of ids of the selected messages
		 */
		getMessagesIds : function () {
			var values = [];
			$('#message_list .message_date input:checked').each(function () {
				values[values.length] = $(this).val();
			});

			return values;
		},

		initiateDragAndDrop : function () {
			var _self = this, wnd = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE), isiOS = Game.isiOs(), root = wnd.getJQElement(),
				isDragDropEnabled = function() {
					return !isiOS || (isiOS && _self.drag_and_drop_for_ios);
				};

			CM.unregister(wnd.getContext(), 'btn_toggle_drag_drop');
			CM.register(wnd.getContext(), 'btn_toggle_drag_drop', root.find('.btn_toggle_drag_drop').button({
				toggle : true,
				tooltips : [
					{title : _('Activate drag & drop')}
				]
			}).on('btn:click:odd', function() {
				_self.drag_and_drop_for_ios = true;
			}).on('btn:click:even', function() {
				_self.drag_and_drop_for_ios = false;
			}));

			// drag
			$('#message_list li.message_item').draggable({
				appendTo: 'body',
				distance: 20,
				helper: function () {
					var $el = $(this);
					$el.find('input').prop('checked', true);
					var selected = Message.getSelectedMessages(), length = selected[0];

					return length > 1 ?
						$('<div class="multidragging"><div class="header">' + length + ' ' + _('Messages') + '</div></div>').append(selected[1]).css({width : $el.width()}) :
						$el.clone().css({width : $el.width()});
				},
				scope: 'message',
				start: function(event, ui) {
					if (!isDragDropEnabled()) {
						event.preventDefault();
					}
				}
			});

			// drop
			$('#folder_menu_messages span.folder').droppable({
				drop: function(event, ui) {
					if (!isDragDropEnabled()) {
						return;
					}

					var wnd = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_MESSAGE);

					if (!wnd) {
						return;
					}

					var handler = wnd.getHandler();
					var folder_id = $(this).attr('name');
					folder_id = folder_id.split('_')[1];
					var messages_ids = Message.getMessagesIds();

					//Drop event is fired multiple times
					if ((handler.last_folder_id !== folder_id || handler.last_messages_ids !== messages_ids) && messages_ids.length) {
						wnd.sendMessage('messageMove', 'message_form', folder_id, handler.last_folder_id);

						handler.last_messages_ids = messages_ids;
						Message.removeSelectedMessages();
					}
				},
				scope: 'message',
				tolerance: 'pointer'
			});
		}
	};

	window.Message = Message;
}());
