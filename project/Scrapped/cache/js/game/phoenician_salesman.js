/* global _, gpAjax, BuildingWindowFactory, Tracking, PhoenicianSalesmanWindowFactory, GameEvents, Slider, GameData, PhoenicianSalesmanWelcomeWindowFactory, Layout, WQM, TooltipFactory, ConfirmationWindowFactory */
(function() {
	'use strict';

	var PhoenicianSalesman = {
		data: null,
		sliders: [],
		resource_names: null,
		call_for_gold_dialog_text: null,
		hint_showed: false,

		initialize: function(json_data) {
			var root = $('#ph_offers');
			PhoenicianSalesman.data = json_data;
			PhoenicianSalesman.initializeMousePopups();

			root.find('a.confirm').click(this.trade);
			root.find('div.ph_order_info').each(function() {
				PhoenicianSalesman.initSlider.call($(this));
			});
		},

		initializeMousePopups: function() {
			$('#current_town_span_id').tooltip(_('City that the Phoenician merchant is currently visiting!'));
			$('#next_town_span_id').tooltip(_('City that the Phoenician merchant will visit next!'));

			// Attach unit popups
			$.each(PhoenicianSalesman.data.goods.units, function(idx, unit) {
				var container_id = '#ph_unit_order_info_' + idx;
				$(container_id + ' .ph_unit_order_unit_big_image, ' + container_id + ' .ph_unit_order_count .ph_unit_order_input').tooltip(
					TooltipFactory.getUnitCard(unit.name),
					{},
					false
				);
			});
		},

		startArrivesAtCountdown: function(until) {
			$('#eta_arrival_at').countdown(until, {}).bind('finish', function() {
				PhoenicianSalesman.reloadContent();
			});
		},

		startLeavesAtCountdown: function(until) {
			$('#eta_departure_at').countdown(until, {}).bind('finish', function() {
				PhoenicianSalesman.reloadContent();
			});
		},

		reloadContent: function() {
			var params = {'tab': PhoenicianSalesman.data.tab};
			gpAjax.ajaxGet('phoenician_salesman', 'load_content', params, true, function(data) {
				$('div.phoenician_salesman_background').parent().html($(data.html));
			});
		},

		action: function(action, opts) {
			gpAjax.ajaxPost('phoenician_salesman', action, opts, true, function(data) {
				$('div.phoenician_salesman_background').parent().html($(data.html));
			});
		},

		set_next_town: function(id) {
			PhoenicianSalesman.action('set_next_town', {'next_town_id': id});
		},

		doCallToTown: function() {
			gpAjax.ajaxPost('phoenician_salesman', 'immediate_call_for_gold', {}, true, function() {
				var b_wnd = BuildingWindowFactory.getWnd();
				if (b_wnd) {
					BuildingWindowFactory.refresh();
				}

				// open phoenician salesman window after calling him to town
				PhoenicianSalesmanWindowFactory.openPhoenicianSalesmanWindow();

				$.Observer(GameEvents.premium.merchant.immediate_call).publish();
			});
		},

		moveOn: function() {
			gpAjax.ajaxPost('phoenician_salesman', 'move_on', {}, true, function(data) {
				$('div.phoenician_salesman_background').parent().html($(data.html));

				var b_wnd = BuildingWindowFactory.getWnd();
				if (b_wnd) {
					BuildingWindowFactory.refresh();
				}

				$.Observer(GameEvents.premium.merchant.run_out).publish();
			});
		},

		trade: function() {
			var values = $(this).parent().find('input'),
				params = {},
				amount = parseInt(values[1].value, 10),
				res = values[0].name === 'resource',
				resources = {};

			if (!amount) {
				return;
			}

			params[values[0].name + '_name'] = values[0].value;
			params[values[0].name + '_amount'] = amount;

			resources[values[0].value] = amount;

			if (res) {
				ConfirmationWindowFactory.openConfirmationWastedResources(
					function() { PhoenicianSalesman.action('trade_' + values[0].name + 's', params); },
					null,
					resources
				);
			} else {
				PhoenicianSalesman.action('trade_' + values[0].name + 's', params);
			}
		},

		initSlider: function() {
			var slider_div = this.find('div.ph_unit_order_slider');
			var slider = new Slider({
				elementMin: this.find('.ph_unit_order_min'),
				elementMax: this.find('.ph_unit_order_max'),
				elementDown: this.find('a.ph_unit_order_down'),
				elementUp: this.find('a.ph_unit_order_up'),
				elementInput: this.find('form.ph_unit_order_count input.ph_unit_order_input'),
				elementSlider: slider_div
			});
			var inp = this.find('input.ph_unit_order_unit_hidden'),
				id = parseInt(inp.parents('div')[0].id.match(/\d+/)[0], 10),
				property = PhoenicianSalesman.data.goods[inp[0].name + 's'][id],
				text,
				res = inp[0].name === 'resource',
				that = this;

			slider_div.bind('change', res ? function() {
				PhoenicianSalesman.resourceShowCosts(that, id, slider.getValue());
			} : function() {
				PhoenicianSalesman.unitShowCosts(that, id, slider.getValue());
			});

			this.find('div.ph_offer_price input.ph_unit_order_input').bind('change', function() {
				var resource = PhoenicianSalesman.data.goods.resources[id];
				var value = Math.floor($(this).val() * (1 / resource.cost[PhoenicianSalesman.data.goods.exchange_resource]));
				slider.setValue(value);
				PhoenicianSalesman.resourceShowCosts(that, id, slider.getValue());
			});

			if (res) {
				text = GameData.resources[inp[0].value];
				this.find('.ph_unit_order_unit_iron').text(property.cost.iron);
			} else {
				text = GameData.units[property.name].name;
			}

			this.find('.ph_unit_order_unit_name').text(text);

			try {
				// not good solution, but this seemed to produce errors in IE,
				// in case dependencies are not fullfilled
				slider.setMax(property.amount);
				slider.setValue(property.amount);
			} catch (e) {}

			if (property.amount <= 0) {
				this.fadeTo('slow', 0.2);
			}
		},

		unitShowCosts: function(elm, id, count) {
			var unit = PhoenicianSalesman.data.goods.units[id];
			var value = unit.cost.iron * count;
			elm.find('span.ph_unit_order_all_iron').text(value);
			elm.find('a.confirm').toggleClass('disabled', value < 1);
		},

		resourceShowCosts: function(elm, id, count) {
			var resource = PhoenicianSalesman.data.goods.resources[id];
			var value = Math.ceil(count * resource.cost[PhoenicianSalesman.data.goods.exchange_resource]);
			var i;

			for (i in resource.cost) {
				if (resource.cost[i]) {
					break;
				}
			}
			elm.find('div.ph_offer_price input.ph_unit_order_input').val(value);
			elm.find('a.confirm').toggleClass('disabled', value < 1);
		},

		/**
		 * @deprecated
		 */
		showHint: function(headline) {
			if (!Layout.player_hint_settings.phoenician_salesman_hint || PhoenicianSalesman.hint_showed) {
				return;
			}

			PhoenicianSalesman.hint_showed = true;

			var windows = require('game/windows/ids');
			var priorities = require('game/windows/priorities');

			WQM.addQueuedWindow({
				type : windows.PHOENICIAN_SALESMAN_WELCOME,
				priority : priorities.getPriority(windows.PHOENICIAN_SALESMAN_WELCOME),
				open_function : function() {
					return PhoenicianSalesmanWelcomeWindowFactory.openWindow();
				}
			});
		}
	};

	window.PhoenicianSalesman = PhoenicianSalesman;
}());

