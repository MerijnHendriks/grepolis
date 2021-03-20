/* global StringSorter */

(function() {
	'use strict';

	var OuterUnitsOverview = {
		data: null,
		templates: null,

		init: function(wnd, data) {
			this.wnd = wnd;
			var context = wnd.getContext();

			//Deinitiate spinners and progressbars
			var _self = this,
				templates = data.templates,
				lang = DM.getl10n('outer_units');

			this.data = data.data;
			this.templates = templates;

			//Render main container of the tab
			wnd.setContent2(us.template(templates.outer_units, {}));

			//Register "sort by" dropdown
			var dd_sort_by = CM.register(context, 'dd_sort_by', $('#dd_troops_outside_sort_by').dropdown({
				value: 'origin_town_name', options: [
					{value: 'origin_town_name', name: lang.origin_town_name},
					{value: 'destination_town_name', name: lang.destination_town_name},
					{value: 'player_name', name: lang.player_name},
					{value: 'troop_count', name: lang.troop_count}
				]
			}).on('dd:change:value', function(e, new_val, old_val) {
				_self.sortData(wnd, _self.getOuterUnitsData(), new_val, _self.getOrderDirection());
			}));

			//Register "order by" button
			CM.register(context, 'btn_order_by', $('#btn_troops_ourside_order_by').button({
				toggle : true
			}).on('btn:click:even', function() {
				_self.sortData(wnd, _self.getOuterUnitsData(), dd_sort_by.getValue(), 'desc');
			}).on('btn:click:odd', function() {
				_self.sortData(wnd, _self.getOuterUnitsData(), dd_sort_by.getValue(), 'asc');
			}));

			//Render list
			this.sortData(wnd, _self.getOuterUnitsData(), dd_sort_by.getValue(), _self.getOrderDirection());

			BuildingPlace.init();
			$.Observer(GameEvents.command.support.send_back).subscribe(['outer_units'], function(event, data) {
				_self.removeSupportById(data.support_id);
			});
		},

		removeSupportById: function(support_id) {
			var data = this.data.outer_units, len = data.length;
			while (len--) {
				if (data[len].id === support_id) {
					data.splice(len, 1);
				}
			}
		},

		getOrderDirection: function() {
			var btn_order_by = CM.get(this.wnd.getContext(), 'btn_order_by');
			return btn_order_by.getState() ? 'asc' : 'desc';
		},

		getOuterUnitsData: function() {
			return this.data.outer_units;
		},

		sortData: function(wnd, data, sort_by, direction) {
			data = hCommon.getCleanCopy(data);
			var sorter = new StringSorter();
			var $return_all_units = $('#outer_troops_box .return_all_units');
			if (data.length) {
				$return_all_units.removeClass('hidden');
				$return_all_units.tooltip(_('Return all units from the selected cities to their home city'));
			} else {
				$return_all_units.addClass('hidden');
			}

			//We have different names on the server and different in the dropdown
			if (sort_by === 'origin_town_name') {
				sort_by = 'home_town_name';
			}
			else if (sort_by === 'destination_town_name') {
				sort_by = 'current_town_name';
			}
			else if (sort_by === 'troop_count') {
				sorter = new NumberSorter();
				sort_by = 'amount_of_units';
			}

			data = sorter.compareObjectsByAttribute(data, [sort_by], direction);

			this.renderList(wnd, data);
		},

		/**
		 * Renders list of units which are outside the town
		 */
		renderList: function(wnd, data) {
			var root = wnd.getJQElement();

			root.find('#outer_troops_list').html(us.template(this.templates.outer_units_list, {outer_units: data}));

			$('a.place_sendback_all').tooltip(_('Return all units'));
			$('a.place_sendback_part').tooltip(_('Return some units'));
		},

		getNewContext: function(units_id) {
			var cm_context = this.wnd.getContext();
			return {main: cm_context.main, sub: units_id};
		},

		getUnitSpinnersAsObject: function(units_id) {
			var unit_spinners_array = CM.searchInSubGroupFor(this.getNewContext(units_id), 'sp_unit_'),
				unit_spinners_object = {}, unit_spinner,
				i, l = unit_spinners_array.length;

			for (i = 0; i < l; i++) {
				unit_spinner = unit_spinners_array[i];
				unit_spinners_object[unit_spinner.getCid()] = unit_spinner;
			}

			return unit_spinners_object;
		},

		toggle: function(units_id, base_id, animate) {
			base_id = base_id || 'place';

			var _self = this, units_data = this.data.outer_units, units,
				i, l = units_data.length,
				$main = $('#' + base_id + '_units_' + units_id),
				$el = $('#' + base_id + '_send_part_' + units_id),
				$spinners = $el.find('.spinner'),
				$buttons = $main.find('.button_unit'),
				$progressbar = $el.find('.single-progressbar'),
				$slow_ship = $el.find('.button_slow_ship'),
				$fast_ship = $el.find('.button_fast_ship'),
				new_context = this.getNewContext(units_id);

			CM.unregisterSubGroup(new_context);

			//Take proper part of the data for selected container
			for (i = 0; i < l; i++) {
				if (units_data[i].id == units_id) {
					units = units_data[i].game_units;
				}
			}

			//Initialize spinners
			var unit_name, unit_count, counter = 0;

			//Initialize ships indicators
			CM.register(new_context, 'btn_slow_ship', $slow_ship.button({
				caption : 0, toggle : true
			}).on('btn:click:odd', function(e, btn) {
				if (sp_big_transporter) {
					sp_big_transporter.setValue(btn.getCaption());
				}
			}).on('btn:click:even', function(e, btn) {
				if (sp_big_transporter) {
					sp_big_transporter.setValue(0);
				}
			}));

			CM.register(new_context, 'btn_fast_ship', $fast_ship.button({
				caption : 0, toggle : true
			}).on('btn:click:odd', function(e, btn) {
				if (sp_small_transporter) {
					sp_small_transporter.setValue(btn.getCaption());
				}
			}).on('btn:click:even', function(e, btn) {
				if (sp_small_transporter) {
					sp_small_transporter.setValue(0);
				}
			}));

			//Initialize progressbar
			CM.register(new_context, 'pb_capacity', $progressbar.singleProgressbar({
				max : 0,
				'caption': _('Capacity:')
			}));

			var btn_slow_ship = CM.get(new_context, 'btn_slow_ship');
			var btn_fast_ship = CM.get(new_context, 'btn_fast_ship');
			var pb_capacity   = CM.get(new_context, 'pb_capacity');

			for (unit_name in units) {
				if (units.hasOwnProperty(unit_name) && units[unit_name] > 0) {
					unit_count = units[unit_name];

					//Initiate buttons
					CM.register(new_context, 'btn_unit_' + unit_name, $($buttons[counter]).button({
						caption : unit_count, toggle : true, cid : unit_name
					}).on('btn:click:odd', function(e, btn) {
						var sp_unit = CM.get(new_context, 'sp_unit_' + btn.getCid());
						sp_unit.setValue(btn.getCaption());
					}).on('btn:click:even', function(e, btn) {
						var sp_unit = CM.get(new_context, 'sp_unit_' + btn.getCid());
						sp_unit.setValue(0);
					}));

					//Initiate spinners
					CM.register(new_context, 'sp_unit_' + unit_name, $($spinners[counter]).spinner({
						value : 0, min : 0, step : 1, max : unit_count, tabindex : counter + 1, cid : unit_name
					}).on('sp:change:value', function(e, new_val, old_val) {
						var data_units = _self.getOuterUnitsData(),
							pos = hCommon.searchForPosition(data_units, 'id', units_id),
							researches = data_units[pos].researches;

						var recalc_values = hCommon.calculateCapacity(_self.getUnitSpinnersAsObject(units_id), researches);

						//Update progressbar
						pb_capacity.setMax(recalc_values.total_capacity, {silent : true}).setValue(recalc_values.total_population);

						//Update ship icons
						btn_slow_ship.setCaption(recalc_values.slow_boats_needed);
						btn_fast_ship.setCaption(recalc_values.fast_boats_needed);

					}).on('sp:change:max', function(e, new_val, old_val, spinner) {
						CM.get(new_context, 'btn_unit_' + spinner.getCid()).setCaption(new_val);
					}));

					counter++;
				}
			}

			if (animate) {
				$el.animate({
					height : 'toggle'
				}, 500, function(){}).parent();
			}
		},

		updateUnitsValues : function(units_id, town_id, base_id, ret_data) {
			var _self = this;

			if (ret_data.close) {
				$('#' + base_id + '_units_' + units_id).remove();
			} else {
				//We store infoirmation about number of units on the client, get currently selected row
				var data_units = this.data.outer_units,
					pos = hCommon.searchForPosition(data_units, 'id', units_id),
					need_rerender = false;

				if (typeof(ret_data.remaining_units) != 'undefined') {
					$.each(ret_data.remaining_units, function(unit_name, unit_count) {
						var sp_unit = CM.get(_self.getNewContext(units_id), 'sp_unit_' + unit_name);
						if (sp_unit) {
							sp_unit.setMax(unit_count);

							//Actualize data array
							data_units[pos][unit_name] = unit_count;
							data_units[pos]['game_units'][unit_name] = unit_count;

							if (unit_count === 0) {
								need_rerender = true;
							}
						}
					});
				}

				if (need_rerender) {
					var dd_sort_by = CM.get(this.wnd.getContext(), 'dd_sort_by').getValue(),
						is_btn_order_by_pressed = CM.get(this.wnd.getContext(), 'btn_order_by').getState();
					this.sortData(this.wnd, this.getOuterUnitsData(), dd_sort_by, is_btn_order_by_pressed ? 'asc' : 'desc');
					// used to instantiate the components again
					this.toggle(units_id, base_id, false);
				}
			}
		},

		sendBackPart: function(units_id, town_id, base_id) {
			var _self = this, params = {
					units_id : units_id
				},
				spinner,
				new_context = this.getNewContext(units_id);

			//Go trough all spinners for this box, and save how many units have been selected
			var spinners = CM.searchInSubGroupFor(new_context, 'sp_unit_'),
				i, l = spinners.length;

			for (i = 0; i < l; i++) {
				spinner = spinners[i];
				params[spinner.getCid()] = spinner.getValue();
				spinner.setValue(0);
			}

			gpAjax.ajaxPost('units_beyond_info', 'send_back_part', params, false, {
				success : function(objLayout, data) {
					_self.updateUnitsValues(units_id, town_id, base_id, data);
				},

				error : function(objLayout, data) {
					HumanMessage.error(data.error);
					_self.updateUnitsValues(units_id, town_id, base_id, data);
				}
			});
		}
	};

	window.OuterUnitsOverview = OuterUnitsOverview;
}());
