/* global MM, GameHelpers */

define('features/questlog/controller/tutorial_quest', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var DetailView = require('features/questlog/views/questlog_detail');
    var Progressable = window.GameModels.Progressable;

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            var quest_collection = this.getQuestsCollection();

            this.stopListening();

            quest_collection.onQuestAdded(this, function () {
                this.parent_controller.reRenderIndex();
                this.openQuest(this.getFirstQuest().getId());
            }.bind(this));

            quest_collection.onQuestRemoved(this, function (quest) {
                this.parent_controller.reRenderIndex();

                if (quest.getId() === this.getActiveQuestId()) {
                    this.parent_controller.clearActiveQuestId();
                    this.detail_view.emptyView();
                    this.parent_controller.openQuest();
                }
            }.bind(this));

            quest_collection.onQuestStateChange(this, function (quest) {
                this.parent_controller.reRenderIndex();
                if (quest.getId() === this.getActiveQuestId() && !quest.isClosed()) {
                    this.detail_view.render();
                }
            });

            quest_collection.onQuestReadMarkChanged(this, function (quest) {
                this.parent_controller.renderQuestNewMarker(quest);
            }.bind(this));

            quest_collection.onQuestProgressChanged(this, function (quest) {
                this.parent_controller.registerQuestProgressbar(quest);
                if (quest.getId() === this.getActiveQuestId() && !quest.isClosed()) {
                    this.detail_view.render();
                }
            }.bind(this));
        },

        renderPage: function () {
            this.initializeView();
        },

        initializeView: function () {
            this.detail_view = new DetailView({
                controller: this,
                questlog_controller: this.parent_controller,
                el: this.$el
            });

            this.registerEventListeners();
        },

        getDecisionIds: function (progressables_ids) {
            var progressables_ids_without_brackets = progressables_ids.replace(/[\{\}]+/g, ''),
                single_ids = progressables_ids_without_brackets.split(',');
            return single_ids.map(function (id) {
                return parseInt(id, 10);
            });
        },

        getQuestsCollection: function () {
            return MM.getOnlyCollectionByName('Progressable');
        },

        /**
         * open the quest details on the right side
         * marks a quest as 'read'
         * and renders the detail view
         * @param {Number} quest_id
         */
        openQuest: function (quest_id, mark_as_read) {
            this.parent_controller.setActiveQuestId(quest_id);
            if (!this.detail_view) {
                this.initializeView();
            }

            if (mark_as_read) {
                this.markQuestAsRead(this.getActiveQuestId());
            }

            this.detail_view.reRender();
            this.parent_controller.renderActiveQuestMarker();
        },

        hasQuest: function (quest_id) {
            return this.getQuestsCollection().get(quest_id);
        },

        getActiveQuestModel: function () {
            return this.getQuestsCollection().getQuest(this.getActiveQuestId());
        },

        getActiveQuestId: function () {
            return this.parent_controller.getActiveQuestId();
        },

        /**
         * true, if a quest is unread
         * @param {number} quest_id
         * @return {Boolean}
         */
        isQuestTaggedAsNew: function (quest_id) {
            return this.getQuestsCollection().getQuest(quest_id).getRead() === false;
        },

        /**
         * true, if a quest is satisfied
         * @param {number} quest_id
         * @return {Boolean}
         */

        isQuestTaggedAsFinished: function (quest_id) {
            return this.getQuestsCollection().getQuest(quest_id).isSatisfied();
        },

        getFinishedQuest: function() {
            return this.getQuestsCollection().getFinishedQuests();
        },

        getNewQuest: function() {
            return this.getQuestsCollection().getNewQuests();
        },


        getFirstQuest: function () {
            return this.getQuestsCollection().getFirstModel();
        },

        getFirstRunningTaskIdForQuest: function (quest_id) {
            return this.getQuestsCollection().getQuest(quest_id).getFirstRunningTaskId();
        },

        /*
         * For quest with a single task the progress of the quest equals the task progress.
         *
         * For quests with multiple tasks the progress equals the progress
         * of the first _running_ task.
         */
        getPercentProgressForQuest: function (quest_id, task_id) {
            task_id = typeof task_id !== 'undefined' ? task_id : this.getFirstRunningTaskIdForQuest(quest_id);
            var quest = this.getQuestsCollection().getQuest(quest_id);

            return quest.getProgressForTaskId(task_id);
        },

        getRunningQuests: function (quests) {
            return quests.filter(function (quest) {
                return quest.isRunning() || quest.isSatisfied();
            });
        },

        collectReward: function () {
            this.getActiveQuestModel().closeQuest();
        },

        /**
         * mark the quest model as read
         * @param {Number} quest_id
         */

        markQuestAsRead: function (quest_id) {
            var quest = this.getQuestsCollection().getQuest(quest_id);

            if (quest) {
                quest.markAsRead();
            }
        },

        showArrows: function () {
            return this.getModel('player_settings').tutorialArrowActivatedByDefault();
        },

        /**
         * check if quest model has game helpers active (arrows)
         *
         * @param {TutoiralQuest} quest
         * @return {Boolean}
         */
        hasGameHelpers: function (quest) {
            return GameHelpers.hasSet(quest.getSetId());
        },

        /**
         * true, when Arrows are shown
         *
         * @param {TutoiralQuest} quest
         * @return {Boolean}
         */
        areGameHelpersShown: function (quest) {
            return GameHelpers.isSetShown(quest.getSetId());
        },

        /**
         * Shows game helpers for the quest.
         * If Helpers are not defined - adds them to the GameHelper;
         * if they are - force-displays them
         *
         * @param {TutorialQuest} quest
         */
        showQuestHelpers: function (quest) {
            var group_id = quest.getGroupId(),
                set_id = quest.getSetId(),
                quest_collection = this.getQuestsCollection();

            if (GameHelpers.hasSet('start_tutorial')) {
                GameHelpers.remove('start_tutorial');
            }

            // to avoid duplicate arrows remove the GameHelpers
            // for everything but the current quest
            quest_collection.forEach(function (other_model) {
                var other_model_id = other_model.getSetId();

                if (other_model_id !== set_id) {
                    GameHelpers.remove(other_model_id);
                }
            });

            if (!this.hasGameHelpers(quest)) {
                GameHelpers.add({
                    setId: set_id,
                    groupId: group_id,
                    steps: quest.getSteps()
                });
            }

            GameHelpers.prioritizeInGroup(set_id);
            GameHelpers.resetStepsDisplayed(set_id, group_id);
            quest.setStepsShownStatus(true);
        },

        /**
         * true, when we shall activate the arrows
         * @param {TutorialQuest} quest
         * @returns {Boolean}
         */
        shouldHelpersActivate: function (quest) {
            return (this.hasGameHelpers(quest) && !this.areGameHelpersShown(quest)) ||
                (quest.isRunning() && quest.hasSteps() && !this.hasGameHelpers(quest));
        },

        /**
         * remove the arrows
         * @param {TutorialQuest} quest
         */
        removeQuestHelpers: function (quest) {
            GameHelpers.remove(Progressable.ID_PREFIX + quest.get('id'));
            quest.setStepsShownStatus(false);
        },

        destroy: function () {
            if (this.detail_view) {
                this.detail_view._destroy();
                this.markQuestAsRead(this.getActiveQuestId());
            }
        }
    });
});

