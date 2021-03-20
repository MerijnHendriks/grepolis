define('events/missions/controllers/sub_windows/rewards_list', function () {
    'use strict';

    var RewardsListView = require('events/missions/views/sub_windows/rewards_list'),
        GameControllers = require_legacy('GameControllers'),
        GameDataMission = require('events/missions/data/mission'),
        GameEvents = require('data/events');

    var RewardsListController = GameControllers.SubWindowController.extend({
        view: null,

        initialize: function (options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);
            this.skin = options.skin;
        },

        render: function ($content_node) {
            this.$el = $content_node;
            this.mission_status_model = this.getModel('mission_status');
            this.extra_rewards_collection = this.getCollection('missions_extra_rewards');

            this.initializeView();

            this.registerEventListeners();
            return this;
        },

        registerEventListeners: function () {
            this.stopObservingEvents();
            this.observeEvent(GameEvents.active_happening.reward.use, this.useReward.bind(this));
            this.observeEvent(GameEvents.active_happening.reward.stash, this.stashReward.bind(this));
            this.observeEvent(GameEvents.active_happening.reward.trash, this.trashReward.bind(this));
        },

        useReward: function (evt, data) {
            this.mission_status_model.useReward(data.id);
        },

        stashReward: function (evt, data) {
            this.mission_status_model.stashReward(data.id);
        },

        trashReward: function (evt, data) {
            this.mission_status_model.trashReward(data.id);
        },

        getRewards: function () {
            return GameDataMission.getAllRewards().concat(this.extra_rewards_collection.models.map(function(reward_model) {
                return reward_model.getRewardData();
            }));
        },

        getRewardForLevel: function (level_id) {
            var static_reward = GameDataMission.getRewardForLevel(level_id);

            if (!static_reward) {
                return this.extra_rewards_collection.getRewardForLevel(level_id);
            }

            return static_reward;
        },

        getCurrentLevel: function () {
            return this.mission_status_model.getLevel();
        },

        isRewardClaimed: function(level_id) {
            return this.mission_status_model.isRewardClaimed(level_id);
        },

        isRewardAvailable: function(level_id) {
            return level_id <= this.getCurrentLevel();
        },

        isRewardNew: function(level_id) {
            return level_id === this.getCurrentLevel();
        },

        isCurrentReward: function(level_id) {
            return level_id === this.getCurrentLevel() + 1;
        },

        initializeView: function () {
            this.view = new RewardsListView({
                controller: this,
                el: this.$el,
                skin: this.skin
            });
        },

        destroy: function () {

        }
    });

    return RewardsListController;
});

