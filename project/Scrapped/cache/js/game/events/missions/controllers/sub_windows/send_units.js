define('events/missions/controllers/sub_windows/send_units', function() {
	'use strict';

	var SendUnitsController,
        SendUnitsView = require('events/missions/views/sub_windows/send_units'),
    	UnitPickerController = require('features/unit_picker/controllers/unit_picker'),
		GameControllers = require_legacy('GameControllers'),
		GameEvents = require('data/events'),
    	GameDataUnits = require('data/units');

	SendUnitsController = GameControllers.SubWindowController.extend({
		view: null,

		initialize: function(options) {
			this.mission = options.mission;
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.player_army_model = this.getModel('missions_player_army');
			this.player_army_units = this.player_army_model.getUnits();
			this.units_data_model = this.getModel('missions_unit_data');
			this.units_data = this.units_data_model.getUnits();
		},

		render: function($content_node) {
			var window_skin = this.options.window_skin;

            this.$el = $content_node;

            this.unregisterController('unit_picker');
			this.registerController('unit_picker', new UnitPickerController({
				parent_controller: this,
                data: {
                    units: this.getUnits()
                },
				settings: {
					el_selector: '.unit_picker_container',
					show_capacity_bar: false,
					show_zero_amount_units: true,
					unit_image_click_handler: this.unitImageClickHandler.bind(this),
					action_button_getter: this.getSendUnitsButton.bind(this),
					unit_tooltip_class: window_skin,
                    unit_icon_class: window_skin
				}
			}));

			this.initializeView();

			return this;
		},

		registerEventListener : function() {
			this.stopObservingEvent(GameEvents.unit_picker.town_switch_rerender);
			this.observeEvent(GameEvents.unit_picker.town_switch_rerender, function() {
				if (this.view && this.view.getComponent('pb_capacity')) {
					this.view.updateCapacityBar();
				}
			}.bind(this));
		},

		initializeView: function() {
			this.view = new SendUnitsView({
				controller : this,
				el : this.$el
			});

			this.registerEventListener();
		},

		renderUnitPicker: function () {
			this.getController('unit_picker').renderPage();
		},

		getSendUnitsButton: function() {
			this.view.getSendUnitsButton();
		},

		startMission: function() {
			var units = this.getController('unit_picker').getSelectedUnits();
			this.window_controller.startMission(this.mission.id, units);
		},

		getMissionsSkin: function() {
			return this.window_controller.getMissionsSkin();
		},

        getCapacityValue: function () {
			var selected_units = this.getController('unit_picker').getSelectedUnits(),
				unit_capacity = 0;

            for (var unit_type in selected_units) {
                if (selected_units.hasOwnProperty(unit_type)) {
                    unit_capacity += selected_units[unit_type] * this.getUnitPopulation(unit_type);
                }
			}

			return unit_capacity;
        },

		getMinCapacity: function() {
			return this.mission.getConfiguration().minimum_capacity;
		},
		
		getMaxCapacity: function () {
			return this.mission.getConfiguration().capacity;
        },

		getAvailableCapacity: function() {
			return this.getMaxCapacity() - this.getCapacityValue();
		},

		getAvailableUnitsFor: function(unit_type) {
			return this.getController('unit_picker').getAvailableUnitsFor(unit_type);
		},

		getUnits: function () {
			var result = {},
				unit_type;

			for (var unit in this.units_data) {
				if (this.units_data.hasOwnProperty(unit)) {
					unit_type = this.units_data[unit].type;

					result[unit_type] = {
                        amount: this.player_army_model.hasUnit(unit_type) ? this.player_army_units[unit_type].amount : 0,
						game_unit: this.units_data[unit].data.game_unit
                    };
				}
			}

			return result;
		},

        getUnitPopulation: function(unit_type) {
			var game_unit;

			for (var unit in this.units_data) {
				if (this.units_data[unit].type === unit_type) {
					game_unit = this.units_data[unit].data.game_unit;
				}
			}

            return GameDataUnits.getUnit(game_unit).population;
        },

		unitImageClickHandler: function(event) {
            var $el = $(event.currentTarget),
                unit_type = $el.data('unit_id'),
                $textbox = this.getComponent(unit_type, 'input_boxes'),
				available_capacity = this.getAvailableCapacity(),
				available_units = this.getAvailableUnitsFor(unit_type),
				max_units = Math.floor(available_capacity / this.getUnitPopulation(unit_type)),
				selected_units = $textbox.getValue();

            if (!$textbox.getValue() && available_capacity <= 0) {
                return;
            }

            if (available_units > max_units) {
				selected_units = max_units;
			}
			else {
            	selected_units = available_units;
			}

            if ($textbox.getValue()) {
				$textbox.setValue(0);
			}
			else {
				$textbox.setValue(selected_units);
			}
		},

		destroy: function() {
		}
	});

	return SendUnitsController;
});

