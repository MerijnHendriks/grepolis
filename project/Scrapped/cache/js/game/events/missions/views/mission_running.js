/*globals us*/
define('events/missions/views/mission_running', function () {
    'use strict';

    var View = window.GameViews.BaseView,
        Timestamp = require('misc/timestamp'),
        TooltipFactory = require_legacy('TooltipFactory'),
        NotificationLoader = require('notifications/notification_loader');

    return View.extend({
        initialize: function (options) {
            //Don't remove it, it should call its parent
            View.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();

            this.render();
        },

        render: function () {
            this.mission = this.controller.getRunningMission();

            this.renderTemplate(this.$el, 'mission_running', {
                l10n: this.l10n,
                skin: this.controller.getMissionsSkin(),
                mission_number: this.mission.getMissionNumber(),
                mission_title: this.mission.getTitle(),
                units: this.mission.getConfiguration().units,
                base_chance: this.mission.getBaseChance() + '%'
            });

            this.addUnitTooltips();
            this.registerCountdown();
            this.registerMissionTimerProgressbar();
            this.registerBoostMissionButton();
            this.registerFreeBoostProgressbar();
            this.addTooltipToBaseChance();
            this.registerChancesProgressbars();
        },

        reRender: function () {
            this.render();
        },

        addUnitTooltips: function () {

            var $units = this.$el.find('.units_container').children(),
                units_data = this.controller.getUnitData().getUnits(),
                skin = this.controller.getMissionsSkin(),
                options = {unit_skin_class: skin};

            if (!$units.length) {
                return;
            }

            us.each($units, function (unit) {
                var unit_data = us.findWhere(units_data, {type: $(unit).data('unit_id')}),
                    game_unit_id = unit_data.data.game_unit;
                $(unit).tooltip(TooltipFactory.getUnitCard(game_unit_id, options), {}, false);
            });
        },

        /*
         * Initialize Event Countdown
         */
        registerCountdown: function () {
            this.unregisterComponent('countdown');
            this.registerComponent('countdown', this.$el.find('.countdown_box .middle').countdown2({
                value : this.controller.getEventEndAt() - Timestamp.now(),
                display : 'event',
                tooltip: {title: this.l10n.tooltips.event_timer_tooltip}
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

        registerMissionTimerProgressbar: function () {
            this.unregisterComponent('pg_mission_timer');
            var duration = this.mission.getDurationTime();
            this.registerComponent('pg_mission_timer', this.$el.find('.pg_mission_timer').singleProgressbar({
                value: this.mission.getEndTime() - Timestamp.now(),
                max: duration,
                type: 'time',
                countdown: true,
                countdown_settings: {
                    display_days: true,
                    timestamp_end: this.mission.getEndTime()
                },
                liveprogress: true,
                liveprogress_interval: 1,
                template: 'tpl_pb_single'
            }).on("pb:cd:finish", function () {
                NotificationLoader.resetNotificationRequestTimeout(100);
            }.bind(this)));
        },

        registerBoostMissionButton: function () {
            this.unregisterComponent('btn_boost_mission');

            var options = {};

            if (this.controller.isFreeMissionBoost()) {
                options = {
                    css_classes: 'instant_buy',
                    caption: this.l10n.mission_running.free,
                    tooltips: [
                        { title: this.l10n.mission_running.tooltips.boost_mission_free }
                    ]
                };
            } else {
                var cost = this.controller.getMissionBoostCost();

                options = {
                    caption: cost,
                    icon: true,
                    icon_type: 'gold',
                    icon_position: 'left',
                    tooltips: [
                        { title: this.l10n.mission_running.tooltips.boost_mission(cost) }
                    ]
                };
            }

            this.registerComponent('btn_boost_mission', this.$el.find('.btn_boost_mission').button(options).on('btn:click', function (ev) {
                this.controller.boostMission();
            }.bind(this)));
        },

        registerFreeBoostProgressbar: function () {
            var $pg_free_boost = this.$el.find('.pg_free_boost'),
                values = this.controller.getMissionBoostProgressValues(),
                is_running = this.controller.isMissionBoostTimerRunning(),
                ttips = this.l10n.mission_running.tooltips,
                tooltip = {
                    template : is_running ? ttips.boost_mission_progress : ttips.boost_mission_ready,
                    data : null,
                    styles : null
                };

            this.unregisterComponent('pg_free_boost');
            this.registerComponent('pg_free_boost', $pg_free_boost.singleProgressbar({
                value: values.value,
                max: values.max,
                type: 'time',
                countdown: true,
                countdown_settings: {
                    display_days: true,
                    timestamp_end: values.timestamp_end
                },
                liveprogress: true,
                liveprogress_interval: 1,
                template: 'tpl_pb_single',
                tooltips: {
                    in_progress: tooltip
                }
            }).on("pb:cd:finish", function () {
                NotificationLoader.resetNotificationRequestTimeout(100);
            }));

            if (!is_running) {
                $pg_free_boost.find('.caption').text(this.l10n.mission_running.ready);
                $pg_free_boost.find('.progress').hide();
            }
        },

        addTooltipToBaseChance: function () {
            this.$el.find('.base_chance_wrapper').tooltip(this.l10n.mission_running.tooltips.base_chance);
        },

        registerChancesProgressbars: function () {
            var unit_bonus = {template : this.l10n.mission_running.tooltips.unit_bonus, data : null, styles : null},
                total_chance = {template : this.l10n.mission_running.tooltips.total_chance, data : null, styles : null},
                value = this.mission.getUnitChance(),
                max = this.mission.getMaxUnitBonus(),
                progressbar;

            this.unregisterComponent('pg_unit');
            progressbar = this.registerComponent('pg_unit', this.$el.find('.pg_unit').singleProgressbar({
                value: value,
                max: max,
                template: 'tpl_pb_single',
                show_value: false,
                caption: s('%1% / %2%', value, max),
                tooltips: {
                    idle: unit_bonus
                }
            }));

            if (value === max) {
                $(progressbar).find('.progress').addClass('gold');
            }

            value = this.controller.getSuccessChance(this.mission);
            max = this.controller.getMaxSuccessChance(this.mission);

            this.unregisterComponent('pg_total');
            progressbar = this.registerComponent('pg_total', this.$el.find('.pg_total').singleProgressbar({
                value: value,
                max: max,
                type: 'percentage',
                template: 'tpl_pb_single',
                show_value: false,
                caption: s('%1% / %2%', value, max),
                tooltips: {
                    idle: total_chance
                }
            }));

            if (value === max) {
                $(progressbar).find('.progress').addClass('gold');
            }
        }

    });
});

