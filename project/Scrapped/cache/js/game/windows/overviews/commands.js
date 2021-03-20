/*global jQuery, Timestamp, _, CM, MM, us, DateHelper, gpAjax, DM */

(function($) {
	'use strict';

	var l10n, templates, data,
		root, cm_ctx;

	var CommandsOverview = {
		nodes : {},
		filter_type : '#tab_all',
		town_filter : '',
		total_commands_count: 0,
		towngroup_commands_count: 0,
		town_groups_collection : null,
		//timer : null,
		_wnd : null,

		init : function(wnd, ret_data) {
			var that = this;

			this._wnd = wnd;

			l10n = ret_data.l10n;
			templates = ret_data.templates;
			data = ret_data.data;
			root = wnd.getJQElement();
			cm_ctx = wnd.getContext();
			this.town_filter = '';

			//cache info about total commands count from the response.
			this.total_commands_count = data.total_commands;
			this.towngroup_commands_count = data.commands.length;

			this.town_groups_collection = MM.getCollections().TownGroup[0];
			var town_groups_collection = this.town_groups_collection;

			this.redrawOverview(this.town_filter, this.filter_type);

			$('#game_list_footer').empty().append(
				us.template(templates.footer, {
					filter_types : data.filter_types,
					filter_type : that.filter_type
				})
			);

			this.addFilterButtonTooltips(data.filter_types);

			//Footer filters initiation
			root.find('#game_list_footer').on('click', '.support_filter', function(e) {
				var filter = $(e.currentTarget), command_class = filter.attr('class').split(' ');

				filter.toggleClass('inactive');

				this.filterDisplayCommands(command_class[1]);
			}.bind(this));

			//Select town group dropdown
			CM.register(cm_ctx, 'dd_commands_command_type', root.find('#dd_commands_command_type').dropdown({
				initial_message : l10n.select_town_group,
				options :[
					{value : '#tab_all', name : l10n.all_commands},
					{value : '#tab_attacks', name : l10n.attacks},
					{value : '#tab_support', name : l10n.support},
					{value : '#tab_espionage', name : l10n.spy}
				],
				value : that.filter_type
			}).on('dd:change:value', function(e, new_val/*, old_val*/) {
				//Change active group
				var select = that.nodes.command_filter || $('#command_filter'); //jshint ignore:line

				that.filter_type = new_val;
				that.redrawOverview(that.town_filter, new_val);
			}));

			//Select town group dropdown
			CM.register(cm_ctx, 'dd_commands_select_town_group', root.find('#dd_commands_select_town_group').dropdown({
				initial_message : l10n.select_town_group,
				options : town_groups_collection.getTownGroupsForDropdown(),
				value : town_groups_collection.getActiveGroupId()
			}).on('dd:change:value', function(e, new_val) {
				//Change active group
				town_groups_collection.makeTownGroupActive(new_val);
			}));

			//Filter towns textbox
			CM.register(cm_ctx, 'txt_commands_search', root.find('#txt_commands_search').textbox({
				initial_message : l10n.search_by, clear_msg_button : true, live : true, hidden_zero: false
			})).on('txt:change:value', function(e, value/*, old_val, _txt*/) {
				//That's not nice
				that.town_filter = value;
				that.redrawOverview(that.town_filter, that.filter_type);
			}).on('txt:cleared', function() {
				//That's not nice
				that.town_filter = '';
				that.redrawOverview(that.town_filter, that.filter_type);
			});
		},

		addFilterButtonTooltips : function(filters) {
			var l10n = DM.getl10n('command_overview').filters,
				$filters = root.find('#command_filter');

			filters.forEach(function(filter) {
				var $filter = $filters.find('.'+filter);
				$filter.tooltip(l10n[filter]);
			});
		},

		filterDisplayCommands : function(command_type) {
			var $root = this._wnd.getJQElement();

			$root.find('.js-command-row').each(function(index, el) {
				var $row = $(el),
					row_command_type = $row.data('command_type');

				if (row_command_type !== command_type) {
					return;
				}

				if ($row.data('hidden')){
					$row.stop().css('display', 'block').animate({opacity: 1}, {queue: false});
					$row.removeData('hidden');
				} else {
					$row.animate({
						opacity: 0
					}, {
						queue: false,
						done: function() {
							$(this).css('display', 'none');
						}
					});

					$row.data('hidden', true);
				}
			});
		},

		initiateCountdowns : function(commands) {
			var cid, command, timestamp = Timestamp.now(),
				html_command,
				onFinish = function() {
					var self = $(this);
					self.siblings('.troops_arrive_at').parent().addClass('timer_ended');
					self.parent().parent().fadeOut();
					self.remove();
				},
				label_arrival = _('Arrival');

			for (cid in commands) {
				if (commands.hasOwnProperty(cid)) {
					command = commands[cid];

					var timestamp_end = command.arrival_at;
					var html_identifier = 'span.eta-command-' + command.id;

					if (command.command_type === 'attack_takeover') {
						label_arrival = _('Siege ends');
					} else if (command.type === 'colonization' && command.colonization_finished_at) {
						label_arrival = _('City foundation ends');
					} else if (command.type === 'revolt') {

						if (command.finished_at) {
							// virtual commands without units
							html_identifier = 'span.eta-command-revolt-end-' + command.id;
							if (command.started_at > timestamp) {
								// not yet arrived
								label_arrival = _('A revolt is being started');
								timestamp_end = command.started_at;
							} else {
								// full running
								label_arrival = _('End');
								timestamp_end = command.finished_at;
							}
						}  // else - revolt unit commands - behave like regular commands
					} else {
						label_arrival = _('Arrival');
					}


					html_command = $(html_identifier);
					if (timestamp_end > timestamp) { // command is not done yet
                        $('#command_' + command.id + ' span.troops_arrive_at').html('(' + label_arrival + ' ' + DateHelper.formatDateTimeNice(timestamp_end, true) + ')');
                        CM.unregister(cm_ctx, html_identifier);
                        CM.register(cm_ctx, html_identifier, html_command.countdown2({
                            value :  timestamp_end - timestamp
                        }).on('cd:finish', onFinish));
					} else { // command was already done / is due
						onFinish.call(html_command);
					}

				}
			}
		},

		initiateCommandsRenaming : function(commands) {
			var cid, command, html_command,
				$command_overview = $('#command_overview');

			$command_overview.find('a.game_arrow_edit').hide();
			$command_overview.find('span.do_rename_command').hide();

			var showEdit = function () {
				$(this).find('a.game_arrow_edit').show();
			};
			var hideEdit = function () {
				$(this).find('a.game_arrow_edit').hide();
			};

			for (cid in commands) {
				if (commands.hasOwnProperty(cid)) {
					command = commands[cid];

					// city foundation can't have custom name
					if (command.type === 'colonization') {
						continue;
					}

					html_command = $('#command_' + command.id);

					$(html_command)
						.bind('mouseover', showEdit)
						.bind('mouseout', hideEdit);

					if (command.custom_command_name) {
						html_command.tooltip(command.custom_command_name);
					}
				}
			}
		},

		redrawOverview : function(town_filter, filter_type) {
			var html_tabs,
				fixName,
				town_filtered,
				current_commands_count,
				commands = [],
				$command_count = root.find('.command_count'),
				timestamp = Timestamp.now();

			town_filter = town_filter.toLowerCase();
			filter_type = filter_type || this.filter_type;

			fixName = function(name) {
				return name !== null ? name : '';
			};

			// Sort function for commands
			var sortCommands = function(a, b) {
				var getTimeLeft = function(cmd) {
					if (cmd.type === 'revolt' && cmd.finished_at) {
						// if not yet arrived take revolt start time else take revolt finish time
						return (cmd.started_at > timestamp) ? cmd.started_at : cmd.finished_at;
					}
					return cmd.arrival_at;
				};

				var a_time_left = getTimeLeft(a),
					b_time_left = getTimeLeft(b);

				//same arrival time - we need to sort more precisely
				if (a_time_left === b_time_left) {
					return a.id - b.id;
				}
				return a_time_left - b_time_left;
			};

			town_filtered = data.commands.filter(function(cmd) {
				var search = ''.concat(cmd.custom_command_name, cmd.origin_town_name, cmd.destination_town_name, cmd.origin_town_player_name, cmd.destination_town_player_name, fixName(cmd.origin_town_player_alliance_name), fixName(cmd.destination_town_player_alliance_name));
				if (town_filter === '') {
					return true;
				} else {
					return search.toLowerCase().match(town_filter);
				}
			}).sort(sortCommands);

			switch (filter_type) {
				case '#tab_attacks':
					var incoming_attacks = town_filtered.filter(function(cmd) {
						return ((!cmd.own_command && !cmd.payed_iron && cmd.type !== 'support') || !cmd.type);
					});

					var outgoing_attacks = town_filtered.filter(function(cmd) {
						return cmd.own_command && !cmd.payed_iron && ((cmd.type !== 'support' && cmd.type !== 'abort') || !cmd.type);
					});

					var canceled_orders = town_filtered.filter(function(cmd) {
						return cmd.own_command && cmd.type === 'abort';
					});

					commands = commands.concat(
						[{html : '<li><h4>'+ _('Incoming attacks') + '</h4></li>'}],
						incoming_attacks.length > 0	? incoming_attacks :
							[{html : '<li class="even"><span class="italic">' + _('There are currently no incoming attacks') + '</span></li>'}],
						[{html : '<li><h4>'+ _('Outgoing attacks') + '</h4></li>'}],
						outgoing_attacks.length > 0	? outgoing_attacks :
							[{html : '<li class="even"><span class="italic">' + _('There are currently no outgoing attacks') + '</span></li>'}],
						[{html : '<li><h4>'+ _('Canceled commands') + '</h4></li>'}],
						canceled_orders.length > 0 ? canceled_orders :
							[{html : '<li class="even"><span class="italic">' + _('There are no current canceled commands') + '</span></li>'}]
					);

					current_commands_count = incoming_attacks.length + outgoing_attacks.length + canceled_orders.length;

					break;
				case '#tab_support':
					var incoming_support = town_filtered.filter(function(cmd) {
						return !cmd.own_command && cmd.type === 'support';
					});

					var outgoing_support = town_filtered.filter(function(cmd) {
						return cmd.own_command && cmd.type === 'support';
					});

					commands = commands.concat(
						[{html : '<li><h4>' + _('Arriving support') + '</h4></li>'}],
						incoming_support.length > 0	? incoming_support :
							[{html : '<li class="even"><span class="italic">' + _('Currently no incoming support is on its way') + '</span></li>'}],
						[{html : '<li><h4>' + _('Outgoing support') + '</h4></li>'}],
						outgoing_support.length > 0 ? outgoing_support :
							[{html : '<li class="even"><span class="italic">' + _('Currently no outgoing support is on its way') + '</span></li>'}]
					);

					current_commands_count = incoming_support.length + outgoing_support.length;

					break;
				case '#tab_espionage':
					var espionage = town_filtered.filter(function(cmd) {
						return cmd.payed_iron;
					});

					commands = espionage.length > 0	? espionage :
						[{html : '<li class="even"><span class="italic">' + _('None of your spies are currently traveling') + '</span></li>'}];

					current_commands_count = espionage.length;

					break;
				default:
					//#tab_all
					commands = town_filtered;

					current_commands_count = this.towngroup_commands_count;

					break;
			}

			if(current_commands_count < this.total_commands_count) {
				$command_count.text( '(' + current_commands_count + '/' + this.total_commands_count + ')' );
				if(current_commands_count < this.towngroup_commands_count) {
					commands.push({html : '<li class="odd note"><span class="italic">' + _('There are additional troop movements which are currently filtered.') + '</span></li>'});
				}
				if(this.towngroup_commands_count < this.total_commands_count) {
					commands.push({html : '<li class="even note"><span class="italic">' + _('There are additional troop movements in other city groups available.') + '</span></li>'});
				}
			} else {
				$command_count.empty();
			}

			html_tabs = us.template(templates.tabs, {
				commands : commands,
				unit_types : data.unit_types,
				player_id : data.player_id,
				attack_types : data.attack_types,
				filter_types : data.filter_types,
				filter_type : filter_type
			});

			$('#command_overview_tabs').empty().append(html_tabs);

			// hide already inactive (filtered) commands
			// this block is here, in case, when a player filter some commands by clicking on icons,
			// after that he filters by a drop down box, and then remove drop down box filter,
			// in this case the commands should be visible like before (using the drop down box)
			$('#command_filter').find('div.support_filter.inactive').each(function() {
				var command_class = $(this).attr('class').split(' ');

				$('.cmd_img.command_type.' + command_class[1]).each(function() {
					var command = $(this).parent().parent().parent();
					command.css({opacity: 0}).hide();
					command.data('hidden', true);
				});
			});

			this.initiateCountdowns(commands);
			this.initiateCommandsRenaming(commands);
		},

		/**
		 * replace command in this.data with updated values, e.g. command canceled
		 * afterwards resort this.data
		 *
		 * @param {Object} new_command_raw_data array data from GameCommand
		 * @return {void}
		 */
		updateCommand : function(new_command_raw_data) {
			var i, result_command = new_command_raw_data, command, command_clone, commands = data.commands, cl = commands.length;

			for (i = 0; i < cl; i++) {
				command = commands[i];
				command_clone = $.extend({}, command);

				if (command.id === result_command.id) {
					command.arrival_at = result_command.arrival_at;
					command.cancelable = result_command.cancelable;
					command.cmd_return = result_command.cmd_return;
					command['return'] = result_command['return'];
					command.started_at = result_command.started_at;
					command.type = result_command.type;

					command.destination_town_id = command_clone.origin_town_id;
					command.destination_town_name = command_clone.origin_town_name;
					command.destination_town_player_alliance_id = command_clone.origin_town_player_alliance_id;
					command.destination_town_player_alliance_name = command_clone.origin_town_player_alliance_name;
					command.destination_town_player_id = command_clone.origin_town_player_id;
					command.destination_town_player_name = command_clone.origin_town_player_name;
					command.dt_number_on_island = command_clone.ot_number_on_island;
					command.userurl_base64_destination = command_clone.userurl_base64_origin;
					command.townurl_base64_destination = command_clone.townurl_base64_origin;

					command.origin_town_id = command_clone.destination_town_id;
					command.origin_town_name = command_clone.destination_town_name;
					command.origin_town_player_alliance_id = command_clone.destination_town_player_alliance_id;
					command.origin_town_player_alliance_name = command_clone.destination_town_player_alliance_name;
					command.origin_town_player_id = command_clone.destination_town_player_id;
					command.origin_town_player_name = command_clone.destination_town_player_name;
					command.ot_number_on_island = command_clone.dt_number_on_island;
					command.userurl_base64_origin = command_clone.userurl_base64_destination;
					command.townurl_base64_origin = command_clone.townurl_base64_destination;
				}
			}

			commands.sort(function(a, b) {
				return a.arrival_at - b.arrival_at;
			});
		},

		cancelCommand : function(command_id, command_type) {
			var that = this;

			if (command_type === 'command') {
				gpAjax.ajaxPost('town_overviews', 'cancel_command', {id : command_id}, false, function(result) {
					that.updateCommand(result.command);
					that.redrawOverview(that.town_filter, that.filter_type);
				});
			} else if (command_type === 'espionage') {
				gpAjax.ajaxPost('command_info', 'cancel_espionage', {id : command_id.replace(/\D*/, '')}, false, function() {
					$('#command_' + command_id).fadeOut('slow');
				});
			}
		},

		renameCommand : function(command_id) {
			var value;

			value = $('#command_' + command_id).find('span.cmd_span_custom').text().trim();
			if (value.length === 0) {
				value = this.getCommandNameAsText(command_id);
			}

			$('<input type="text" name="custom_command_name" value="' + value + '" />').insertAfter($('#command_' + command_id + ' span.cmd_span').hide());

			$('#command_' + command_id + ' span.cmd_span_custom').hide();
			$('#command_' + command_id + ' span.rename_command').hide();
			$('#command_' + command_id + ' span.do_rename_command').show();
			$('#command_' + command_id + ' .game_arrow_delete').hide();
		},

		doRenameCommand : function(command_id, command_type) {
			var that = this;
			var name = $('#command_' + command_id + ' input[name="custom_command_name"]').val();
			var value = this.getCommandNameAsText(command_id);

			if (name === value) {
				this.displayOriginalCommandName(command_id);
			} else {
				gpAjax.ajaxPost('town_overviews', 'rename_command', {id : command_id.replace(/\D*/, ''), name : name, type: command_type}, false, function() {
					that.setCommandNameById(command_id, name);
					that.redrawOverview(that.town_filter, that.filter_type);
				});
			}
		},

		doRestoreCommandName : function(command_id, command_type) {
			var that = this;

			gpAjax.ajaxPost('town_overviews', 'restore_command_name', {id : command_id.replace(/\D*/, ''), type: command_type}, false, function() {
				that.displayOriginalCommandName(command_id);
				that.setCommandNameById(command_id, null);
			});
		},

		displayOriginalCommandName : function(command_id) {
			var cmd = $('#command_' + command_id);
			cmd.find('span.rename_command').show();
			cmd.find('span.do_rename_command').hide();
			cmd.find('input[name="custom_command_name"]').remove();
			cmd.find('span.cmd_span').show();
			cmd.find('span.cmd_span_custom').empty().hide();
			cmd.tooltip().destroy();
			cmd.find('.game_arrow_delete').show();
		},

		setCommandNameById: function(command_id, command_name) {
			var cid, command;

			for (cid in data.commands) {
				if (data.commands.hasOwnProperty(cid)) {
					command = data.commands[cid];
					// info: don't compare for type! don't use === because command_id is sometimes integer like '123' and sometimes string like 'espionage_456'
					if (command.id == command_id) { //jshint ignore:line
						data.commands[cid].custom_command_name = command_name;
						return;
					}
				}
			}
		},

		getCommandNameAsText : function(command_id) {
			var cid, command, selected_command = null, value, target, dest_town_player_name;

			for (cid in data.commands) {
				if (data.commands.hasOwnProperty(cid)) {
					command = data.commands[cid];
					// info: don't compare for type! don't use === because command_id is sometimes integer like '123' and sometimes string like 'espionage_456'
					if (command.id == command_id) { //jshint ignore:line
						selected_command = command;
						break;
					}
				}
			}

			if (!selected_command) {
				return '';
			}

			dest_town_player_name = selected_command.destination_town_player_name ? selected_command.destination_town_player_name : _('Ghost town');
			if (selected_command.command_type && selected_command.command_type === 'revolt') {
				value = selected_command.destination_town_name + ' (' + dest_town_player_name + ') < ' + selected_command.origin_player_name;
			} else {
				var origin = '';
				if (selected_command.type === 'colonization' || selected_command.type === 'colonization_failed') {
					if (selected_command.colonization_finished_at) {
						target = _('Colonization has begun');
					} else {
						target = _('City foundation');
					}
				} else if (selected_command.is_attack_spot) {
					if (selected_command.cmd_return) {
						target = selected_command.userurl_base64_origin;
						origin = selected_command.destination_town_name + ' (' + selected_command.destination_town_player_name + ')';
					} else {
						origin = selected_command.userurl_base64_destination; //jshint ignore:line
						target = selected_command.origin_town_name + ' (' + selected_command.origin_town_player_name + ')';
					}
				}
				else {
					origin = selected_command.origin_town_name + ' (' + selected_command.origin_town_player_name + ')';
					target = selected_command.farm_town_id ? selected_command.farm_town_name + ' (' + _('Farming village') + ')' : selected_command.destination_town_name + ' (' + dest_town_player_name + ')';
				}
				value = origin + (selected_command.cmd_return ? ' < ' : ' > ') + target;
			}

			return value;
		},

		// used in commands overview
		createFarmLink : function(farm_id, farm_name) {
			return '<a class="gp_town_link" href="#' + (btoa('{"id" : '+farm_id+', "ix" : 13, "iy" : 4, "tp" : "farm_town"}')) + '">'+ farm_name +'</a> (' + _('Farming village') + ')';
		}

	};

	window.CommandsOverview = CommandsOverview;
}(jQuery));
