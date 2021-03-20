/*globals jQuery, us, CM, Layout, hOpenWindow, Game, Timestamp, WMap, s, GameEvents, GoToPageWindowFactory, AttackPlannerWindowFactory,
 DateHelper, gpAjax */

(function($) {
	'use strict';

	var wnd, cm_context, cm_reserve_town_popup, cm_reservations_list, root,
		templates, l10n;

	var model, view, controller;

	var $content;

	/**
	 * Model
	 */
	model = {
		data : null,

		default_per_page : 7,
		default_tab_nr : 0,
		default_page_nr : 0,

		selecting_mode : false,

		toggleSelection : function(reservation_id) {
			var reservation = this.getReservation(reservation_id);

			reservation.selected = !reservation.selected;
		},

		unselectAllReservations : function() {
			var reservations = this.getReservations(), i, l = reservations.length;

			for (i = 0; i < l; i++) {
				reservations[i].selected = false;
			}
		},

		getSelectionState : function(reservation_id) {
			return this.getReservation(reservation_id).selected;
		},

		getSelectedReservations : function() {
			var selected = [], reservations = this.getReservations(), i, l = reservations.length;

			for (i = 0; i < l; i++) {
				if (reservations[i].selected) {
					selected.push(reservations[i]);
				}
			}

			return selected;
		},

		setSelectingMode : function(value) {
			this.selecting_mode = value;
		},

		getSelectingMode : function() {
			return this.selecting_mode;
		},

		isSelectingModeActive : function() {
			return this.getSelectingMode();
		},

		hasCaptain : function() {
			return this.data.has_captain;
		},

		setHasCaptain : function(value) {
			this.data.has_captain = value;
		},

		getPerPage : function() {
			return this.default_per_page;
		},

		getTabNr : function() {
			return this.default_tab_nr;
		},

		getPageNr : function() {
			return this.default_page_nr;
		},

		isAdmin : function() {
			return this.data.is_admin;
		},

		setData : function(ret_data) {
			this.data = ret_data;
		},

		isOpenedFromTownInfo : function() {
			return typeof this.data.reservation_id !== 'undefined';
		},

		getPreselectedReservationId : function() {
			return this.data.reservation_id || 0;
		},

		getPageNrForPreselectedReservation : function(reservations) {
			var i, l = reservations.length, reservation,
				reservation_id = this.getPreselectedReservationId();

			for (i = 0; i < l; i++) {
				reservation = reservations[i];
				if (reservation.id === reservation_id) {
					return parseInt((i + 1) / model.getPerPage(), 10);//Return preselected page
				}
			}

			return 0;//return first page
		},

		removePreselectedReservationId : function() {
			delete this.data.reservation_id;
		},

		getAllianceByValueFromDropdown: function(value) {
			var alliances = this.data.partner_data, alliance_id;

			for (alliance_id in alliances) {
				if (alliances.hasOwnProperty(alliance_id) && parseInt(alliance_id, 10) === value) {
					return {value : alliance_id, name : alliances[alliance_id]};
				}
			}

			return null;
		},

		getAlliancesForDropdown : function() {
			var alliances = this.data.partner_data, alliance_id, options = [];

			for (alliance_id in alliances) {
				if (alliances.hasOwnProperty(alliance_id)) {
					options.push({value : alliance_id, name : alliances[alliance_id]});
				}
			}

			return options;
		},

		addReservation : function(reservation_data) {
			this.data.reservations.push(reservation_data);
		},

		updateReservationData : function(reservation_id, reservation_data) {
			var reservations = this.getReservations(), l = reservations.length;

			while (l--) {
				if (reservations[l].id === reservation_id) {
					reservations[l] = reservation_data;
				}
			}
		},

		getReservations : function() {
			return this.data.reservations;
		},

		getFilteredReservations : function(tab_nr, search_text, search_type, mode, page_nr, per_page) {
			var filtered = this.data.reservations.clone(),
				start, my_alliance_id = Game.alliance_id, my_player_id = Game.player_id;

			var search_text_parts = search_text.toLowerCase().split(';'), l = search_text_parts.length, now = Timestamp.now();

			//Show only expired reservations
			if (mode === 'expired_reservations') {
				filtered = filtered.filter(function(reservation) {
					return (reservation.expire_date > 0 && reservation.expire_date <= now) ||
						(reservation.town_owner_id !== null && reservation.town_owner_id === reservation.reservation_player_id);
				});
			} else {
				filtered = filtered.filter(function(reservation) {
					return (reservation.expire_date === null || reservation.expire_date === 0 || reservation.expire_date > now);
				});
			}

			//reservation.expire_date === null || reservation.expire_date > now

			//Check if there is a sense to filter by 'search string'
			while (l--) {
				//If string is empty there is not sense to check agains it
				if (search_text_parts[l].trim() === '') {
					search_text_parts.splice(l, 1);
				}
			}

			if (search_text_parts.length > 0) {
				//Filter by 'search string'
				filtered = filtered.filter(function(reservation) {
					//Determinate which string do we want to examine
					var search_in;
					switch(search_type) {
						case 'town_name':
							search_in = reservation.town_name;
							break;
						case 'player_name':
							search_in = (reservation.town_owner_name || '') + (reservation.reservation_player_name || '');
							break;
						case 'alliance_name':
							search_in = (reservation.town_owner_alliance_name || '') + (reservation.reservation_player_alliance_name || '');
							break;
						default :
							search_in = '';
					}

					search_in = search_in.toLowerCase();

					//Search strings can be ';' separated, for example: 'Jill D;Jane'
					var i, l = search_text_parts.length;

					for (i = 0; i < l; i++) {
						if (search_in.match(search_text_parts[i])) {
							return true;
						}
					}

					return false;
				});
			}

			//Filter data
			filtered = filtered.filter(function(reservation) {
				switch (tab_nr) {
					case 0://All
						return true;
					case 1://My Own
						return reservation.reservation_player_id === my_player_id;
					case 2://My Alliance
						return reservation.alliance_id === my_alliance_id;
					case 3://Pact
						return reservation.alliance_id !== my_alliance_id;
					case 4://New targets
						return (reservation.reservation_player_id === null) && (reservation.alliance_id === my_alliance_id);
				}
			});

			//Sort by
			if (mode === 'expired_reservations') {
				filtered.sort(function(a, b) {
					var a_u = a.capture_date || 0,
						b_u = b.capture_date || 0;

					return a_u === b_u ? 0 : (a_u < b_u	? -1 : 1);
				});

				filtered.reverse();
			}

			//When reservation has been opened from the town info, we have to preselect it
			if (model.isOpenedFromTownInfo()) {
				page_nr = model.getPageNrForPreselectedReservation(filtered);
			}

			//Cut data which should be displayed for specific page

			if (typeof page_nr !== 'undefined' && typeof per_page !== 'undefined') {
				//Limit rows by page number
				start = page_nr * per_page;
				filtered = filtered.splice(start, per_page);
			}

			return {reservations : filtered, page_nr : page_nr || 0};
		},

		getFilteredReservationsCount : function(tab_nr, search_text, search_type, mode) {
			return this.getFilteredReservations(tab_nr, search_text, search_type, mode).reservations.length;
		},

		unassignUser : function(reservation_id) {
			var reservation, reservations = this.getReservations(), l = reservations.length;

			while (l--) {
				reservation = reservations[l];

				if (reservation.id === reservation_id) {
					reservation.reservation_player_alliance_id = null;
					reservation.reservation_player_alliance_name = null;
					reservation.reservation_player_id = null;
					reservation.reservation_player_link = null;
					reservation.reservation_player_name = null;
				}
			}
		},

		removeReservation : function(reservation_id) {
			var reservation, reservations = this.getReservations(), l = reservations.length;

			while (l--) {
				reservation = reservations[l];

				if (reservation.id === reservation_id) {
					return reservations.splice(l, 1);
				}
			}

			return false;
		},

		getReservation : function(reservation_id) {
			var reservation, reservations = this.getReservations(), l = reservations.length;

			while (l--) {
				reservation = reservations[l];

				if (reservation.id === reservation_id) {
					return reservation;
				}
			}

			return false;
		},

		isUnassigningEnabled : function(reservation_id, player_id) {
			var reservation = this.getReservation(reservation_id);

			return reservation.reservation_player_id && (reservation.can_edit || (
				reservation.reservation_player_id !== reservation.create_player_id &&
				reservation.reservation_player_id === player_id
			));
		},

		isRemoveEnabled : function(reservation_id, player_id) {
			var reservation = this.getReservation(reservation_id);

			return reservation.can_edit || (
				reservation.reservation_player_id === reservation.create_player_id &&
				reservation.create_player_id === player_id
			);
		},

		destroy : function() {
			this.data = null;
			this.selecting_mode = false;
		}
	};

	/**
	 * View
	 */
	view = {
		initialize : function() {
			$content = root.find('.gpwindow_content');

			//Load template
			$content.html(us.template(templates.index, {
				l10n : l10n
			}));

			this.initializeMainLayoutComponents();
			this.updateNewTargetsTabTitle();

			controller.renderReservationsList(model.getTabNr(), model.getPageNr());
		},

		initializeMainLayoutComponents : function() {
			var per_page = model.getPerPage(),
				tab_nr = model.getTabNr(),
				page_nr = model.getPageNr(),
				my_player_id = Game.player_id,
				my_player_name = Game.player_name,
				my_alliance_id = Game.alliance_id,
				$txt_search,
				$rbtn_search_type,
				$rbtn_switch_mode;

			var autocompletion_format_list_callback_town = function(row) {
				return row[1] + ' (' + row[2] + ')';
			};

			var autocompletion_format_output_callback_town = function(row) {
				return row.data[1] + ' (' +row.data[2] + ')';
			};

			var autocompletion_format_list_callback_player = function(row) {
				return row[0];
			};

			var autocompletion_format_output_callback_player = function(row) {
				return row.data[0];
			};

			//This is a code which closes Select Town Menu
			root.parent().on('mousedown.fixSelectTownMenu', function(e) {
				var $target = $(e.target),
					$btn = CM.get(cm_context, 'btn_reserve_town'),
					$menu = CM.get(cm_context, 'menu_reserve_town');

				//Close menu when user clicks on something which is not the button which opens menu
				if ($btn && $target !== $btn && !($btn.find($target)).length) {
					$menu.hide();
				}
			});

			//Set default state for 'selecting mode'
			view.activateSelectingMode(model.getSelectingMode());

			//Search textbox
			$txt_search = CM.register(cm_context, 'txt_search', $content.find('.txt_search').textbox({
				clear_msg_button : true, live : true, hidden_zero : false
			}).on('txt:change:value', function() {
				controller.renderReservationsList();
			}));

			//Search Radiobutton
			$rbtn_search_type = CM.register(cm_context, 'rbtn_search_type', $content.find('.rbtn_search_type').radiobutton({
				value : 'town_name', template : 'tpl_rb_sort_by',
				options : [
					{value : 'town_name', name : l10n.town_name, tooltip : l10n.search_in_town_names},
					{value : 'player_name', name : l10n.player_name, tooltip : l10n.search_in_player_names},
					{value : 'alliance_name', name : l10n.alliance_name, tooltip : l10n.search_in_alliance_names}
				]
			}).on('rb:change:value', function() {
				controller.renderReservationsList();
			}));

			//Switch modes radiobutton
			$rbtn_switch_mode = CM.register(cm_context, 'rbtn_switch_mode', root.find('.rbtn_switch_mode').radiobutton({
				value : 'running_reservations', template : 'tpl_radiobutton_nocaption',
				options : [
					{value : 'running_reservations', tooltip : l10n.running_reservations},
					{value : 'expired_reservations', tooltip : l10n.expired_reservations}
				]
			}).on('rb:change:value', function() {
				controller.renderReservationsList();
			}));

			//BBCode button
			CM.register(cm_context, 'btn_get_bbcode', $content.find('.btn_get_bbcode').button({
				toggle : true, state : model.getSelectingMode(),
				tooltips : [{title : '<b>' + l10n.bbcode_btn_popup_header + '</b><br /><br />' + l10n.bbcode_btn_popup_descr}]
			}).on('btn:click', function(e, _btn) {
				var state = _btn.getState();

				controller.toggleSelectingMode(state);
			}));

			//BBCode textbox
			CM.register(cm_context, 'txt_get_bbcode', $content.find('.txt_get_bbcode').textbox({
				hidden_zero : false, value : '[reservation][/reservation]', visible : false
			}).on('txt:afterfocus', function(e, _txt) {
				_txt.select();
			}));

			//Tab
			CM.register(cm_context, 'tab_reservations', $content.find('.tab_reservations').tab({
				activepagenr : tab_nr
			}).on('tab:change:activepagenr', function(e, tab_nr) {
				//Reset active page in pager
				CM.get(cm_context, 'pgr_reservations').setActivePage(0, {silent : true});
				//Load filtered data
				controller.renderReservationsList(tab_nr, 0);
			}));

			//Pager
			CM.register(cm_context, 'pgr_reservations', $content.find('.pgr_reservations').pager({
				activepage : page_nr, per_page : per_page, total_rows : model.getFilteredReservationsCount(tab_nr, $txt_search.getValue(), $rbtn_search_type.getValue(), $rbtn_switch_mode.getValue())
			}).on('pgr:page:switch', function(e, page_nr) {
				controller.renderReservationsList(null, page_nr);
			}).on('pgr:page:select', function(e, _pager, activepagenr, number_of_pages) {
				GoToPageWindowFactory.openPagerGoToPageWindow(_pager, activepagenr + 1, number_of_pages);
			}));

			//Open Attack planner window handler
			$content.on('click.reservation', '.reservation', function(e) {
				var $row = $(e.currentTarget),
					$target = $(e.target),
					town_id = parseInt($row.attr('data-townid'), 10),
					reservation_id = parseInt($row.attr('data-reservationid'), 10),
					reservation, type;

				controller.toggleSelection($row, reservation_id);

				if ($target.hasClass('btn_open_attack_planner')) {
					if (model.hasCaptain()) {
						AttackPlannerWindowFactory.openAttackPlannerForTarget(town_id);
					}
					else {
						hOpenWindow.openActivateAdvisorWindow('captain');
					}
				}
				else if ($target.hasClass('alliance_name')) {
					reservation = model.getReservation(reservation_id);
					type = $target.attr('data-type');

					Layout.allianceProfile.open(addslashes(reservation[type + '_alliance_name']), reservation[type + '_alliance_id']);
				}
			});

			$content.on('click.reservation', '.btn_open_reservation_settings', function() {
				controller.openReservationSettings();
			});

			//Button Reserve Town
			CM.register(cm_context, 'btn_reserve_town', $content.find('.btn_reserve_town').button({
				caption : l10n.add_new_reservation,
				tooltips : [
					{title: l10n.reserve_button_popup}
				]
			}));
			CM.register(cm_context, 'menu_reserve_town', $content.find('.btn_reserve_town').menu({
				template : us.template(templates.select_town_group_popup_window, {l10n : l10n, admin_mode : model.isAdmin(), predefiended_id : 'select_town_popup_reservation_tool'}),
				container_id : 'select_town_popup_reservation_tool', hide_on_hover : false, hover : false, list_pos : {vertical : 'auto', horizontal : 'left'}
			}).on('menu:show', function(e, _menu) {
				var $el = _menu.getListHTMLElement(),
					$txt_search_by, $rbtn_search_by,
					$rbtn_reservation_type, $txt_admin_mode_select_player, $dd_admin_mode_select_alliance;


				//Register radiobutton
				var options = [
					{value : 'town_name', name : l10n.town_name},
					{value : 'town_id', name : l10n.town_id}
				];

				if (model.isAdmin()) {
					options.push({value : 'player_name', name : l10n.player_name});
				}

				$rbtn_search_by = CM.register(cm_reserve_town_popup, 'rbtn_search_by', $el.find('.rbtn_search_by').radiobutton({
					value : 'town_name',
					options : options
				}).on('rb:change:value', function(e, value) {
					$txt_search_by[value === 'town_name' || value === 'player_name' ? 'enableAutocompletion' : 'disableAutocompletion']().setValue('');

					if (model.isAdmin()) {
						if (value === 'player_name') {
							$rbtn_reservation_type.setValue('alliance');
							$rbtn_reservation_type.disableOptions(['player']);
							$txt_search_by.changeAutocompletion('game_player', autocompletion_format_list_callback_player, autocompletion_format_output_callback_player);
						} else {
							$rbtn_reservation_type.enableOptions(['player']);
							$txt_search_by.changeAutocompletion('game_town', autocompletion_format_list_callback_town, autocompletion_format_output_callback_town);
						}
					}
				}));

				//Register textbox
				$txt_search_by = CM.register(cm_reserve_town_popup, 'txt_search_by', $el.find('.txt_search_by').textbox({
					clear_msg_button : true,
					autocompletion : true,
					autocompletion_type : 'game_town',
					autocompletion_format_list : autocompletion_format_list_callback_town,
					autocompletion_format_output : autocompletion_format_output_callback_town
				}).focus());

				//Register button
				CM.register(cm_reserve_town_popup, 'btn_confirm', $el.find('.btn_confirm').button({

				}).on('btn:click', function() {
					var search_by_type = $rbtn_search_by.getValue(),
						value = search_by_type === 'town_id' ? $txt_search_by.getValue() : $txt_search_by.getLastSelectedSuggestion()[0],
						town_id = parseInt(value, 10);

					controller.reserveTownForPlayer(town_id);

					_menu.hide();
				}));

				//Initialize components for Admin mode
				if (model.isAdmin()) {
					$rbtn_reservation_type = CM.register(cm_reserve_town_popup, 'rbtn_reservation_type', $el.find('.rbtn_reservation_type').radiobutton({
						value : 'player', template : templates.radiobutton,
						options : [
							{value : 'player', name : l10n.reserve_for_player},
							{value : 'alliance', name : l10n.reserve_for_alliance}
						]
					}).on('rb:change:value', function(e, value) {

					}));

					$txt_admin_mode_select_player = CM.register(cm_reserve_town_popup, 'txt_admin_mode_select_player', $el.find('.txt_admin_mode_select_player').textbox({
						value : my_player_name, last_selected_suggestion : [my_player_name, my_player_id],
						clear_msg_button : true,
						autocompletion_with_id : true,
						autocompletion : true,
						autocompletion_type : 'game_player',
						autocompletion_format_list : autocompletion_format_list_callback_player,
						autocompletion_format_output : autocompletion_format_output_callback_player
					}));

					$dd_admin_mode_select_alliance = CM.register(cm_reserve_town_popup, 'dd_admin_mode_select_alliance', $el.find('#dd_admin_mode_select_alliance').dropdown({
						value : my_alliance_id,
						options : model.getAlliancesForDropdown()
					}).on('dd:change:value', function(e, new_val, old_val) {

					}));

					CM.register(cm_reserve_town_popup, 'btn_add_reservation', $el.find('.btn_add_reservation').button({
						caption : l10n.add_reservation
					}).on('btn:click', function() {
						var reservation_type = $rbtn_reservation_type.getValue(),
							search_by_type = $rbtn_search_by.getValue(),
							value = search_by_type === 'town_id' ? $txt_search_by.getValue() : $txt_search_by.getLastSelectedSuggestion()[0],
							town_id = parseInt(value, 10),
							player_id;

						var what = null;
						if (reservation_type === 'player') {
							player_id = parseInt($txt_admin_mode_select_player.getLastSelectedSuggestion()[1], 10);
							what = $txt_admin_mode_select_player.getLastSelectedSuggestion()[0];
						}
						else if (reservation_type === 'alliance') {
							what = model.getAllianceByValueFromDropdown(parseInt($dd_admin_mode_select_alliance.getValue(), 10)).name;
						}

						hOpenWindow.showConfirmDialog(l10n.add_reservation, s(l10n.add_reservation_msg, what), function() {
							if (reservation_type === 'player') {
								controller.reserveTown(my_alliance_id, town_id, player_id);
							}
							else if (reservation_type === 'alliance') {

								if (search_by_type === 'player_name') {
									controller.reserveTownsFromPlayer($dd_admin_mode_select_alliance.getValue(), value);
								} else {
									controller.reserveTown($dd_admin_mode_select_alliance.getValue(), town_id);
								}
							}

							_menu.hide();
						}, l10n.btn_yes, function() {
							// on cancel
						}, l10n.btn_no).setHeight(220);
					}));
				}
			}).on('menu:hide', function() {
				CM.unregisterSubGroup(cm_reserve_town_popup);
			}));

			$content.find('.btn_open_reservation_settings').tooltip(l10n.open_settings_popup);
		},

		renderReservationsList : function(tab_nr, mode, reservations, preselected_reservation_id) {
			var $tab_reservations = CM.get(cm_context, 'tab_reservations'),
				$page, now, new_targets_tab;

			CM.unregisterSubGroup(cm_reservations_list);

			//Take page HTMLElement
			$page = $tab_reservations.getPageElement(tab_nr);

			//Load template
			$page.off('.reservation').html(us.template(templates.reservations_list, {
				l10n : l10n,
				reservations : reservations,
				tab_nr : tab_nr,
				mode : mode,
				preselected_reservation_id : preselected_reservation_id
			}));

			if (tab_nr === 4) { //New targets tab
				$page.find('.btn_reserve').each(function(index, el) {
					var $el = $(el),
						reservation_id = parseInt($el.attr('data-reservationid'), 10);

					CM.register(cm_reservations_list, 'btn_reserve_' + reservation_id, $el.button({
						caption : l10n.reserve
					}).on('btn:click', function() {
						hOpenWindow.showConfirmDialog(l10n.add_reservation, l10n.assign_reservation_msg, function() {
							controller.assignUser(reservation_id);
						}, l10n.btn_yes, function() {
							// on cancel
						}, l10n.btn_no).setHeight(220);
					}));
				});
			}
			else {
				$page.find('.remove').each(function(index, el) {
					var $el = $(el),
						reservation_id = parseInt($el.attr('data-reservationid'), 10),
						// empty value added for GP-13167
						// this will be hidden later, so both of the other options can always be selected
						// the use of the dropdown component is basically wrong here
						dd_options = [{
							value: 'empty',
							name: 'empty'
						}];

					if (model.isRemoveEnabled(reservation_id, Game.player_id)) {
						dd_options.push({value : 'remove_reservation', name : l10n.remove_reservation});
					}

					if (model.isUnassigningEnabled(reservation_id, Game.player_id)) {
						dd_options.push({value : 'unassign_player', name : l10n.unassign_player});
					}

					var dd_remove = CM.register(cm_reservations_list, 'dd_remove_' + reservation_id, $el.dropdown({
						options : dd_options,
						value : null, template : 'tpl_dd_square', list_pos : 'left',
						tooltips : [{title : l10n.remove_reservation_popup}],
						exclusions : ['']
					}).on('dd:change:value', function(e, new_val) {
						if (new_val === 'unassign_player') {
							hOpenWindow.showConfirmDialog(l10n.unassign_player, l10n.unassign_reservation_msg, function() {
								controller.unassignUser(reservation_id);
							}, l10n.btn_yes, function() {
								// on cancel
							}, l10n.btn_no).setHeight(220);
						}
						else if (new_val === 'remove_reservation') {
							hOpenWindow.showConfirmDialog(l10n.remove_reservation, l10n.remove_reservation_msg, function() {
								controller.removeReservation(reservation_id);
							}, l10n.btn_yes, function() {
								// on cancel
							}, l10n.btn_no).setHeight(220);
						}

						dd_remove.setValue('empty');
					}));

					dd_remove.getList().addClass('reservation_dd_remove_list');
				});
			}

			//Initialize timers

			now = Timestamp.now();
			new_targets_tab = tab_nr === 4;
			$page.find('.col_expiration_date').each(function(index, el) {
				var $el = $(el),
					$parent = $el.parent(),
					reservation_id = parseInt($parent.attr('data-reservationid'), 10),
					reservation = model.getReservation(reservation_id),
					expires_in = reservation.expire_date - now;

				//For new targets tab, just display formated time
				if (new_targets_tab) {
					$el.html(DateHelper.formatDateTimeNice(reservation.create_date));
				}
				else {
					if (!reservation.capture_date) {
						if (expires_in > 0) {
							CM.register(cm_reservations_list, 'countdown_' + reservation_id, $el.countdown2({
								value : expires_in, display : 'readable_seconds_with_days'
							}));
						} else {
							$el.html('-');
						}
					}
				}
			});

			$page.find('.btn_open_attack_planner').tooltip(l10n.open_attack_planner_popup);
		},

		updateNewTargetsTabTitle : function() {
			var new_reservations = model.getFilteredReservations(4, '', '', 'running_reservations').reservations,
				$tab_reservations = CM.get(cm_context, 'tab_reservations');

			$tab_reservations.updateTabTitle(4, l10n.tabs.new_targets + ' (' + new_reservations.length + ')');
		},

		activateSelectingMode : function(state) {
			$content.toggleClass('selecting_mode', state);
		},

		cleanupAfterSelectingMode : function() {
			$content.find('.reservation.item_selected').removeClass('item_selected');
			CM.get(cm_context, 'txt_get_bbcode').setValue('[reservation][/reservation]');
		},

		toggleSelection : function($row, reservation_id) {
			var selected = model.getSelectedReservations(), i = 0, l = selected.length,
				str = '[reservation]', str_end = '[/reservation]', town_ids = [], town_id;

			for (i = 0; i < l; i++) {
				town_id = selected[i].town_id;

				if (town_ids.indexOf(town_id) === -1) {
					str += (town_ids.length > 0 ? ', ' : '') + town_id;

					town_ids.push(town_id);
				}
			}

			//Select node
			$row.toggleClass('item_selected', model.getSelectionState(reservation_id));

			//Update bbcode textbox
			CM.get(cm_context, 'txt_get_bbcode').setValue(str + str_end);
		},

		destroy : function() {
			root.parent().off('.fixSelectTownMenu');
			$content.off('.reservation');
		}
	};

	/**
	 * Controller
	 */
	controller = {
		initialize : function() {
			view.initialize();
		},

		renderReservationsList : function(tab_nr, page_nr) {
			var $tab_reservations = CM.get(cm_context, 'tab_reservations'),
				$pgr_reservations = CM.get(cm_context, 'pgr_reservations'),
				$txt_search = CM.get(cm_context, 'txt_search'),
				$rbtn_search_type = CM.get(cm_context, 'rbtn_search_type'),
				$rbtn_switch_mode = CM.get(cm_context, 'rbtn_switch_mode');

			var mode = $rbtn_switch_mode.getValue(),
				search_text = $txt_search.getValue(),
				search_type = $rbtn_search_type.getValue();

			var reservations, filtered, preselected_reservation_id = 0;

			//Determinate tab number
			tab_nr = tab_nr !== null && typeof tab_nr !== 'undefined' ? tab_nr : $tab_reservations.getActiveTabNr();

			//Update number of reservations in pager component
			$pgr_reservations.setTotalRows(model.getFilteredReservationsCount(tab_nr, search_text, search_type, mode));

			//Determinate page number
			page_nr = typeof page_nr !== 'undefined' ? page_nr : $pgr_reservations.getActivePage();

			//Get proper reservation
			filtered = model.getFilteredReservations(tab_nr, search_text, search_type, mode, page_nr, model.getPerPage());
			reservations = filtered.reservations;
			page_nr = filtered.page_nr;

			if (model.isOpenedFromTownInfo()) {
				preselected_reservation_id = model.getPreselectedReservationId();

				model.removePreselectedReservationId();
			}

			//page_nr
			CM.get(cm_context, 'pgr_reservations').setActivePage(page_nr);

			//Display them
			view.renderReservationsList(tab_nr, mode, reservations, preselected_reservation_id);
		},

		unassignUser : function(reservation_id) {
			var _self = this;

			gpAjax.ajaxPost('reservation', 'unassign_reservation', {reservation_id : reservation_id}, true, function() {
				//Unassign user
				model.unassignUser(reservation_id);

				//Rerender list
				_self.renderReservationsList();

				//Update 'New Targets' tab title
				view.updateNewTargetsTabTitle();

				WMap.pollForMapChunksUpdate();
			});
		},

		assignUser : function(reservation_id, callback) {
			var _self = this;

			callback = callback || function(ret_data) {
				//Update reservation data
				model.updateReservationData(reservation_id, ret_data.data.reservation_data);

				//Rerender list
				_self.renderReservationsList();

				//Update 'New Targets' tab title
				view.updateNewTargetsTabTitle();

				WMap.pollForMapChunksUpdate();
			};

			gpAjax.ajaxPost('reservation', 'assign_reservation', {reservation_id : reservation_id, player_id : Game.player_id}, true, callback);
		},

		removeReservation : function(reservation_id) {
			var _self = this;

			reservation_id = parseInt(reservation_id, 10);

			if (reservation_id > 0) {
				gpAjax.ajaxPost('reservation', 'delete_reservation', {reservation_id : reservation_id}, true, function() {
					//Remove reservation from model
					model.removeReservation(reservation_id);
					//Rerender view
					_self.renderReservationsList();
					//Update icons on the map
					WMap.pollForMapChunksUpdate();
				});
			}
		},

		reserveTownForPlayer : function(town_id, callback) {
			callback = callback || function(ret_data) {
				//Add reservation to model
				model.addReservation(ret_data.data.reservation_data);

				//Rerender list
				controller.renderReservationsList();

				//Update 'New Targets' tab title
				view.updateNewTargetsTabTitle();

				//Update icons on the map
				WMap.pollForMapChunksUpdate();
			};

			gpAjax.ajaxPost('reservation', 'reserve_town_for_player', {reserve_town_id : town_id}, true, callback);
		},

		reserveTownsFromPlayer : function(alliance_id, player_name) {
			gpAjax.ajaxPost('reservation', 'reserve_player_towns', {alliance_id : alliance_id, player_name: player_name}, true, function(ret_data) {
				var reservations_data = ret_data.data.reservations_data,
					reservations_data_length = reservations_data.length,
					reservation_data,
					i;

				//Add reservations to model
				for (i = 0; i < reservations_data_length; i++) {
					reservation_data = reservations_data[i];
					model.addReservation(reservation_data);
				}
				//Rerender list
				controller.renderReservationsList();

				//Update 'New Targets' tab title
				view.updateNewTargetsTabTitle();

				//Update icons on the map
				WMap.pollForMapChunksUpdate();
			});
		},

		reserveTown : function(alliance_id, town_id, reservation_player) {
			var ajax_params = {alliance_id : alliance_id, reserve_town_id : town_id};

			if (reservation_player) {
				ajax_params.reservation_player = reservation_player;
			}

			gpAjax.ajaxPost('reservation', 'reserve_town', ajax_params, true, function(ret_data) {
				//Add reservation to model
				model.addReservation(ret_data.data.reservation_data);

				//Rerender list
				controller.renderReservationsList();

				//Update 'New Targets' tab title
				view.updateNewTargetsTabTitle();

				//Update icons on the map
				WMap.pollForMapChunksUpdate();
			});

			//reservation_player
			//alliance_id
			//reserve_town_id
			//expiration
		},

		openReservationSettings : function() {
			wnd.requestContentGet('reservation', 'show_reservation_settings', {});
		},

		toggleSelection : function($row, reservation_id) {
			if (model.isSelectingModeActive()) {
				//Update model
				model.toggleSelection(reservation_id);
				//Update html
				view.toggleSelection($row, reservation_id);
			}
		},

		toggleSelectingMode : function(state) {
			//Show textbox with BBCode
			CM.get(cm_context, 'txt_get_bbcode').setVisibility(state);

			//Turn on/off selecting mode
			model.setSelectingMode(state);
			view.activateSelectingMode(state);

			if (!state) {
				model.unselectAllReservations();
				view.cleanupAfterSelectingMode();
			}

			if (state) {
				CM.get(cm_context, 'txt_get_bbcode').select(13, 13);
			}
		},

		destroy : function() {
			view.destroy();
			model.destroy();
		}
	};

	window.reservationTool = {
		initialize : function(wnd_handler, ret_data) {
			wnd = wnd_handler;
			cm_context = wnd.getContext();
			cm_reserve_town_popup = {main : cm_context.main, sub : 'reserve_town'};
			cm_reservations_list = {main : cm_context.main, sub : 'dropdowns'};
			root = wnd.getJQElement();
			templates = ret_data.templates;
			l10n = ret_data.l10n;

			//Save data in the model
			model.setData(ret_data.data);

			$.Observer(GameEvents.premium.adviser.activate).subscribe(['buy_captain_for_reservation_tool_attack_planner'], function(e, data) {
				if (data.adviser_id === 'captain' || data.all_advisers) {
					model.setHasCaptain(true);
				}
			});

			//Initialize tab
			controller.initialize();

			return this;
		},

		reserveTownForPlayer : function(town_id, callback) {
			controller.reserveTownForPlayer(town_id, callback);
		},

		assignUser : function(reservation_id, callback) {
			controller.assignUser(reservation_id, callback);
		},

		destroy : function() {
			controller.destroy();

			$.Observer(GameEvents.premium.adviser.activate).unsubscribe(['buy_captain_for_reservation_tool_attack_planner']);
		}
	};
}(jQuery));
