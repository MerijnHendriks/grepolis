/* globals GameData */

define('features/simulator/controllers/configuration', function() {
    'use strict';
    
    var GameControllers = require_legacy('GameControllers'),
        SimulatorConfigurationView = require('features/simulator/views/configuration'),
        Categories = require('features/simulator/enums/categories'),
        SubWindowHelper = require('helpers/sub_window'),
        MAX_LEVEL = 10;

    return GameControllers.BaseController.extend({
        view: null,

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);

            this.categories = Object.keys(options.categories);
            this.categories_mapping = options.categories;
            this.power_configurations = options.power_configurations;
            this.onBeforeCloseCallback = options.onBeforeCloseCallback;
            this.options = {};
            this.configuration = {
                attacker: {},
                defender: {}
            };
            this.$subwindow = null;
        },

        renderPage: function () {
            SubWindowHelper.renderSubWindow(this.$el, 'simulator_configuration');

            if (!this.$subwindow) {
                this.$subwindow = this.$el.find('.sub_window .content');
                this.categories.forEach(this.generateOptionsForCategory.bind(this));

                this.view = new SimulatorConfigurationView({
                    el: this.$subwindow,
                    controller: this
                });
            } else {
                this.$subwindow.appendTo(this.$el.find('.sub_window .content'));
            }
        },

        handleCloseButtonClick: function () {
            this.onBeforeCloseCallback();
            this.$subwindow.detach();
            this.$el.find('.simulator_configuration').remove();
        },

        getSimulatorConfiguration: function ()  {
            return this.configuration;
        },

        getOptionConfigurationIndex: function (options, category, id, permutation) {
            var option_index = null;

            options[category].find(function (option, index) {
                var is_match = option.power_id === id;

                if (is_match && typeof permutation !== 'undefined') {
                    is_match = option.permutation === permutation;
                }

                if (is_match) {
                    option_index = index;
                }

                return is_match;
            });

            return option_index;
        },

        addOptionToConfiguration: function (side, category, option) {
            var id = option.power_id,
                permutation = option.permutation;

            if (!this.configuration[side][category]) {
                this.configuration[side][category] = [];
            }

            if (!this.getOptionConfigurationIndex(this.configuration[side], category, id, permutation)) {
                this.configuration[side][category].push(option);
            }
        },

        removeOptionFromConfiguration: function (side, category, option) {
            var index = this.getOptionConfigurationIndex(
                this.configuration[side],
                category,
                option.power_id,
                option.permutation
            );

            if (index !== null) {
                this.configuration[side][category].splice(index, 1);
            }
        },

        adjustOptionLevel: function (side, category, option, new_level) {
            var index = this.getOptionConfigurationIndex(
                this.configuration[side],
                category,
                option.power_id,
                option.permutation
            );

            if (index !== null) {
                this.configuration[side][category][index].level = new_level;
                this.view.renderOptionToCategory(side, category, option, true);
            }
        },

        getPowerConfiguration: function (power_id) {
            return this.power_configurations.find(function (power_configuration) {
                return power_configuration.id === power_id;
            });
        },

        addPermutationsToOptions: function (category, power_id, permutations) {
            permutations.forEach(function (permutation, index) {
                this.options[category].push({
                    power_id: power_id,
                    configuration: permutation,
                    permutation: index,
                    size: permutation.size,
                    max_level: MAX_LEVEL,
                    attacker: true,
                    defender: true,
                    level: 1
                });
            }.bind(this));
        },

        generateOptionsForCategory: function (category) {
            var category_power = this.categories_mapping[category],
                power_configuration, permutations, gd_power,
                is_upgradeable, defaults, max_level,
                attacker, defender;

            if (!this.options[category]) {
                this.options[category] = [];
            }

            for (var id in category_power) {
                if (!category_power.hasOwnProperty(id)) {
                    continue;
                }

                var power_id = category_power[id];

                power_configuration = this.getPowerConfiguration(power_id);
                permutations = power_configuration ? power_configuration.permutations : [];

                if (category !== Categories.POWERS && category !== Categories.SPELLS && permutations.length > 0) {
                    this.addPermutationsToOptions(category, power_id, permutations);
                } else {
                    gd_power = GameData.powers[power_id];
                    is_upgradeable = (gd_power && gd_power.is_upgradable) || permutations.length > 0;
                    defaults = gd_power ? gd_power.meta_defaults : {};
                    attacker = true;
                    defender = true;

                    if (power_configuration) {
                        attacker = power_configuration.attacker;
                        defender = power_configuration.defender;
                    }

                    if (is_upgradeable) {
                        max_level = permutations.length ?
                            permutations.length :
                            this.getMaxLevelFromProperties(power_configuration.properties);
                    } else {
                        max_level = 0;
                    }

                    this.options[category].push({
                        power_id: power_id,
                        level: 1,
                        max_level: max_level,
                        is_upgradeable: is_upgradeable,
                        configuration: defaults,
                        attacker: attacker,
                        defender: defender
                    });
                }
            }
        },

        getMaxLevelFromProperties: function (properties) {
            var level_property = properties.find(function (property) {
                return property.name === 'level';
            });

            return level_property ? level_property.max : 0;
        },

        getCategories: function () {
            return this.categories;
        },

        getCategoryOptions: function (category) {
            return this.options[category];
        },

        hasAvailableCategoryOptions: function (side, category) {
            return this.getAvailableCategoryOptionsBySide(side, category).length !== 0;
        },

        getAvailableCategoryOptionsBySide: function (side, category) {
            return this.getCategoryOptions(category).filter(function (option) {
                if (!option[side]) {
                    return false;
                }

                return !(this.configuration[side][category] &&
                    this.configuration[side][category].find(this.compareOptions.bind(this, option)));
            }.bind(this));
        },

        compareOptions: function (option_a, option_b) {
            return option_a.power_id === option_b.power_id &&
                option_a.permutation === option_b.permutation;
        },

        getOption: function (category, id, permutation) {
            var index = this.getOptionConfigurationIndex(this.options, category, id, permutation);
            return Object.assign({}, this.options[category][index]);
        },

        isUpgradeable: function (category, option) {
            return category === Categories.TEMPLES || option.is_upgradeable;
        }
    });
});