/*globals DateHelper, Timestamp, us*/

define('events/missions/views/missions', function (require) {
    'use strict';

    var TooltipFactory = require_legacy('TooltipFactory');
    var View = window.GameViews.BaseView;

    return View.extend({
        initialize: function () {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function() {
            var missions = this.controller.getMissions();

            this.renderTemplate(this.$el, 'index', {
                l10n: this.l10n,
                skin: this.controller.getMissionsSkin(),
                missions_count: missions.length
            });

            this.renderMissions();
            this.renderUnits();
            this.registerCountdown();
        },

        renderMissions: function() {
            var missions = this.controller.getMissions(),
                swap_mission_cost = this.controller.getSwapMissionCost(),
                mission_ids = this.controller.getPreviousMissionIds();

            this.$el.find('.missions').empty();

            missions.forEach(function (mission, idx) {
                var duration = DateHelper.readableSeconds(mission.getConfiguration().duration, true, true);
                this.$el.find('.missions').append(
                    this.getTemplate('mission', {
                        l10n: this.l10n,
                        id: mission.getId(),
                        title: mission.getTitle(),
                        duration: duration,
                        new_mission_price: swap_mission_cost,
                        configuration: mission.getConfiguration(),
                        skin: this.controller.getMissionsSkin(),
                        type: mission.getType()
                    })
                );

                this.registerMissionClick();

                if (idx === 0 && !mission_ids.length) {
                    this.selectMission(mission);
                }
                else if (mission_ids.indexOf(mission.id) === -1 && mission_ids.length === 2) {
                    this.selectMission(mission);
                }
            }.bind(this));

            this.registerNewMissionButtons();
            this.registerTooltipsMissionList();
        },

        renderDetails: function(mission) {
            var $details = $(this.$el.find('.missions_list_details')),
                mission_base_chance = mission.getBaseChance(),
                mission_max_chance = this.controller.getMaxSuccessChance(mission),
                success_chance = mission_base_chance >= mission_max_chance ?
                    mission_base_chance + "%" :
                    mission_base_chance + "% - " + mission_max_chance + "%";


            $details.empty();

            if (!mission) {
                return;
            }

            var duration = DateHelper.readableSeconds(mission.getConfiguration().duration, true, true);
            $details.append(
                this.getTemplate('details', {
                    l10n: this.l10n,
                    title: mission.getTitle(),
                    description: mission.getDescription(),
                    duration: duration,
                    mission_id: mission.id,
                    mission_number: mission.getMissionNumber(),
                    success_chance: success_chance,
                    capacity: mission.getConfiguration().capacity,
                    skin: this.controller.getMissionsSkin()
                })
            );

            this.registerSendUnitsButton();
            this.registerTooltipsMissionDetails();
        },

        renderUnits: function () {
            var player_army_model = this.controller.getPlayerArmy(),
                player_army_units = player_army_model.getUnits(),
                unit_data_model = this.controller.getUnitData(),
                units_data = unit_data_model.getUnits(),
                $missions_units = this.$el.find('.missions_units_wrapper'),
                skin = this.controller.getMissionsSkin();

            $missions_units.empty();

            units_data.forEach(function (unit) {
                var amount = 0,
                    estimated_cost = 0;

                if (player_army_model.hasUnit(unit.type)) {
                    amount = player_army_units[unit.type].amount;
                    estimated_cost = player_army_units[unit.type].cost_factor * unit.data.base_cost;
                }

                $missions_units.append(
                    this.getTemplate('buy_unit', {
                        amount: player_army_model.hasUnit(unit.type) ? player_army_units[unit.type].amount : 0,
                        unit_id: unit.type,
                        game_unit: unit.data.game_unit,
                        buy_units: this.l10n.buy_units(unit.data.purchase_amount)
                    })
                );

                this.setTooltipsToUnitImages($missions_units, unit, skin);
                this.registerBuyUnitsButton($missions_units, unit, estimated_cost);
            }.bind(this));
        },

        registerBuyUnitsButton: function ($el, unit, estimated_cost) {
            var id = 'btn_buy_units_' + unit.type,
                $button = $el.find('.button[data-unit_id="' + unit.type + '"]'),
                unit_name_plural = this.controller.getGameUnitNamePlural(unit.data.game_unit);

            this.unregisterComponent(id);
            this.registerComponent(id, $button.button({
                caption: estimated_cost,
                tooltips: [
                    {title: this.l10n.tooltips.buy_units(unit.data.purchase_amount, unit_name_plural, estimated_cost)}
                ],
                icon: true,
                icon_type: 'gold'
            }).on('btn:click', function (ev) {
                this.controller.buyUnits(unit.type, unit.data.purchase_amount, unit_name_plural, estimated_cost);
            }.bind(this)));
        },

        /*
         * Initialize Event Countdown
         */
        registerCountdown: function () {
            this.unregisterComponent('countdown');
            this.registerComponent('countdown', this.$el.find('.countdown_box .middle').countdown2({
                value : this.controller.getEventEndAt() - Timestamp.now(),
                display : 'event',
                tooltip : {title: this.l10n.tooltips.event_timer_tooltip}
            }));

            this.controller.unregisterComponent('btn_info_overlay');
            this.controller.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
                template : 'internal',
                tooltips : [
                    {title: this.l10n.tooltips.event_info_btn}
                ]
            }).on('btn:click', function() {
                var MissionTutorial = require('events/missions/helpers/tutorial');
                MissionTutorial.showTutorial(this.controller);
            }.bind(this)));
        },

        registerNewMissionButtons: function() {
            var swap_mission_cost = this.controller.getSwapMissionCost();

            this.$el.find('.mission').each(function(idx, el) {
                var mission = this.getMission(el);

                this.unregisterComponent('btn_new_mission_' + mission.id);
                this.registerComponent('btn_new_mission_' + mission.id, this.$el.find('.btn_new_mission.mission_' + mission.id).button({
                    caption: swap_mission_cost,
                    tooltips: [{title: this.l10n.tooltips.swap_mission_button(swap_mission_cost)}],
                    icon: true,
                    icon_type: 'gold',
                    stop_propagation: true
                }).on('btn:click', function(ev) {
                    var mission = this.getMission(ev.currentTarget),
                        mission_ids = this.getMissionIds();
                    this.controller.setPreviousMissionIds(mission_ids);
                    this.controller.getNewMission(mission.id, swap_mission_cost);
                }.bind(this)));
            }.bind(this));
        },

        registerSendUnitsButton: function() {
            this.unregisterComponent('btn_send_units');
            this.registerComponent('btn_send_units', this.$el.find('.btn_send_units').button({
                caption: this.l10n.send_units_button,
                tooltips: [{title: this.l10n.tooltips.send_units_button}]
            }).on('btn:click', function (ev) {
                var mission = this.getMission(ev.currentTarget);
                this.controller.sendUnits(mission);
            }.bind(this)));
        },

        registerMissionClick: function () {
            this.$el.find('.mission').on('click.mission', function(ev) {
                var mission = this.getMission(ev.currentTarget);
                this.selectMission(mission);
            }.bind(this));
        },

        registerTooltipsMissionList: function() {
            var missions = this.controller.getMissions();

            missions.forEach(function(mission) {
                this.$el.find('.mission_' + mission.id + ' .mission_left').tooltip(this.l10n.tooltips[mission.getType()]);
            }.bind(this));

            this.$el.find('.mission_timer').tooltip(this.l10n.tooltips.duration_icon);
            this.$el.find('.mission_base_chance').tooltip(this.l10n.tooltips.base_chance_icon);
        },

        registerTooltipsMissionDetails: function() {
            this.$el.find('.details_resources_timer').tooltip(this.l10n.tooltips.duration_icon);
            this.$el.find('.details_resources_boost').tooltip(this.l10n.tooltips.success_chance);
            this.$el.find('.details_resources_capacity').tooltip(this.l10n.tooltips.mission_capacity);
        },

        setTooltipsToUnitImages: function ($el, unit, skin) {
            var options = {unit_skin_class: skin},
                tooltip = TooltipFactory.getUnitCard(unit.data.game_unit, options);

            $el.find('.unit[data-unit_id="' + unit.type + '"]').tooltip(tooltip, {}, false);
        },

        getMission: function(el) {
            var $el = $(el),
                mission_id = $el.data('mission_id'),
                missions = this.controller.getMissions();

            //we use the underscore find method since the default array find is not supported in IE11
            return us.find(missions, function(mission) {
                return mission.id === mission_id;
            }.bind(this));
        },

        selectMission: function(mission) {
            var $mission = this.$el.find('.mission.mission_' + mission.id),
                $missions = this.$el.find('.missions'),
                template = '<div class="active_indicator ' + mission.getSkinId() + '"></div>';

            $missions.find('.mission').removeClass('active');
            $missions.find('.active_indicator').remove();

            $mission.addClass('active').append(template);

            this.renderDetails(mission);
        },

        getMissionIds: function() {
            var missions = this.controller.getMissions(),
                mission_ids = [];

            missions.forEach(function(mission, idx) {
                mission_ids[idx] = mission.getId();
            }.bind(this));

            return mission_ids;
        }
    });
});

