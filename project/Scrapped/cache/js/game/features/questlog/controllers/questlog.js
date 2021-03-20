/* global WM, us, require_legacy, debug */

define('features/questlog/controllers/questlog', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var View = require('features/questlog/views/questlog_base');
    var IndexView = require('features/questlog/views/questlog_index');

    var IslandQuestController = require('features/questlog/controllers/island_quest');
    var TutorialQuestController = require('features/questlog/controller/tutorial_quest');

    var QUESTS = require('enums/quests');

    var folded_categories = [];
    var CATEGORIES = require('enums/questlog_categories');
    var GameEvents = require('data/events');

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            this.stopListening();
            this.stopObservingEvents();

            this.getIslandQuestController().registerEventListeners();

            this.observeEvent(GameEvents.window.maximize, function () {
                this.reRenderIndex();
            }.bind(this));
        },

        renderPage: function () {
            this.initializeView();
        },

        initializeView: function () {
            this.view = new View({
                controller: this,
                el: this.$el
            });

            this.index_view = new IndexView({
                controller: this,
                island_quest_controller: this.getIslandQuestController(),
                tutorial_quest_controller: this.getTutorialQuestController(),
                el: this.$el.find('.questlog_index')
            });

            this.registerEventListeners();

            this.openQuest();
            this.resetWindowArguments();
        },

        resetWindowArguments: function() {
            this.getWindowModel().setArguments({
                quest_id: undefined,
                quest_type: undefined
            });
        },

        openQuest: function() {
            // open a quest
            var args = this.getWindowModel().getArguments(),
                quest_id = args.quest_id,
                quest_type = args.quest_type,
                has_tutorial_quests = this.tutorial_controller.getFirstQuest() !== null,
                has_island_quests = this.island_controller.getIslandQuestsDecisionCollection().length > 0,
                finished_tutorial_quest = this.tutorial_controller.getFinishedQuest(),
                finished_island_quest = this.island_controller.getFinishedQuest(),
                new_tutorial_quest = this.tutorial_controller.getNewQuest(),
                new_island_quest = this.island_controller.getNewQuest();

            /* TODO undefined behavior
             if (!has_island_quests && !has_tutorial_quests) {
             this.closeWindow();
             return;
             }
             */

            /**
             * Opening logic:
             * 1. When a quest id is given open this quest (recheck type)
             * 2. Completed Open Quest
             * 3. Completed Island Quest
             * 4. New Open Quest
             * 5. New Island Quest
             * 6. Top of the list Open Quest
             * 7. Top of the list Island Quest
             */
            if (has_tutorial_quests && (!quest_type || quest_type === QUESTS.QUEST) &&
                quest_id && this.tutorial_controller.hasQuest(quest_id)) {
                this.openTutorialQuest(quest_id);
            } else if (has_island_quests && (!quest_type || quest_type === QUESTS.ISLAND_QUEST) &&
                quest_id && this.island_controller.hasQuest(quest_id)) {
                this.openIslandQuest(quest_id);
            } else if (has_tutorial_quests && finished_tutorial_quest.length) {
                this.openTutorialQuest(finished_tutorial_quest[0].getId());
            } else if (has_island_quests && finished_island_quest.length) {
                this.openIslandQuest(finished_island_quest[0].getId());
            } else if (has_tutorial_quests && new_tutorial_quest.length) {
                this.openTutorialQuest(new_tutorial_quest[0].getId());
            } else if (has_island_quests && new_island_quest.length) {
                this.openIslandQuest(new_island_quest[0].getId());
            } else if (has_tutorial_quests) {
                this.openTutorialQuest(this.tutorial_controller.getFirstQuest().getId());
            } else if (has_island_quests) {
                this.openIslandQuest(this.island_controller.getFirstQuestDecisionId());
            }
        },

        openIslandQuest: function (decision_id) {
            var iq_controller = this.getIslandQuestController(),
                decision = iq_controller.getIslandQuestsDecisionCollection().get(decision_id);

            if (decision) {
                var quest_id = us.first(iq_controller.getQuestFromDecision(decision)).getId();
                this.getIslandQuestController().openQuest(quest_id);
            } else {
                debug('Can not open island quest with id ' + decision_id + ': no decisions found');
            }
        },

        openTutorialQuest: function (quest_id) {
            this.getTutorialQuestController().openQuest(quest_id);
        },

        reRenderIndex: function () {
            if (this.index_view) {
                this.index_view.render();
            }
        },

        renderQuestNewMarker: function (quest, category) {
            if (this.index_view) {
                this.index_view.renderQuestNewMarker(quest.getId(), category);
            }
        },

        registerQuestProgressbar: function (quest) {
            if (this.index_view) {
                this.index_view.registerQuestProgressbar(quest);
            }
        },

        registerIslandQuestProgressBar: function (state, decisions, quest) {
            if (this.index_view) {
                this.index_view.registerIslandQuestProgressBar(state, decisions, quest);
            }
        },

        renderActiveQuestMarker: function () {
            if (this.index_view) {
                this.index_view.renderActiveQuestMarker();
            }
        },

        // Lazy create a sub-controller
        getIslandQuestController: function () {
            if (!this.island_controller) {
                this.island_controller = new IslandQuestController({
                    el: this.$el.find('.questlog_detail .js-scrollbar-content'),
                    parent_controller: this,
                    collections : {
                        units : this.getCollection('units')
                    }
                });
                this.registerController('island_controller', this.island_controller);
            }

            return this.island_controller;
        },

        getTutorialQuestController: function () {
            if (!this.tutorial_controller) {
                this.tutorial_controller = new TutorialQuestController({
                    el: this.$el.find('.questlog_detail .js-scrollbar-content'),
                    parent_controller: this
                });
                this.registerController('tutorial_controller', this.tutorial_controller);
            }
            return this.tutorial_controller;
        },

        setActiveQuestId: function (quest_id) {
            this.active_quest_id = quest_id;
        },

        getActiveQuestId: function () {
            return this.active_quest_id;
        },

        clearActiveQuestId: function () {
            this.active_quest_id = null;
        },

        getCategoriesInOrder: function () {
            return [CATEGORIES.DEFAULT_CATEGORY, CATEGORIES.ISLAND_QUESTS];
        },

        /**
         * returns all quests for a category, includes viable, closed, aborted etc.
         * You want to use getRunningQuestsForCategory
         *
         * @param {String} category
         * @returns {[TutorialQuest]}
         */
        getQuestsForCategory: function (category) {
            var quests_collection = this.tutorial_controller.getQuestsCollection(),
                island_quests = this.island_controller.getIslandQuestsCollection();

            switch (category) {
                case CATEGORIES.DEFAULT_CATEGORY:
                    return quests_collection.models;
                case CATEGORIES.ISLAND_QUESTS:
                    return island_quests.models;
                default:
                    return [];
            }
        },

        getQuestsForCategoryInOrder: function (category) {
            var quests = this.getRunningQuestsForCategory(category);
            if (category !== CATEGORIES.ISLAND_QUESTS) { //TODO write check for island quests
                quests.sort(this.tutorial_controller.getQuestsCollection().comparator);
            }
            return quests;
        },

        /**
         * returns 'open' / 'close' for a given category
         * @param {string} category
         * @return {String} open || close
         */
        getFoldingStateForCategory: function (category) {
            return folded_categories.indexOf(category) !== -1 ? 'close' : 'open';
        },

        /**
         * returns the running or satisfied quests for a given category
         * @param {String} category
         * @return {[TutorialQuest]}
         */
        getRunningQuestsForCategory: function (category) {
            var quests = this.getQuestsForCategory(category),
                running_quests;

            switch (category) {
                case CATEGORIES.ISLAND_QUESTS:
                    running_quests = this.island_controller.getRunningQuestsForIslandQuests(quests);
                    break;
                default:
                    running_quests = this.tutorial_controller.getRunningQuests(quests);
                    break;
            }
            return running_quests;
        },

        getRunningQuestsCountForCategory: function (category) {
            return this.getRunningQuestsForCategory(category).length;
        },

        /**
         * open or closes a category state (saved in closure variable to survive window close actions)
         * @param {string} category
         */
        toggleFoldingStateForCategory: function (category) {
            if (folded_categories.indexOf(category) !== -1) {
                folded_categories.splice(folded_categories.indexOf(category), 1);
            } else {
                folded_categories.push(category);
            }
        },

        /**
         * true, if a category has unread = new quests
         * since collections does not know about categories, it is filtered here
         * @param {String} category
         * @return {Boolean}
         */
        hasCategoryNewQuests: function (category) {
            if (category === CATEGORIES.ISLAND_QUESTS) {
                var main_quests = this.getQuestsForCategory(category);
                return main_quests.some(function (quest) {
                    return this.getIslandQuestController().isQuestTaggedAsNew(quest.getId());
                }.bind(this));
            }

            var quests = this.getQuestsForCategory(category);

            return quests.some(function (quest) {
                return quest.getRead() === false;
            }.bind(this));
        },

        /**
         * true, if a category has finished quests
         * since collections does not know about categories, it is filtered here
         * @param {String} category
         * @return {Boolean}
         */
        hasCategoryFinishedQuests: function (category) {
            if (category === CATEGORIES.ISLAND_QUESTS) {
                var main_quests = this.getQuestsForCategory(category);
                return main_quests.some(function (quest) {
                    return this.getIslandQuestController().isQuestTaggedAsFinished(quest.getId());
                }.bind(this));
            }

            var quests = this.getQuestsForCategory(category);
            return quests.some(function (quest) {
                return this.tutorial_controller.isQuestTaggedAsFinished(quest.getId());
            }.bind(this));
        },

        hasCategoryAnyQuests: function (category) {
            if (category === CATEGORIES.ISLAND_QUESTS) {
                return this.getIslandQuestController().getIslandQuestsCollection().getActiveQuestsCount();
            }

            return this.getTutorialQuestController().getQuestsCollection().length > 0;
        },

        clearView: function (quest_model) {
            WM.minimizeAllWindows(true);
            this.closeWindow();
        },

        getCurrentTown : function() {
            return this.getCollection('towns').getCurrentTown();
        },

        destroy: function () {
            if (this.index_view) {
                this.index_view._destroy();
            }
        }
    });
});

