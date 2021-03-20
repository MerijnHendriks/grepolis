define('events/missions/controllers/sub_windows/collect_reward', function () {
    'use strict';

    var CollectRewardView = require('events/missions/views/sub_windows/collect_reward'),
        GameControllers = require_legacy('GameControllers'),
        GameEvents = require('data/events'),
        GameDataMission = require('events/missions/data/mission');

    var CollectRewardController = GameControllers.SubWindowController.extend({
        view: null,

        initialize: function (options) {
            GameControllers.SubWindowController.prototype.initialize.apply(this, arguments);
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

        useReward: function () {
            this.mission_status_model.useReward(this.mission_status_model.getLevel());
            this.close();
        },

        stashReward: function () {
            this.mission_status_model.stashReward(this.mission_status_model.getLevel());
            this.close();
        },

        trashReward: function () {
            this.mission_status_model.trashReward(this.mission_status_model.getLevel());
            this.close();
        },

        getCurrentReward: function() {
            var level_id = this.mission_status_model.getLevel();

            var static_reward = GameDataMission.getRewardForLevel(level_id);

            if (!static_reward) {
                return this.extra_rewards_collection.getRewardForLevel(level_id);
            }

            return static_reward;
        },

        initializeView: function () {
            this.view = new CollectRewardView({
                controller: this,
                el: this.$el,
                skin: this.skin
            });
        },

        destroy: function () {
            // if the user closes the subwindow, also make sure the context menu is empty
            $('#context_menu').empty();
        }
    });

    return CollectRewardController;
});

