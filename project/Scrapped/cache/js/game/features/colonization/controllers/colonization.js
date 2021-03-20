/* global us */
define('features/colonization/controllers/colonization', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var View = require('features/colonization/views/index');
    var GameDataUnits = require('data/units');
    var GameDataColonization = require('feature/colonization/data/colonization');
    var GameDataBuildings = require('helpers/buildings');
    var UnitPickerController = require('features/unit_picker/controllers/unit_picker');
    var GameEvents = require('data/events');
    var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);

            var args = this.getWindowModel().getArguments();
            this.spot_info = args.spot_info;
        },

        registerEventListeners: function () {
            this.stopObservingEvent(GameEvents.town.town_switch);
            this.observeEvent(GameEvents.town.town_switch, function() {
                this.getModel('colonization').forceUpdate(this.spot_info, function() {
                    this.renderPage();
                }.bind(this));
            }.bind(this));

            this.getUnitsCollection().onUnitsColonizeShipChange(this, this.renderPage.bind(this));
        },

        renderPage: function () {
            this.unregisterController('unit_picker');
            this.registerController('unit_picker', new UnitPickerController({
                parent_controller: this,
                collections: {
                    units: this.getCollection('units')
                },
                settings: {
                    el_selector: '.units_container_col .content',
                    show_capacity_bar: true,
                    show_zero_amount_units: true,
                    show_laurels: true,
                    show_expand_button: false,
                    show_simulator_button: false,
                    show_runtime_simulator: false,
                    show_max_booty: false,
                    show_needed_transport: true,
                    show_hero: false,
                    show_land_units: true,
                    show_naval_units: true,
                    show_runtimes: true,
                    runtimes: this.getRuntimesObjectForColonization.bind(this),
                    action_button_getter: this.getFoundTownButton.bind(this),
                    freeze_units: {
                        colonize_ship: 1
                    },
                    line_break_before: 'big_transporter',
                    // window_model is used to save input values over a re-render loop
                    window_model: this.window_model
                }
            }));

            this.initializeView();

            this.getController('unit_picker').renderPage();
        },

        initializeView: function () {
            var info =  this.getIslandInfo().island_id + ' (' +
                        this.spot_info.target_number_on_island + ')';

            this.setWindowTitle(this.getl10n().window_title + ' ' + info);

            this.view = new View({
                controller: this,
                el: this.$el
            });
            this.registerEventListeners();
        },

        getFoundTownButton: function () {
            return this.view.getFoundTownButton();
        },

        getUnitsCollection: function () {
            return this.getCollection('units');
        },

        getColonizationTownBasePoints: function () {
            return GameDataColonization.getColonizationTownBasePoints();
        },

        getColonizationTooltipInfos: function () {
            var regular_town_buildings = GameDataBuildings.getRegularBuildings();
            var levels = GameDataColonization.getTownFoundationBuildingLevels();

            var sort_order = [
                'main', 'ironer', 'storage', 'barracks', 'farm', 'temple', 'lumber', 'market', 'stoner', 'place'
            ];

            return {
                buildings: regular_town_buildings,
                levels: levels,
                sort_order: sort_order
            };
        },

        /**
         * this screen has only one fixed runtime for all units: the time of the colo-ship,
         * which is in the model as 'duration'
         *
         * @returns {{}}
         */
        getRuntimesObjectForColonization: function () {
            var runtimes = { ground_units: {}, naval_units: {}},
                fixed_duration = this.getModel('colonization').getDuration();

            GameDataUnits.allUnitIds().forEach(function (unit_id) {
                if (GameDataUnits.getUnit(unit_id).is_naval) {
                    runtimes.naval_units[unit_id] = fixed_duration;
                } else {
                    runtimes.ground_units[unit_id] = fixed_duration;
                }
            }.bind(this));

            return runtimes;
        },

        getIslandInfo: function () {
            return this.getModel('colonization').getIslandInfo();
        },

        getTargetInfo: function () {
            return this.getModel('colonization').getTargetInfo();
        },

        getColonizationDuration: function () {
            return this.getModel('colonization').getColonizationDuration();
        },

        getFoundationRequirements: function () {
            var units = this.getCollection('units').getUnitsInTown().getUnits();
            return {
                needed_culture_points: this.getModel('colonization').getNeededCulturePoints(),
                colonize_ship: units.colonize_ship || 0
            };
        },

        isFoundationRequirementFullfilled: function () {
            var req = this.getFoundationRequirements();

            return req.needed_culture_points === 0 && req.colonize_ship > 0;
        },

        sendColonizer: function (units) {
            var params = us.extend(this.spot_info, units);

            this.getModel('colonization').sendColonizer(params);
        },

        onFoundTownButton: function () {
            var unit_picker = this.getController('unit_picker'),
                selected_units = unit_picker.getSelectedUnits();

            ConfirmationWindowFactory.openConfirmationFoundNewCityWindow(function () {
                this.sendColonizer(selected_units);
                this.closeWindow();
            }.bind(this));
        }
    });
});
