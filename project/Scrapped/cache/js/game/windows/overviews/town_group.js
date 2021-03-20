/*globals Sort, navigator, _, GameEvents, GameData, gpAjax, ITowns, HumanMessage, Layout, us,GPWindowMgr, Game, InfoWindowFactory,
  GameDataPremium, StringSorter, NumberSorter, ConfirmationWindowFactory */

(function() {
	'use strict';

	var TownGroupOverview = {
		hasActiveGroup : false,
		property : '',
		list: null,
		active_list: null,
		temporary_active_group : 0,
		old_temp_active_group : 0,
		move: true,
		sum_active_towns: 0,
		original_target: null,
		town_data: {},
		wnd_handler_id: null,
		sort_direction: 'asc',
		dialog_handler: null,

		reset: function() {
			TownGroupOverview.hasActiveGroup = false;
			TownGroupOverview.property = '';
			TownGroupOverview.list= null;
			TownGroupOverview.active_list= null;
			TownGroupOverview.temporary_active_group = 0;
			TownGroupOverview.old_temp_active_group = 0;
			TownGroupOverview.move= true;
			TownGroupOverview.sum_active_towns= 0;
			TownGroupOverview.original_target= null;
			TownGroupOverview.town_data= {};
			TownGroupOverview.wnd_handler_id= null;
		},

		init: function(wnd_id) {
			//Reset all variables
			Sort.sortBy(null); //reset sorting
			TownGroupOverview.reset();

			TownGroupOverview.wnd_handler_id = wnd_id;

			$('.town_draggable').draggable({
				appendTo: 'body',
				helper: function() {
					var clone = $(this).clone(); //clone
					var id = '_' + clone.attr('id'); //valid id
					return clone.attr('id', id );
				},
				drag: function(e) {
					if (TownGroupOverview.original_target === null) {
						TownGroupOverview.original_target = e.target;
						if (navigator.appName === 'Microsoft Internet Explorer') {
							$(TownGroupOverview.original_target).attr('style', 'filter:alpha(opacity=50);');
						} else {
							$(TownGroupOverview.original_target).attr('style', 'opacity:0.5;');
						}
					}
				},
				stop: function () {
					$(TownGroupOverview.original_target).removeAttr('style');
					TownGroupOverview.original_target = null;
				}
			});

			$('.town_drop_area_active').droppable({
				accept: '#town_group_all_towns .town_draggable',
				activeClass: 'droppable-active',
				hoverClass: 'droppable-hover',
				drop: function(e, ui) {
					TownGroupOverview.addToGroup(ui.draggable);
				}
			});

			$('.town_drop_area_remaining').droppable({
				accept: '#town_group_active_towns .town_draggable',
				activeClass: 'droppable-active',
				hoverClass: 'droppable-hover',
				drop: function(e, ui) {
					TownGroupOverview.removeFromGroup(ui.draggable);
				}
			});

			TownGroupOverview.makeListsFromDOM();

			TownGroupOverview.setUnitPopups();
			TownGroupOverview.sortTownsBy('town_name', false);
			$('.sort_icon_all.town_name, .sort_icon_active.town_name').addClass('active');

			//sort
			$('.sort_icon_active').bind('click',function(){
				TownGroupOverview.sortTownsBy(($(this).attr('class')).match(/town_\w+/g)[0], true, true);
				$('.sort_icon_active').removeClass('active');
				$(this).addClass('active');
			});
			$('.sort_icon_all').bind('click',function(){
				TownGroupOverview.sortTownsBy(($(this).attr('class')).match(/town_\w+/g)[0], false, true);
				$('.sort_icon_all').removeClass('active');
				$(this).addClass('active');
			});
			$('.overview_type_icon').bind('click',function(){
				TownGroupOverview.setOverviewType(($(this).attr('class')).replace(/(overview_type_icon\s)|(\sactive)/g,''), false);
			});

			$('.sort_icon_all.town_name').tooltip(_('Sort by city name'));
			$('.sort_icon_all.town_points').tooltip(_('Sort by points'));
			$('.sort_icon_all.town_population').tooltip(_('Sort by free population'));
			$('.sort_icon_active.town_name').tooltip(_('Sort by city name'));
			$('.sort_icon_active.town_points').tooltip(_('Sort by points'));
			$('.sort_icon_active.town_population').tooltip(_('Sort by free population'));
			$('.overview_type_icon.show_resources').tooltip(_('Show resources in the cities'));
			$('.overview_type_icon.show_units').tooltip(_('Show units in the cities'));

			$('.rename_town_group').tooltip(_('Rename group'));
			$('.rename_town_confirm').tooltip(_('Save'));
			$('.rename_town_cancel').tooltip(_('Cancel'));

			$('.select_town_group').tooltip(_('Activate group'));
			$('.delete_town_group').tooltip(_('Delete group'));
			$('.storage').tooltip(_('Warehouse'));
			$('.population_info').tooltip(_('Free population'));
			$('.town_population_sort').tooltip(_('Sort by free population'));

			$.Observer(GameEvents.itowns.town_groups.remove).unsubscribe(['town_group_overview']);
			$.Observer(GameEvents.itowns.town_groups.add).unsubscribe(['town_group_overview']);

			$.Observer(GameEvents.itowns.town_groups.remove).subscribe(['town_group_overview'], TownGroupOverview.removeFromGroupEvent);
			$.Observer(GameEvents.itowns.town_groups.add).subscribe(['town_group_overview'], TownGroupOverview.addToGroupEvent);
		},

		makeListsFromDOM: function() {
			TownGroupOverview.list = $.makeArray($('#town_group_all_towns').find('.town_item'));
			TownGroupOverview.active_list = $.makeArray($('#town_group_active_towns').find('.town_item'));
		},

		setUnitPopups: function() {
			$.each(GameData.units, function(unit) {
				$('.unit_' + unit).setPopup(unit);
			});
		},

		setOverviewType: function(type) {
			var data = {};
			data.overview_type = type;

			if (this.town_data[type]) {
				TownGroupOverview.update_town_data(this.town_data[type], type);
				return;
			}

			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'set_overview_type', data, false, function (return_data) {
					TownGroupOverview.update_town_data(return_data.towns, type);
					TownGroupOverview.town_data[type] = return_data.towns;
					TownGroupOverview.setUnitPopups();
				}, {}, 'set_overview_type');
			}
		},

		update_town_data: function(data, type) {
			$.each(data, function(town_id, content) {
				$('#ov_town_'+town_id+' .box_content').html('<div>'+content+'</div>');
			});

			$('.overview_type_icon').removeClass('active');
			$('#sort_groups .' + type).addClass('active');
		},

		removeFromGroup: function(town_element) {
			var data = {};
			data.town_id = town_element[0].id.replace('ov_town_', '');
			data.group_id = TownGroupOverview.temporary_active_group;
			ITowns.townGroupsRemoveFromGroup(data.group_id,data.town_id);
		},

		removeFromGroupEvent: function(evt, return_data) {
			TownGroupOverview.moveRight(return_data);

			// if no town is in group, remove link to set it active
			if ($('#town_group_active_towns').children().length === 0) {
				$('#town_group_id_' + return_data.group_id).find('a.select_town_group').hide();

				// if active town group is empty, deselect it
				if (return_data.is_active) {
					TownGroupOverview.setActiveTownGroup(0, '', '', false);
				}
			}
			else {
				$('#town_group_id_' + return_data.group_id).find('a.select_town_group').show();

			}
			if ($('#town_group_all_towns').children().length === 1) {
				$('#sort_icons_all_towns').find('.hide').removeClass('hide').addClass('show');
			}
		},

		/**
		 *
		 * is called when you drop a dragged town onto the group list
		 *
		 */
		addToGroup: function(town_element) {
			var data = {};
			data.town_id = parseInt(town_element[0].id.replace('ov_town_', ''), 10);
			data.group_id = TownGroupOverview.temporary_active_group;
			//No group selected
			if (parseInt(data.group_id, 10) === 0) {
				HumanMessage.error(_('No group has been selected!'));
				return;
			}
			ITowns.townGroupsAddToGroup(data.group_id, data.town_id);
		},

		/**
		 *
		 * is called from itowns as callback when town is successfully added to group on server
		 *
		 */
		addToGroupEvent: function(evt, return_data) {
			TownGroupOverview.moveLeft(return_data);

			// if one or more towns are in group, make it selectable
			if (TownGroupOverview.sum_active_towns > 0) {
				$('#sort_icons_active_group_towns').find('.hide').removeClass('hide').addClass('show');

				var $town_group = $('#town_group_id_' + return_data.group_id);

				if (!$town_group.find('a.select_town_group').length) {
					$town_group.append(
						'<a class="select_town_group confirm" href="#" onclick="TownGroupOverview.setActiveTownGroup(' + return_data.group_id + ', \'town_group_overviews\', \'\'); return false"></a>');
					$('.select_town_group').tooltip(_('Activate group'));
				}
				$town_group.find('a.select_town_group').show();
			}

			if ($('#town_group_all_towns').children().length === 0 && $('.town_group_active.show').length > 0) {
				InfoWindowFactory.openAllTownsInOneGroupInfoWindow();
			}
		},

		/**
		 *
		 * move town div from right list to group list
		 *
		 */
		moveLeft: function(town_data) {
			var town_id = town_data.town_id,
				$town_group_active_towns = $('#town_group_active_towns');

			//if it is already in the list
			if ($town_group_active_towns.find('#ov_town_' + town_id).length !== 0) {
				return;
			}

			var $town = $('#ov_town_' + town_id);
			//town could be not found!!
			TownGroupOverview.insertTownInto($town, $town_group_active_towns);
			TownGroupOverview.sum_active_towns++;

			TownGroupOverview.makeListsFromDOM();

			if ($('#town_group_all_towns').children().length === 0) {
				$('#sort_icons_all_towns .show').removeClass('show').addClass('hide');
			}

			TownGroupOverview.sortTowns(true);
		},

		moveRight: function(town_data) {
			var $town = $('#ov_town_' + town_data.town_id);
			//town could be not found!!
			TownGroupOverview.insertTownInto($town,$('#town_group_all_towns'));
			if (TownGroupOverview.sum_active_towns > 0) {
				TownGroupOverview.sum_active_towns--;
			}
			TownGroupOverview.makeListsFromDOM();

			if ($('#town_group_active_towns').children().length === 0) {
				$('#sort_icons_active_group_towns .show').removeClass('show').addClass('hide');
			}

			TownGroupOverview.sortTowns(false);
		},

		/**
		 * Inserts a town into an ordered list at the correct position, avoids sorting again and again
		 *
		 * @param {jQuery} town The town that should be inserted
		 * @param {jQuery} list An ordered list where the town should be inserted
		 */
		insertTownInto: function(town,list) {
			town.appendTo(list);
		},

		/**
		 *
		 * set town group which we want to edit
		 *
		 */
		setTemporaryActiveGroup: function(data) {
			var tmp_obj_hide_to_show = null;
			var tmp_obj_show_to_hide = null;
			var tmp_title = '';
			var $tmp_active_group = $('#town_group_id_' + TownGroupOverview.temporary_active_group);
			var town_id_arr = data.towns_ids;

			if (us.isArray(town_id_arr)) {
				TownGroupOverview.cleanupActiveTowns(town_id_arr);
				TownGroupOverview.cleanupRemainingTowns(town_id_arr);
				TownGroupOverview.sum_active_towns = us.keys(town_id_arr).length;
			}

			if (parseInt(TownGroupOverview.old_temp_active_group, 10) !== 0) {
				tmp_obj_show_to_hide = $('#town_group_id_' + TownGroupOverview.old_temp_active_group + ' .show');
				tmp_obj_hide_to_show = $('#town_group_id_' + TownGroupOverview.old_temp_active_group + ' .hide');
				tmp_obj_show_to_hide.removeClass('show').addClass('hide');
				tmp_obj_hide_to_show.removeClass('hide').addClass('show');
			}

			// mark selected group as link
			if (parseInt(TownGroupOverview.temporary_active_group, 10) !== 0) {
				tmp_obj_show_to_hide = $tmp_active_group.find('.show');
				tmp_obj_hide_to_show = $tmp_active_group.find('.hide');
				tmp_obj_show_to_hide.removeClass('show').addClass('hide');
				tmp_obj_hide_to_show.removeClass('hide').addClass('show');
				tmp_title = $('#town_group_id_' + TownGroupOverview.temporary_active_group + ' .show').text().trim();

				// change head of active group
				$('#active_town_list_head').text(_('Cities from %s').replace('%s', tmp_title));

				// check if sort icons should be shown
				if ($('#town_group_id_' + TownGroupOverview.temporary_active_group + ' .select_town_group').length > 0) {
					$('#sort_icons_active_group_towns .hide').removeClass('hide').addClass('show');
				}
			}
		},

		// move all towns, not in town_id_arr to the right side
		cleanupActiveTowns: function(town_id_arr) {
			var active_towns = $('#town_group_active_towns .town_item');

			$.each(active_towns, function() {
				var town_id = parseInt(this.id.replace('ov_town_', ''), 10);
				var move = true;

				$.each(town_id_arr, function() {
					if (this.id === town_id) {
						move = false; // do not move
					}
				});

				if (move) {
					TownGroupOverview.moveRight({'town_id': town_id});
				}
			});

			if ($('#town_group_active_towns').children().length === 0) {
				$('#sort_icons_active_group_towns .show').removeClass('show').addClass('hide');
			}

			Sort.sortBy(null); //just to be safe
			TownGroupOverview.sortTowns(false);
		},

		// move all towns in town_id_arr to the left side
		cleanupRemainingTowns: function(town_id_arr) {
			var rem_towns = $('#town_group_all_towns .town_item');

			$.each(rem_towns, function(){
				var town_id = parseInt(this.id.replace('ov_town_', ''), 10);

				$.each(town_id_arr, function() {
					if (this.id === town_id) {
						TownGroupOverview.moveLeft({'town_id': town_id});
					}
				});
			});

			Sort.sortBy(null); //just to be safe
			TownGroupOverview.sortTowns(true);
		},

		sortTowns: function(isMovedLeft) {
			var tmp = TownGroupOverview.property !== '' ? TownGroupOverview.property : 'town_name';
			TownGroupOverview.sortTownsBy(tmp, isMovedLeft, false);
		},

		sortTownsBy: function(_property, isMovedLeft, reverse) {
			this.property = _property;
			var sorter = _property === 'town_name' ? new StringSorter() : new NumberSorter();

			if (reverse) {
				this.switchSortDirection();
			}

			if (isMovedLeft) {
				TownGroupOverview.active_list = sorter.compareObjectsByFunction(TownGroupOverview.active_list, function(obj) {
					return $(obj).find('span.sortable.' + _property).text();
				}, this.sort_direction);
				$('#town_group_active_towns').append(TownGroupOverview.active_list);
			} else {
				TownGroupOverview.list = sorter.compareObjectsByFunction(TownGroupOverview.list, function(obj) {
					return $(obj).find('span.sortable.' + _property).text();
				}, this.sort_direction);
				$('#town_group_all_towns').append(TownGroupOverview.list);
			}
		},

		switchSortDirection: function() {
			if (this.sort_direction ===  'asc') {
				this.sort_direction = 'desc';
			} else {
				this.sort_direction = 'asc';
			}
		},

		setActiveTownGroup: function(group_id, controller_name, action_name) {
			var handler;

			if (controller_name === 'town_overviews') {
				handler = function() {
					TownGroupOverview.toggleTownGroupList(controller_name, action_name);
					var w = GPWindowMgr.GetByID(TownGroupOverview.wnd_handler_id);
					w.requestContentGet('town_group_overviews', 'town_group_overview', {});

					$.Observer(GameEvents.itowns.town_groups.set_active_group).unsubscribe(['town_group_overview']);
				};
			}
			else if (controller_name === 'town_group_overviews') {
				if ($('#town_group_id_' + group_id + ' .town_group_active').length === 0) {
					handler = function(event, data) {
						// show activated town_group
						TownGroupOverview.setTemporaryActiveTownGroup(data.town_group_id);
						// display image for active town_group
						var tg_img = $('.show .img_active_town_group');

						if (tg_img.length === 0) {
							tg_img = $('<img class="img_active_town_group" src="'+Game.img()+'/game/overviews/active_group.png" alt="A - " height="14" width="14" />');
						}

						$('.town_group_active').removeClass('town_group_active').addClass('town_group_inactive');
						$('#town_group_id_' + data.town_group_id + ' .town_group_inactive').removeClass('town_group_inactive').addClass('town_group_active');
						tg_img.prependTo($('#town_group_id_' + data.town_group_id + ' .town_group_active'));
						$('.town_group_inactive .img_active_town_group').remove();

						// if temporary active group is activated its show/hide classes need to be switched to show it's text bold
						if($('#town_group_id_' + data.town_group_id + ' .show .bold').length > 0) {
							var active_hide = $('#town_group_id_' + data.town_group_id + ' .show');
							var active_show = $('#town_group_id_' + data.town_group_id + ' .hide');
							active_hide.removeClass('show').addClass('hide');
							active_show.removeClass('hide').addClass('show');
						}

						// if active group was unset while in controller town_group_overviews, reload page
						if (data.town_group_id === 0) {
							var w = GPWindowMgr.GetByID(TownGroupOverview.wnd_handler_id);
							w.requestContentGet('town_group_overviews', 'town_group_overview', {});
						}

						$.Observer(GameEvents.itowns.town_groups.set_active_group).unsubscribe(['town_group_overview']);
					};
				}
			}
			else {
				handler = function() {
					TownGroupOverview.toggleTownGroupList(controller_name, action_name);

					$.Observer(GameEvents.itowns.town_groups.set_active_group).unsubscribe(['town_group_overview']);
				};
			}

			//For some reason second condition does not set handler to be a function (clicking twice on the set active group in overview throws an error)
			if (typeof handler === 'function') {
				$.Observer(GameEvents.itowns.town_groups.set_active_group).subscribe(['town_group_overview'], handler);
			}

			ITowns.setActiveTownGroup(group_id);

			return false;
		},

		toggleTownGroupList: function(controller_name, action_name) {
			if (Layout.town_group_list_toggle) {
				return;
			}

			var list_element = $('#town_list');
			if (list_element.is(':visible')) {
				list_element.hide().empty();
			} else {
				Layout.town_group_list_toggle = true;
				list_element.detach();
				if (GameDataPremium.hasCurator()) {
					gpAjax.ajaxGet('town_group_overviews', 'get_selectable_town_groups', {
						'controller_name': controller_name,
						'action_name': action_name
					}, false, function (data) {
						var town_groups = data.town_groups;
						var list = $('<ul></ul>');
						$('<div id="town_list_top"></div>').appendTo(list);
						$.each(town_groups, function () {
							if (this.active) {
								TownGroupOverview.has_active_group = true;
								$('<li><img src="' + Game.img() + '/game/overviews/active_group.png" alt="A - " height="14" width="14" /> <span class="bold">' +
								this.name + '</span></li>').appendTo(list);
							} else {
								$('<li><a href="#" onclick="return TownGroupOverview.setActiveTownGroup(' + this.id +
								', \'' + data.controller_name + '\', \'' + data.action_name + '\')">' +
								this.name + '</a></li>').appendTo(list);
							}
						});
						$('<li>&nbsp;</li>').appendTo(list);

						// check if player has an active group. If yes, show link to deselect, otherwise not
						if (TownGroupOverview.has_active_group) {
							$('<li><a href ="#" onclick="return TownGroupOverview.setActiveTownGroup(-1, \'' + data.controller_name + '\', \'' + data.action_name + '\')">' + _('Deselect group') + '</a></li>').appendTo(list);
						}
						$('<li><a href ="#" onclick="return TownGroupOverview.gotoTownGroupOverview()">' + _('Manage groups') + '</a></li>').appendTo(list);
						$('<div id="town_list_bottom"></div>').appendTo(list);
						list.appendTo(list_element);
						list_element.show();
						delete Layout.town_group_list_toggle;
					});
				}
			}
		},

		deleteTownGroup: function(id, town_group_name, active){
			if (GameDataPremium.hasCurator()) {
				ConfirmationWindowFactory.openConfirmationDeleteTownGroupWindow(function () {
					gpAjax.ajaxPost('town_group_overviews', 'delete_town_group', {
						town_group_id: id,
						town_group_name: town_group_name,
						active: active
					}, false, function (data) {
						if (data.success) {
							$('#town_group_id_' + id + '').remove();

							// if active group is deleted, cleanup townlist
							if (data.active || data.town_group_id === TownGroupOverview.temporary_active_group) {
								TownGroupOverview.has_active_group = false;
								TownGroupOverview.temporary_active_group = 0;
								TownGroupOverview.cleanupActiveTowns({});

								$('#active_town_list_head').text(_('No group has been selected'));
								$('#sort_icons_active_group_towns .show').removeClass('show').addClass('hide');
							}

							// check if link 'create group' should be shown
							var sum_groups = $('#overview_town_group_list').children().length;

							var list = $('#town_group_overview_dummy');
							if (sum_groups === data.max_sum_groups - 1) {
								var elem = $('<ul class="game_list" id="town_group_add_new_group"></ul>');
								elem.append('<li><form id="town_group_name" class="bold" action=""><span id="town_grop_name_span_text"><a href="javascript:void(0)" onclick="TownGroupOverview.addTownGroup()" id="add_town_group_href">' + _('Add new group') + '</a></span><span id="town_group_name_span_input" style="display:none"><input type="text" id="town_group_name_input" value="" maxlength="20" size="15" /><img src="' + Game.img() + '/game/layout/town_name_save.png" alt="" id="save_town_group_name" onclick="TownGroupOverview.saveTownGroupName()" style="cursor:pointer" /></span></form></li>');
								elem.appendTo(list);
							}
							else if (sum_groups === 0) {
								$('#town_group_overview_head').text(_('No group present'));
							}

							$.Observer(GameEvents.itowns.refetch.start).publish({});

							GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS).reloadContent();
						}
					}, {}, 'delete_town_group');
				}, null, {town_group_name: town_group_name});
			}
		},

		saveTownGroupName: function() {
			var town_group_name = $('#town_group_name_input').val();
			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'add_town_group', {
					town_group_name: town_group_name
				}, false, function (data) {
					if (data.success) {
						var list_element = $('#overview_town_group_list');

						var list = $('<li class="town_group_name" id="town_group_id_' +
						data.town_group_id + '"><div class="town_group_inactive show"><a href="#" onclick="TownGroupOverview.setTemporaryActiveTownGroup(' +
						data.town_group_id + ', \'\'' + ', \'\'' + ', ' + false + ')">' + data.town_group_name + '</a></div>' +
						'<div class="town_group_inactive hide"><span class="bold">' + data.town_group_name + '</span></div><a class="cancel delete_town_group" href="#" onclick="TownGroupOverview.deleteTownGroup(' + data.town_group_id + ', \'' + data.town_group_name + '\', false)"></a><a class="rename rename_town_group" href="#" onclick="TownGroupOverview.renameTownGroup(' + data.town_group_id + ', \'' + data.town_group_name + '\')"></a></li>');
						list.appendTo(list_element);

						var sum_groups = $(list_element).children().length;
						if (sum_groups >= data.max_sum_groups) {
							$('#town_group_add_new_group').remove();
						}

						if (sum_groups === 1) {
							$('#town_group_overview_head').text(_('Groups'));
						}

						$('#town_group_name_span_input').css('display', 'none');

						if (data.show_hint) {
							InfoWindowFactory.openCreateFirstTownGroupInfoWindow();
						}

						$.Observer(GameEvents.itowns.refetch.start).publish({});

						GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS).reloadContent();
					}
				}, {}, 'add_town_group');
			}
		},

		renameTownGroupName: function() {
			var town_group_rename_id = $('#town_group_rename_input_id').val();
			var town_group_rename_name = $('#town_group_rename_input_name').val();

			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'rename_town_group', {
					town_group_id: town_group_rename_id,
					town_group_name: town_group_rename_name
				}, false, function (data) {
					if (data.success) {
						$('#town_group_rename_input_id').attr('value', '');
						$('#town_group_rename_input_name').attr('value', '');
						$('#town_group_options_rename').hide();
						$('#town_group_options_add').show();

						$.Observer(GameEvents.itowns.refetch.start).publish({});

						GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS).reloadContent();
					}
				}, {}, 'rename_town_group');
			}
		},

		renameCancel: function() {
			$('#town_group_rename_input_name').attr('value', '');
			$('#town_group_rename_input_id').attr('value', '');
			$('#town_group_options_rename').hide();
			$('#town_group_options_add').show();
		},

		renameTownGroup: function(town_group_rename_id, town_group_rename_name) {
			$('#town_group_options_add').hide();
			$('#town_group_options_rename').show();
			$('#town_group_rename_input_id').attr('value', town_group_rename_id);
			$('#town_group_rename_input_name').attr('value', town_group_rename_name);
		},

		addTownGroup: function(){
			$('#town_group_name_span_input').css('display', '');
			$('#town_group_name').bind('submit', TownGroupOverview.saveTownGroupName);
		},

		/**
		 *
		 * switch town group we want to edit
		 *
		 */
		setTemporaryActiveTownGroup: function(group_id) {
			TownGroupOverview.old_temp_active_group = TownGroupOverview.temporary_active_group;
			TownGroupOverview.temporary_active_group = group_id;

			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxGet('town_group_overviews', 'get_town_ids_by_group', {'group_id': group_id}, false, TownGroupOverview.editTownGroupEvent);
			}
		},

		/**
		 *
		 * update list with data from server
		 *
		 */
		editTownGroupEvent: function (data) {
			TownGroupOverview.setTemporaryActiveGroup(data);
		},

		gotoTownGroupOverview: function() {
			var w = GPWindowMgr.GetByID(TownGroupOverview.wnd_handler_id);
			w.requestContentGet('town_group_overviews', 'town_group_overview', {});
		}
	};

	window.TownGroupOverview = TownGroupOverview;
}());
