/*globals DM, TM, JSON, NoGoldDialogWindowFactory, GameData */

define('events/missions/controllers/missions', function (require) {
    var MissionsController,
        MissionsView = require('events/missions/views/missions'),
        MissionRunningView = require('events/missions/views/mission_running'),
        SubWindowSendUnits = require('events/missions/controllers/sub_windows/send_units'),
        GameControllers = window.GameControllers,
        MISSION_SUCCESS_STATE = require('events/missions/enums/mission_success'),
        Timestamp = require('misc/timestamp'),
        ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
        MissionsHelper = require('events/missions/helpers/missions'),
        BenefitHelper = require('helpers/benefit'),
        SubWindowMissionResult = require('events/missions/controllers/sub_windows/mission_result'),
        REPORT_ARRIVED_TIMER = 'mission_report_arrived_timer',
        ANIMATIONS = require('events/missions/enums/animations'),
        CollectedItemsIndicator = require('features/collected_items/controllers/collected_items_indicator'),
        MAX_SUCCESS_CHANCE = 100;

    MissionsController = GameControllers.TabController.extend({
        view: null,

        initialize: function () {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        renderPage: function () {
            this.player_heroes_collection = this.getCollection('player_heroes');
            this.towns_collection = this.getCollection('towns');
            this.missions_collection = this.getCollection('missions');
            this.mission_status_model = this.getModel('mission_status');
            this.player_gods_model = this.getModel('player_gods');
            this.mission_report_model = this.getModel('mission_report');
            this.missions_player_army_model = this.getModel('missions_player_army');
            this.missions_unit_data_model = this.getModel('missions_unit_data');

            var l10n_event = DM.getl10n(this.getMissionsSkin()).missions;
            this.l10n = $.extend(true, this.l10n, l10n_event);
            this.mission_report_arrived = false;

            this.prev_mission_ids = [];

            this.setWindowTitle(this.l10n.window_title);

            if (this.missions_collection.length === 0) {
                this.missions_collection.reFetch(this.renderViewByMissionState.bind(this));
            }
            else {
                this.renderViewByMissionState();
            }

            return this;
        },

        renderViewByMissionState: function () {
            this.destroyView();
            this.renderCollectedItemsIndicator();
            if (this.missions_collection.isMissionRunning()) {
                this.initializeMissionRunningView();
                if (this.mission_report_model.getRewards().length) {
                    this.openMissionReport();
                }
            } else {
                this.initializeMissionListView();
            }

            this.getController('collected_units').renderPage();
        },

        renderCollectedItemsIndicator: function () {
            this.unregisterController('collected_units');
            this.registerController('collected_units', new CollectedItemsIndicator({
                parent_controller: this,
                settings: {
                    items: this.missions_player_army_model.getUnitPacksCollected(),
                    items_count: this.missions_player_army_model.getUnitPacksCollectedCount(),
                    l10n: this.l10n.collected_items_indicator,
                    tooltip: {
                        css_classes: this.getMissionsSkin()
                    }
                }
            }));
        },

        destroyView: function () {
            if (this.view !== null) {
                this.view._destroy();
                this.view = null;
            }
        },

        initializeMissionRunningView: function () {
            this.view = new MissionRunningView({
                controller: this,
                el: this.$el,
                skin: this.getMissionsSkin()
            });

            this.registerEventListeners();
            this.registerEndTimer();
        },

        initializeMissionListView: function () {
            this.view = new MissionsView({
                controller: this,
                el: this.$el
            });

            this.registerEventListeners();
            this.registerPlayerArmyEventListeners();
        },

        registerEventListeners: function () {
            this.stopListening();

            this.missions_collection.onMissionAddRemove(this, this.renderViewByMissionState.bind(this));
            this.mission_status_model.onChange(this, this.renderViewByMissionState.bind(this));
            this.mission_report_model.onChange(this, this.openMissionReport.bind(this));

            this.missions_player_army_model.onUnitPacksCollectedCountChange(this, function () {
                this.getController('collected_units').reRender({
                    items: this.missions_player_army_model.getUnitPacksCollected(),
                    items_count: this.missions_player_army_model.getUnitPacksCollectedCount()
                });
            });
        },

        registerPlayerArmyEventListeners: function () {
            this.missions_player_army_model.offUnitsChange(this);
            this.missions_player_army_model.onUnitsChange(this, this.view.renderUnits.bind(this.view));
        },

        registerEndTimer: function () {
            var end_time = this.getRunningMission().getEndTime();
            if (end_time) {
                var interval = (end_time - Timestamp.now()) * 1000;
                this.unregisterTimer('mission_finish_timer');
                this.registerTimerOnce('mission_finish_timer', interval, this.getMissionReport.bind(this));
            }
        },

        selectMission: function (mission) {
            this.view.renderDetails(mission);
        },

        sendUnits: function(mission) {
            var controller = new SubWindowSendUnits({
                l10n: this.l10n.send_units,
                window_controller: this,
                mission: mission,
                window_skin: this.getMissionsSkin(),
                templates: {
                    send_units: this.getTemplate('send_units'),
                    unit_picker: this.getTemplate('unit_picker')
                },
                collections: {
                    player_heroes: this.player_heroes_collection,
                    towns: this.towns_collection
                },
                models: {
                    player_gods: this.player_gods_model,
                    missions_player_army: this.missions_player_army_model,
                    missions_unit_data: this.missions_unit_data_model
                },
                cm_context: {
                    main: this.getMainContext(),
                    sub: 'send_units'
                }
            });

            this.openSubWindow({
                title: this.l10n.send_units.title,
                controller: controller,
                skin_class_names: 'classic_sub_window'
            });
        },

        getMissionsSkin: function() {
            return BenefitHelper.getBenefitSkin();
        },

        getMissions: function () {
            return this.missions_collection.getMissions();
        },

        getMissionReport: function() {
            this.showLoading();
            TM.unregister(REPORT_ARRIVED_TIMER);
            if (!this.mission_report_arrived) {
                // if the daemon is a bit slower or delayed we will need to re-trigger a refetch to get the report data
                TM.register(REPORT_ARRIVED_TIMER, 5000, function() {
                    if (this.mission_report_model) {
                        this.mission_report_model.reFetch();
                    }
                }.bind(this), {});
            }
        },

        getSwapMissionCost: function() {
            return this.mission_status_model.getSwapMissionCost();
        },

        getNewMission: function(mission_id, mission_swap_cost) {
            if (this.getPlayerLedger().getGold() < mission_swap_cost) {
                NoGoldDialogWindowFactory.openWindow('missions_swap_mission');
                return;
            }
            ConfirmationWindowFactory.openConfirmationSwapMissionWindow(mission_swap_cost, function () {
                this.showLoading();

                this.missions_collection.getNewMission(mission_id, mission_swap_cost, function() {
                    this.hideLoading();
                }.bind(this));
            }.bind(this));
        },

        startMission: function (mission_id, units) {
            this.missions_collection.startMission(mission_id, units, function () {
                this.closeSubWindow();
                this.renderViewByMissionState();
            }.bind(this));
        },

        getl10n: function () {
            return this.l10n;
        },

        getRunningMission: function () {
            return this.missions_collection.first();
        },

        getMissionBoostCost: function () {
            return this.mission_status_model.getMissionBoostCost();
        },

        isFreeMissionBoost: function () {
            return this.getMissionBoostCost() === 0;
        },

        isMissionBoostTimerRunning: function () {
            return this.mission_status_model.getMissionBoostCooldownTime() > 0;
        },

        getMissionBoostProgressValues: function () {
            return {
                value: this.mission_status_model.getMissionBoostCooldownTime() - Timestamp.now(),
                max: this.mission_status_model.getMissionBoostCooldownMinutes() * 60,
                timestamp_end: this.mission_status_model.getMissionBoostCooldownTime()
            };
        },

        boostMission: function () {
            if (this.isFreeMissionBoost()) {
                this.missions_collection.boostMission(this.getRunningMission().getId(), this.getMissionBoostCost());
            }
            else {
                var mission_boost_cost = this.getMissionBoostCost();
                if (this.getPlayerLedger().getGold() < mission_boost_cost) {
                    NoGoldDialogWindowFactory.openWindow('missions_boost_mission');
                    return;
                }
                ConfirmationWindowFactory.openConfirmationBoostMissionWindow(mission_boost_cost, function() {
                    this.missions_collection.boostMission(this.getRunningMission().getId(), mission_boost_cost);
                }.bind(this));
            }
        },

        getPlayerLedger : function() {
            return this.getModel('player_ledger');
        },

        getEventEndAt: function() {
            return MissionsHelper.getEventEndAt();
        },

        openMissionReport: function () {
            if (!this.mission_report_model.getRewards().length) {
                return;
            }

            this.mission_report_arrived = true;
            this.hideLoading();
            TM.unregister(REPORT_ARRIVED_TIMER);
            var l10n = this.getl10n();

            var controller = new SubWindowMissionResult({
                l10n: l10n,
                window_controller: this,
                skin: this.getMissionsSkin(),
                mission_result: this.mission_report_model.getMissionSuccess() ? MISSION_SUCCESS_STATE.SUCCESS : MISSION_SUCCESS_STATE.FAILURE,
                rewards: this.mission_report_model.getRewards().map(function (reward) {
                    return JSON.parse(reward);
                }),
                templates: {
                    mission_result: this.getTemplate('mission_result')
                },
                cm_context: {
                    main: this.getMainContext(),
                    sub: 'sub_window_mission_result'
                }
            });

            this.openSubWindow({
                title: this.mission_report_model.getTitle() ? this.mission_report_model.getTitle() + ': ' + l10n.mission_result_subwindow.mission_report : l10n.mission_result_subwindow.mission_report,
                controller: controller,
                skin_class_names: 'classic_sub_window'
            });
        },

        markAsRead: function() {
            var data = {};

            data[ANIMATIONS.FADE_STEP] = this.mission_report_model.getMissionSuccess();
            data[ANIMATIONS.SHOW_COLLECT_REWARD_BOX] = this.mission_status_model.getSubLevel() === this.mission_status_model.getSubLevelsRequired();
            data[ANIMATIONS.ADD_POINTS] = this.mission_report_model.getRewards().map(function (reward) {
                return JSON.parse(reward);
            });

            this.getWindowModel().setData('animation_data', data);

            this.mission_report_model.markAsRead(function() {
                this.switchTab(0);
            }.bind(this));
        },

        setPreviousMissionIds: function(prev_mission_ids) {
            this.prev_mission_ids = prev_mission_ids;
        },

        getPreviousMissionIds: function() {
            return this.prev_mission_ids;
        },

        getPlayerArmy: function () {
            return this.missions_player_army_model;
        },

        getUnitData: function () {
            return this.missions_unit_data_model;
        },

        buyUnits: function (unit_id, amount, unit_name, estimated_cost) {
            ConfirmationWindowFactory.openConfirmationBuyEventUnitsWindow(amount, unit_name, estimated_cost, function () {
                this.showLoading();

                this.missions_player_army_model.buyUnits(unit_id, estimated_cost, function() {
                    this.hideLoading();
                }.bind(this));
            }.bind(this));
        },

        getSuccessChance: function (mission) {
            return Math.min(mission.getSuccessChance(), MAX_SUCCESS_CHANCE);
        },

        getMaxSuccessChance: function (mission) {
            return Math.min(mission.getMaxSuccessChance(), MAX_SUCCESS_CHANCE);
        },

        getGameUnitNamePlural: function (game_unit) {
            return GameData.units[game_unit].name_plural;
        }
    });

    return MissionsController;
});