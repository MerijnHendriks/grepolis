/*globals jQuery, hOpenWindow, _, Layout, GoToPageWindowFactory */

(function($) {
	'use strict';

	var Forum = {
		forum_datas: {},
		flag_separate_forum_tab: false,
		forum_id: 0,
		thread_id: 0,

		getThreadsPerPage: function () {
			return this.threads_per_page;
		},

		setThreadsPerPage: function (threads_per_page) {
			if (this.flag_separate_forum_tab) {
				this.threads_per_page = threads_per_page;
			}
		},

		checkAllThreads: function (ele) {
			var is_checked = !!$(ele).prop('checked');
			$('#thread_list_form input[type=checkbox][name!=ignore]').prop('checked', is_checked);
			if (is_checked) {
				$('div.threadicon').addClass('checked');
			} else {
				$('div.threadicon').removeClass('checked');
			}
		},

		checkThread: function (ele) {
			var checkbox = $(ele).children('INPUT[type=checkbox]');
			var checked = checkbox.prop('checked');
			checkbox.prop('checked', !checked);
			checked=!checked;
			$(ele).children('div.threadicon').toggleClass('checked', checked);
		},

		deleteThreads: function () {
			hOpenWindow.showConfirmDialog(_('Are you sure?'), _('Really delete topics?'), function(){
				var params = {forum_id: Forum.forum_id};

				params.action = 'threads_delete';

				Forum.sendCommandForMultipleSelections(params);
			});
		},

		closeOpenThreads: function () {
			var params = {forum_id: Forum.forum_id};

			params.action = 'threads_close_open';

			Forum.sendCommandForMultipleSelections(params);
		},

		moveThreads: function () {
			var params = {};
			var forum_id = $('#admin_functions select').val();

			params.action = 'threads_move';
			params.forum_id = forum_id;

			Forum.sendCommandForMultipleSelections(params);
		},

		changeImportantFlagOnThreads: function () {
			var params = {forum_id: Forum.forum_id};

			params.action = 'threads_change_important_flag';

			Forum.sendCommandForMultipleSelections(params);
		},

		// private function
		reloadContentPost: function(params, callback) {
			Layout.allianceForum.getWnd().clearMenu();
			Layout.allianceForum.getWnd().requestContentPost('alliance_forum', 'forum', params, callback);
		},

		// private function
		sendCommandForMultipleSelections: function (params, is_post) {
			var element_id = is_post ? 'postlist' : 'threadlist',
				param_type = is_post ? 'post_ids' : 'thread_ids';

			params[param_type] = [];

			$('#' + element_id + ' input:checkbox:checked').each(function (i, elem) {
				params[param_type][i] = $(elem).val();
			});
			this.reloadContentPost(params);
		},

		deleteThread: function (thread_id) {
			var _self = this;
			hOpenWindow.showConfirmDialog(_('Are you sure?'), _('Do you really want to delete this topic?'), function(){
				_self.reloadContentPost({
					'action': 'thread_delete',
					'thread_id': thread_id
				});
			});
		},

		closeThread: function (thread_id) {
			this.reloadContentPost({
				'action': 'thread_close',
				'thread_id': thread_id
			}, function () {
				$('a.openclose_button.open')
					.removeClass('open')
					.addClass('closed')
					.attr('onclick', 'Forum.openThread(' + Forum.thread_id + ')')
					.tooltip(_('Open thread'));
			});
		},

		openThread: function (thread_id) {
			this.reloadContentPost({
				'action': 'thread_open',
				'thread_id': thread_id
			}, function () {
				$('a.openclose_button.closed')
					.removeClass('closed')
					.addClass('open')
					.attr('onclick', 'Forum.closeThread(' + Forum.thread_id + ')')
					.tooltip(_('Close thread'));
			});
		},

		viewThread: function (thread_id, goto_last_post, page, post_id) {
			Forum.thread_id = thread_id;

			var params = {
				'thread_id': thread_id,
				'page': page || 1
			};

			if (goto_last_post) {
				params.action = 'lastpost';

				Layout.allianceForum.getWnd().sendMessage('go', params, this.scrollPostsDown);
			} else if (post_id) {
				Layout.allianceForum.getWnd().sendMessage('go', params, function() {
					document.getElementById('post_' + post_id).scrollIntoView();
				});
			} else {
				Layout.allianceForum.getWnd().sendMessage('go', params);
			}
		},

		/**
		* Important!
		* This function is not a dead code, it's name is created dynamicaly
		*/
		viewThreadPrompt : function(forum_id) {
			var that = this;

			GoToPageWindowFactory.openGoToPageWindow(1, Infinity, function(page_nr) {
				that.viewThread(that.thread_id, false, page_nr);
			});

			/*Layout.allianceForum.getWnd().ajaxRequestGet('alliance_forum', 'gotopage', {
				'forum_id': forum_id
			}, function (response, data, status) {
				if (status === "success") {
					Layout.showConfirmDialog(_('Go to page'), data.html, function() {
						that.viewThread(that.thread_id, false, $('#forum_gotopage').val());
					}, _('OK'), _('Cancel'));
				}
			});*/
		},

		editThread: function () {
			$('#forum_thread_name_span_text_admin').css('display', 'none');
			$('#forum_thread_title').css('display', 'none');
			$('#forum_thread_name_span_input').css('display', '');
		},

		updateThread: function () {
			var thread_id = $('#forum_thread_id_input').val();
			var thread_name = $('#forum_thread_name_input').val();
			var thread_important = $('#forum_thread_important_input').prop('checked');

			Layout.allianceForum.getWnd().ajaxRequestPost('alliance_forum', 'forum', {
				'action': 'thread_update',
				'thread_id': thread_id,
				'thread_name': thread_name,
				'thread_important': thread_important
			}, function (_wnd, data) {
				if (data.success) {
					$('#forum_thread_name_span_text_admin').css('display', '');
					$('#forum_thread_title').css('display', '');
					$('#forum_thread_name_span_input').css('display', 'none');
					var html = thread_important ? (_('Important:') + ' ') : '';
					html += '<span class="title">' + thread_name + '</span>';

					$('#forum_thread_name_span_text_admin').html(html);
				}
			});
		},

		editForum: function (index, elm) {
			if (!Forum.tboxes) {
				Forum.tboxes = $('#forumlist li.forum div.name form div.text_box');
			}
			Forum.tboxes.each(function () {
				var that = $(this);
				if (that.hasClass('expanded')) {
					that.stop(true, true).css({right: 0}).show().removeClass('expanded');
					that.next().stop(true, true).hide();
				}
			});
			var tbox = $(elm),
				ebox = tbox.next();
				tbox.addClass('expanded').stop(true,true).animate({right: tbox.width()}, 300, 'linear', function () {
					$(this).hide();
					ebox.stop(true,true).slideDown(300);
				});
		},

		shareForum: function (elm, forum_id) {
			Forum.forum_id = forum_id;
			var html = $('#share_forum_with_alliance'),
				list = $(elm).parents('ul.shared_with_list').clone().attr('class',''), // source for alliances
				label_box = $('<div class="label_box"></div>'),
				input_box = $('<div class="input_box" id="remove_alliances" style="position:relative;"></div>'),
				list_2 = $('#shared_with_list').empty(), // target for alliances
				elm_count = 0; // increment if elements are appended to list

			list.children().each(function () {
				var that = $(this).children('a').first();
				var id = $(this).attr('class').match(/alliance_id_(\d+)/);
				if (id) {
					var l = $('<label></label>');
					that.appendTo(l);
					label_box.append(l);
					elm_count++;
					input_box.append('<span><input type="checkbox" name="ally" value="' + id[1] + '"/></span>');
				} else {
					that.remove();
				}
			});
			if (elm_count) {
				list_2.prev().show(); // show h4
				input_box.append('<a href="#" id="remove_share_confirm" class="confirm" onclick="Forum.removeAllianceFromSharedForum(' + forum_id + ');" style="position:absolute; right: 59px;bottom: 0;"></a>');
				label_box.appendTo(list_2.empty());
				input_box.appendTo(list_2);
			} else {
				list_2.prev().hide();
			}
			jQuery.blocker({
				caching: true,
				html: html,
				height: 300,
				width: 400,
				cssClass : 'share_forum',
				title: _('Forum'),
				success: $('#share_forum_confirm, #remove_share_confirm')
			});
		},

		addAllianceToSharedForum: function () {
			var alliance_name = $('#share_forum_with_alliance #shared_with_name').val();

			$('#share_forum_with_alliance').hide();
			this.reloadContentPost({
				'action': 'add_alliance',
				'forum_id': Forum.forum_id,
				'alliance_name': alliance_name
			});
		},

		removeAllianceFromSharedForum: function (forum_id) {
			var alliance_ids = $('#remove_alliances').find('input:checked');
			alliance_ids.each(function(idx, el) {
				this.reloadContentPost({
					'action': 'remove_alliance',
					'forum_id': forum_id,
					'alliance_id': $(el).val()
				});
			}.bind(this));
		},

		delSharedForum: function (forum_id) {
			this.reloadContentPost({
				'action': 'del_shared_forum',
				'forum_id': forum_id
			});
		},

		addSharedForum: function (forum_id) {
			this.reloadContentPost({
				'action': 'add_shared_forum',
				'forum_id': forum_id
			});
		},

		ignoreForum: function (forum_id) {
			var ignore = $('#ignore_forum').prop('checked');

			this.reloadContentPost({
				'action': 'forum_ignore',
				'forum_id': forum_id,
				'ignore': ignore
			});
		},
		/**
		* Shows a confirmation dialog when called without 'confirmed'-option.
		* Otherwise the function deletes the specified post.
		*
		* @param thread_id Number
		* @param post_id Number
		* @param confirmed Boolean
		* @param page
		*/
		deletePost: function (thread_id, post_id, confirmed, page) {
			if (!confirmed)	{
				jQuery.blocker({
					caching: false,
					width: 250,
					height: 150,
					title: _('Forum'),
					html: $('#delete_post_dialog'),
					success: '#delete_post_confirm',
					onSuccess: function () {
						Forum.deletePost(thread_id, post_id, true, page);
					},
					cancel: '#delete_post_cancel'
				});
			} else {
				this.reloadContentPost({
					'action': 'post_delete',
					'thread_id': thread_id,
					'post_id': post_id,
					'page' : page
				});
			}
		},

		/**
		 * Shows confirmation dialog and if confirmed deletes multiple selected posts from the post list
		 *
		 * @param thread_id Number
		 * @param page Number
		 */
		deletePosts: function (thread_id, page) {
			hOpenWindow.showConfirmDialog(_('Are you sure?'), _('Really delete posts?'), function() {
				var params = {
					'action': 'posts_delete',
					'forum_id': Forum.forum_id,
					'thread_id': thread_id,
					'post_id': 0,
					'page': page
				};

				Forum.sendCommandForMultipleSelections(params, true);
			});
		},

		openPlayerProfile: function (player_name, player_id) {
			Layout.playerProfile.open(player_name,player_id);
		},

		openAllianceProfile: function (alliance_name, alliance_id) {
			Layout.allianceProfile.open(alliance_name,alliance_id);
		},

		newThread: function (forum_id) {
			Layout.allianceForum.getWnd().sendMessage('go', {action: 'thread_new', forum_id: forum_id});
		},

		newPoll: function (forum_id) {
			Layout.allianceForum.getWnd().sendMessage('go', {action: 'poll_new', forum_id: forum_id});
		},

		switchForum: function (forum_id, page) {
			page = page || 1;
			var w = Layout.allianceForum.getWnd();
			Forum.forum_id = forum_id;

			w.sendMessage('go',{forum_id: forum_id, page: page}, function() {
				$('#menu_link' + forum_id).removeClass('unread');
			});
		},

		switchForumPrompt : function(forum_id) {
			var that = this;
			Layout.allianceForum.getWnd().ajaxRequestGet('alliance_forum', 'gotopage', {
				'forum_id': forum_id
			}, function (response, data, status) {
				if (status === 'success') {
					Layout.showConfirmDialog(_('Go to page'), data.html, function() {
						that.switchForum(that.forum_id, $('#forum_gotopage').val());
					}, _('OK'), _('Cancel'));
				}
			});
		},

		addPollOption: function () {
			var ele = $('#forum_poll_options_list'),
				children = ele.children('span.grepo_input'),
				fields = children.length;

			if (fields < 12) {
				var new_option = children.first().clone();
				ele.append(new_option);
				new_option.find('input').val('');
				$('#forum_post_textarea').height(220 + 54 - ele.outerHeight(true));
			}
		},

		markForumAsRead: function (forum_id) {
			this.reloadContentPost({
				'action': 'forum_read',
				'forum_id': forum_id
			});
		},

		markAllForumsAsRead: function (forum_id) {
			Layout.allianceForum.getWnd().ajaxRequestPost('alliance_forum', 'forum', {
				'action': 'forum_read_all',
				'forum_id': forum_id
			}, function () {
				$('a.submenu_link.unread').removeClass('unread');
				$('div.forum_thread_unread').removeClass('forum_thread_unread').addClass('forum_thread_read');
				$('div.thread_closed_unread').removeClass('forum_thread_unread').addClass('thread_closed');
				$('div.forum_thread_important_unread').removeClass('forum_thread_important_unread').addClass('forum_thread_important_read');
			});
		},

		initAdmin: function () {
			$('#forum_list, #forum_shared_list').each(function () {
				$(this).sortable({
					axis: 'y',
					items: 'li.forum',
					placeholder: 'forum ui-sortable-placeholder-highlight',
					helper: 'clone',
					handle: 'div.handle',
					containment: '#forumlist',
					start: function (ev, ui) {
						Forum.old_index = $.inArray(ui.item[0],ui.item.parent().children());
					},
					stop: function (ev, ui) {
						var new_index = $.inArray(ui.item[0],ui.item.parent().children());
						var data = {};
						data.forum_id = ui.item.attr('id').replace(/\D+/g,'');
						data.old_index = Forum.old_index;
						data.new_index = new_index;
						data.shared_forum = ui.item.attr('id').indexOf('shared_id') >= 0;
						//data[ui.item.attr('id').replace(/\D+/g,'')] = [Forum.old_index, new_index];
						//data[ui.item.prev().attr('id').replace(/\D+/g,'')] = new_index - 1;
						//data[ui.item.next().attr('id').replace(/\D+/g,'')] = new_index + 1;

						Forum.moveForum(data);
					}
				});
			});
		},

		moveForum: function (options) {
			if (options.old_index === options.new_index) {
				return;
			}

			this.reloadContentPost({
				'action': 'forum_move',
				'forum_id': options.forum_id,
				'old_index': (options.old_index + 1),
				'new_index': (options.new_index + 1),
				'shared_forum': options.shared_forum
			});
		},

		forumUpdate: function (forum_id) {
			delete Forum.tboxes;
			var forum_name = $('#forum_forum_name_' + forum_id).val();
			var forum_content = $('#forum_forum_content_' + forum_id).val();
			var forum_hidden = $('#forum_forum_hidden_' + forum_id).prop('checked');

			this.reloadContentPost({
				'action': 'forum_update',
				'forum_id': forum_id,
				'forum_name': forum_name,
				'forum_content': forum_content,
				'forum_hidden': forum_hidden
			});
		},

		forumDelete: function (forum_id, confirmed) {
			if (!confirmed) {
				Layout.showConfirmDialog($('#forum_forum_name_' + forum_id).val(),_('Do you really want to delete this forum?'), function() {
					Forum.forumDelete(forum_id, true);
				});
			} else {
				this.reloadContentPost({
					'action': 'forum_delete',
					'forum_id': forum_id,
					'confirm': confirmed
				});
			}
		},

		forumCreate: function (confirmed) {
			var forum_name = $('#forum_forum_name');
			var forum_content = $('#forum_forum_content');
			var forum_hidden = $('#forum_forum_hidden');

			Layout.allianceForum.getWnd().getWindowVeryMainNode().find('.bb_color_picker').remove();
			if (!confirmed) {
				jQuery.blocker({
					caching: false,
					html: $('#create_forum_dialog'),
					width: 330,
					height: 200,
					success: '#create_forum_confirm',
					onSuccess: function() {
						Forum.forumCreate(true);
					},
					cancel: '#create_forum_cancel',
					onCancel: function() {
						forum_name.val('');
						forum_content.val('');
						forum_hidden.prop('checked', false);
					}
				});
			} else {
				this.reloadContentPost({
					'action': 'forum_create',
					'forum_name': forum_name.val(),
					'forum_content': forum_content.val(),
					'forum_hidden': forum_hidden.prop('checked')
				});
			}
		},

		threadCreate: function () {
			var params = {};

			params.action = 'thread_create';
			params.forum_id = $('#forum_forum_id').val();
			params.thread_name = $('#forum_thread_name').val();
			params.thread_important = $('#forum_thread_important').prop('checked');
			params.post_text = $('#forum_post_textarea').val();

			Layout.allianceForum.getWnd().getWindowVeryMainNode().find('.bb_color_picker').remove();

			if ($('#forum_poll_question').length === 1) {
				params.poll_question = $('#forum_poll_question').val();
				params.poll_show_result = $('#forum_poll_show_result').prop('checked');
				params.poll_option = [];

				$('#forum_poll_options_list input').each(function(i, elem) {
					params.poll_option[i] = $(elem).val();
				});
			}

			Layout.allianceForum.getWnd().sendMessage('go',params);
		},

		pollVote: function () {
			var thread_id = $('#forum_thread_id').val();
			var poll_id = $('#forum_poll_id').val();
			var poll_option_id = $('#forum_poll_wrapper input:radio:checked').val();

			if (poll_option_id === undefined) {
				poll_option_id = 0;
			}

			this.reloadContentPost({
				'action': 'poll_vote',
				'thread_id': thread_id,
				'poll_id': poll_id,
				'poll_option_id': poll_option_id
			});
		},

		scrollPostsDown : function() {
			var postlist = $('#postlist'),
				scrollHeight = document.getElementById('postlist').scrollHeight,
				innerHeight = postlist.innerHeight();

			if (scrollHeight > innerHeight) {
				postlist.scrollTop(scrollHeight);
			}
		},

		postReply: function (thread_id, page) {
			var params = {};
			params.action = 'post_reply';
			params.thread_id = thread_id;
			params.page = page;

			Layout.allianceForum.getWnd().sendMessage('go', params, this.scrollPostsDown);
		},

		postSave: function () {
			var that = this;
			var thread_id = $('#forum_thread_id').val();
			var page = $('#forum_page').val();
			var post_id = $('#forum_post_id').length === 1 ? $('#forum_post_id').val() : 0;
			var post_text = $('#forum_post_textarea').val();

			Layout.allianceForum.getWnd().getWindowVeryMainNode().find('.bb_color_picker').remove();

			this.reloadContentPost({
				'action': 'post_save',
				'thread_id': thread_id,
				'page': page,
				'post_id': post_id,
				'post_text': post_text
			}, function() {
				if (post_id) {
					document.getElementById('post_' + post_id).scrollIntoView();
				} else {
					that.scrollPostsDown();
				}
			});
		},

		postQuote: function (thread_id, page, post_id) {
			var params = {};
			params.action = 'post_quote';
			params.thread_id = thread_id;
			params.post_id = post_id;
			params.page = page;

			Layout.allianceForum.getWnd().sendMessage('go', params);
		},

		postEdit: function (thread_id, page, post_id) {
			var params = {};
			params.action = 'post_edit';
			params.thread_id = thread_id;
			params.post_id = post_id;
			params.page = page;

			Layout.allianceForum.getWnd().sendMessage('go', params);
		},

		postCancel: function (thread_id, post_id, page_nr) {
			this.viewThread(thread_id, false, page_nr, post_id);
		},

		search: function (keywords,forum_id,page) {
			var params = {};
			params.action = 'search';
			params.keywords = encodeURIComponent(keywords);
			params.forum_id = forum_id;
			params.page = page || 1;

			Layout.allianceForum.getWnd().sendMessage('go', params);
		},

		initAutocomplete: function () {
			$('#share_forum_with_alliance #shared_with_name').oldautocomplete('/autocomplete', {
				'extraParams' : {
					'what' : 'game_alliance'
				},
				'minChars' : 3,
				'autoFill' : true
			});
		},

		togglePoll: function (options) {
			options = options || {};
			var poll = $('#forum_poll_wrapper');
			var visible = poll.is(':visible');

			function show() {
				poll.show();
				$('#poll_toggle span').toggleClass('collapsed',false).toggleClass('expanded',true);
			}

			function hide() {
				poll.hide();
				$('#poll_toggle span').toggleClass('collapsed',true).toggleClass('expanded',false);
			}

			if (options.show === false || visible) {
				hide();
			} else if (options.show || !visible) {
				show();
			}
		},

		setData: function (forum_datas) {
			this.forum_id = forum_datas.forum_id;
			this.thread_id = forum_datas.thread_id;

			delete forum_datas.forum_id;
			delete forum_datas.thread_id;

			this.forum_datas = forum_datas;
		},

		displayData: function () {
			$.each(this.forum_datas, function (forum_id, data) {
				var content = '';
				var jQElem = $('span.forum_id_' + forum_id);

				if (jQElem.length > 0 && (data.forum_content_shorten.length > 0 || data.alliances.length > 0)) {
					if (data.forum_content_shorten.length > 0) {
						content = $('<div/>').text(data.forum_content_shorten).html() + '<br />';
					}

					if (data.alliances.length > 0) {
						content += '<b>' + _('Shared with') + '</b>';
						$.each(data.alliances, function(idx, name) {
							content += '<br />' + name;
						});
					}

					jQElem.tooltip(content);
				}
			});
		},

		toggleFunctionBar: function (action) {
			var top = $('#thread_functions');
			var height_top = 102;

			//show poll
			if (top.is(':hidden')) {
				top.show();
				top.animate({height: height_top.toString(10) + 'px'}, 'normal');

				$('div.forum_toggle span').toggleClass('collapsed',false).toggleClass('expanded',true);
			}
			else { //hide poll
				top.animate({
					height: '0px'
				}, 'normal',function(){
					top.hide();
				});
				//list.animate({top:  theight}, 'normal');

				$('div.forum_toggle span').toggleClass('collapsed',true).toggleClass('expanded',false);
			}
		},

		initForumPopups: function() {
			$('#admin_functions a.openclose_button.openclose_toggle').tooltip(_('Open/close marked threads'));
			$('#admin_functions a.cancel').tooltip(_('Delete marked threads'));
			$('#admin_functions a.important_button').tooltip(_('Set marked threads to important/normal'));
			$('#admin_functions #move a.button').tooltip(_('Move marked threads to the selected forum'));
			$('#threadlist a.forum_lastpost').tooltip(_('Go to last post'));

			$('#save_thread_title').tooltip(_('Save changes'));
			$('#forum_thread_name_span_text_admin').tooltip(_('Change title'));
			$('a.openclose_button.closed').tooltip(_('Open thread'));
			$('a.openclose_button.open').tooltip(_('Close thread'));
			$('#forum_buttons a.cancel').tooltip(_('Delete thread'));

			$('#forum_list a.cancel').tooltip(_('Delete forum'));
			$('#forumlist a.confirm').tooltip(_('Save changes'));
			$('li.shared_forum a.confirm').tooltip(_('Unlock forum'));
			$('div.text_box').tooltip(_('Rename'));
			$('#forumlist span.hidden_icon').tooltip(_('Hidden forum'));
			$('#forumlist span.share_icon').tooltip(_('Edit entries'));

			Forum.initAutocomplete();
		},

		initialize: function() {
			if (!this.flag_separate_forum_tab) {
				$('a.separate_forum_tab_link').show();
			}
			this.initForumPopups();
		}
	};

	window.Forum = Forum;
}(jQuery));
