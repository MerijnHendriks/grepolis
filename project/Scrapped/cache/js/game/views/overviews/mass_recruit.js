/* globals GameDataConstructionQueue, GameDataInstantBuy, HelperPower, GameEvents, BuyForGoldWindowFactory, TooltipFactory, GameData */

(function() {
	'use strict';

	var View = window.GameViews.BaseView;

	var MassRecruitEditView = View.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			View.prototype.initialize.apply(this, arguments);

            this.l10n = this.controller.getl10n();
			this.render();
		},

		render : function() {
			this.$el.addClass('mass_recruit_window');

			//Insert HTML content which is static
			this.$el.html(us.template(this.controller.getTemplate('main'), {
				unit_types : this.controller.getUnitTypes(),
				mythological_unit_types : this.controller.getMythologicalUnitTypes(),
				lang : this.l10n
			}));

			this.registerViewComponents();
		},

		registerViewComponents : function() {
			//Select town group dropdown
			var dd_town_groups = this.registerComponent('dd_recruit_select_town_group', this.$el.find('#dd_recruit_select_town_group').dropdown({
				initial_message : this.l10n.select_town_group,
				options : this.controller.getTownGroupsForDropdown(),
				value : this.controller.getActiveTownGroupId()
			}).on('dd:change:value', this.controller.onSelectTownGroupValueChange.bind(this.controller)));

			//Sort by dropdown
			var dd_sort_by = this.registerComponent('dd_recruit_sort_by', this.$el.find('#dd_recruit_sort_by').dropdown({
				initial_message : this.l10n.sort_by.descr,
				value : 'getName',
				options : [
					{value : 'getName', name : this.l10n.sort_by.name},
					{value : 'getPoints', name : this.l10n.sort_by.points},
					{value : 'getWood', name : this.l10n.sort_by.wood},
					{value : 'getStone', name : this.l10n.sort_by.stone},
					{value : 'getIron', name : this.l10n.sort_by.iron},
					{value : 'getAvailablePopulation', name : this.l10n.sort_by.population},
					{value : 'getStorageVolume', name : this.l10n.sort_by.storage}
				]
			}).on('dd:change:value', this.controller.onSelectSortByValueChange.bind(this.controller)));

			//Register 'direction ASC DESC' button
			var btn_direction = this.registerComponent('btn_recruit_direction', this.$el.find('#btn_recruit_direction').button({
				toggle : true, state : false
			}).on('btn:click:even', this.controller.onButtonSortingDirectionClickEven.bind(this.controller))
				.on('btn:click:odd', this.controller.onButtonSortingDirectionClickOdd.bind(this.controller)));

			//Filter towns textbox
			var txt_filter = this.registerComponent('txt_recruit_filter', this.$el.find('#txt_recruit_search').textbox({
				initial_message : this.l10n.search_by, clear_msg_button : true, live : true
			})).on('txt:change:value', this.controller.onTextobxFilterChangeValue.bind(this.controller)).on('txt:cleared', this.controller.onTextobxFilterCleared.bind(this.controller));

			//Help button
			this.registerComponent('btn_recruit_help', this.$el.find('#btn_recruit_help').button({
				caption : 'Help'
			}).on('btn:click', this.controller.onButtonHelpClick.bind(this.controller)));

			//Initialize radiobutton
			this.registerComponent('rbtn_show_troops', this.$el.find('#rbtn_show_troops').radiobutton({
				value : 'count', template : 'tpl_radiobutton_nocaption',
				options : [
					{value : 'count', tooltip : this.l10n.tt_own_troops_in_town},
					{value : 'all', tooltip : this.l10n.tt_own_troops_and_support_in_town},
					{value : 'total', tooltip : this.l10n.tt_own_troops_and_support_from_town}
				]
			}).on('rb:change:value', this.controller.onShowTroopsRadiobuttonValueChange.bind(this.controller)));

			//Button population
			var btn_population = this.registerComponent('btn_population', this.$el.find('#btn_population').button({
				toggle : true,
				tooltips : [
					{title : this.l10n.tt_toggle_population, styles : {width : 500}}
				]
			}).on('btn:click:even', this.controller.onButtonFilterPopulationOutButtonClick.bind(this.controller))
				.on('btn:click:odd', this.controller.onButtonFilterPopulationOutButtonClick.bind(this.controller)));

            var filtered_towns = this.controller.getFilteredTowns(dd_town_groups.getValue(), dd_sort_by.getValue(), btn_direction.getDirectionState(), txt_filter.getValue(), btn_population.getState());

			//Button clear general textboxes
			this.registerComponent('btn_general_clear_textboxes', this.$el.find('#btn_general_clear_textboxes').button({

			}).on('btn:click', this.controller.onClearTextboxesButtonClick.bind(this.controller)));

			//Units list tab (normal units page 1, mythological units page 2)
			this.registerComponent('tab_general_unit_types', this.$el.find('.tab_general_unit_types').tab({
				activepagenr : 0
			}));

			//Button which switch tabs
			this.registerComponent('btn_switch_units', this.$el.find('#btn_switch_units').button({
				toggle : true, tooltips : [
					{title : this.l10n.tt_show_mythical_units},
					{title : this.l10n.tt_show_land_and_water_units}
				]
			}).on('btn:click:odd', this.controller.onSwitchUnitsButtonClickOdd.bind(this.controller))
				.on('btn:click:even', this.controller.onSwitchUnitsButtonClickEven.bind(this.controller)));

			//Recruit button
			this.registerComponent('btn_recruit_units', this.$el.find('#btn_recruit_units').button({
				caption : this.l10n.recruit
			}).on('btn:click', this.controller.onButtonRecruitClick.bind(this.controller)));

			//Initialize save settings checkbox
			this.registerComponent('cbx_save_settings', this.$el.find('#cbx_save_settings').checkbox({
				caption : this.l10n.save_values, checked : true
			}));

			//Initialize components which are in section with resources
			this.registerComponent('sp_recruit_wood', this.$el.find('#sp_recruit_wood').spinner({
				cid : {name : 'wood'}
			}));

			this.registerComponent('sp_recruit_stone', this.$el.find('#sp_recruit_stone').spinner({
				cid : {name : 'stone'}
			}));

			this.registerComponent('sp_recruit_iron', this.$el.find('#sp_recruit_iron').spinner({
				cid : {name : 'iron'}
			}));

			this.registerComponent('sp_recruit_population', this.$el.find('#sp_recruit_population').spinner({
				cid : {name : 'population'}, step : 50
			}));

			//Insert tropps button
			var btn_insert_troops = this.registerComponent('btn_insert_troops', this.$el.find('#btn_insert_troops').button({
				caption : this.l10n.insert_troops_state_1
			}).on('btn:click:even', this.controller.onInsertTroopsButtonClickEven.bind(this.controller))
				.on('btn:click:odd', this.controller.onInsertTroopsButtonClickOdd.bind(this.controller)));

			//Initialize textboxes in top section
			this.$el.find('.tab_general_unit_types td').each(function(index, el) {
				var $el = $(el), $unit = $el.find('.unit_icon40x40'), $textbox = $el.find('.textbox'),
					name = el.getAttribute('name');

				//Initialize textbox
				this.registerComponent('txt_main_' + name, $textbox.textbox({
					cid : {name : name},
					type : 'custom',
					regexp : /(^$|^MAX$|^\d*$)/g,
					ios_keyboard : 'numbers'
				}));

				//Make image as a button
				this.registerComponent('btn_main_' + name, $unit.button({
					cid : {name : name},
					template : 'tpl_emptybutton'
				}).on('btn:click', function(e, _btn) {
					var textbox = this.getComponent('txt_main_' + _btn.getCid().name),
						value = textbox.getValue();

					textbox.setValue(value === 'MAX' ? '' : 'MAX');
				}.bind(this)));
			}.bind(this));

			//Add popups for units icons
			this.$el.find('#recruit_general_fields').find('td').each(function(index, el) {
				var $el = $(el), name = $el.attr('name');

				$el.setPopup(name + '_details');
			});

			//Scroller
			this.registerComponent('scroller_recruits', this.$el.find('#recruit_town_list').scroller({
				page : 1,
				per_page : 3,
				page_offset : 2,
				item_height: 104,
				items : filtered_towns,
				template : this.controller.getTemplate('list'),
				template_item_name : 'town',
				template_item_init : function(context, row_id, origin_town_id, is_selected, item) {
					this.initializeListItemComponents(context, row_id);
					this.initializeListQueueComponents(item);
				}.bind(this),
				template_item_deinit : this.deinitializeListItemComponents.bind(this),
				template_data : {
					mythological_unit_types : this.controller.getMythologicalUnitTypes(),
					filter : this.getComponent('rbtn_show_troops').getValue(),
					lang : this.l10n,
					unit_types : this.controller.getUnitTypes(),
					GodsFavor : this.controller.GodsFavor
				}
			}).on('scroller:change', function(e, _scroller, page, prev_page) {

			}));

			//There is no sense to use components to open Barracks and Harbors windows
			this.$el.off('.obw').on('click.obw', '.open_barracks_window span', function(e) {
				var $el = $(e.currentTarget),
					town_id = parseInt($el.attr('details'), 10);

				this.controller.openBuildingWindow(town_id, 'barracks');
			}.bind(this));

			this.$el.off('.ohw').on('click.ohw', '.open_harbor_window span', function(e) {
				var $el = $(e.currentTarget),
					town_id = parseInt($el.attr('details'), 10);

				this.controller.openBuildingWindow(town_id, 'docks');
			}.bind(this));

			//Initialize set max buttons
			this.$el.off('.set_max').on('click.set_max', '.btn_set_max', function(e) {
				var $el = $(e.currentTarget),
					details = $.parseJSON(atob($el.attr('details')));

				var textbox = this.getComponent('txt_recruit_' + details.town_id + '_' + details.unit_id, details.row_id),
					value = textbox.getValue();

				textbox.setValue(value === 0 ? details.unit_max : 0);
			}.bind(this));

			//Initialize premium buttons in the queue
			var GameDataFeatureFlags = require('data/features');
			var onPremiumFeatureButtonClick = (GameDataFeatureFlags.isInstantBuyEnabled() ? this.controller.handleInstantBuyButton : this.controller.handleReduceBuildTimeButton).bind(this.controller);
			this.$el.off('.premium-unit-feature').on('click.premium-unit-feature', '.js-time_reduction', onPremiumFeatureButtonClick);

			if (GameDataInstantBuy.isEnabled()) {
				this.initializeInstantBuyTooltip();
			}

			//Load saved settings
			this.controller.loadSettings();

			this.controller.observeEvent(GameEvents.document.key.shift.down, function() {
				btn_insert_troops.setState(true).setCaption(this.l10n.insert_troops_state_2);
			});

			this.controller.observeEvent(GameEvents.document.key.shift.up, function() {
				btn_insert_troops.setState(false).setCaption(this.l10n.insert_troops_state_1);
			});

			this.initializePowerTooltips();
		},

		initializePowerTooltips : function() {
			$('#recruit_overview').on('mouseover', '.container_casted_powers .power_icon12x12, .cell_cast_power .power_icon24x24', function(e) {
				var $el = $(e.currentTarget),
					el_data = $el.data(), casted_power, extendable, show_costs,
					power_configuration = el_data.powerConfiguration;

				casted_power = HelperPower.getCastedPower(el_data.powerId, el_data.townId) || {};
				extendable = casted_power.extended > 0;
				show_costs = el_data.showCosts === true;

				var tooltip = TooltipFactory.createPowerTooltip(el_data.powerId, {
					show_costs : show_costs,
					casted_power_end_at: casted_power.end_at,
					extendable : extendable
				}, power_configuration);

				$el.tooltip(tooltip, {width: 370}).showTooltip(e);
			});
		},

		initializeInstantBuyTooltip : function() {
			//Instant buy tooltip
			var instant_buy_tooltip = this.registerComponent(GameDataInstantBuy.TOOLTIP_COMPONENT_NAME, this.$el.instantBuyTooltip({
				selector : '.js-time_reduction',
				arrow_position : 'bottom-center'
			}));

			instant_buy_tooltip.on('ibt:load:data', function(e, _ibt, $content, $item) {
				this.controller.loadDataToTooltip($content, $item);
			}.bind(this)).on('ibt:destroy', function(/*e, _ibt*/) {
				this.unregisterComponents(GameDataInstantBuy.SUB_CONTEXT_NAME);
			}.bind(this));
		},

		/**
		 * Initializes components for single row on the list\
		 *
		 * @param {jQuery Object} context    jQuery object of the row
		 * @param {String} scope_row_index   unique row id
		 */
		initializeListItemComponents : function(context, scope_row_index) {
			var tab_main;

			//unregister components from specific group
			this.unregisterComponents(scope_row_index);

			tab_main = this.getComponent('tab_general_unit_types');

			//Units list tab - Units list (normal units page 0, mythological units page 1)
			this.registerComponent('tab_recruit_unit_types', context.find('.tab_recruit_unit_types').tab({
				activepagenr : tab_main.getActiveTabNr()
			}), scope_row_index);

			//Initialize all textboxes
			context.find('.table_recruit_units .textbox').each(function(index, el) {
				var $el = $(el),
					details = $.parseJSON(atob($el.attr('details'))),
					props = {cid : details, type : 'number', max : details.unit_max};

				var unit_id = details.unit_id, town_id = details.town_id;
				var fields_row = this.controller.fieldsObject.getRow(details.town_id);

				//If we have information in 'fields' object that user specified some values for this field, we should put it into textbox now
				if (fields_row && fields_row[unit_id]) {
					props.value = fields_row[unit_id];
				}

				//Focus some specific textbox
				if (this.controller.isTextboxFocused(town_id, unit_id)) {
					props.focus = true;
				}

				this.registerComponent('txt_recruit_' + town_id + '_' + unit_id, $el.textbox(props).on('txt:change:value', function(e, new_val, old_val, _btn) {
					var details = _btn.getCid();

					//Just update 'fields' object, list doesn't have to be rerendered, because value is already in the field
					this.controller.fieldsObject.setUnitCount(details.town_id, details.unit_id, new_val);
				}.bind(this)).on('txt:focus', function(e, _txt) {
					this.controller.setLastFocusedTextbox(_txt.getCid());
				}.bind(this)), scope_row_index);
			}.bind(this));

			//Initialize clear buttons
			context.find('.town_buttons .btn_clear_fields').each(function(index, el) {
				var $el = $(el),
					details = $.parseJSON(atob($el.attr('details')));

				this.registerComponent('btn_clear_fields_' + details.town_id, $el.button({
					cid : details,
					disabled : details.total_inactivity
				}).on('btn:click', function(e, _btn) {
					this.controller.clearTextboxes(_btn.getCid().row_id);
				}.bind(this)), scope_row_index);
			}.bind(this));

			//Initialize buy_units buttons
			context.find('.town_buttons .btn_buy_units').each(function(index, el) {
				var $el = $(el),
					details = $.parseJSON(atob($el.attr('details')));

				this.registerComponent('btn_btn_buy_units_' + details.town_id, $el.button({
					cid : details,
					disabled : details.total_inactivity
				}).on('btn:click', function(e, _btn) {
					var info = _btn.getCid();

					this.controller.getUnitsAndBuy(info.town_id);
				}.bind(this)), scope_row_index);
			}.bind(this));

			//Initialize unit number labels
			context.find('.lbl_unit_number').each(function(index, el) {
				var $el = $(el),
					details = $.parseJSON(atob($el.attr('details')));

				this.registerComponent('lbl_unit_number_' + details.town_id + '_' + details.unit_id, $el.label({
					cid : details,
					caption : details.unit_number,
					template : 'empty'
				}), scope_row_index);
			}.bind(this));

			var onCastSpellButtonClickCallback = function(row_id) {
				//Repaint row (its better to do this in this way, because someone can close window)
				var scroller = this.getComponent('scroller_recruits');

				if (scroller) {
					scroller.rerenderItem(row_id);
				}
			};
			var onCastSpellButtonClick = function(power_id, details, click_event, _btn) {
				var town_id = details.town_id,
					row_id = details.row_id,
					casted_power = HelperPower.getCastedPower(power_id, town_id);

				//If spell is already casted, don't try to cast it once again, but extend it by gold instead
				if (!casted_power) {
					HelperPower.cast(power_id, town_id, onCastSpellButtonClickCallback.bind(this, row_id));
				}
				else {
					BuyForGoldWindowFactory.openExtendPowerForGoldWindow(_btn, casted_power, onCastSpellButtonClickCallback.bind(this, row_id));
				}
			};

			//Initialize cast powers buttons
			us.each(['fertility_improvement', 'call_of_the_ocean'], function(power_id) {
				var $btn = context.find('.power_icon24x24.' + power_id),
					details = $.parseJSON(atob($btn.data('details'))),
					casted_power = HelperPower.getCastedPower(power_id, details.town_id),
					spell_god_id = power_id === 'call_of_the_ocean' ? 'poseidon' : 'hera',
					favor_for_god = this.controller.GodsFavor.getCurrentFavorForGod(spell_god_id),

					casted_but_not_extendable = casted_power && !casted_power.isExtendable(),
					not_enough_favor = favor_for_god < GameData.powers[power_id].favor,
					no_god_with_this_spell = !this.controller.GodsFavor.hasGodInAnyTown(spell_god_id),

					is_disabled = casted_but_not_extendable || not_enough_favor	|| no_god_with_this_spell;

				this.registerComponent('cast_spell_' + power_id, $btn.button({
					disabled : is_disabled
				}).on('btn:click', onCastSpellButtonClick.bind(this, power_id, details)), scope_row_index);
			}.bind(this));
		},

		initializeListQueueComponents: function(town) {
			var town_id = town.getId(),
				$table_row = this.$el.find('.recruit_units_row_' + town_id + ' .table_recruit_units .queue'),
				orders = {
					barracks: town.getUnitsOrders('barracks'),
					harbor: town.getUnitsOrders('docks')
				};

			for (var order_type in orders) {
				if (orders.hasOwnProperty(order_type)) {
					$table_row.append(us.template(this.controller.getTemplate('queue'), {
						orders_by_type: orders[order_type],
						order_type: order_type,
						town_id: town_id,
						queue_length: GameDataConstructionQueue.getUnitOrdersQueueLength(),
						lang : this.l10n
					}));
				}
			}
		},

		/**
		 * Deinitializes components for single row on the list\
		 *
		 * @param {String} scope_row_index   unique row id
		 */
		deinitializeListItemComponents : function($row, scope_row_index) {
			this.unregisterComponents(scope_row_index);
		},

		destroy : function() {
			this.$el.off('.obw');
			this.$el.off('.ohw');
			this.$el.off('.set_max');
			this.$el.off('.js-time_reduction');
		}
	});

	window.GameViews.MassRecruitEditView = MassRecruitEditView;
}());
