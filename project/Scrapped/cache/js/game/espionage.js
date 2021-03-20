/*global $, GameEvents, CM, HideWindowFactory, Backbone, MM, TM, gpAjax, Timestamp, readableUnixTimestamp */

/**
 * This window is opened when you click on the opponent's town and choose "Spy"
 */

(function() {
	'use strict';

	function Espionage(target_id, wnd, data) {
		var hide_storage = parseInt(data.stored_iron, 10),
			root = wnd.getJQElement(),
			context = wnd.getContext();

		var min_silver_amount_to_spy = 1000;

		/**
		 * @param {Number} payed_iron
		 * @returns {Number}
		 */
		function calculateEspionageBonusValue(payed_iron) {
			return parseInt(payed_iron * 0.2, 10);
		}

		function initSlider() {
			var $building_hide_slider = root.find('.espionage_order_box #building_hide_slider'),
				$hide_order_min = root.find('.espionage_order_box #hide_order_min'),
				$hide_order_max = root.find('.espionage_order_box #hide_order_max'),
				$hide_order_input = root.find('.espionage_order_box #hide_order_input'),
				$espionage_bonus_text = root.find('.research_espionage_bonus_text').find('span'),
				not_enough_iron = hide_storage < min_silver_amount_to_spy || hide_storage === 0,
				order_input,
				slider,
				label_espionage_bonus,
				espionage_bonus_text_callback = function(value) {
					label_espionage_bonus.setCaption(calculateEspionageBonusValue(value));
				};

			CM.register(context, 'hide_order_min_' + target_id, $hide_order_min.button({
				caption: '' + min_silver_amount_to_spy,
				disabled: not_enough_iron
			}).on('btn:click', function() {
				order_input.setValue(min_silver_amount_to_spy);
				slider.setValue(min_silver_amount_to_spy);
			}));

			CM.register(context, 'hide_order_max_' + target_id, $hide_order_max.button({
				caption: '' + hide_storage,
				disabled: not_enough_iron
			}).on('btn:click', function() {
				order_input.setValue(hide_storage);
				slider.setValue(hide_storage);
			}));

			label_espionage_bonus = CM.register(context, 'research_espionage_bonus_text_' + target_id, $espionage_bonus_text.label({
				caption : calculateEspionageBonusValue(min_silver_amount_to_spy),
				template : 'empty'
			}));

			order_input = CM.register(context, 'hide_order_input_' + target_id, $hide_order_input.textbox({
				disabled: not_enough_iron,
				value : min_silver_amount_to_spy,
				type : 'number',
				min : min_silver_amount_to_spy,
				max : hide_storage
			}).on('txt:change:value txt:key:up txt:blur', function(e, new_val) {
				slider.setValue(new_val, {silent: true});
				espionage_bonus_text_callback(new_val);
			}));

			slider = CM.register(context, 'building_hide_slider_' + target_id, $building_hide_slider.grepoSlider({
				max: hide_storage,
				min: min_silver_amount_to_spy,
				step : 100,
				button_step: 1,
				value : min_silver_amount_to_spy,
				snap: true,
				disabled: not_enough_iron
			}).on('sl:change:value', (function (e, _sl, new_val) {
				order_input.setValue(new_val, {silent: true});
				espionage_bonus_text_callback(new_val);
			}).bind(this))); //jshint ignore:line

			return slider;
		}

		function deinitSlider() {
			var context = wnd.getContext();
			CM.unregisterSubGroup(context);
		}

		function deinitializeNotEnoughSilver() {
			root.find('a.espionage_goto_hide').unbind('click');
		}

		function deinitializeEspionageScreen() {
			deinitSlider();
			TM.unregister('spy_arrival_timer');
			root.find('a.espionage_goto_hide').unbind('click');
			root.find('div.espionage_spy_button').unbind('click');
		}

		function spy(btn, slider) {
			gpAjax.ajaxPost('town_info', 'spy', {id : target_id, espionage_iron : slider.getValue()}, true, {
				success: function(layout, data) {
					hide_storage = data.stored_iron;
					btn.removeClass('inactive');
				},
				error: function() {
					btn.removeClass('inactive');
				}
			});
		}

		function initializeArrivalTime()  {
			var $arrival_time = root.find('.arrival_at'),
				runtime = parseInt(root.find('.runtime_time').data('runtime'), 10),
				updateArrivalTime = function() {
					$arrival_time.text('~' + readableUnixTimestamp(Timestamp.now() + runtime));
				};

			TM.unregister('spy_arrival_timer');
			TM.register('spy_arrival_timer', 1000, updateArrivalTime);
		}

		function initializeNotEnoughSilver() {
			root.find('a.espionage_goto_hide').bind('click', function() {
				HideWindowFactory.openHideWindow();
			});
		}

		function initializeEspionageScreen() {
			var slider = initSlider();

			root.find('a.espionage_goto_hide').bind('click', function() {
				HideWindowFactory.openHideWindow();
			});

			initializeArrivalTime();

			root.find('div.espionage_spy_button').bind('click', function() {
				var btn = $(this).find('.button');
				if (btn.hasClass('inactive')) {
					return false;
				}

				btn.addClass('inactive');
				spy(btn, slider);
			});
		}

		function notificationEventHandler(e, data) {
			var params = $.parseJSON(data.param_str);

			//params.storage_1k_border == 1
			$.Observer(GameEvents.town.hide.change).publish(params);
		}

		function updateValues(hide_storage) {
			if (hide_storage < min_silver_amount_to_spy) {
				//Refresh window
				wnd.reloadContent();
			}
			else {
				//Just update the amount on the screen
				root.find('span.espionage_stored_iron').html(hide_storage);
				root.find('a.espionage_order_max').html(hide_storage);

				var slider = CM.get(context, 'building_hide_slider_' + target_id),
					btn_max = CM.get(context, 'hide_order_max_' + target_id);

				//Content for not enough silver is in the window, need to change it
				if (!slider) {
					return wnd.reloadContent();
				}
				slider.setMax(hide_storage);
				btn_max.setCaption('' + hide_storage);
			}
		}

		var module = {
			destroy : function() {
				//Its not a problem when we will try to deinitialize both, even if only one exist
				deinitializeNotEnoughSilver();
				deinitializeEspionageScreen();

				$.Observer().unsubscribe(['espionage_js']);
				this.stopListening();
			}
		};

		us.extend(module, Backbone.Events);

		//Initialize
		(function() {
			//Load content
			wnd.setContent(data.html);

			//bind events
			$.Observer(GameEvents.notification.system.arrive).subscribe(['dataChangedHide', 'espionage_js'], notificationEventHandler);
			$.Observer(GameEvents.town.hide.change).subscribe(['espionage_js'], function(e, data) {
				hide_storage = data.espionage_storage;
				updateValues(hide_storage);
			});
			var town_model = MM.getCollections().Town[0].getCurrentTown();
			town_model.onEspionageStorageChange(module, function() {
				var hide_storage = town_model.getEspionageStorage();
				updateValues(hide_storage);
			});

			//Initialize screen
			if (hide_storage < min_silver_amount_to_spy) {
				initializeNotEnoughSilver();
			}
			else {
				initializeEspionageScreen();
			}
		}());

		return module;
	}

	window.Espionage = Espionage;
}());
