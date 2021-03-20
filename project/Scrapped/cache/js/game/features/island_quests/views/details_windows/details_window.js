/* global Timestamp, DateHelper, readableUnixTimestamp */

define('features/island_quests/views/details_windows/details_window', function () {
    'use strict';

    var BaseView = window.GameViews.BaseView;
    var GameDataUnits = require('data/units');
    var GameEvents = require('data/events');
    var STATES = require('enums/quests');

    return BaseView.extend({
        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            this.questlog_controller = this.options.questlog_controller;
            this.decision = this.options.decision;
            this.l10n = this.options.l10n.details_window;
        },

        registerEventListeners: function () {
            this.stopListening();
            $.Observer().unsubscribe('IslandQuestsDetailsWindow');

            this.decision.onProgressChange(this, function (decision) {
                if (decision.getState() === STATES.SATISFIED) {
                    this.questlog_controller.sub_window.close();
                } else {
                    this.rerender();
                }
            }.bind(this));

            $.Observer(GameEvents.town.town_switch).subscribe('IslandQuestsDetailsWindow', this.rerender.bind(this));
        },

        rerender: function () {
            this.unregisterComponents(this.sub_context);
            this.render(this.questlog_controller.getSubWindowContentNode());
        },

        getSelectedUnits: function () {
            var units = {};

            this.$el.find('.txt_unit').each(function (index, el) {
                var $el = $(el),
                    unit_id = $el.attr('data-unitid'),
                    textbox = this.getComponent('txt_unit_' + unit_id, this.sub_context);

                units[unit_id] = parseInt(textbox.getValue(), 10);
            }.bind(this));

            return units;
        },

        getSelectedUnitsAndHero: function() {
            var units = this.getSelectedUnits(),
                hero = this.controller.getHero(),
                checkbox = this.getComponent('cbx_include_hero', this.sub_context);

            if (hero && checkbox && checkbox.isChecked()) {
                units[hero.getId()] = hero.getLevel(); // simulator
                units['heroes'] = hero.getId(); // attack
            }

            return units;
        },

        updateRuntimes: function (elem_duration, elem_arrival) {
            var selected_units = this.getSelectedUnits(),
                town_id = this.current_town.getId(),
                target_town = this.decision.getTownId(),
                cache_id = town_id + '-' + target_town;

            if (GameDataUnits.isEmpty(selected_units)) {
                elem_duration.hide();
                elem_arrival.hide();
                return;
            }

            var callback = function (unit_runtimes) {
                var slowest_runtime = GameDataUnits.getSlowestRuntime(selected_units, unit_runtimes),
                    arrival = Timestamp.server() + slowest_runtime;

                elem_duration.text('~' + DateHelper.readableSeconds(slowest_runtime));
                elem_arrival.text(slowest_runtime).updateTime();
                elem_arrival.text('~' + readableUnixTimestamp(arrival, 'no_offset'));

                elem_duration.show();
                elem_arrival.show();

                this.unit_runtimes[cache_id] = unit_runtimes;
            }.bind(this);

            if (this.unit_runtimes[cache_id]) {
                callback(this.unit_runtimes[cache_id]);
            } else {
                this.controller.getUnitRuntimes(target_town, callback);
            }

        },

        destroy: function () {
            this.stopListening();
            $.Observer().unsubscribe('IslandQuestsDetailsWindow');
        }
    });
});
