/*globals jQuery, us, CM, ITowns, GameData, Timestamp, newDateByTimezone, HumanMessage,
GameEvents, StringSorter, NumberSorter, HelperTown, DateHelper, gpAjax, Game */

(function($) {
	'use strict';

	var model, view, controller;
	var templates = {}, data = {}, l10n = {};
	var wnd, root, at_model, at_controller;
	var cm_context, cm_context_units_top, cm_context_sel_row, ctx_create_plan;
	var $content, $units_info, $town_info, $details_container, $curtain;
	var AttackPlannerHelper = require('windows/attack_planner/helpers/attack_planner');
	var OlympusStages = require('enums/olympus_stages');
	var OlympusHelper = require('helpers/olympus');
	var Features = require('data/features');
	var GameDataUnits = require('data/units');

	var units_order = [
		//Naval offense
		'attack_ship', 'trireme',
		//Naval defense
		'bireme', 'demolition_ship',
		//Colonization
		'colonize_ship',
		//Naval transport
		'big_transporter', 'small_transporter',
		//Land units
		'sword', 'slinger', 'archer', 'hoplite', 'rider', 'chariot', 'catapult',
		//Mythical units
		'godsent',
		'manticore', 'minotaur', //Zeus
		'zyklop', 'sea_monster', //Poseidon
		'harpy', 'medusa', //Hera
		'centaur', 'pegasus', //Athene
		'cerberus', 'fury', //Hades
		'calydonian_boar', 'griffin', //Artemis
		'siren', 'satyr', //Aphrodite
		'spartoi', 'ladon' //Aphrodite
	];

	/**
	 * Gets the town group ID which is currently selected
	 *
	 * @return {Number}    town group id (0 for all towns, when no group is active)
	 */
	function getSelectedTownGroupId() {
		return ITowns.getActiveTownGroupId();
	}

	/**
	 * Model
	 */
	model = {
		order_by : 'asc',
		sort_by : 'runtime',
		towns_ids : null,
		hidden_columns : [],
		saved_details : {},

		destroy : function() {
			this.order_by = 'asc';
			this.sort_by = 'runtime';
			this.towns_ids = null;
			this.hidden_columns = [];
			this.saved_details = {};
		},

		resetSavedTextboxValues : function() {
			this.saved_details = {};
		},

		getSavedTextboxValues : function() {
			return this.saved_details;
		},

		setSavedTextboxValues : function(values) {
			this.saved_details = values;
		},

		getTargetLink : function() {
			return data.target_link;
		},

		getTargetName : function() {
			return data.target_name;
		},

		getFirstOriginTownId : function() {
			var origin_town_id, plan_data = data.plan_data || {};

			for (origin_town_id in plan_data) {
				if (plan_data.hasOwnProperty(origin_town_id)) {
					return origin_town_id;
				}
			}

			return 0;
		},

		isInEditMode : function() {
			return typeof data.plan_data !== 'undefined';
		},

		setPlanData : function(plan_data) {
			data.plan_data = plan_data;
		},

		getPlanData : function(origin_town_id) {
			return data.plan_data ? data.plan_data[origin_town_id] : {};
		},

		getPlanId : function(origin_town_id) {
			var plan_data = this.getPlanData(origin_town_id);

			return this.isInEditMode() ? plan_data.plan_id : at_model.getCurrentPlanId();
		},

		getPlanName : function(plan_id) {
			return data.plan_list[plan_id];
		},

		updatePlannedUnits : function(origin_town_id, planned_units) {
			var town = this.getTown(origin_town_id),
				planned_data = this.getPlanData(origin_town_id),
				units = town.units, unit_id;

			for (unit_id in planned_units) {
				if (planned_units.hasOwnProperty(unit_id)) {
					//Differences are negative if number decreased, and positive when increased
					units[unit_id].planned -= planned_data.units[unit_id].amount - planned_units[unit_id];
				}
			}
		},

		substractUnits : function(origin_town_id, planned_units) {
			var town = this.getTown(origin_town_id),
				units = town.units, unit_id;

			for (unit_id in planned_units) {
				if (planned_units.hasOwnProperty(unit_id)) {
					units[unit_id].planned += planned_units[unit_id];
				}
			}
		},

		setPlanList : function(new_plan_list) {
			data.plan_list = new_plan_list;
		},

		getConvertedPlansList : function() {
			var plan_id, plans_list = data.plan_list,
				converted_plans_list = [{value : 0, name : l10n.select_plan}];

			for (plan_id in plans_list) {
				if (plans_list.hasOwnProperty(plan_id)) {
					converted_plans_list[converted_plans_list.length] = {
						value : plan_id,
						name : plans_list[plan_id]
					};
				}
			}

			return converted_plans_list;
		},

		getMorale : function() {
			return data.morale * 100;
		},

		setSortByMethod : function(type) {
			this.sort_by = type;
		},

		getSortByMethod : function() {
			return this.sort_by;
		},

		getOrderByMethod : function() {
			return this.order_by;
		},

		/**
		 * asc | desc
		 */
		setOrderByMethod : function(type) {
			this.order_by = type;
		},

		toggleOrderByMethod : function() {
			this.order_by = this.order_by === 'asc' ? 'desc' : 'asc';
		},

		areColumnsHidden : function() {
			return this.hidden_columns.length > 0;
		},

		resetHiddenColumns : function() {
			this.hidden_columns = [];
		},

		getHiddenColumns : function() {
			return this.hidden_columns;
		},

		addHiddenColumn : function(unit_id) {
			if (this.hidden_columns.indexOf(unit_id) === -1) {
				this.hidden_columns[this.hidden_columns.length] = unit_id;
			}
		},

		/**
		 * It's AuB, means that its an object with unit types which
		 * occured at least once
		 */
		getSumSetOfUnitsInTowns : function() {
			var towns = data.towns, town_id, units, unit_id,
				sum_set = {}, i, l = units_order.length,
				sum_set_ordered = [],
				hidden_columns = this.getHiddenColumns();

			//Check which units are at least in one town
			for (town_id in towns) {
				if (towns.hasOwnProperty(town_id)) {
					units = towns[town_id].units;

					for (unit_id in units) {
						if (units.hasOwnProperty(unit_id) && (units[unit_id].amount + units[unit_id].on_way > 0) && hidden_columns.indexOf(unit_id) === -1) {
							sum_set[unit_id] = true;
						}
					}
				}
			}

			//Order them
			for (i = 0; i < l; i++) {
				if (sum_set.hasOwnProperty(units_order[i])) {
					sum_set_ordered[sum_set_ordered.length] = units_order[i];

					//There can be a case that someone will forget to put new unit in 'units_order'
					//so for every found unit we have to remove it from the object, and at the end
					//we will have an object with units which are not on the 'units_order' list
					delete sum_set[units_order[i]];
				}
			}

			//Add units which was not set on the 'units order' at the end of the list
			for (unit_id in sum_set) {
				if (sum_set.hasOwnProperty(unit_id)) {
					sum_set_ordered[sum_set_ordered.length] = unit_id;
				}
			}

			return sum_set_ordered;
		},

		getTowns : function(excluded_towns) {
			excluded_towns = excluded_towns || [];

			var towns_ids = [], town_id, t = data.towns, town;

			if (this.towns_ids) {
				return this.towns_ids;
			}

			for (town_id in t) {
				if (t.hasOwnProperty(town_id) && excluded_towns.indexOf(parseInt(town_id, 10)) === -1) {
					town = t[town_id];
					town.selected = false;
					town.town_id = parseInt(town_id, 10);

					towns_ids[towns_ids.length] = town;
				}
			}

			this.towns_ids = towns_ids;

			return towns_ids;
		},

		selectFirstTown : function() {
			var towns = this.getTowns(), town;

			if (towns.length > 0) {
				town = towns[0];
				town.previously_selected = false;
				town.selected = true;
			}
		},

		selectTown : function(town_id) {
			var towns = this.getTowns(), i, l = towns.length, town;

			for (i = 0; i < l; i++) {
				town = towns[i];
				town.previously_selected = town.selected;
				town.selected = town.town_id === town_id;
			}
		},

		isTownSelected : function(town_id) {
			var town, towns = this.getTowns(), i, l = towns.length;

			for (i = 0; i < l; i++) {
				town = towns[i];

				if (town.town_id === town_id && town.selected) {
					return true;
				}
			}

			return false;
		},

		getSelectedTownId : function() {
			var towns = this.getTowns(), i, l = towns.length;

			for (i = 0; i < l; i++) {
				if (towns[i].selected) {
					return towns[i].town_id;
				}
			}

			return 0;
		},

		unselectTowns : function() {
			this.selectTown(null);
		},

		getUnitsOrder : function() {
			return units_order;
		},

		getClonedTownsIds : function(excluded_towns) {
			return this.getTowns(excluded_towns).clone() || [];
		},

		getTown : function(town_id) {
			return data.towns[town_id];
		},

		getRunTimeForUnit : function(town_id, unit_id) {
			return data.towns[town_id].units[unit_id].duration;
		},

		getFilteredTowns : function(filter, sort_by, order_by, show_units_on_the_way, show_units_planned, units_min_amount, excluded_towns) {
			excluded_towns = excluded_towns || [];

			//Hint - if the performace is not good enough, please combine all filter functions
			var filtered = this.getClonedTownsIds(excluded_towns),
				are_some_units_in_some_town = false,
				sorter;

			filter = (filter || '').toLowerCase();

			//Filter towns by string
			filtered = filtered.filter(function(town, index, array) {
				return town.town_name.toLowerCase().match(filter);
			});

			//Filter towns by minimal amount of units by type specified in textboxes or if there are no units in town at all
			filtered = filtered.filter(function(town, index, array) {
				var unit_id, units = town.units, unit, unit_limit, amount,
					no_units_in_town = true, min_unit_count_limit_exceeded = false;

				for (unit_id in units) {
					if (units.hasOwnProperty(unit_id)) {
						unit = units[unit_id];
						unit_limit = units_min_amount ? units_min_amount[unit_id] : 0;//0 means no limits
						amount = unit.amount + (show_units_on_the_way ? unit.on_way : 0);

						//If there are some units in town
						if (amount) {
							no_units_in_town = false;
							are_some_units_in_some_town = true;
						}

						//Hide town if number of unit of specifict types are not equal minimal number
						if (unit_limit && amount < unit_limit) {
							min_unit_count_limit_exceeded = true;
						}
					}
				}

				return !no_units_in_town && !min_unit_count_limit_exceeded;
			});


			if (sort_by === 'town_name') {
				//Order towns by name
				sorter = new StringSorter();
				filtered = sorter.compareObjectsByAttribute(filtered, [sort_by], order_by);
			} else if (sort_by === 'runtime') {
				//Order by runtime
				sorter = new NumberSorter();
				filtered = sorter.compareObjectsByAttribute(filtered, ['units', 'small_transporter', 'duration'], order_by);
			} else {
				// Order by units amount
				sorter = new NumberSorter();
				filtered = sorter.compareObjectsByFunction(filtered, function(show_units_on_the_way, show_units_planned, obj) {
					var value = obj.units[sort_by];
					return value.amount + (show_units_on_the_way ? value.on_way : 0) - (show_units_planned ? 0 : value.planned);
				}.bind(null, show_units_on_the_way, show_units_planned), order_by);
			}

			return {filtered : filtered, are_some_units_in_some_town : are_some_units_in_some_town};
		},

		canCreatePortalAttack : function() {
			if (!Features.isOlympusEndgameActive()) {
				return false;
			}

			var olympus = OlympusHelper.getOlympusModel();

			return data.is_portal_temple &&
				Game.alliance_id &&
				Game.alliance_id === data.target_alliance_id &&
				olympus.getOlympusStage() === OlympusStages.OLYMPUS_STAGE;
		}
	};

	/**
	 * View
	 */
	view = {
		initialize : function() {
			$content = root.find('.gpwindow_content');

			this.initializeMainLayout();

			$curtain = root.find('.window_inner_curtain');
		},

		initializeMainLayout : function() {
			var _self = this,
				txt_search_in_towns;

			var plan_id = model.getPlanId(model.getFirstOriginTownId());

			//Load template
			$content.html(us.template(templates.add_attack, {
				l10n : l10n,
				//plan_id : plan_id,
				target_link : model.getTargetLink(),
				set_sum : model.getSumSetOfUnitsInTowns()
			}));

			$town_info = $content.find('.town_info');
			$units_info = $content.find('.units_info');
			$details_container = $content.find('.details_container');

			CM.unregisterGroup(cm_context);

			//Select town group dropdown
			CM.register(cm_context, 'dd_town_groups', $content.find('.dd_town_groups').dropdown({
				initial_message : l10n.select_town_group,
				options : HelperTown.getTownGroupsForDropdown(),
				value : getSelectedTownGroupId()
			}).on('dd:change:value', function(e, new_val, old_val) {
				//Change active group
				ITowns.setActiveTownGroup(new_val, function() {}, {force : true});
			}));

			//Order by 'ASC DESC' button
			CM.register(cm_context, 'btn_order_towns_by', $content.find('.btn_order_towns_by').button({
				toggle : true, state : true
			}).on('btn:click:even', function() {
				model.setOrderByMethod('desc');
				//desc
				controller.filterTowns(txt_search_in_towns.getValue(), model.getSortByMethod(), 'desc');
			}).on('btn:click:odd', function() {
				model.setOrderByMethod('asc');
				//asc
				controller.filterTowns(txt_search_in_towns.getValue(), model.getSortByMethod(), 'asc');
			}));

			//Filter towns textbox
			txt_search_in_towns = CM.register(cm_context, 'txt_search_in_towns', $content.find('.txt_search_in_towns').textbox({
				initial_message : l10n.search_by, clear_msg_button : true, live : true, hidden_zero : false
			})).on('txt:change:value', function(e, value, old_val, _txt) {
				controller.filterTowns(value, model.getSortByMethod(), model.getOrderByMethod());
			}).on('txt:cleared', function() {
				controller.filterTowns('', model.getSortByMethod(), model.getOrderByMethod());
			});

			//Sort radiobutton
			CM.register(cm_context, 'rb_sort_by', $content.find('.rb_sort_by').toggleStateRadiobutton({
				value : model.getSortByMethod(), state : model.getOrderByMethod() === 'desc',
				template : 'tpl_rb_sort_by', options : [
					{value : 'town_name', tooltip : l10n.order_by_town_name},
					{value : 'runtime', tooltip : l10n.order_by_runtime}
				]
			}).on('tsrb:change:value', function(e, _tsrb, new_val, old_val) {
				controller.resetFilters(new_val, _tsrb.getState() ? 'desc' : 'asc');
			}).on('tsrb:change:state', function(e, _tsrb, state) {
				controller.resetFilters(_tsrb.getValue(), state ? 'desc' : 'asc');
			}));

			//Scrollbar
			CM.register(cm_context, 'details_container_horizontal', $content.find('.attack_planner').scrollbar({
				$elements_to_scroll : $content.find('.data_container, .visibility_limiter'),
				$container : $content.find('.visibility_limiter'), orientation : 'horizontal'
			}));

			$content.find('.units_header .textbox').each(function(index, el) {
				var $el = $(el),
					unit_id = $el.attr('data-unit');

				CM.unregister(cm_context_units_top, 'unit_top_' + unit_id);
				CM.register(cm_context_units_top, 'units_top_' + unit_id, $el.textbox({
					cid : unit_id, type : 'number'
				}).on('txt:change:value', function(e, value, old_value) {
					controller.filterTowns(txt_search_in_towns.getValue(), model.getSortByMethod(),	model.getOrderByMethod());
				}).on('txt:afterfocus', function(e, _txt) {
					var value = parseInt(_txt.getValue(), 10) || 0;

					if (value > 0) {
						_txt.select(0, 20);
					}
					else {
						_txt.setValue(1);
					}
				}));
			});

			//Sort buttons
			var btn_show_units_on_the_way = CM.register(cm_context, 'btn_show_units_on_the_way', $content.find('.btn_show_units_on_the_way').button({
				toggle : true, state : true, tooltips : [{title : l10n.popup_units_on_the_way}]
			}).on('btn:click', function() {
				controller.filterTowns(txt_search_in_towns.getValue(), model.getSortByMethod(),	model.getOrderByMethod());
			}));

			var btn_show_scheduled_units = CM.register(cm_context, 'btn_show_scheduled_units', $content.find('.btn_show_scheduled_units').button({
				toggle : true, state : true, tooltips : [{title : l10n.popup_units_planned, styles : {width : 400}}]
			}).on('btn:click', function() {
				controller.filterTowns(txt_search_in_towns.getValue(), model.getSortByMethod(),	model.getOrderByMethod());
			}));

			/*CM.register(cm_context, 'btn_show_units_in_the_queue', $content.find('.btn_show_units_in_the_queue').button({}).on('btn:click', function() {

			}));*/

			CM.register(cm_context, 'btn_clear_all_textboxes', $content.find('.btn_clear_all_textboxes').button({}).on('btn:click', function() {
				var $textboxes = CM.searchInSubGroupFor(cm_context_units_top, 'units_top_'), l = $textboxes.length;

				while (l--) {
					$textboxes[l].setValue('');
				}
			}));

			CM.register(cm_context, 'btn_reset_hidden_units', $content.find('.btn_reset_hidden_units').button({
				disabled : true,
				tooltips : [{title : l10n.show_all_units}]
			}).on('btn:click', controller.resetHiddenColumns));

			//Go back to 'show plan' page button
			CM.register(cm_context, 'btn_open_show_plan', $content.find('.btn_open_show_plan').button({
				template : 'empty', caption : model.getPlanName(plan_id) || '- ', disabled : !model.getPlanName(plan_id)
			}).on('btn:click', function() {
				//Open 'show plan' page (plan ID can change, so take always the newest id)
				at_controller.showPlan(at_model.getCurrentPlanId());
			}));

			//'Remove column' event delegator
			$content.on('click', '.remove_column', function(e) {
				var $cell = $(e.currentTarget).parent().parent(),
					unit_id = $cell.attr('data-unitid');

				e.stopPropagation();

				$cell.hide();
				controller.hideColumn(unit_id, $cell);
			});

			//'Open Attack town window' event delegator
			$details_container.on('click.attack_wnd_button_delegation', '.attack_town_button', function(e) {
				var $el = $(e.currentTarget),
					town_id = $el.attr('data-townid');

				controller.switchTownForAttack(town_id);
			});

			//'Sort by amount of units' event delegator
			$content.on('click.sort_by_unit_amount', '.unit_icon40x40', function(e) {
				var $el = $(e.currentTarget),
					unit_id = $el.parent().attr('data-unitid');

				controller.selectColumn($el, unit_id);
			});

			var filtered_towns = model.getFilteredTowns(
				txt_search_in_towns.getValue(),
				model.getSortByMethod(),
				model.getOrderByMethod(),
				btn_show_units_on_the_way.getState(),
				btn_show_scheduled_units.getState(),
				null,
				[at_model.getSelectedTargetId()]
			);

			$content.find('.details_container').toggleClass('no_units_in_all_towns', !filtered_towns.are_some_units_in_some_town);

			//Scroller
			CM.register(cm_context, 'scroller_town_info', $town_info.scroller({
				$scroll_event_keeper : $content.find('.details_container'),
				page : 1,
				per_page : 7,
				page_offset : 4,
				row_identifier : 'town_id',
				item_height: 50,
				selected_item_height : 210,
				items : filtered_towns.filtered,
				template : templates.town_list,
				template_item_name : 'row'
			}));

			//Scroller
			CM.register(cm_context, 'scroller_units_info', $units_info.scroller({
				$scroll_event_keeper : $content.find('.details_container'),
				page : 1,
				per_page : 7,
				page_offset : 4,
				row_identifier : 'town_id',
				item_height: 50,
				selected_item_height : 210,
				items : filtered_towns.filtered,
				template : templates.units_list,
				template_item_name : 'row',
				on_click_selector : '.click_detection',
				template_item_init : function($row, row_id, origin_town_id, is_selected) {
					if (is_selected) {
						_self.addDetailsContainer($row, origin_town_id);
						view.updateValuesInDetailsContainer(origin_town_id);
					}
				},
				template_item_deinit : function($row, row_id) {
					_self.removeDetailsContainer($row);
				},
				template_data : {
					set_sum : model.getSumSetOfUnitsInTowns(),
					show_units_on_the_way : CM.get(cm_context, 'btn_show_units_on_the_way').getState(),
					show_units_planned : CM.get(cm_context, 'btn_show_scheduled_units').getState()
				}
			}).on('scroller:change:page', function(e, _scroller, new_page, old_page) {

			}).on('scroller:item:click', function(e, _scroller, click_event, $row) {
				controller.togglePlanSpecification(click_event, $row);
			}));

			//Some kind of workaround, because its fucking hard to resize the 'units_info' box with pure CSS
			$units_info.css('width', Math.max(578, $content.find('.units_header').width()));

			$units_info.off('click.add_amount').on('click.add_amount', '.show_amount', function(e) {
				var $el = $(e.currentTarget),
					unit_id = $el.attr('data-unitid'),
					$textbox = CM.get(cm_context_sel_row, 'textbox_unit_' + unit_id),
					total_amount = parseInt($el.attr('data-totalamount'), 10),
					sugg_amount = parseInt($el.html(), 10),
					curr_amount;

				if ($textbox) {
					curr_amount = $textbox.getValue();
					$textbox.setValue(sugg_amount === 0 ? 0 : Math.min(total_amount, curr_amount + sugg_amount));
				}
			});

			$town_info.off('click.close_details_container').on('click.close_details_container', '.hepler_row', function(e) {
				var $row = $(e.currentTarget),
					$target = $(e.target),
					town_id = parseInt($row.attr('data-town_id'), 10);

				if ($target.hasClass('town_name_box')) {
					controller.unselectTown(town_id);
				}
			});
		},

		addDetailsContainer : function($row, origin_town_id) {
			var _self = this, $row_textboxes = $row.find('.textboxes_row_' + origin_town_id);

			var edit_mode = model.isInEditMode(),
				plan_data = model.getPlanData(origin_town_id),
				attack_id = edit_mode ? plan_data.id : 0,
				target_id = edit_mode ? plan_data.target_id : at_model.getSelectedTargetId(),
				//Time
				current_time = edit_mode ? plan_data.arrival_at : Timestamp.now() + 7200, //+2 because it should be some date from the future

				//Attack type
				attack_type = edit_mode ? plan_data.type : 'attack',
				attack_type_options = [
					{value : 'attack', tooltip : l10n.attack},
					{value : 'support', tooltip : l10n.support}
				];

			if (model.canCreatePortalAttack()) {
				attack_type_options.push({value: 'portal_attack_olympus', tooltip: l10n.olympus_portal_attack});
				attack_type_options.push({value: 'portal_support_olympus', tooltip: l10n.olympus_portal_support});
			}

			CM.unregisterSubGroup(cm_context_sel_row);

			//Load textboxes HTML
			$row_textboxes.html(us.template(templates.units_details_textboxes, {
				set_sum : model.getSumSetOfUnitsInTowns(),
				town : model.getTown(origin_town_id),
				show_units_on_the_way : CM.get(cm_context, 'btn_show_units_on_the_way').getState(),
				show_units_planned : CM.get(cm_context, 'btn_show_scheduled_units').getState()
			}));

			//Load details HTML
			$row.find('.plan_specification').append(us.template(templates.units_details, {
				morale : model.getMorale()
			}));

			//Initialize all textboxes
			$row_textboxes.find('.textbox').each(function(index, el) {
				var $el = $(el),
					saved_values = model.getSavedTextboxValues(),
					unit_id = $el.attr('data-unitid'),
					value = edit_mode ? plan_data.units[unit_id].amount : saved_values[unit_id] || 0;

				CM.register(cm_context_sel_row, 'textbox_unit_' + unit_id, $el.textbox({
					cid : {unit_id : unit_id}, min : 0, max : Infinity, value : value, type : 'number'
				}).on('txt:change:value', function() {
					view.updateValuesInDetailsContainer(origin_town_id);
					controller.saveTextboxValues();
				}));
			});

			CM.register(cm_context_sel_row, 'dp_attack_day', $row.find('.time').datepicker({
				timestamp : current_time
			}));

			//Attack type radiobutton
			CM.register(cm_context_sel_row, 'rb_attack_type', $row.find('.rb_attack_type').radiobutton({
				value : attack_type, template : 'tpl_radiobutton_nocaption', options : attack_type_options
			}));

			//Small ship icon
			$row.find('.ships_small').off('click').on('click.insert_small_ships', function(e) {
				var $el = $(e.currentTarget),
					$textbox = CM.get(cm_context_sel_row, 'textbox_unit_small_transporter'),
					value = parseInt($el.html(), 10);

				//There are no ships in the city
				if (!$textbox) {
					return;
				}

				$textbox.setValue(value === $textbox.getValue() ? '' : value);
			});

			//Big ship icon
			$row.find('.ships_big').off('click').on('click.insert_big_ships', function(e) {
				var $el = $(e.currentTarget),
					$textbox = CM.get(cm_context_sel_row, 'textbox_unit_big_transporter'),
					value = parseInt($el.html(), 10);

				//There are no ships in the city
				if (!$textbox) {
					return;
				}

				$textbox.setValue(value === $textbox.getValue() ? '' : value);
			});

			//Sort by dropdown
			var dd_select_plan = CM.register(cm_context_sel_row, 'dd_select_plan', root.find('#dd_select_plan').dropdown({
				initial_message : l10n.select_plan_init_msg,
				value : model.getPlanId(origin_town_id),
				options : model.getConvertedPlansList()
			}).on('dd:change:value', function(e, new_val, old_val) {
				CM.get(cm_context_sel_row, 'btn_add_plan')[parseInt(new_val, 10) > 0 ? 'enable' : 'disable']();
			}));

			//Open show add plan dialog window
			CM.register(cm_context_sel_row, 'btn_open_add_new_plan_window', $row.find('.btn_open_add_new_plan_window').button({}).on('btn:click', function() {
				_self.openCreatePlanWindow();
			}));

			//Add Plan Button
			CM.register(cm_context_sel_row, 'btn_add_plan', $row.find('.btn_add_plan').button({
				caption : edit_mode ? l10n.save_changes : l10n.add_attack, disabled : parseInt(model.getPlanId(origin_town_id), 10) === 0
			}).on('btn:click', function() {
				if (edit_mode) {
					//Save edited attack
					controller.sendAttackData(parseInt(dd_select_plan.getValue(), 10), target_id, attack_id, origin_town_id);
				}
				else {
					//Add new attack
					controller.sendAttackData(parseInt(dd_select_plan.getValue(), 10) , target_id);
				}
			}));

			$row.find('.clock').tooltip(l10n.arrival);

			//In edit mode we have to execute these functions manually, because container is opened with some values inside
			if (edit_mode) {
				view.updateValuesInDetailsContainer(origin_town_id);
			}

			$details_container.scrollTop($town_info.find('.hepler_row.selected').position().top);
		},

		updateValuesInDetailsContainer : function(origin_town_id) {
			//Recalculate attack runtime
			view.recalculateAttackDetails(origin_town_id);

			//Check if transport ships are selected, if yes, replace runtimes for ground units with number of units which will fit to these boats
			view.recalculateBootyForGroundUnits(origin_town_id);
		},

		recalculateAttackDetails : function(town_id) {
			var textboxes = CM.searchInSubGroupFor(cm_context_sel_row, 'textbox_unit_'),
				$selected_row = $units_info.find('.hepler_row.selected'),
				chosen_units = Object.keys(textboxes).reduce(
					function (units, key) {
						var type = textboxes[key].getCid().unit_id,
							amount = parseInt(textboxes[key].getValue(), 10);

						if (type !== undefined && amount) {
							units[type] = amount;
						}

						return units;
					},
					{}
				),
				unit_runtimes = Object.keys(chosen_units).reduce(
					function (runtimes, type) {
						runtimes[type] = model.getRunTimeForUnit(town_id, type);

						return runtimes;
					},
					{}
				),
				max_runtime = GameDataUnits.getSlowestRuntime(chosen_units, unit_runtimes),
				capacity = GameDataUnits.calculateCapacity(town_id, chosen_units),
				total_booty = GameDataUnits.getTotalBooty(chosen_units);

			//Update run time
			$selected_row.find('.traveltime').text(
				max_runtime > 0 ? '~' + DateHelper.readableSeconds(max_runtime) : '0:00:00'
			);

			//Update booty
			$selected_row.find('.resources .text').text(total_booty > 0 ? '~' + total_booty : 0);

			//Update needed ships
			$selected_row.find('.ships_small').text(capacity.fast_boats_needed);
			$selected_row.find('.ships_big').text(capacity.slow_boats_needed);
		},

		recalculateBootyForGroundUnits : function(town_id) {
			var $selected_row = $units_info.find('.hepler_row.selected'), $cells = $selected_row.find('.duration'), $cell;
			var gd_units = GameData.units, research_berth = ITowns.getTown(town_id).getResearches().hasResearch('berth') ? GameData.research_bonus.berth : 0,
				big_transporter_cap = gd_units.big_transporter.capacity, small_transporter_cap = gd_units.small_transporter.capacity;

			var $textbox_big_transporter = CM.get(cm_context_sel_row, 'textbox_unit_big_transporter'),
				$textbox_small_transporter = CM.get(cm_context_sel_row, 'textbox_unit_small_transporter'),
				total_capacity =
					($textbox_big_transporter ? ($textbox_big_transporter.getValue() || 0) * (big_transporter_cap + research_berth) : 0) +
					($textbox_small_transporter ? ($textbox_small_transporter.getValue() || 0) * (small_transporter_cap + research_berth) : 0);

			var set_sum = model.getSumSetOfUnitsInTowns(), town = model.getTown(town_id), units = town.units, i, l = set_sum.length,
				unit, unit_id, gd_unit, count, unit_count, total_ground_capacity = 0, $textbox, show_amount, ground_unit,
				town_on_the_same_island = town.same_island;

			//Calculate how many ground units are already specified in textboxes
			for (i = 0; i < l; i++) {
				unit_id = set_sum[i];

				$cell = $($cells[i]);
				$textbox = CM.get(cm_context_sel_row, 'textbox_unit_' + unit_id);

				if ($textbox) {
					gd_unit = gd_units[unit_id];
					count = parseInt($textbox.getValue(), 10) * gd_unit.population || 0;

					//Take only ground units
					if (!gd_unit.flying && !gd_unit.is_naval) {
						total_ground_capacity += count;
					}
				}
			}

			for (i = 0; i < l; i++) {
				unit_id = set_sum[i];
				$cell = $($cells[i]);
				$textbox = CM.get(cm_context_sel_row, 'textbox_unit_' + unit_id);

				gd_unit = gd_units[unit_id];
				unit = units[unit_id];

				ground_unit = !gd_unit.flying && !gd_unit.is_naval;
				show_amount = total_capacity > 0 && ground_unit;

				//Take only ground units
				if (show_amount) {
					unit_count = $textbox ? (parseInt($textbox.getValue(), 10) || 0) : 0;
				}

				$cell.html(show_amount ?
					Math.min(Math.min(unit.amount - unit_count, unit.amount), Math.floor((total_capacity - total_ground_capacity) / gd_unit.population)) :
					(!town_on_the_same_island && ground_unit ? '' : DateHelper.readableSeconds(unit.duration))
				);

				$cell[show_amount ? 'addClass' : 'removeClass']('show_amount');
			}
		},

		removeDetailsContainer : function($row) {
			var $el = $row.hasClass('click_detection') ? $row.parent().parent().parent().parent() : $row;

			$el.find('.plan_specification').html('');
		},

		resetHiddenColumns : function() {
			$content.find('.units_header td').show();
			this._updateTownListView();
		},

		hideColumn : function($cell) {
			$cell.hide().find('.unit_icon40x40').removeClass('selected');

			this._updateTownListView();
		},

		selectColumn : function($el) {
			this.unselectAllColumns();
			$el.addClass('selected');
		},

		unselectAllColumns : function() {
			$content.find('.unit_icon40x40').removeClass('selected');
		},

		_updateTownListView : function() {
			CM.get(cm_context, 'scroller_units_info').updateTemplateData('set_sum', model.getSumSetOfUnitsInTowns()).rerender({reinitialize_scrollbar : true});
			CM.get(cm_context, 'details_container_horizontal').update();
		},

		openCreatePlanWindow : function() {
			var txt_plan_name, txta_plan_descr, txt_plan_target, rbtn_search_by;

			CM.unregisterSubGroup(ctx_create_plan);
			txt_plan_name = CM.register(ctx_create_plan, 'txt_plan_name', $content.find('.txt_plan_name').textbox({

			}));

			txta_plan_descr = CM.register(ctx_create_plan, 'txta_plan_descr', $content.find('.txta_plan_descr').textarea({
				maxlength : 160, invalidmsg : l10n.too_long_description
			}));

			txt_plan_target = AttackPlannerHelper.registerSearchTextBox(ctx_create_plan, $content.find('.txt_plan_target'), l10n);
			rbtn_search_by = AttackPlannerHelper.registerRadioButtons(ctx_create_plan, $content.find('.rbtn_search_by'), l10n, txt_plan_target);

			CM.register(ctx_create_plan, 'btn_cancel_plan', $content.find('.btn_cancel_plan').button({
				caption : l10n.cancel
			}).on('btn:click', function() {
				view.closeCreatePlanWindow();
			}));

			CM.register(ctx_create_plan, 'btn_create_plan', $content.find('.btn_create_plan').button({
				caption : l10n.create_plan
			}).on('btn:click', function(e, _btn) {
				var target_id = txt_plan_target.getLastSelectedSuggestion()[0] || txt_plan_target.getValue();
				controller.createPlan(txt_plan_name.getValue(), target_id, txta_plan_descr.getValue());
			}));

			$curtain.show();
		},

		closeCreatePlanWindow : function() {
			CM.unregisterSubGroup(ctx_create_plan);

			$curtain.hide();
		},

		updateSelectedPlanName : function(plan_id) {
			CM.get(cm_context, 'btn_open_show_plan').setCaption(model.getPlanName(plan_id)).enable();
		},

		resetTextboxes : function() {
			var textboxes = CM.searchInSubGroupFor(cm_context_sel_row, 'textbox_unit_'), l = textboxes.length;

			while (l--) {
				textboxes[l].clear();
			}
		},

		destroy : function() {
			$content.off();
		}
	};

	/**
	 * Controller
	 */
	controller = {
		initialize : function(obj) {
			templates = obj.ret_data.templates;
			data = obj.ret_data.data;
			l10n = obj.ret_data.l10n;
			at_model = obj.at_model;
			at_model.setSelectedTargetId(data.target_id);

			at_controller = obj.at_controller;

			wnd = obj.wnd;
			root = wnd.getJQElement();

			wnd.setTitle(l10n.attack_planner);

			//Contexts
			cm_context = wnd.getContext();
			cm_context_units_top = {main : cm_context.main, sub : 'units_top'};
			cm_context_sel_row = {main : cm_context.main, sub : 'selected_row'};
			ctx_create_plan = {main : cm_context.main, sub : 'wnd_create_plan_2'};

			/*$.Observer(GameEvents.premium.adviser.expire).subscribe('attack_planner_show_attack_dialog', function(e, data) {
				//If curator expired, refresh window
				if (data.advisor_id === 'curator') {
					at_controller.openAddAttackPage(at_model.getSelectedTargetId());
				}
			});*/

			$.Observer(GameEvents.itowns.refetch.finish).subscribe(['attack_planner_show_attack_dialog'], function(e, data) {
				//Updte town groups
				CM.get(cm_context, 'dd_town_groups').setOptions(HelperTown.getTownGroupsForDropdown()).setValue(getSelectedTownGroupId(), {force : true});
			});

			if (model.isInEditMode()) {
				model.selectFirstTown();
			}

			view.initialize();
		},

		togglePlanSpecification : function(click_event, $row) {
			var town_id = parseInt($row.attr('data-townid'), 10),
				$target = $(click_event.target),
				tag_name = $target ? $target.prop('tagName') : '',
				value, unit_id, textbox, opening = false;

			//Opening details container
			if (!model.isTownSelected(town_id)) {
				//Select town
				model.selectTown(town_id);
				//Reset saved values which were in textboxes
				controller.resetTextboxValues();
				opening = true;

				CM.get(cm_context, 'scroller_town_info').rerender({reinitialize_scrollbar : true});
				CM.get(cm_context, 'scroller_units_info').rerender();
			}

			//If details container is already opened, then put numbers from TD elements to textbox components
			if (!opening && model.isTownSelected(town_id) && tag_name === 'TD') {
				unit_id = $target.attr('data-unitid');
				value = parseInt($target.html(), 10);

				if (unit_id) {
					textbox = CM.get(cm_context_sel_row, 'textbox_unit_' + unit_id);

					if (textbox) {
						textbox.setValue(parseInt(textbox.getValue(), 10) === value ? '' : value);
					}
				}
			}
		},

		filterTowns : function(filter, sort_by, order_by) {
			var show_units_on_the_way = CM.get(cm_context, 'btn_show_units_on_the_way').getState(),
				show_units_planned = CM.get(cm_context, 'btn_show_scheduled_units').getState(),
				filtered_towns,
				$scroller_town_info = CM.get(cm_context, 'scroller_town_info'),
				$scroller_units_info = CM.get(cm_context, 'scroller_units_info'),

			//Prepare object with key-value items which keeps information about minmal amount of units for each type
				$textboxes_min_amount = CM.searchInSubGroupFor(cm_context_units_top, 'units_top_'),
				i, l = $textboxes_min_amount.length, $textbox, units_min_amount = {}, value, unit_id;

			for (i = 0; i < l; i++) {
				$textbox = $textboxes_min_amount[i];
				value = parseInt($textbox.getValue(), 10);
				unit_id = $textbox.getCid();

				if (value) {
					units_min_amount[unit_id] = value;
				}
			}

			//Filter towns
			filtered_towns = model.getFilteredTowns(filter, sort_by, order_by, show_units_on_the_way, show_units_planned, units_min_amount, [at_model.getSelectedTargetId()]);

			$content.find('.details_container').toggleClass('no_units_in_all_towns', !filtered_towns.are_some_units_in_some_town);

			$scroller_town_info.setItems(filtered_towns.filtered, true);

			$scroller_units_info.updateTemplateData('show_units_on_the_way', show_units_on_the_way);
			$scroller_units_info.updateTemplateData('show_units_planned', show_units_planned);
			$scroller_units_info.setItems(filtered_towns.filtered, true);
		},

		resetHiddenColumns : function() {
			if (model.areColumnsHidden()) {
				model.resetHiddenColumns();
				view.resetHiddenColumns();

				CM.get(cm_context, 'btn_reset_hidden_units').disable();
			}
		},

		hideColumn : function(unit_id, $cell) {
			//When data was sorted by removed column
			if (model.getSortByMethod() === unit_id) {
				//Change order function with value from radiobutton
				model.setSortByMethod(CM.get(cm_context, 'rb_sort_by').getValue());
			}

			CM.get(cm_context, 'btn_reset_hidden_units').enable();
			model.addHiddenColumn(unit_id);
			view.hideColumn($cell);
		},

		selectColumn : function($el, unit_id) {
			if (model.getSortByMethod() === unit_id) {
				model.toggleOrderByMethod();
				CM.get(cm_context, 'btn_order_towns_by').toggleState();
			}
			else {
				model.setSortByMethod(unit_id);
			}

			//Data is no longer orderedby 'town_name' or 'runtime' so, set value in radiobutton to 'something' to unselect options
			CM.get(cm_context, 'rb_sort_by').setValue('', {silent : true});

			view.selectColumn($el);
			controller.filterTowns(CM.get(cm_context, 'txt_search_in_towns').getValue(), unit_id, model.getOrderByMethod());
		},

		resetFilters : function(sort_by, order_by) {
			model.setSortByMethod(sort_by);
			model.setOrderByMethod(order_by);

			view.unselectAllColumns();

			controller.filterTowns(CM.get(cm_context, 'txt_search_in_towns').getValue(), sort_by, order_by);
		},

		_calculateArrivalTimeStamp : function() {
			var $timepicker = CM.get(cm_context_sel_row, 'dp_attack_day');

			var day = $timepicker.getDay(),
				month = $timepicker.getMonth(),
				year = $timepicker.getYear(),
				time = $timepicker.getTime(),
				arrivalDate = newDateByTimezone(year, month - 1, day, time.hours, time.minutes, time.seconds, Timestamp.localeGMTOffset());

			return Math.floor(arrivalDate.getTime() * 0.001);
		},

		sendAttackData : function(plan_id, target_id, attack_id, origin_town_id) {
			//attack_id and origin_town_id are undefined when we are creating new attack
			var edit_mode = typeof attack_id !== 'undefined',
				attack_type = CM.get(cm_context_sel_row, 'rb_attack_type').getValue(),
				arrival_at = this._calculateArrivalTimeStamp(),
				units = this.getUnitsFromTextboxes(),
				ajax_object, action = edit_mode ? 'edit_origin_town' : 'add_origin_town';

			origin_town_id = origin_town_id || model.getSelectedTownId();

			if (us.isEmpty(units)) {
				return HumanMessage.error(l10n.please_select_some_units);
			}

			//Ajax object is almost the same for 'add' and 'edit' actions
			ajax_object = {
				plan_id: plan_id,
				target_id: target_id,
				origin_town: origin_town_id,
				type: attack_type,
				units: units,
				arrival_at: arrival_at
			};

			//When we want to save changed data
			if (edit_mode) {
				ajax_object.attack_id = attack_id;
			}

			gpAjax.ajaxPost('attack_planer', action, ajax_object, true, function (ret_data) {
				if (at_model.getLastAction() === 'attacks') {
					//Go back to attacks tab
					at_controller.openAttacksPage();
				}
				else {
					//If plan has been also change, change it on the top
					if (at_model.getCurrentPlanId() !== plan_id) {
						at_model.setCurrentPlanId(plan_id);

						view.updateSelectedPlanName(plan_id);
					}

					if (edit_mode) {
						//This method have to be called before model.setPlanData,
						//because I have to compare new state with previous one
						model.updatePlannedUnits(origin_town_id, units);

						//If everything went fine, change 'planned' units
						model.setPlanData(ret_data.data.plan_data);
					}
					else {
						view.resetTextboxes();
						model.substractUnits(origin_town_id, units);
					}

					//Update view
					CM.get(cm_context, 'scroller_units_info').rerender();
				}
			});

			return true;
		},

		createPlan : function(name, target_id, description) {
			var btn = CM.get(ctx_create_plan, 'btn_create_plan').disable();

			gpAjax.ajaxPost('attack_planer', 'create_plan', {
				name : name,
				description : description,
				target_id : target_id,
				simple_plan_list : 1
			}, true, {success : function(Layout, data) {
				//Update data in the model
				model.setPlanList(data.plan_list);

				view.closeCreatePlanWindow();

				//Fill dropdown with new list, and select last created plan on the list
				CM.get(cm_context_sel_row, 'dd_select_plan').setOptions(model.getConvertedPlansList()).setValue(data.new_plan_id);

				btn.enable();
			}, error : function(Layout, data) {
				btn.enable();
			}});
		},

		getUnitsFromTextboxes : function() {
			var units = {}, textbox, textboxes = CM.searchInSubGroupFor(cm_context_sel_row, 'textbox_unit_'),
				i, l = textboxes.length, value;

			for (i = 0; i < l; i++) {
				textbox = textboxes[i];
				value = parseInt(textbox.getValue(), 10);
				units[textbox.getCid().unit_id] = value;
			}

			return units;
		},

		saveTextboxValues : function() {
			model.setSavedTextboxValues(this.getUnitsFromTextboxes());
		},

		resetTextboxValues : function() {
			model.resetSavedTextboxValues();
		},

		switchTownForAttack : function(origin_town_id) {
			var $rb_attack_type = CM.get(cm_context_sel_row, 'rb_attack_type'),
				target_id = at_model.getSelectedTargetId(),
				attack_type = $rb_attack_type ? $rb_attack_type.getValue() : 'attack',
				target_town_name = model.getTargetName(),
				units = this.getUnitsFromTextboxes();

			at_controller.switchTownForAttack(attack_type, target_id, target_town_name, origin_town_id, units);
		},

		unselectTown : function(town_id) {
			if (model.isTownSelected(town_id)) {
				//I don't use town_id here, because we open only 1 town at once
				model.unselectTowns();

				view._updateTownListView();

				CM.get(cm_context, 'scroller_town_info').rerender({reinitialize_scrollbar : true});
				CM.get(cm_context, 'scroller_units_info').rerender();
			}
		},

		destroy : function() {
			templates = data = l10n = null;
			wnd = root = null;
			cm_context = cm_context_units_top = cm_context_sel_row = null;

			model.destroy();
			view.destroy();

			$.Observer().unsubscribe('attack_planner_show_attack_dialog');
		}
	};

	//Make it globally visible
	window.AttackPlanner.controllers.show_attack_dialog = controller;
}(jQuery));
