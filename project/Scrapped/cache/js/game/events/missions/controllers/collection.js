define('events/missions/controllers/collection', function (require) {

    var MissionsView = require('events/missions/views/collection'),
        RewardSubwindowController = require('events/missions/controllers/sub_windows/collect_reward'),
        RewardsListController = require('events/missions/controllers/sub_windows/rewards_list'),
        OverallRankingSubController = require('events/missions/controllers/sub_windows/overall_ranking'),
        GameControllers = window.GameControllers,
        GameDataMission = require('events/missions/data/mission'),
        MissionTutorial = require('events/missions/helpers/tutorial'),
        SCREEN_STATE = require('events/missions/enums/mission_states'),
        ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory'),
        MissionsHelper = require('events/missions/helpers/missions'),
        BenefitHelper = require('helpers/benefit'),
        ANIMATIONS = require('events/missions/enums/animations'),
        Timestamp = require_legacy('Timestamp'),
        NoGoldDialogWindowFactory = require_legacy('NoGoldDialogWindowFactory');

    return GameControllers.TabController.extend({
        view: null,
        evaluation_active : false,

        initialize: function () {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        renderPage: function () {
            if (this.hasCompletedMissionReport()) {
                this.switchTab(1);
                return;
            }

            this.mission_status_model = this.getModel('mission_status');
            this.missions_collection = this.getCollection('missions');
            this.ranking_player_model = this.getModel('missions_player_ranking');
            this.extra_rewards_collection = this.getCollection('missions_extra_rewards');
            this.ranking_model = this.getModel('missions_ranking');
            this.mission_report_model = this.getModel('mission_report');

            this.initializeView();
            this.registerEventListeners();

            if (!MissionTutorial.hasBeenCompleted()) {
                MissionTutorial.showTutorial(this, this.enableDisableTabs.bind(this));
            }

            return this;
        },

        initializeView: function () {
            this.view = new MissionsView({
                controller: this,
                el: this.$el,
                skin: this.getMissionsSkin()
            });
        },

        enableDisableTabs: function() {
            var index_tab = 1;
            if (this.getScreenState() !== SCREEN_STATE.RUNNING) {
                this.disableTab(index_tab);
            } else {
                this.enableTab(index_tab);
            }
        },

        getScreenState: function () {
            if (this.getCooldownTime() > 0) {
                return SCREEN_STATE.COOLDOWN;
            } else if (this.getSubLevel() >= this.getMaxSubLevel()) {
                return SCREEN_STATE.COLLECT_REWARD;
            }

            return SCREEN_STATE.RUNNING;
        },

        registerEventListeners: function () {
            var ReportCallback = function () {
                if (this.mission_report_model.getRewards().length) {
                    this.switchTab(1);
                }
            }.bind(this);

            this.stopListening();
            this.mission_status_model.onChange(this, this.view.reRender.bind(this.view));
            this.mission_report_model.onChange(this, ReportCallback);

            this.ranking_model.onRankingAccessibilityChange(this, this.reRenderRanking);
        },

        reRenderRanking: function() {
            this.view.registerRankingBox();
        },

        reRenderRankingRewards: function() {
            this.view.registerRankingRewards();
        },

        isRankingEnabled: function() {
            return this.ranking_model.isRankingEnabled();
        },

        isEvaluationActive : function() {
            return this.evaluation_active;
        },

        setEvaluation : function(value) {
            this.evaluation_active = value;
        },

        startEvaluation : function() {
            this.setEvaluation(true);
            this.reRenderRanking();
            this.refetchRanking();
        },

        stopEvaluation : function() {
            this.setEvaluation(false);
            this.reRenderRanking();
            this.reRenderRankingRewards();
        },

        refetchRanking: function () {
            if (this.isEvaluationActive() ||  this.getDailyRankingEndTimestamp() < Timestamp.now()) {
                this.ranking_player_model.forceUpdate({success: this.stopEvaluation.bind(this)});
            }
        },

        skipLevelUpCooldown: function () {
            var skip_cooldown_cost = this.mission_status_model.getRemoveLevelUpCooldownCost();

            if (this.getModel('player_ledger').getGold() < skip_cooldown_cost) {
                NoGoldDialogWindowFactory.openWindow('missions_skip_level_up_cooldown');
                return;
            }

            ConfirmationWindowFactory.openConfirmationSkipCooldownWindow(skip_cooldown_cost, function () {
                this.setHideCooldownBoxAnimation();
                this.showLoading();
                this.mission_status_model.skipLevelUpCooldown(function () {
                    this.hideLoading();
                }.bind(this));
            }.bind(this));
        },

        levelUp: function (callback) {
            this.mission_status_model.levelUp(callback);
        },

        getMissionsSkin: function () {
            return BenefitHelper.getBenefitSkin();
        },

        getLevel: function () {
            return this.mission_status_model.getLevel();
        },

        getMaxLevel: function ()  {
            return this.mission_status_model.getMaximumLevel();
        },

        getSubLevel: function () {
            if (this.getCooldownTime() > 0) {
                return this.getMaxSubLevel();
            }
            return this.mission_status_model.getSubLevel();
        },

        getMaxSubLevel: function () {
            return this.mission_status_model.getSubLevelsRequired();
        },

        getCooldownTime: function () {
            return this.mission_status_model.getCooldownTime();
        },

        getCooldownDuration: function () {
            return this.mission_status_model.getLevelUpCooldownMinutes() * 60;
        },

        getCurrentReward: function () {
            var level = this.getLevel() + 1;

            var static_reward = GameDataMission.getRewardForLevel(level);

            if (!static_reward) {
                return this.extra_rewards_collection.getRewardForLevel(level);
            }

            return static_reward;
        },

        getOverallRankingEndTimestamp: function () {
            return this.ranking_model.getRankingTimeout();
        },

        getOverallRankingPlayers: function() {
            return this.ranking_player_model.getOverallRankingPlayers();
        },

        getOverallRankingRewards: function () {
            return this.ranking_model.getOverallRankingRewards();
        },

        openOverallRankingSubWindow: function () {
            var l10n = this.l10n;

            var controller = new OverallRankingSubController({
                l10n : l10n,
                window_controller : this,
                skin : this.getMissionsSkin(),
                models: {
                    ranking_model : this.ranking_model
                },
                templates : {
                    overall_ranking : this.getTemplate('overall_ranking')
                },
                cm_context : {
                    main : this.getMainContext(),
                    sub : 'sub_window_overall_ranking'
                }
            });

            controller.setOnAfterClose(this.enableDisableTabs.bind(this));

            this.openSubWindow({
                title: l10n.overall_ranking.title,
                controller : controller,
                skin_class_names : 'classic_sub_window'
            });
        },

        openRewardsListSubwindow: function () {
            var l10n = this.getl10n();

            var controller = new RewardsListController({
                l10n: l10n,
                window_controller: this,
                skin: this.getMissionsSkin(),
                models: {
                    mission_status: this.mission_status_model
                },
                collections: {
                    missions_extra_rewards: this.extra_rewards_collection
                },
                templates: {
                    rewards_list: this.getTemplate('rewards_list'),
                    rewards_list_reward: this.getTemplate('rewards_list_reward')
                },
                cm_context: {
                    main: this.getMainContext(),
                    sub: 'sub_window_rewards_list'
                }
            });

            controller.setOnAfterClose(this.enableDisableTabs.bind(this));

            this.openSubWindow({
                title: l10n.rewards_list_subwindow.title,
                controller: controller,
                skin_class_names: 'classic_sub_window'
            });
        },

        collectReward: function () {
            this.levelUp(function () {
                var missions_collection = this.getCollection('missions');
                if (missions_collection) {
                    missions_collection.unregisterFromModelManager();
                }

                this.openCollectRewardSubwindow();
            }.bind(this));
        },

        openCollectRewardSubwindow: function () {
            var l10n = this.getl10n();

            var controller = new RewardSubwindowController({
                l10n: l10n,
                window_controller: this,
                skin: this.getMissionsSkin(),
                models: {
                    mission_status: this.mission_status_model
                },
                collections: {
                    missions_extra_rewards: this.extra_rewards_collection
                },
                templates: {
                    collect_reward: this.getTemplate('collect_reward')
                },
                cm_context: {
                    main: this.getMainContext(),
                    sub: 'sub_window_collect_reward'
                }
            });

            controller.setOnAfterClose(this.enableDisableTabs.bind(this));

            this.openSubWindow({
                title: l10n.collect_reward_subwindow.title(this.getLevel()),
                controller: controller,
                skin_class_names: 'classic_sub_window'
            });

        },

        getEventEndAt: function () {
            return MissionsHelper.getEventEndAt();
        },

        getSkipCooldownCost: function() {
            return this.mission_status_model.getRemoveLevelUpCooldownCost();
        },

        getAnimationData: function () {
            var data = this.window_model.getData('animation_data') || {};
            this.window_model.setData('animation_data', {});

            return data;
        },

        setHideCooldownBoxAnimation: function () {
            var data = this.getAnimationData();

            data[ANIMATIONS.HIDE_COOLDOWN_BOX] = true;
            data[ANIMATIONS.FADE_STEP] = true;

            this.window_model.setData('animation_data', data);
        },

        hasCompletedMissionReport: function () {
            return this.getModel('mission_report').getMissionSuccess() !== null;
        }
    });
});