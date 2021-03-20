/*global us, $, GameEvents, TooltipFactory */

define('features/island_quests/views/details_windows/collect_units', function () {
    'use strict';

    var DetailsWindow = require('features/island_quests/views/details_windows/details_window');

    return DetailsWindow.extend({
        sub_context: 'collect_units',
        unit_runtimes: {},

        initialize: function () {
            DetailsWindow.prototype.initialize.apply(this, arguments);

            this.current_town = this.options.current_town;
            this.units_collection = this.options.units_collection;
            this.registerEventListeners();
        },

        registerEventListeners: function () {
            DetailsWindow.prototype.registerEventListeners.apply(this, arguments);
            
            $.Observer(GameEvents.town.units.change).subscribe('IslandQuestsDetailsWindow', this.rerender.bind(this));

            this.current_town.onGodChange(this, this.rerender.bind(this));
        },

        unregisterEventListeners: function () {
            $.Observer().unsubscribe('IslandQuestsDetailsWindow');
            this.stopListening();
        },

        render: function ($content_node) {
            var units = this.units_collection.getLandUnits(false, true);

            this.$el = $content_node;

            this.$el.html(us.template(this.controller.getTemplate('wnd_collect_units'), {
                l10n: this.l10n,
                decision: this.decision,
                units: units
            }));

            this.registerViewComponents(units);

            return this;
        },

        registerViewComponents: function (units) {
            var $way_duration = this.$el.find('.way_duration'),
                $arrival_time = this.$el.find('.arrival_time');

            this.unregisterComponents(this.sub_context);

            this.$el.find('.txt_unit').each(function (index, el) {
                var $el = $(el),
                    unit_id = $el.attr('data-unitid');

                this.registerComponent('txt_unit_' + unit_id, $el.textbox({
                    type: 'number',
                    value: 0,
                    min: 0,
                    max: units[unit_id],
                    hidden_zero: true,
                    live: true,
                    prevent_repeats: true
                }).on('txt:change:value', function () {
                    this.updateRuntimes($way_duration, $arrival_time);
                }.bind(this)), this.sub_context);

            }.bind(this));

            this.registerComponent('rallied_troops_progress', this.$el.find('.rallied_troops_progress').singleProgressbar({
                value: this.decision._getCollectUnitsProgress().count_units,
                max: this.decision._getCollectUnitsProgress().count_to_rally,
                type: 'integer'
            }), this.sub_context);

            this.registerComponent('btn_select_all_troops', this.$el.find('.btn_select_all_troops').button({
                caption: this.l10n.select_all_troops
            }).on('btn:click', function () {
                this.selectAllTroops();
                this.updateRuntimes($way_duration, $arrival_time);
            }.bind(this)), this.sub_context);

            this.registerComponent('btn_send_support', this.$el.find('.btn_send_support').button({
                caption: this.l10n.btn_send_troops
            }).on('btn:click', function () {
                var town_id = this.decision.getTownId(),
                    units = this.getSelectedUnits();

                this.controller.sendUnits(town_id, units, 'support', 'regular', this.rerender.bind(this));
            }.bind(this)), this.sub_context);

            this.$el.find('.units_in_town').on('click', '.unit_icon', function (e) {
                var $current_target = $(e.currentTarget),
                    unit_id = $current_target.attr('data-unitid'),
                    textbox = this.controller.getComponent('txt_unit_' + unit_id, this.sub_context),
                    curr_value = textbox.getValue();

                textbox.setValue(curr_value === units[unit_id] ? 0 : units[unit_id], {silent: true});
                this.updateRuntimes($way_duration, $arrival_time);
            }.bind(this)).find('.unit_icon').each(function () {
                // unit tooltip
                $(this).tooltip(TooltipFactory.getUnitCard($(this).data('unitid')), {}, false);
            });

            this.$el.find('.rallied_troops_progress').tooltip(this.l10n.population);
        },

        selectAllTroops: function () {
            var units = this.units_collection.getLandUnits();

            this.$el.find('.txt_unit').each(function (index, el) {
                var $el = $(el),
                    unit_id = $el.attr('data-unitid'),
                    textbox = this.getComponent('txt_unit_' + unit_id, this.sub_context);

                textbox.setValue(units[unit_id]);
            }.bind(this));
        },

        destroy: function () {
            DetailsWindow.prototype.destroy.apply(this, arguments);

            this.controller.unregisterComponents(this.sub_context);

            this.unregisterEventListeners();
        }
    });
});
