/* global us, Game, require_legacy */
define('features/questlog/controllers/island_quest', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers');

    var View = require('features/island_quests/views/questlog_detail');
    var QUESTS = require('enums/quests');
    var CATEGORIES = require('enums/questlog_categories');
    var TooltipFactory = require('factories/tooltip_factory');
    var Timestamp = require('misc/timestamp');
    var GameEvents = require('data/events');
    var TownGroups = require('collections/town/town_groups');
    var TownGroupTowns = require('collections/town/town_group_towns');
    var TownGroupTown = require('models/town/town_group_town');
    var TownSwitch = require('helpers/town_switch');
    var IQ_TOWN_GROUP_ID = 'island_quest';

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
        },

        registerEventListeners: function () {
            var quest_collection = this.getIslandQuestsCollection(),
                decision_collection = this.getIslandQuestsDecisionCollection();

            this.stopListening();
            this.stopObservingEvents();

            quest_collection.onQuestChange(this, function (quest) {
                us.defer(this.parent_controller.reRenderIndex.bind(this.parent_controller));

                // case: remove quest from index
                if (!quest.getProgressablesId()) {
                    if (quest.getId() === this.parent_controller.getActiveQuestId()) {
                        this.view.emptyView();
                    }
                    return;
                }

                // case : half done update of data
                if (this.getDecisionsForIslandQuest(quest).length === 0) {
                    return;
                }

                if (quest.getId() === this.parent_controller.getActiveQuestId()) {
                    us.defer(this.openQuest.bind(this, this.parent_controller.getActiveQuestId()));
                }
            }.bind(this));

            decision_collection.onQuestReadMarkChanged(this, function (decision) {
                var quest = this.getQuestFromDecision(decision);
                if (!quest.length) {
                    return;
                }
                this.parent_controller.renderQuestNewMarker(quest[0], CATEGORIES.ISLAND_QUESTS);
            }.bind(this));

            decision_collection.onQuestProgressChanged(this, function (decision) {
                var quest = this.getQuestFromDecision(decision);
                if (!quest.length) {
                    return;
                }
                var decisions = this.getDecisionsForIslandQuest(us.first(quest)),
                    state = this.getIslandQuestState(decisions);

                us.defer(function () {
                    this.parent_controller.registerIslandQuestProgressBar(state, decisions, us.first(quest));
                    this.view.render();
                }.bind(this));
            }.bind(this));

            decision_collection.onQuestAdded(this, function() {
                us.defer(this.parent_controller.reRenderIndex.bind(this.parent_controller));
            }.bind(this));

            this.observeEvent(GameEvents.window.island_quest.reward.use, function () {
                this.claimReward(Game.constants.island_quest.reward.reward_use);
            }.bind(this));

            this.observeEvent(GameEvents.window.island_quest.reward.stash, function () {
                this.claimReward(Game.constants.island_quest.reward.reward_stash);
            }.bind(this));

            this.observeEvent(GameEvents.window.island_quest.reward.trash, function () {
                this.claimReward(Game.constants.island_quest.reward.reward_trash);
            }.bind(this));

            this.observeEvent(window.GameEvents.town.town_switch, function() {
                if (this.view && this.getActiveQuestModel()) {
                    this.view.render();
                }
            }.bind(this));
        },

        renderPage: function () {
            this.initializeView();
        },

        initializeView: function () {
            this.view = new View({
                controller: this,
                questlog_controller: this.parent_controller,
                el: this.$el
            });

            this.registerEventListeners();
        },

        getDecisionIds: function (progressables_ids) {
            if (!progressables_ids) {
                return [];
            }

            var progressables_ids_without_brackets = progressables_ids.replace(/[{}]+/g, ''),
                single_ids = progressables_ids_without_brackets.split(',');

            return single_ids.map(function (id) {
                return parseInt(id, 10);
            });
        },

        getQuestIdFromDecisionId: function(decision_id) {
            var quests = this.getIslandQuestsCollection(),
                quest_with_specific_decision_id = quests.filter(function(quest) {
                    var progressable_ids = quest.getProgressablesId(),
                        decisions = progressable_ids !== null ? this.getDecisionIds(progressable_ids) : [];

                    return decisions.indexOf(decision_id) > 0;
                }.bind(this));

            return quest_with_specific_decision_id.length > 0 ? us.first(quest_with_specific_decision_id).getId() : 0;
        },

        getUnitRuntimes: function (town_id, callback) {
            return this.getIslandQuestsDecisionCollection().unitRuntimes(town_id, callback);
        },

        sendUnits: function (town_id, units, movement_type, attack_type, callback) {
            return this.getIslandQuestsDecisionCollection().sendUnits(town_id, units, movement_type, attack_type, callback);
        },

        challengeActiveDecision: function () {
            var decision = us.first(this.getDecisionsForIslandQuest(this.getActiveQuestModel()));
            if (decision) {
                // we do not pass Game.townId directly, because the request can be faked by player
                // instead we populate the parameter as true and let the api handle it
                return this.getIslandQuestsDecisionCollection().challenge({
                    current_town_id: true
                }, decision.getProgressableId(), function () {
                    this.parent_controller.closeSubWindow();
                }.bind(this));
            }
        },

        getIslandQuestsCollection: function () {
            return this.getCollection('island_quest_player_relations');
        },

        getIslandQuestsDecisionCollection: function () {
            return this.getCollection('island_quests');
        },

        getFinishedQuest: function() {
            var quest_collection = this.getIslandQuestsCollection(),
                finished_quests = [];

            quest_collection.forEach(function(quest) {
                if (!quest.getProgressablesId()) {
                    return;
                }
                var decisions = this.getDecisionsForIslandQuest(quest);
                decisions.forEach(function (decision) {
                    if (decision.getState() === QUESTS.SATISFIED) {
                        finished_quests.push(decision);
                    }
                });
            }.bind(this));
            return finished_quests;
        },

        getNewQuest: function() {
            var quest_collection = this.getIslandQuestsCollection(),
                new_quests = [];
            quest_collection.forEach(function(quest) {
                if (!quest.getProgressablesId()) {
                    return;
                }
                var decisions = this.getDecisionsForIslandQuest(quest);
                decisions.forEach(function (decision) {
                    if (!decision.getRead()) {
                        new_quests.push(decision);
                    }
                });
            }.bind(this));
            return new_quests;
        },

        hasQuest: function(quest_id) {
            return this.getIslandQuestsDecisionCollection().get(quest_id);
        },

        /**
         * state 0 - awaiting decision
         * state 1 - in progress
         * state 2 - satisfied
         */
        getIslandQuestState: function (decisions) {
            if (decisions.length === 1) {
                return decisions[0].isSatisfied() ? 2 : 1;
            } else if (decisions.length > 1 && decisions[0].isViable()) {
                return 0;
            }
            return 1;
        },

        getTimerForIslandQuest: function (quest) {
            if (quest.getCreatedAt() && !quest.getAcceptedAt()) {
                return (quest.getCreatedAt() + (24 * 60 * 60)) - Timestamp.now();
            } else if (quest.getAcceptedAt() && !quest.getFinishedAt()) {
                return (quest.getAcceptedAt() + (24 * 60 * 60)) - Timestamp.now();
            }
            return 0;
        },

        getRunningQuestsForIslandQuests: function (quests) {
            if (quests.length === 0) {
                return [];
            }
            return quests.filter(function(quest) {
                return quest.getProgressablesId() !== null;
            });
        },

        getDecisionsForIslandQuest: function (quest) {
            var decisions = [];
            if (!quest) {
                return decisions;
            }
            var all_decisions = this.getIslandQuestsDecisionCollection(),
                decision_ids = this.getDecisionIds(quest.getProgressablesId());

            decision_ids.forEach(function (decision_id) {
                var decision_for_quest = all_decisions.getIslandQuestWithProgressableId(quest.getIslandX(), quest.getIslandY(), decision_id);
                if (decision_for_quest.length) {
                    decisions.push(decision_for_quest[0]);
                }
            });
            return decisions;
        },

        getNotAbortedDecisionsForIslandQuest: function (quest) {
            var decisions = this.getDecisionsForIslandQuest(quest);
            return decisions.filter(function (decision) {
                return !decision.isAborted();
            });
        },

        /**
         * mark the quest model as read
         * @param {Number} quest_id
         */

        markQuestAsRead: function (quest_id) {
            var quest_collection = this.getIslandQuestsCollection(),
                decision_collection = this.getIslandQuestsDecisionCollection(),
                quest = quest_collection.getQuest(quest_id);

            if (typeof quest === 'undefined' ||  !quest.getProgressablesId()) {
                return;
            }

            var decisions = this.getDecisionsForIslandQuest(quest);

            decisions.forEach(function (decision) {
                if (decision.getRead()) {
                    return;
                }
                var progressable_id = decision.getProgressableId();
                decision_collection.markAsRead(progressable_id);
            });
        },

        /**
         * true, if a quest is unread
         * @param {number} quest_id
         * @return {Boolean}
         */
        isQuestTaggedAsNew: function (quest_id) {
            var quest_collection = this.getIslandQuestsCollection(),
                quest = quest_collection.getQuest(quest_id),
                decision = us.first(this.getDecisionsForIslandQuest(quest));

            return decision ? decision.getRead() === false : false;
        },

        /**
         * true, if a quest is satisfied
         * @param {number} quest_id
         * @return {Boolean}
         */

        isQuestTaggedAsFinished: function (quest_id) {
            var quest_collection = this.getIslandQuestsCollection(),
                quest = quest_collection.getQuest(quest_id);

            if (quest.getProgressablesId() === null) {
                return false;
            }

            var decisions = this.getDecisionsForIslandQuest(quest);

            var satisfied_decision = decisions.filter(function (decision) {
                return decision.getState() === QUESTS.SATISFIED;
            });

            return satisfied_decision.length !== 0;
        },

        getQuestFromDecision: function (decision) {
            var quest_collection = this.getIslandQuestsCollection(),
                configuration = decision.getConfiguration(),
                island_x = configuration.island_x,
                island_y = configuration.island_y,
                decision_id = decision.getId();

            return quest_collection.filter(function (quest) {
                if (quest.getProgressablesId()) {
                    var ids_without_brackets = quest.getProgressablesId().replace(/[{}]+/g, ''),
                        single_decision_ids = ids_without_brackets.split(',');

                    var decision_ids = single_decision_ids.map(function (id) {
                        return parseInt(id, 10);
                    });
                    return quest.getIslandX() === island_x &&
                        quest.getIslandY() === island_y &&
                        decision_ids.indexOf(decision_id) >= 0;
                }
            });
        },


        /**
         * open the quest details on the right side
         * marks a quest as 'read'
         * and renders the detail view
         * @param {Number} quest_id
         */
        openQuest: function (quest_id, mark_as_read) {
            this.parent_controller.setActiveQuestId(quest_id);

            if (!this.view) {
                this.initializeView();
            }

            if (mark_as_read) {
                this.markQuestAsRead(quest_id);
            }

            this.view.reRender();
            this.parent_controller.renderActiveQuestMarker();
        },

        openDummyQuest: function() {
            if (!this.view) {
                this.initializeView();
            }
            this.view.emptyView();
        },

        getActiveQuestModel: function () {
            return this.getIslandQuestsCollection().getQuest(this.getActiveQuestId());
        },

        getActiveQuestId: function () {
            return this.parent_controller.getActiveQuestId();
        },

        chooseSide: function (decision) {
            this.getIslandQuestsDecisionCollection().chooseSide(decision.getSide(), decision.getProgressableId(), {
                success: function() {
                    this.openQuest(this.getActiveQuestId());

                    // Wait time quests / bear effect quests start immediately
                    if (this.isDecisionTimeBased(decision)) {
                        us.defer(this.challengeActiveDecision.bind(this));
                    }
                }.bind(this)
            });
        },

        exchangeIslandQuest: function (decision) {
            this.getIslandQuestsDecisionCollection().exchange(decision, decision.getProgressableId(), {
                success: function () {
                    this.parent_controller.reRenderIndex();
                    this.openQuest(this.getActiveQuestId());
                }.bind(this)
            });
        },

        skipQuestCooldown: function () {
            this.showLoading();

            this.getIslandQuestsDecisionCollection().skipQuestCooldown({
                success: function () {
                    this.hideLoading();
                }.bind(this),
                error: function() {
                    this.hideLoading();
                }.bind(this)
            });
        },

        claimReward: function (action) {
            var decision = us.first(this.getDecisionsForIslandQuest(this.getActiveQuestModel()));

            if (decision) {
                this.getIslandQuestsDecisionCollection().claimReward(action, QUESTS.CLOSED, decision.getProgressableId(), {
                    success : function() {
                        this.parent_controller.reRenderIndex();
                        this.parent_controller.openQuest();
                    }.bind(this)
                });
            }
        },

        challengeResources: function (wood, iron, stone) {
            var decision = us.first(this.getDecisionsForIslandQuest(this.getActiveQuestModel()));

            this.getIslandQuestsDecisionCollection().challengeResources({
                wood: wood,
                iron: iron,
                stone: stone
            }, decision.getProgressableId());
        },

        getGoldTooltipHtml : function() {
            return TooltipFactory.getAvailableGold(this.getModel('player_ledger').getGold());
        },

        getFirstQuestDecisionId : function() {
            return this.getIslandQuestsDecisionCollection().getFirstQuestDecisionId();
        },

        isDecisionTimeBased : function(decision) {
            return decision.getChallengeType() === 'wait_time' || decision.getChallengeType() === 'bear_effect';
        },

        isTimeBasedQuestChallengeRunning : function(decision) {
            return this.isDecisionTimeBased(decision) && decision.getProgress().wait_till !== null && decision.getProgress().wait_till > Timestamp.now();
        },

        isCurrentTownOnSameIsland : function(decision) {
            return decision.isTownOnSameIsland(this.parent_controller.getCurrentTown());
        },

        getCurrentTown : function() {
            return this.parent_controller.getCurrentTown();
        },

        getUnitsCollection : function() {
            return this.getCollection('units');
        },

        getHeroCollection: function () {
            return this.getCollection('player_heroes');
        },

        getHero: function () {
            return this.getHeroCollection().getHeroOfTown(Game.townId);
        },

        isHeroHealthyInTown: function () {
            return this.getHeroCollection().isStateHealthyHeroInTown();
        },

        /**
         * returns a 'fake' Town Group for the Ciry selection popup
         *
         * @param decision
         * @returns TownGroups
         */
        getTownGroupsCollectionForIQTowns: function(decision) {
            return new TownGroups({
                id: IQ_TOWN_GROUP_ID,
                active: true,
                collapsed: false,
                name: this.l10n.island + " " + decision.getIslandId()
            });
        },

        /**
         * Get a list of all the players town_ids on one given island,
         * excluding the current town
         *
         * @param island_id
         * @returns [town_id]
         */
        getTownIdsForIsland : function(island_id) {
            var towns_collection = this.getCollection('towns'),
                current_town_id = towns_collection.getCurrentTown().id;

            return towns_collection.getTownsOnIsland(island_id).map(function(town) {
                return town.getId();
            }).filter(function(town_id) {
                return town_id !== current_town_id;
            });
        },

        /**
         * get the TownGroupTowns Collection for a given island to populate the
         * TownGroup
         *
         * @param decision
         * @returns TownGroupTowns
         */
        getTownGroupTownsForIQTowns: function(decision) {
            var towns_on_island = [];

            this.getTownIdsForIsland(decision.getIslandId()).forEach(function(town_id) {
                towns_on_island.push(new TownGroupTown({
                    group_id : IQ_TOWN_GROUP_ID,
                    town_id : town_id
                }));
            });

            return new TownGroupTowns(towns_on_island);
        },

        /**
         * do a town switch
         *
         * @param town_id
         */
        handleSelectingTownEvent: function(town_id) {
            (new TownSwitch()).townSwitch(town_id);
        },

        destroy: function () {
            if (this.view) {
                this.view._destroy();
                this.markQuestAsRead(this.getActiveQuestId());
            }
        }
    });
});

