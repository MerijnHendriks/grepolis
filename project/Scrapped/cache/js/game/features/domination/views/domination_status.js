// Domination tab view
define('features/domination/views/domination_status', function () {
    'use strict';

    var LAST_STAND_STATUS = require('enums/last_stand_status'),
        BaseView = window.GameViews.BaseView,
        Game = require_legacy('Game'),
        Timestamp = require_legacy('Timestamp'),

        DominationView = BaseView.extend({
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.l10n = this.controller.getl10n();
                this.alliance_data = this.controller.getAllianceData();

                this.render();
            },

            getLastStandTextDependingOnState: function () {
                var last_stand_status = this.controller.getLastStandStatus();
                return this.l10n.last_stand[last_stand_status];
            },

            getLastStandButtonDisabledState: function() {
                var last_stand_status = this.controller.getLastStandStatus(),
                    post_domination_era_active = this.controller.isPostDominationEraActive();

                return last_stand_status !== LAST_STAND_STATUS.ACTIVATION_POSSIBLE || post_domination_era_active;
            },

            renderLastStand: function () {
                var $last_stand = this.$el.find('.last_stand_wrapper');

                this.renderTemplate($last_stand, 'last_stand', {
                    l10n: this.l10n,
                    text: this.getLastStandTextDependingOnState(),
                    status: this.controller.getLastStandStatus()
                });

                var last_stand_tooltip = this.l10n.last_stand_info_tooltip(Game.last_stand_duration_days, Game.last_stand_planning_days);
                $last_stand.find('.info_icon').tooltip(last_stand_tooltip, {width: 400});
            },

            registerLastStandProgress: function () {
                if (this.controller.getLastStandStatus() === LAST_STAND_STATUS.NOT_REACHED) {
                    return;
                }

                var $progressbar = this.$el.find('.pg_last_stand'),
                    status = this.controller.getLastStandStatus(),
                    ls_started_timestamp = this.controller.getLastStandStartedAtTimestamp(),
                    ls_planned_in_seconds = Game.last_stand_planning_days * 86400,
                    deduction = (status === LAST_STAND_STATUS.ACTIVATED) ? ls_started_timestamp : (ls_started_timestamp - ls_planned_in_seconds),
                    ls_finished_timestamp = this.controller.getLastStandFinishedAtTimestamp(),
                    value = Timestamp.now() - deduction,
                    getMaxValue = function () {
                        var max;
                        if (status === LAST_STAND_STATUS.ACTIVATED) {
                            max = ls_finished_timestamp - deduction;
                        } else {
                            max = ls_started_timestamp - deduction;
                        }
                        return max;
                    },
                    max = getMaxValue();

                this.unregisterComponent('pg_last_stand');
                this.registerComponent('pg_last_stand', $progressbar.singleProgressbar({
                    value: value,
                    max: max,
                    liveprogress: true,
                    show_value: false
                }));

                this.unregisterComponent('last_stand_countdown');
                this.registerComponent('last_stand_countdown', this.$el.find(".last_stand_countdown").countdown2({
                    value : max - value,
                    display : 'day_hr_min_sec'
                }));
            },

            registerLastStandButton: function () {
                var last_stand_status = this.controller.getLastStandStatus();
                if (last_stand_status === LAST_STAND_STATUS.ACTIVATED) {
                    return;
                }

                var $button = this.$el.find('.last_stand_btn');
                var button_disabled = this.getLastStandButtonDisabledState();

                this.unregisterComponent('last_stand_btn');
                this.registerComponent('last_stand_btn', $button.button({
                    caption: this.l10n.last_stand_button,
                    status: button_disabled,
                    disabled: button_disabled
                }).on('btn:click', function () {
                    this.controller.startLastStand();
                }.bind(this)));
            },

            renderAndRegisterLastStandStatus: function () {
                this.renderLastStand();
                this.registerLastStandProgress();
                this.registerLastStandButton();
            },

            renderAllianceStatus: function () {
                var $alliance_status = this.$el.find('.alliance_status_wrapper'),
                    tooltip = this.l10n.tooltips.alliance_status_info;

                this.renderTemplate($alliance_status, 'alliance_status', {
                    l10n: this.l10n,
                    alliance_name: this.alliance_data.alliance_name,
                    alliance_town_count: this.alliance_data.owned_cities,
                    alliance_color: this.controller.getCustomColorForOwnAlliance()
                });

                $alliance_status.find('.info_icon').tooltip(tooltip, {width: 400});
            },

            renderAllianceStatusEmpty: function () {
                var $alliance_status = this.$el.find('.alliance_status_wrapper');

                this.renderTemplate($alliance_status, 'alliance_status_empty', {
                    l10n: this.l10n
                });
            },

            renderWorldStatus: function () {
                var $world_status = this.$el.find('.world_status_wrapper');

                this.renderTemplate($world_status, 'world_status', {
                    l10n: this.l10n,
                    valid_towns_count: {
                        total: this.controller.getTotalCities(),
                        free: this.controller.getUnownedCities()
                    }
                });
            },

            registerAllianceStatusProgress: function () {
                var $progressbar = this.$el.find('.pg_alliance_status'),
                    value = this.alliance_data.domination_percentage,
                    max = this.controller.getCurrentGoal();

                this.unregisterComponent('pg_alliance_status');
                this.registerComponent('pg_alliance_status', $progressbar.singleProgressbar({
                    value: value,
                    max: max,
                    caption: s('%1% / %2%', value, max),
                    show_value: false
                }));
            },

            render: function () {
                this.renderTemplate(this.$el, 'domination_status', {
                    l10n: this.l10n
                });

                if (this.alliance_data) {
                    this.renderAllianceStatus();
                    this.registerAllianceStatusProgress();
                } else {
                    this.renderAllianceStatusEmpty();
                }

                this.renderWorldStatus();
                this.renderAndRegisterLastStandStatus();
            }
        });

    window.GameViews.DominationView = DominationView;

    return DominationView;

});
