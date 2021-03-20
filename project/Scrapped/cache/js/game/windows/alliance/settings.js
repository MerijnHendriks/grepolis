/*globals jQuery, us, CM, Layout, hOpenWindow, gpAjax */

(function($) {
	'use strict';

	var wnd, root,
		templates, l10n,
		cm_context, cm_settings, cm_permissions_list, cm_permissions, cm_partner_settings;

	var model, view, controller;
	var $content, $our_settings, $permissions_list;
	var changes_watcher, $changes_watcher;

	changes_watcher = {
		changes : {},

		saveChange : function(attr, new_value, prev_value) {
			//If this is first change
			if (!this.changes.hasOwnProperty(attr)) {
				this.changes[attr] = {
					base : prev_value,
					current : new_value
				};
			}
			else {
				this.changes[attr].current = new_value;
			}

			$changes_watcher.triggerHandler('watcher:changes', [this.hasUnsavedChanges()]);
		},

		hasUnsavedChanges : function() {
			var id, change, changes = this.changes,
				unsaved_changes = false;

			for (id in changes) {
				if (changes.hasOwnProperty(id)) {
					change = changes[id];

					if (change.base !== change.current) {
						unsaved_changes = true;
					}
				}
			}

			return unsaved_changes;
		},

		reset : function() {
			this.changes = {};
		},

		destroy : function() {
			this.reset();
		}
	};

	$changes_watcher = $(changes_watcher);

	$changes_watcher.on('watcher:changes', function(e, has_unsaved_chnages) {
		CM.get(cm_context, 'btn_save')[has_unsaved_chnages ? 'enable' : 'disable']();
	});

	/**
	 * Model
	 */
	model = {
		data : null,

		isAdmin : function() {
			return this.data.is_admin;
		},

		setData : function(ret_data) {
			this.data = ret_data;
		},

		hasUnsharedPacts : function() {
			return this.data.has_unshared_pacts;
		},

		/* Partner View */
		setPartnerViewPermissionsData : function(ret_data) {
			this.data.partner_view = ret_data;
		},

		removePartnerViewPermissionsData : function() {
			delete this.data.partner_view;
		},

		getPartnerViewAllianceName : function() {
			return this.data.partner_view.permissions.alliance_name;
		},

		getPartnerViewPermission : function(type) {
			return this.data.partner_view.permissions['allow_' + type];
		},

		getPartnerViewPermissions : function() {
			return this.data.partner_view.permissions;
		},

		/* Partner View end */

		getIncommingPermissions : function() {
			return this.data.partner_incoming;
		},

		getMaxReservationsPerPlayer : function() {
			return this.data.settings.max_per_player;
		},

		setMaxReservationsPerPlayer : function(value) {
			//Save previous value
			var prev = this.data.settings.max_per_player;

			//Watch changes
			changes_watcher.saveChange('max_per_player', value, prev);

			//Save new value
			this.data.settings.max_per_player = value;
		},

		getDaysToExpire : function() {
			return this.data.settings.days_to_expire;
		},

		setDaysToExpire : function(value) {
			//Save previous value
			var prev = this.data.settings.days_to_expire;

			//Watch changes
			changes_watcher.saveChange('days_to_expire', value, prev);

			//Save new value
			this.data.settings.days_to_expire = value;
		},

		getPartnerMaxReservationsPerPlayer : function() {
			return this.data.partner_view.settings.max_per_player;
		},

		getPartnerDaysToExpire : function() {
			return this.data.partner_view.settings.days_to_expire;
		},

		getPartnersPermissions : function() {
			return this.data.partner_permissions;
		},

		setPartnersPermissions : function(ret_data) {
			this.data.partner_permissions = ret_data;
		},

		setIncommingPermissions : function(ret_data) {
			this.data.partner_incoming = ret_data;
		},

		getPermissions : function(permission_id) {
			var permissions = this.getPartnersPermissions().concat(this.getIncommingPermissions()),
				i, l = permissions.length, permission;

			for (i = 0; i < l; i++) {
				permission = permissions[i];

				if (permission.id === permission_id) {
					return permissions[i];
				}
			}

			return false;
		},

		getPermission : function(permission_id, type) {
			var permissions = this.getPermissions(permission_id);

			return permissions['allow_' + type];
		},

		removePermissions : function(permission_id) {
			var permissions = this.getPartnersPermissions(),
				l = permissions.length;

			while (l--) {
				if (permissions[l].id === permission_id) {
					return permissions.splice(l, 1);
				}
			}

			return false;
		},

		setPermissions : function(permission_id, type, state) {
			var permissions = this.getPartnersPermissions(),
				i, l = permissions.length, permission, prev;

			for (i = 0; i < l; i++) {
				permission = permissions[i];

				if (permission.id === permission_id) {
					//Save previous state
					prev = permissions[i]['allow_' + type];

					permissions[i]['allow_' + type] = state;
					permissions[i]['changed_' + type] = !permissions[i]['changed_' + type];

					changes_watcher.saveChange('allow_' + type + '_' + permission_id, state, prev);

					return;
				}
			}
		},

		getChangedPermissions : function() {
			var permissions = this.getPartnersPermissions(), permission,
				changed = [], l = permissions.length;

			while (l--) {
				permission = permissions[l];

				if (permission.changed_add || permission.changed_edit || permission.changed_view) {
					//Save changed permissions
					changed.push(permission);
				}
			}

			return changed;
		},

		resetChangedIndicators : function() {
			var permissions = this.getPartnersPermissions(), permission,
				l = permissions.length;

			while (l--) {
				permission = permissions[l];

				//Reset 'changed' indicators
				permission.changed_add = false;
				permission.changed_edit = false;
				permission.changed_view = false;
			}
		},

		destroy : function() {
			this.data = null;
		}
	};

	/**
	 * View
	 */
	view = {
		initialize : function() {
			$content = root.find('.gpwindow_content');

			//Load template
			$content.html(us.template(templates.settings_index, {
				l10n : l10n,
				has_unshared_pacts : model.hasUnsharedPacts(),
				is_admin : model.isAdmin()
			}));

			$our_settings = $content.find('.our_settings');
			$permissions_list = $content.find('.permissions_content');

			this.initializeMainLayoutComponents();
			this.initializeSettingsComponents();

			this.initializePermissionListComponents();
			this.initializePermissionsComponents();
		},

		initializeMainLayoutComponents : function() {
			if (model.isAdmin()) {
				CM.register(cm_context, 'btn_save', $content.find('.btn_save').button({
					caption : l10n.save, tooltips: [{title: l10n.btn_save_settings_tooltip}], disabled : true
				}).on('btn:click', function() {
					controller.saveSettings();
				}));
			}

			CM.register(cm_context, 'btn_cancel', $content.find('.btn_cancel').button({caption : l10n.cancel, tooltips: [{title: l10n.btn_cancel_save_settings_tooltip}]}).on('btn:click', function() {
				if (changes_watcher.hasUnsavedChanges()) {
					hOpenWindow.showConfirmDialog(l10n.cancel_settings_title, l10n.cancel_settings_msg, function() {
						controller.openReservationTool();
					}, l10n.btn_yes, function() {
						// on cancel
					}, l10n.btn_no).setHeight(220);
				}
				else {
					controller.openReservationTool();
				}
			}));
		},

		initializeSettingsComponents : function() {
			CM.register(cm_settings, 'txt_max_reservations_per_player', $our_settings.find('.txt_max_reservations_per_player').textbox({
				value : model.getMaxReservationsPerPlayer(), type : 'number', min : 1, max : Infinity, disabled: !model.isAdmin()
			}).on('txt:change:value', function(e, value) {
				model.setMaxReservationsPerPlayer(value);
			}));

			CM.register(cm_settings, 'txt_time_until_reservations_expires', $our_settings.find('.txt_time_until_reservations_expires').textbox({
				value : model.getDaysToExpire(), type : 'number', min : 1, max : Infinity, disabled: !model.isAdmin()
			}).on('txt:change:value', function(e, value) {
				model.setDaysToExpire(value);
			}));
		},

		initializePermissionListComponents : function() {
			CM.unregisterSubGroup(cm_permissions_list);

			//Display Accepted Permissions
			$permissions_list.off('.permissions').html(us.template(templates.settings_partner_permissions, {
				l10n : l10n,
				permissions : model.getPartnersPermissions(),
				incomming_permissions : model.getIncommingPermissions(),
				is_admin: model.isAdmin()
			}));

			$permissions_list.on('click.permissions', '.row_permission', function(e) {
				var $row = $(e.currentTarget),
					$target = $(e.target),
					permission_id = parseInt($row.attr('data-permissionid'), 10),
					alliance_id, permission;

				if ($target.hasClass('remove')) {
					hOpenWindow.showConfirmDialog(l10n.remove_partner_title, l10n.remove_partner_msg, function() {
						controller.removePermissions(permission_id);
					}, l10n.btn_yes, function() {
						// on cancel
					}, l10n.btn_no).setHeight(220);
				}
				else if ($target.hasClass('view_settings')) {
					alliance_id = $target.attr('data-allianceid');
					controller.showPartnerReservationSettings(alliance_id);
				}
				else if ($target.hasClass('gp_link_fake')) {
					permission = model.getPermissions(permission_id);
					Layout.allianceProfile.open(addslashes(permission.alliance_name), permission.alliance_id);
				}
			});

			$permissions_list.find('.col_add').tooltip(l10n.col_add_tooltip);
			$permissions_list.find('.col_edit').tooltip(l10n.col_edit_tooltip);
			$permissions_list.find('.col_view').tooltip(l10n.col_view_tooltip);
			$permissions_list.find('.view_settings').tooltip(l10n.btn_view_settings_tooltip);
			$permissions_list.find('.button_new.accept').tooltip(l10n.btn_accept_share_tooltip, {width: '400px'});

			$permissions_list.find('.checkbox_new').each(function(index, el) {
				var $el = $(el),
					permission_id = parseInt($el.attr('data-permissionid'), 10),
					type = $el.attr('data-type'),
					disabled = !!parseInt($el.attr('data-disabled'), 10);

				CM.register(cm_permissions_list, 'checkbox_' + type + ' ' + permission_id, $el.checkbox({
					caption : '', checked : model.getPermission(permission_id, type), disabled: disabled
				}).on('cbx:check', function(e, _self, state) {
					model.setPermissions(permission_id, type, state);
				}));
			});

			//Display incomming permissions
			$permissions_list.on('click.permissions', '.row_ipermission', function(e) {
				var $row = $(e.currentTarget),
					$target = $(e.target),
					permission_id = parseInt($row.attr('data-permissionid'), 10);

				if ($target.hasClass('accept')) {
					hOpenWindow.showConfirmDialog(l10n.accept_incoming_title, l10n.accept_incoming_msg, function() {
						controller.acceptIncommingPermission(permission_id);
					}, l10n.btn_yes, function() {
						// on cancel
					}, l10n.btn_no).setHeight(220);
				}
			});

		},

		initializePermissionsComponents : function() {
			var $txt_select_alliance;

			CM.register(cm_permissions, 'btn_add_alliance', $content.find('.btn_add_alliance').button({tooltips: [{title: l10n.btn_add_single_alliance_tooltip}]}).on('btn:click', function() {
				var alliance_id = parseInt($txt_select_alliance.getLastSelectedSuggestion()[1], 10);
				if (alliance_id) {
					hOpenWindow.showConfirmDialog(l10n.send_request_title, l10n.send_request_msg, function() {
						controller.requestShare(alliance_id);
					}, l10n.btn_yes, function() {
						// on cancel
					}, l10n.btn_no).setHeight(220);
				}
			}));

			if (model.hasUnsharedPacts()) {
				CM.register(cm_permissions, 'btn_add_all_pacts', $content.find('.btn_add_all_pacts').button({
					caption : l10n.add_all_pacts,
					tooltips: [
						{title: l10n.btn_add_all_pact_alliances_tooltip}
					]
				}).on('btn:click', function() {
					hOpenWindow.showConfirmDialog(l10n.pact_request_title, l10n.pact_request_msg, function() {
						controller.addAllPacts();
					}, l10n.btn_yes, function() {
						// on cancel
					}, l10n.btn_no).setHeight(220);
				}));
			}

			$txt_select_alliance = CM.register(cm_settings, 'txt_select_alliance', $content.find('.txt_select_alliance').textbox({
				clear_msg_button : true,
				autocompletion_with_id : true,
				autocompletion : true,
				autocompletion_type : 'game_alliance',
				autocompletion_format_list : function(row) {
					return row[0];
				},
				autocompletion_format_output : function(row) {
					return row.data[0];
				}
			}));
		},

		removeAddAllPactsButton : function() {
			CM.unregister(cm_permissions, 'btn_add_all_pacts');

			$content.find('.btn_add_all_pacts').remove();
		},

		showPermissionsBox : function() {
			$content.find('.reservation_settings').show();
		},

		hidePermissionsBox : function() {
			$content.find('.reservation_settings').hide();
		},

		initializePartnerViewPermissionSettings : function() {
			//Load template
			$content.find('.content').append(us.template(templates.settings_partner_view_permissions, {
				l10n : l10n,
				alliance_name : model.getPartnerViewAllianceName()
			}));

			var $view_settings = $content.find('.reservation_view_settings').off('.settings');

			$view_settings.find('.permissions_list .col_add').tooltip(l10n.col_add_tooltip);
			$view_settings.find('.permissions_list .col_edit').tooltip(l10n.col_edit_tooltip);
			$view_settings.find('.permissions_list .col_view').tooltip(l10n.col_view_tooltip);

			CM.register(cm_partner_settings, 'txt_max_reservations_per_player', $view_settings.find('.txt_max_reservations_per_player').textbox({
				value : model.getPartnerMaxReservationsPerPlayer(), disabled : true
			}));

			CM.register(cm_partner_settings, 'txt_time_until_reservations_expires', $view_settings.find('.txt_time_until_reservations_expires').textbox({
				value : model.getPartnerDaysToExpire(), disabled : true
			}));

			$view_settings.find('.checkbox_new').each(function(index, el) {
				var $el = $(el),
					type = $el.attr('data-type');

				CM.register(cm_partner_settings, 'checkbox_' + type, $el.checkbox({
					caption : '', checked : model.getPartnerViewPermission(type), disabled : true
				}));
			});

			CM.register(cm_partner_settings, 'btn_go_back', $content.find('.btn_go_back').button({
				caption : l10n.back_to_sharing_settings
			}).on('btn:click', function() {
				view.uninitializePartnerViewPermissionSettings();
				view.showPermissionsBox();
			}));

			$view_settings.on('click.settings', '.gp_link_fake', function() {
				var permissions = model.getPartnerViewPermissions();

				Layout.allianceProfile.open(addslashes(permissions.alliance_name), permissions.alliance_id);
			});
		},

		uninitializePartnerViewPermissionSettings : function() {
			CM.unregisterSubGroup(cm_partner_settings);
			$content.find('.reservation_view_settings').remove();
			model.removePartnerViewPermissionsData();
		},

		destroy : function() {
			$permissions_list.off('.permissions');
		}
	};

	/**
	 * Controller
	 */
	controller = {
		initialize : function() {
			view.initialize();
		},

		requestShare : function(alliance_id) {
			gpAjax.ajaxPost('reservation', 'request_share', {alliance_id: alliance_id}, true, function(ret_data) {
				model.setPartnersPermissions(ret_data.data.partner_permissions);
				model.setIncommingPermissions(ret_data.data.partner_incoming);

				//Clear textbox
				CM.get(cm_settings, 'txt_select_alliance').clear();

				//Rerender list
				view.initializePermissionListComponents();
			});
		},

		addAllPacts : function() {
			gpAjax.ajaxPost('reservation', 'add_all_pacts', {}, true, function(ret_data) {
				//Update all permissions
				model.setPartnersPermissions(ret_data.data.partner_permissions);
				model.setIncommingPermissions(ret_data.data.partner_incoming);

				//Rerender list
				view.initializePermissionListComponents();
				view.removeAddAllPactsButton();
			});
		},

		removePermissions : function(permission_id) {
			gpAjax.ajaxPost('reservation', 'delete_share', {request_id : permission_id}, true, function() {
				//Update all permissions
				model.removePermissions(permission_id);

				//Rerender list
				view.initializePermissionListComponents();
			});
		},

		acceptIncommingPermission : function(permission_id) {
			gpAjax.ajaxPost('reservation', 'confirm_share', {request_id : permission_id}, true, function(ret_data) {
				model.setPartnersPermissions(ret_data.data.partner_permissions);
				model.setIncommingPermissions(ret_data.data.partner_incoming);

				//Rerender list
				view.initializePermissionListComponents();
			});
		},

		showPartnerReservationSettings : function(alliance_id) {
			gpAjax.ajaxPost('reservation', 'show_partner_reservation_settings', {partner_alliance_id : alliance_id}, true, function(ret_data) {
				//Save date returned from the server
				model.setPartnerViewPermissionsData(ret_data.data);

				view.hidePermissionsBox();

				view.initializePartnerViewPermissionSettings();
			});
		},

		/*savePermissions : function(permission_id) {
			var permissions = model.getPermissions(permission_id);

			gpAjax.ajaxPost('reservation', 'edit_partner_permission', permissions, true, function(ret_data) {

			});
		},*/

		saveSettings : function() {
			var max_reservations_per_player = CM.get(cm_settings, 'txt_max_reservations_per_player').getValue(),
				time_until_reservations_expires = CM.get(cm_settings, 'txt_time_until_reservations_expires').getValue(),
				partners = model.getChangedPermissions();

			gpAjax.ajaxPost('reservation', 'edit_settings_and_permissions', {
				settings : {max_per_player : max_reservations_per_player, days_to_expire : time_until_reservations_expires},
				partners : partners
			}, true, {
				success : function() {
					model.resetChangedIndicators();
					changes_watcher.reset();
				},
				error : function() {

				}
			});
		},

		openReservationTool : function() {
			//Reseta all changes
			changes_watcher.reset();

			wnd.requestContentGet('reservation', 'index');
		},

		destroy : function() {
			view.destroy();
			model.destroy();
			changes_watcher.destroy();
		}
	};

	window.reservationToolSettings = {
		initialize : function(wnd_handler, ret_data) {
			wnd = wnd_handler;
			cm_context = wnd.getContext();
			cm_settings = {main : cm_context.main, sub : 'settings'};
			cm_permissions_list = {main : cm_context.main, sub : 'permissions_list'};
			cm_permissions = {main : cm_context.main, sub : 'permissions'};
			cm_partner_settings = {main : cm_context.main, sub : 'partner_settings'};
			root = wnd.getJQElement();
			templates = ret_data.templates;
			l10n = ret_data.l10n;

			//Save data in the model
			model.setData(ret_data.data);

			//Initialize tab
			controller.initialize();

			return this;
		},

		hasUnsavedChanges : function() {
			return changes_watcher.hasUnsavedChanges();
		},

		resetUnsavedChanges : function() {
			return changes_watcher.reset();
		},

		destroy : function() {
			controller.destroy();
		}
	};
}(jQuery));