/*globals MM, DM, us, Game, GameControllers, MassRecruitTowns, MassRecruitFieldsStore, ITowns, NumberSorter,
StringSorter, Overviews, HumanMessage, gpAjax, GameDataUnits, ngettext, JSON, BuyForGoldWindowFactory,
ConstructionQueueStrategyFactory, GameDataInstantBuy, GameData, GeneralModifications, InfoWindowFactory */
(function() {
	'use strict';

	//@todo try to move it to player_gods model
	var godsFavor = function(player_gods) {
		return {
			getCurrentFavorForGod : function(unit_god_id, god_id) {
				if (unit_god_id === 'all') {
					// if the unit is for all gods, the favor is taken from current town
					unit_god_id = god_id;
				}

				//@todo
				return player_gods.getCurrentFavorForGod(unit_god_id);
			},

			hasGodInAnyTown : function(god_id) {
				var PlayerGodsModel = MM.getModels().PlayerGods[Game.player_id];

				return PlayerGodsModel.hasGod(god_id);
			}
		};
	};

	var btnFake = {
		enable : function() {},
		disable : function() {}
	};

	var MassRecruitController = GameControllers.TabController.extend({
		last_focused_textbox : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		renderPage : function() {
			//Needed for old window
			this.$el.addClass('mass_recruit_window');

			this.updateTranslations();

			this.GodsFavor = godsFavor(this.getModel('player_gods'));//@todo

			//Make objects of all towns
			this.objTowns = new MassRecruitTowns(this.options.preloaded_data.towns, this.GodsFavor);//@todo
			this.fieldsObject = new MassRecruitFieldsStore(this.objTowns); //@todo
			this.fieldsObject.init();

			this.view = new window.GameViews.MassRecruitEditView({
				controller : this,
				el : this.$el.find('.gpwindow_content')
			});

			this.registerEventListeners();

			return this;
		},

		registerEventListeners : function() {
			this.checkOrderQueuesForChanges();

			var town_agnostic_unit_orders = MM.getTownAgnosticCollectionsByName('UnitOrder')[0];

			town_agnostic_unit_orders.registerFragmentEventSubscriber(this);
			ITowns.onAnyOrderInAllTownsChange(this, function() {
				this.rerenderList();
			}.bind(this));
		},

		rerenderList : function() {
			var scroller_recruits = this.getComponent('scroller_recruits');

			if (scroller_recruits) {
				scroller_recruits.rerender();
			}

			this.checkOrderQueuesForChanges();
		},

		renderItems : function(items) {
			var scroller = this.getComponent('scroller_recruits');

			scroller.setItems(items);
		},

		/**
		 * Opens Barracks or Docks for specific town
		 *
		 * @param {Number} town_id   town id
		 * @param {String} type      'barracks' or 'docks'
		 */
		openBuildingWindow : function(town_id, type) {
			Overviews.openBuildingWnd(town_id, type);
		},

		makeTownGroupActive : function(town_group_id) {
			this.getCollection('town_groups').makeTownGroupActive(town_group_id);
		},

		getActiveTownGroupId : function() {
			return this.getCollection('town_groups').getActiveGroupId();
		},

		getTownGroupsForDropdown : function() {
			return this.getCollection('town_groups').getTownGroupsForDropdown();
		},

		getUnitTypes : function() {
			return this.options.preloaded_data.unit_types;
		},

		getMythologicalUnitTypes : function() {
			return this.options.preloaded_data.mythological_unit_types;
		},

		/**
		 * Returns towns object filtered, ordered and groupped depends on the
		 * specified parameters (always takes clean copy of the current 'towns' object)
		 *
		 * @param {Number} town_group_id       town group id
		 * @param {String} sort_by             'name', 'wood' etc (check dropdown will all options)
		 * @param {String} direction           ascending ('asc'), or descending ('desc')
		 * @param {String} filter              string which will be checked against the town name
		 * @param {Boolean} show_population    Determinates if towns with 0 population should be displayed or not
		 */
		getFilteredTowns : function(town_group_id, sort_by, direction, filter, show_population) {
			filter = filter || '';

			var number_attributes = ['getPoints', 'getWood','getStone', 'getIron', 'getAvailablePopulation', 'getStorageVolume'];
			var filtered = this.objTowns.getClonedTowns() || [],
				sorter = us.contains(number_attributes, sort_by ) ? new NumberSorter() : new StringSorter();

			//Remove towns with population = 0
			if (show_population) {
				filtered = filtered.filter(function(town) {
					return town.getAvailablePopulation() > 0;
				});
			}

			//Sort
			filtered = sorter.compareObjectsByFunction(filtered, function(obj) {
				return obj[sort_by]();
			});

			//name use inversed order
			if (sort_by === 'getName') {
				filtered.reverse();
			}

			//ASC DESC
			if (direction === 'desc') {
				filtered.reverse();
			}

			//Filter results
			filtered = filtered.filter(function(town) {
				return town.getName().toLowerCase().match(filter.toLowerCase());
			});

			return filtered;
		},

		updateTranslations : function() {
			var l10n = this.getl10n();
			var //Cost of the build time reduction
				cost = GameDataUnits.getUnitOrderBuildTimeReductionCost(),
			//Available gold
				gold = this.getModel('player_ledger').getGold();

			var l10n_premium = DM.getl10n('COMMON', 'premium').unit_build_time_reduction;

			$.extend(l10n, {
				finish_for_gold_dialog_text : {
					barracks : s(ngettext(l10n_premium.question_barracks, l10n_premium.question_barracks_plural, cost), cost),
					docks : s(ngettext(l10n_premium.question_docks, l10n_premium.question_docks_plural, cost), cost)
				},
				text_finish_for_gold_popup : {
					barracks : s(ngettext(l10n_premium.tooltip_barracks, l10n_premium.tooltip_barracks_plural, cost), cost),
					docks : s(ngettext(l10n_premium.tooltip_docks, l10n_premium.tooltip_docks_plural, cost), cost)
				},
				available_gold : s(ngettext(l10n_premium.available_gold, l10n_premium.available_gold_plural, gold), gold)
			});
		},

		/**
		 * Saves settings in cookie for currently selected town group
		 */
		saveSettings : function() {
			var town_group_id = this.getActiveTownGroupId(),
				settings = {
					textboxes : {},
					spinners : {}
				};

			//Search for textbox components
			this.searchInSubGroupFor(null, 'txt_main_', function(_comp) {
				//Get value
				var value = _comp.getValue(),
					details;

				if (value) {
					details = _comp.getCid();

					settings.textboxes[details.name] = value;
				}
			});

			//Search for textbox components
			this.searchInSubGroupFor(null, 'sp_recruit_', function(_comp) {
				//Get value
				var value = _comp.getValue(),
					details;

				if (value) {
					details = _comp.getCid();

					settings.spinners[details.name] = value;
				}
			});

			$.cookie('mass_recruit_gr' + town_group_id, btoa(JSON.stringify(settings)), {expires : 9999999});
		},

		/**
		 * Clears all textboxes depends on the row id
		 *
		 * @param {String} row_id   row id from Scroller component
		 */
		clearTextboxes : function(row_id) {
			//Get all registered components for this row
			var textboxes = this.getComponents(row_id), id, details, textbox, already_cleared = false;

			//Check if component is a textbox
			for (id in textboxes) {
				if (textboxes.hasOwnProperty(id) && id.match('txt_recruit')) {
					textbox = textboxes[id];

					//Set 0, these textboxes has set 'hidden_zero' setting set, so 0 will be replaced with empty string
					textbox.setValue(0);

					//Clear 'fields' object either (we can do it only once, because all that textboxes are from the same town)
					if (!already_cleared) {
						details = textbox.getCid();
						this.fieldsObject.resetRow(details.town_id);//@todo
						already_cleared = true;
					}
				}
			}
		},

		isTextboxFocused : function(town_id, unit_id) {
			return this.last_focused_textbox && this.last_focused_textbox.town_id === town_id && this.last_focused_textbox.unit_id === unit_id;
		},

		setLastFocusedTextbox : function(data) {
			this.last_focused_textbox = data;
		},

		/**
		 * Buys units for single row
		 *
		 * @param {Number} town_id   town id
		 */
		getUnitsAndBuy : function(town_id) {
			var data = this.fieldsObject.getRow(town_id),//@todo
				row = {};
			var l10n = this.getl10n();

			if (!us.isEmpty(data)) {
				//server needs {town_id : {unit_id : value}}
				row[town_id] = data;

				this.buyUnits(row);
			}
			else {
				HumanMessage.error(l10n.no_units_selected);
			}
		},

		/**
		 * Makes a request to the server to buy units
		 *
		 * @param {Object} data   data in format which can be handled by server
		 */
		buyUnits : function(data) {
			var l10n = this.getl10n();

			if (us.isEmpty(data)) {
				HumanMessage.error(l10n.no_units_selected);
				return false;
			}

			gpAjax.ajaxPost('town_overviews', 'recruit_units', {
				towns : data
			}, false, function (retdata) {
				var handled_towns = retdata.handled_towns;

				//Update towns with new data
				var town_id, h_town, town;

				for (town_id in handled_towns) {
					if (handled_towns.hasOwnProperty(town_id)) {
						town = this.objTowns.getTownById(town_id);
						h_town = handled_towns[town_id];

						town.updateUnits(h_town.units);
						town.updateWood(h_town.resources.wood);
						town.updateStone(h_town.resources.stone);
						town.updateIron(h_town.resources.iron);
						town.updatePopulation(h_town.population);

						//This order, first update ITowns
						// function call removed since there is no need for upating itowns
						// PLUS MassRecruitTown does not have such a function
						//town.updateItowns();
						//later calcualte properties
						town.calculateAdditionalProperties();

						this.fieldsObject.resetRow(town_id);//@todo
					}
				}

				//Town list will be updated because of the orderCount event
			}.bind(this));

			return true;
		},

		checkOrderQueuesForChanges : function() {
			var towns = this.getCollection('towns').getTowns(),
				new_ts = Infinity;

			//Loop trough all unit orders for all towns
			for (var i = 0, l = towns.length; i < l; i++) {
				var town_id = towns[i].getId(),
					itown = ITowns.getTown(town_id),
					unit_orders_collection = itown.getUnitOrdersCollection(),
					unit_orders = unit_orders_collection.getAllOrders();

				//Continue only if there are some orders
				if (unit_orders.length > 0) {
					var filtered_orders = [unit_orders_collection.getActiveGroundUnitOrder(), unit_orders_collection.getActiveNavalUnitOrder()];

					for (var j = 0; j < 2; j++) {
						var filtered_order = filtered_orders[j];

						if (filtered_order !== null) {
							var single_unit_build_time = filtered_order.getSingleUnitBuildTime();
							var time_for_order_left = filtered_order.getTimeLeft();

							new_ts = Math.min(new_ts, time_for_order_left % single_unit_build_time === 0 ? single_unit_build_time : time_for_order_left % single_unit_build_time);
						}
					}
				}
			}

			//Unregister previous timer
			this.unregisterTimer('mass_recruit_update_units_queue');

			//Set timer if
			if (new_ts < Infinity && new_ts > 0) {
				var timeout = new_ts * 1E3;

				//Check queue status again later
				this.registerTimerOnce('mass_recruit_update_units_queue', timeout, function() {
					this.rerenderList();
				}.bind(this));
			}
		},

		handleInstantBuyButton : function(e) {
			//Nothing should happend becaouse all action buttons are in the tooltip
			return;
		},

		handleReduceBuildTimeButton : function(e) {
			if (!GameDataUnits.isBuildTimeReductionEnabled()) {
				return;
			}

			var $el = $(e.currentTarget),
				details = $.parseJSON(atob($el.attr('details')));

			var building_type = details.building_type, order_id = details.order_id,
				town = this.objTowns.getTownById(details.town_id),
				order = town.getUnitOrderById(order_id),
				prev_order = town.getPreviousUnitOrderById(order_id, building_type);

			var data = {
				building_type : building_type,
				order_id : order_id,
				unit_id : order.unit_type,
				completed_at : order.to_be_completed_at,
				completed_at_prev : (prev_order ? prev_order.to_be_completed_at : 0)
			};

			BuyForGoldWindowFactory.openReductUnitBuildTimeForGoldWindow(btnFake, data, function(callbacks) {
				var controller = 'town_overviews',
					action = 'finish_for_gold';

				gpAjax.ajaxPost(controller, action, {order_id : order_id}, true, {
					success : function(objLayout, response) {
						//Rerendering is handled in collections listener
						callbacks.success(data);
					}.bind(this),

					error : function() {
						callbacks.error(data);
					}
				});
			}.bind(this));
		},

		getOrderById : function(order_id) {
			return MM.getModels().UnitOrder[order_id];//@todo
		},

		getUnitQueueStrategyInstance : function(building_type, town_id) {
			return ConstructionQueueStrategyFactory.getUnitQueueStrategyInstance(town_id, building_type, {
				player_ledger : this.getModel('player_ledger')
			}, {
				feature_blocks : this.getCollection('feature_blocks'),
				unit_orders : this.getCollection('unit_orders'),
				towns : this.getCollection('towns')
			});
		},

		loadDataToTooltip : function($content, $item) {
			var details = $.parseJSON(atob($item.attr('details'))),
				order_id = details.order_id,
				town_id = details.town_id,
				progressbar_order_index = 0, //We want to see progressbar
				premium_button_order_index = 1, //We want to always have button in the tooltips
				building_type = details.building_type;

			var order = this.getOrderById(order_id),
				strategy = this.getUnitQueueStrategyInstance(building_type, town_id);

			var callback = this.instantBuyCallback.bind(this, details.row_id);

			GameDataInstantBuy.loadInstantBuyTooltipContent(strategy, this, $content, order, progressbar_order_index, premium_button_order_index, callback);
		},

		//try to exclude all instant buy methods out of the mass recruit
		instantBuyCallback : function(row_id) {
			//Rerendering is handled in collections listener
		},

		/**
		 * Gets the town group ID which is currently selected
		 *
		 * @return {Number}    town group id (0 for all towns, when no group is active)
		 */
		getSelectedTownGroupId : function() {
			return this.getCollection('town_groups').getActiveGroupId();
		},

		/**
		 * Loads settings saved in cookies for currently selected town group
		 */
		loadSettings : function() {
			var cookie = $.cookie('mass_recruit_gr' + this.getSelectedTownGroupId());

			if (!cookie) {
				return;
			}

			var settings = $.parseJSON(atob(cookie)),
				name,
				textboxes, spinners;

			textboxes = settings.textboxes;
			spinners = settings.spinners;

			//Set values to proper textboxes
			for (name in textboxes) {
				if (textboxes.hasOwnProperty(name)) {
					this.getComponent('txt_main_' + name).setValue(textboxes[name]);
				}
			}

			//Set values to proper spinners
			for (name in spinners) {
				if (spinners.hasOwnProperty(name)) {
					this.getComponent('sp_recruit_' + name).setValue(spinners[name]);
				}
			}
		},

		insertTroops : function() {
			var GD_u = GameData.units;

			this.fieldsObject.resetTowns();

			var textboxes = [], scroller = this.getComponent('scroller_recruits'),
				spinners = {
					wood : this.getComponent('sp_recruit_wood'),
					stone : this.getComponent('sp_recruit_stone'),
					iron : this.getComponent('sp_recruit_iron'),
					population : this.getComponent('sp_recruit_population')
				};

			//Search for textbox components
			this.searchInSubGroupFor(this.getSubContext(), 'txt_main_', function(_comp) {
				//Save only textboxes which have some value inside
				if (_comp.getValue()) {
					textboxes.push(_comp);
				}
			});

			//sort textboxes by unit type which one of prices (wood, iron, stone) is the highest, ASC
			//(should be DESC, but at the end we have to use array.splice())
			textboxes.sort(function(a, b) {
				var details1 = a.getCid(), details2 = b.getCid(),
					unit1 = GD_u[details1.name], unit2 = GD_u[details2.name],
					max_price1 = Math.max(unit1.resources.wood, unit1.resources.iron, unit1.resources.stone),
					max_price2 = Math.max(unit1.resources.wood, unit2.resources.iron, unit2.resources.stone);

				return max_price1 > max_price2;
			});

			var i, j, towns = this.objTowns.getClonedTowns(), l = towns.length, l2 = textboxes.length,
				town, town_id, order, unit, res, gd_unit, details, value, unit_id, unit_research_factor;
			var pop_order, units_in_town, temp_towns = {}, units_in_queue;

			var gods_favor = this.getModel('player_gods').getCurrentProductionOverview();

			//Prepare data for later calculations
			for (i = 0; i < l; i++) {
				town = towns[i];
				town_id = town.getId();

				//We already checked which towns has a possibility to buy something @see fieldsObject.init(),
				//so it means: if town is in 'fields' object, then user can buy some unit in this town
				if (this.fieldsObject.getRow(town_id)) {
					//Town resources
					res = $.extend({}, town.getResources());

					//Substract values which are in spinners, because user want to save this resources
					res = {
						wood : Math.max(res.wood - spinners.wood.getValue(), 0),
						stone : Math.max(res.stone - spinners.stone.getValue(), 0),
						iron : Math.max(res.iron - spinners.iron.getValue(), 0),
						population : Math.max(res.population - spinners.population.getValue(), 0)
					};

					temp_towns[town_id] = {
						info : {
							resources : res,
							favor : gods_favor,
							id : town.getId(),
							god_id: town.getGod()
						},

						units : []
					};

					for (j = 0; j < l2; j++) {
						order = textboxes[j];
						details = order.getCid();
						unit_id = details.name;
						unit = town.getUnitById(unit_id);
						unit_research_factor = unit.getResearchFactor();

						//User can build something
						if (!unit.hasNoDependencies()) {
							continue;
						}

						gd_unit = GD_u[unit_id];
						units_in_town = unit.getAmount('total');
						units_in_queue = town.getNumberOfUnitsFromOrderQueues(unit_id);//Units which are already in the building process
						value = order.getValue();

						//Change value to number (sometimes can be 'MAX')
						value = parseInt(
							value === 'MAX' ?
								(town.getAvailablePopulation() / gd_unit.population) :
								Math.max(value - units_in_town - units_in_queue, 0),
							10);

						pop_order = gd_unit.population * Math.max(value , 0);

						temp_towns[town_id].units.push({
							unit_id : unit_id,
							value : value,
							need_buy : value,
							pop_order : pop_order,
							god_id : gd_unit.god_id,
							cost_wood : Math.ceil(gd_unit.resources.wood * unit_research_factor),
							cost_stone : Math.ceil(gd_unit.resources.stone * unit_research_factor),
							cost_iron : Math.ceil(gd_unit.resources.iron * unit_research_factor),
							cost_population : gd_unit.population,
							cost_favor : gd_unit.favor
						});
					}
				}
			}

			function getTotalPopulationOrder(units) {
				var i, l = units.length, total = 0;

				for (i = 0; i < l; i++) {
					total += units[i].pop_order;
				}

				return total;
			}

			//calculate how many units we can build, and update textboxes
			var units, k, pop_proportion, fav, temp_town, can_buy, temp_values,
				res_types = ['wood', 'stone', 'iron', 'population', 'favor'], res_type, r, rl = res_types.length,
				total_pop, unit_god_id;

			for (town_id in temp_towns) {
				if (temp_towns.hasOwnProperty(town_id)) {
					//Stores informations about town
					temp_town = temp_towns[town_id];
					//Number of resources and population in town
					res = temp_town.info.resources;
					fav = temp_town.info.favor;
					//Units which are in town
					units = temp_town.units;
					//Number of types of units in town
					k = units.length;

					while (k--) {
						//Reset
						temp_values = [];
						//Single unit
						unit = units[k];
						//Total population order
						total_pop = getTotalPopulationOrder(units);
						//proportion ordered units of one type to all ordered units
						pop_proportion = total_pop === 0 ? 0 : unit.pop_order / getTotalPopulationOrder(units);

						//we can not buy any unit of this type (example, user selected 5 Hoplits, but have 7 in the town)
						if (pop_proportion > 0) {
							//Check each type of resource (skip resources which are not needed for unit)
							for (r = 0; r < rl; r++) {
								res_type = res_types[r];

								//If resource is not needed for this unit
								if (unit['cost_' + res_type] > 0) {
									unit_god_id = unit.god_id;

									if (unit_god_id === 'all') {
										unit_god_id = temp_town.info.god_id;
									}

									var res_val = parseInt(res_type === 'favor'	? fav[unit_god_id].current : res[res_type], 10);
									temp_values.push(Math.floor(res_val * pop_proportion / unit['cost_' + res_type]));
								}
							}

							//The number of units we can realy buy
							can_buy = Math.min.apply(null, temp_values);

							//Sometimes you can buy more than user specified in the field
							can_buy = Math.min(can_buy, unit.need_buy);

							if (can_buy > 0) {
								res.wood = res.wood - can_buy * unit.cost_wood;
								res.stone = res.stone - can_buy * unit.cost_stone;
								res.iron = res.iron - can_buy * unit.cost_iron;
								res.population = res.population - can_buy * unit.cost_population;

								if (unit.god_id) {
									unit_god_id = unit.god_id;

									if (unit_god_id === 'all') {
										unit_god_id = temp_town.info.god_id;
									}

									fav[unit_god_id].current = fav[unit_god_id].current - can_buy * unit.cost_favor;
								}

								this.fieldsObject.setUnitCount(temp_town.info.id, unit.unit_id, can_buy);
							}
						}

						units.splice(k, 1);
					}
				}
			}

			//Rerender items to show values
			scroller.rerender();
		},

		/**
		 * Buys units for all towns on the list
		 */
		buyUnitsInAllTowns : function(){
			var data = this.fieldsObject.getAllRows(), town_id;

			for (town_id in data) {
				if (data.hasOwnProperty(town_id) && us.isEmpty(data[town_id])) {
					delete data[town_id];
				}
			}

			this.buyUnits(data);
		},

		onSelectTownGroupValueChange : function(e, new_val) {
			this.makeTownGroupActive(new_val);
		},

		onSelectSortByValueChange : function(e, new_val) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), new_val, this.getSortingDirection(), this.getFilterText(), this.isPopulationFilteredOut());

			this.renderItems(items);
		},

		onButtonSortingDirectionClickEven : function(e, new_val) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), this.getSortedBy(), 'desc', this.getFilterText(), this.isPopulationFilteredOut());

			this.renderItems(items);
		},

		onButtonSortingDirectionClickOdd : function(e, new_val) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), this.getSortedBy(), 'asc', this.getFilterText(), this.isPopulationFilteredOut());

			this.renderItems(items);
		},

		onTextobxFilterChangeValue : function(e, new_val) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), this.getSortedBy(), this.getSortingDirection(), new_val, this.isPopulationFilteredOut());

			this.renderItems(items);
		},

		onTextobxFilterCleared : function(e, new_val) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), this.getSortedBy(), this.getSortingDirection(), '', this.isPopulationFilteredOut());

			this.renderItems(items);
		},

		onButtonHelpClick : function() {
			InfoWindowFactory.openMassRecruitHelpInfoWindow();
		},

		onShowTroopsRadiobuttonValueChange : function(e, new_val) {
			this.getComponent('scroller_recruits').updateTemplateData('filter', new_val).rerender();
		},

		onButtonFilterPopulationOutButtonClick : function(e, _btn) {
			var items = this.getFilteredTowns(this.getActiveTownGroupId(), this.getSortedBy(), this.getSortingDirection(), this.getFilterText(), _btn.getState());

			this.renderItems(items);
		},

		onClearTextboxesButtonClick : function() {
			//Search for textbox components
			this.searchInSubGroupFor(null, 'txt_main_', function(_comp) {
				//Reset value
				_comp.setValue('');
			});
		},

		onSwitchUnitsButtonClickOdd : function() {
			this.onSwitchUnitsButtonClick(1);
		},

		onSwitchUnitsButtonClickEven : function() {
			this.onSwitchUnitsButtonClick(0);
		},

		onSwitchUnitsButtonClick : function(tab_number) {
			var units_tab = this.getComponent('tab_general_unit_types');

			//set units tab to 0
			units_tab.setActiveTab(tab_number);

			//do the same also for tabs in all rows
			var tabs = this.getElementsFromSubGroups('tab_recruit_unit_types');

			for (var i = 0, l = tabs.length; i < l; i++) {
				tabs[i].setActiveTab(tab_number);
			}

			var scroller = this.getComponent('scroller_recruits');
			scroller.rerender();
		},

		onButtonRecruitClick : function() {
			var cbx_settings = this.getComponent('cbx_save_settings');

			if (cbx_settings.isChecked()) {
				this.saveSettings();
			}

			this.buyUnitsInAllTowns();
		},

		onInsertTroopsButtonClickEven : function() {
			var cbx_settings = this.getComponent('cbx_save_settings');

			//Recruit troops
			if (cbx_settings.isChecked()) {
				this.saveSettings();
			}

			//Insert troops
			this.insertTroops();

			//Buy units in all towns
			this.buyUnitsInAllTowns();
		},

		onInsertTroopsButtonClickOdd : function() {
			//Insert tropps
			this.insertTroops();
		},

		getSortedBy : function() {
			return this.getComponent('dd_recruit_sort_by').getValue();
		},

		getSortingDirection : function() {
			return this.getComponent('btn_recruit_direction').getDirectionState();
		},

		getFilterText : function() {
			return this.getComponent('txt_recruit_filter').getValue();
		},

		isPopulationFilteredOut : function() {
			return this.getComponent('btn_population').getState();
		},

		destroy : function() {
			var town_agnostic_unit_orders = MM.getTownAgnosticCollectionsByName('UnitOrder')[0];
			town_agnostic_unit_orders.unregisterFragmentEventSubscriber(this);
		}
	});

	window.GameControllers.MassRecruitController = MassRecruitController;
}());
