/*global TooltipFactory, us, $, ITowns, Game, GameEvents, BuildingPlace, ConfirmationWindowFactory */

define('features/island_quests/views/details_windows/attack_npc', function () {
    'use strict';

    var DetailsWindow = require('features/island_quests/views/details_windows/details_window');

    return DetailsWindow.extend({
        sub_context: 'attack_npc',
        unit_runtimes: {},

        initialize: function () {
            DetailsWindow.prototype.initialize.apply(this, arguments);

            this.current_town = this.options.current_town;
            this.units_collection = this.options.units_collection;

            this.registerEventListeners();
        },

        registerEventListeners: function () {
            DetailsWindow.prototype.registerEventListeners.apply(this, arguments);

            $.Observer(GameEvents.town.units.change).subscribe('IslandQuestsDetailsWindowAttackNPC', this.rerender.bind(this));

            this.current_town.onGodChange(this, this.rerender);
        },

        unregisterEventListeners: function () {
            $.Observer().unsubscribe('IslandQuestsDetailsWindowAttackNPC');
            this.stopListening();
        },

        render: function ($content_node) {
            var units = this.units_collection.getLandUnits(false, true),
                hero = this.controller.getHero(Game.townId);

            // catapults are not allowed to attack IQ
            delete units.catapult;

            this.$el = $content_node;

            this.$el.html(us.template(this.controller.getTemplate('wnd_attack_npc'), {
                l10n: this.l10n,
                decision: this.decision,
                units: units,
                hero: hero ? hero.getId() : ''
            }));

            this.registerViewComponents();

            return this;
        },

        registerViewComponents: function () {
            var $way_duration = this.$el.find('.way_duration'),
                $arrival_time = this.$el.find('.arrival_time'),
                units = this.units_collection.getLandUnits(false, true);

            this.unregisterComponents(this.sub_context);

            this.$el.find('.txt_unit').each(function (index, el) {
                var $el = $(el),
                    unit_id = $el.attr('data-unitid');

                this.registerComponent('txt_unit_' + unit_id, $el.textbox({
                    type: 'number',
                    value: 0,
                    min: 0,
                    max: units[unit_id],
                    hidden_zero: true
                }).on('txt:change:value', function () {
                    this.updateRuntimes($way_duration, $arrival_time);
                    this.updateAttackButton();
                }.bind(this)), this.sub_context);
            }.bind(this));

            this.registerComponent('cbx_include_hero', this.$el.find('.cbx_include_hero').checkbox({
                type: 'checkbox',
                caption: '',
                checked: false
            }).on('cbx:check', function () {
                this.updateRuntimes($way_duration, $arrival_time);
            }.bind(this)), this.sub_context);

            this.registerComponent('btn_select_all_troops', this.$el.find('.btn_select_all_troops').button({
                caption: this.l10n.select_all_troops
            }).on('btn:click', function () {
                this.updateRuntimes($way_duration, $arrival_time);
                this.selectAllTroops();
            }.bind(this)), this.sub_context);

            this.registerComponent('btn_simulate', this.$el.find('.btn_simulate').button({
                caption: this.l10n.simulate
            }).on('btn:click', function () {
                var sim_units = {
                    'att': this.getSelectedUnitsAndHero(),
                    'def': this.decision.getAttackNPCUnitsLeft()
                };

                BuildingPlace.insertUnitsToSimulator(sim_units);
            }.bind(this)), this.sub_context);

            this.registerComponent('btn_send_attack', this.$el.find('.btn_send_attack').button({
                caption: this.l10n.btn_attack,
                disabled: !this.areSomeUnitsSelected(),
                state: !this.areSomeUnitsSelected()
            }).on('btn:click', function () {
                var HelperSimulator = require('features/fatal_attack_warning/helpers/fight_simulator');

                var town_id = this.decision.getTownId(),
                    units = this.getSelectedUnitsAndHero(),
                    npc_units = this.decision.getAttackNPCUnitsLeft(),
                    simulator_units_array = HelperSimulator.buildSimulatorUnitsArrayForFatalAttackCheck(units, npc_units),
                    do_attack = function () {
                        this.controller.sendUnits(town_id, units, 'attack', 'regular');
                    }.bind(this);

                HelperSimulator.simulateFight(simulator_units_array)
                    .then(HelperSimulator.isAttackFatal)
                    .then(function (is_fatal) {
                        if (is_fatal) {
                            ConfirmationWindowFactory.openConfirmationFatalAttack(function () {
                                do_attack();
                            });
                        } else {
                            do_attack();
                        }
                    });
            }.bind(this)), this.sub_context);

            this.$el.find('.units_in_town').on('click', '.unit_icon', function (e) {
                var $current_target = $(e.currentTarget),
                    unit_id = $current_target.attr('data-unitid'),
                    hero = $current_target.attr('data-hero') && this.controller.isHeroHealthyInTown(),
                    component_name = hero ? 'cbx_include_hero' : 'txt_unit_' + unit_id,
                    input = this.getComponent(component_name, this.sub_context),
                    curr_value = hero ? input.isChecked() : input.getValue();

                if (hero) {
                    input.check(!curr_value);
                } else {
                    input.setValue(curr_value === units[unit_id] ? 0 : units[unit_id]);
                    this.updateRuntimes($way_duration, $arrival_time);
                }
            }.bind(this)).find('.unit_icon').each(function () {
                // unit tooltip
                $(this).tooltip(TooltipFactory.getUnitCard($(this).data('unitid')), {}, false);
            });
        },

        areSomeUnitsSelected: function () {
            return us.values(this.getSelectedUnits()).some(function (el) {
                return el > 0;
            });
        },

        updateAttackButton: function () {
            var button = this.getComponent('btn_send_attack', this.sub_context);

            if (this.areSomeUnitsSelected()) {
                button.setState(false);
                button.enable();
            } else {
                button.setState(true);
                button.disable();
            }
        },

        selectAllTroops: function () {
            var controller = this.controller, sub_context = this.sub_context,
                units = ITowns.getTown(Game.townId).getLandUnits(),
                checkbox = controller.getComponent('cbx_include_hero', sub_context);

            this.$el.find('.txt_unit').each(function (index, el) {
                var $el = $(el),
                    unit_id = $el.attr('data-unitid'),
                    textbox = controller.getComponent('txt_unit_' + unit_id, sub_context);

                textbox.setValue(units[unit_id]);
            });

            if (checkbox) {
                checkbox.check(true);
            }
        },

        destroy: function () {
            DetailsWindow.prototype.destroy.apply(this, arguments);

            this.controller.unregisterComponents(this.sub_context);
            this.unregisterEventListeners();
        }
    });

});
