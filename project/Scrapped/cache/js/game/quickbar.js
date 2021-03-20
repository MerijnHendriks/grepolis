/* global GPWindowMgr, HumanMessage, hOpenWindow, _*/
(function() {
	'use strict';

	/**
	 * This code is used to handle Quickbar in the settings window
	 */
	var Quickbar = {

		initialize: function(models) {
			var model = models.quickbar;

			var that = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_PLAYER_SETTINGS);
			var quickbar_elm = $('#quickbar');

			//edit item - show form
			quickbar_elm.find('a').click(function() {
				var id = $(this).parent('li').attr('id').replace(/id_/, '');
				var item = model.getOption(parseInt(id));
				Quickbar.show_edit_form(item);
			});

			//move items in quickbar
			quickbar_elm.sortable({
				update: function(event, ui) {
					var sort_array_unformated = quickbar_elm.sortable('toArray');
					var sort_array = [];
					$.each(sort_array_unformated, function(i, id) {
						sort_array[i] = parseInt(id.replace(/id_/, ''),10);
					});
					that.ajaxRequestPost('quickbar', 'resort', {sort_array: sort_array}, function(window, data) {
						that.setContent3('.settings-container', data.html);

						Quickbar.refresh(data, models);
					});
				}
			});

			var toolbar_item_id = $('#toolbar_item_id'),
				toolbar_item_name = $('#toolbar_item_name'),
				toolbar_item_image = $('#toolbar_item_image'),
				toolbar_item_url = $('#toolbar_item_url'),
				edit_toolbar_item = $('#edit_toolbar_item'),
				add_data = $('#add_data'),
				item_url = $('#item_url'),
				save_data = $('#save_data'),
				submenu = $('#submenu');

			//add item - show form
			$('#add_item_show').click(function() {
				toolbar_item_id.val('');
				toolbar_item_name.val('');
				toolbar_item_image.val('');
				toolbar_item_url.val('');
				edit_toolbar_item.fadeIn('fast');
				add_data.show(); //show the right button
				item_url.show();
				save_data.hide();
				submenu.hide();
			});

			//add item - save
			add_data.click(function() {
				var item = {
					name: toolbar_item_name.val(),
					url: toolbar_item_url.val(),
					image: toolbar_item_image.val()
				};
				if (submenu.html() !== '') {
					item.submenu = edit_toolbar_item.serializeArray();
				}

				that.ajaxRequestPost('quickbar', 'add_item', item, function(window, data) {
					HumanMessage.success(_('The menu item was added.'));
					that.setContent3('.settings-container', data.html);

					Quickbar.refresh(data, models);
				});
			});

			//add submenu - show form
			$('#add_submenu_show').click(function() {
				Quickbar.show_edit_form(new GameModels.QuickbarOption({
					item: {name: '', image: '', id: ''},
					options: [
						{name: '', url: '', id: ''}
					]
				}));
				toolbar_item_url.val('');
				add_data.show(); //show the right button
				item_url.hide();
				save_data.hide();
			});

			//edit item - save
			save_data.click(function() {
				var item = {
					id: toolbar_item_id.val(),
					name: toolbar_item_name.val(),
					url: toolbar_item_url.val(),
					image: toolbar_item_image.val()
				};
				if (submenu.html() !== '') {
					item.submenu = edit_toolbar_item.serializeArray();
				}

				that.ajaxRequestPost('quickbar', 'edit_item', item, function(window, data) {
					HumanMessage.success(_('The quick bar has been edited successfully.'));
					that.setContent3('.settings-container', data.html);

					Quickbar.refresh(data, models);
				});
			});

			//remove item
			$('#remove_data').click(function() {
				var id = toolbar_item_id.val() || -1;
				hOpenWindow.showConfirmDialog(_('Are you sure?'), _('Are you sure that you would like to remove this menu item?'), function() {
					that.ajaxRequestPost('quickbar', 'remove_item', {'id': id}, function(window, data) {
						HumanMessage.success(_('The menu item was removed.'));
						that.setContent3('.settings-container', data.html);

						Quickbar.refresh(data, models);
					});
				});
			});

			//reset Quickbar
			$('#reset_quickbar').click(function() {
				hOpenWindow.showConfirmDialog(_('Are you sure?'), _('Are you sure that you want to reset the quick bar?'), function() {
					that.ajaxRequestPost('quickbar', 'reset_quickbar', {}, function(window, data) {
						HumanMessage.success(_('The quick bar has been reset.'));
						that.setContent3('.settings-container', data.html);

						Quickbar.refresh(data, models);
					});
				});
			});
		},

		show_edit_form : function(item) {
			var toolbar_item_id = $('#toolbar_item_id'),
				toolbar_item_name = $('#toolbar_item_name'),
				toolbar_item_image = $('#toolbar_item_image'),
				toolbar_item_url = $('#toolbar_item_url'),
				edit_toolbar_item = $('#edit_toolbar_item'),
				add_data = $('#add_data'),
				item_url = $('#item_url'),
				save_data = $('#save_data'),
				submenu = $('#submenu');

			add_data.hide(); //show the right button
			save_data.show();
			toolbar_item_id.val(item.getId());
			toolbar_item_name.val(item.getName());
			if (item.isDropdownMenu()) {
				//item is submenu?
				item_url.hide();
				var submenu_html = '';
				submenu_html += '<b>' + _('Menu items') + '</b>';
				submenu_html += '<ul>';

				item.getSubOptions().forEach(function(sub_option, id) {
					submenu_html += '<li>';
					submenu_html += '<label>' + _('Name:') + '  </label><input type="text" name="submenu[' + id + '][name]" value="' + sub_option.getName().replace(/"/g, '&quot;') + '"/>  ';
					submenu_html += '<label>' + _('Link:') + '  </label><input type="text" name="submenu[' + id + '][url]" value="' + sub_option.getSnippet().replace(/"/g, '&quot;') + '"/>  ';
					submenu_html += '<a href="#" class="cancel delete_submenu_item"></a><br style="clear:both"/>';
					submenu_html += '</li>';
				});

				submenu_html += '</ul>';
				submenu_html += '<div style="clear:both;"></div><a href="#" class="add_submenu_item invite_to_ally" style="float:right;"></a>';
				//$('#toolbar_item_url').css("disabled", "disabled");
				submenu.html(submenu_html).show();

				//sortable list elements
				submenu.find('ul').sortable();

				//delete submenu item
				$('a.delete_submenu_item').click(function() {
					$(this).parent('li').remove();
				});

				//add submenu item
				$('a.add_submenu_item').click(function() {
					var id = submenu.find('ul li').length +  1;
					submenu_html = '';
					submenu_html += '<li>';
					submenu_html += '<label>' + _('Name:') + '</label><input type="text" name="submenu[' + id + '][name]" value=""/>  ';
					submenu_html += '<label>' + _('Link:') + '</label><input type="text" name="submenu[' + id + '][url]" value=""/>  ';
					submenu_html += '<a href="#" class="cancel delete_submenu_item"></a><br style="clear:both"/>';
					submenu_html += '</li>';
					submenu.find('ul').append(submenu_html);

					//delete submenu item
					$('a.delete_submenu_item').click(function() {
						$(this).parent('li').remove();
					});

					//sortable list elements
					submenu.find('ul').sortable();
				});
			} else {
				toolbar_item_url.val(item.getSnippet()).show();
				item_url.show();
				submenu.empty();
			}

			edit_toolbar_item.fadeIn('fast');
		},

		toggleInfoText: function() {
			$('#quickbar_toggle_text_button').html($('#quickbar_info_text').is(':visible') ? _('Display text') : _('Hide text'));
			$('#quickbar_info_text').slideToggle();
		},

		refresh: function(data, models) {
			var toolbar = $('#toolbar');
			//append quickbar to layout header
			if (data.quickbar) {
				if (toolbar.length) {
					toolbar.remove();
				}
			} else {
				toolbar.remove();
			}
			Quickbar.initialize(models);
		}
	};

	window.Quickbar = Quickbar;
}());
