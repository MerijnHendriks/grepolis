/*global GameEvents, GameData, WMap */

/**
 * this collection holds all island quests decisions
 */
define('features/island_quests/collections/island_quests', function () {
    'use strict';

    var GrepolisCollection = window.GrepolisCollection;
    var IslandQuest = window.GameModels.IslandQuest;
    var QUESTS = require('enums/quests');

    var IslandQuests = GrepolisCollection.extend({
        model: IslandQuest,
        model_class: 'IslandQuest',

        initialize: function () {
            this.on('add change', function (model) {
                if (model.isClosed() || model.isAborted()) {
                    this.remove(model);
                    model.unregisterFromModelManager();
                } else if (model.isSatisfied()) {
                    $.Observer(GameEvents.island_quest.satisfied).publish({});
                }
            });

            this.on('add remove', function (model) {
                var configuration = model.getConfiguration();
                if (configuration && configuration.island_x && configuration.island_y) {
                    WMap.pollForMapChunksUpdateWithCoord(configuration.island_x, configuration.island_y);
                } else {
                    WMap.pollForMapChunksUpdate();
                }
            });

            this.on('add', function () {
                $.Observer(GameEvents.island_quest.add).publish({});
            });
        },

        /**
         * override Backbone.Collection.add
         * only models in state != CLOSED or ABORTED should be displayed
         *
         * @param model
         * @param options
         *
         * @return void
         */
        add: function (model, options) {
            var staticProgressableData;

            var model_state = model.state || (typeof model.get === 'function' ? model.get('state') : null),
                model_progressable_id = model.progressable_id || (typeof model.get === 'function' ? model.get('progressable_id') : null);

            if (model_state && model_state !== IslandQuest.CLOSED && model_state !== IslandQuest.ABORTED) {
                // single model added
                staticProgressableData = GameData.progressable[model_progressable_id];
                if (staticProgressableData.type === 'island_quest') {
                    GrepolisCollection.prototype.add.apply(this, Array.prototype.slice.call(arguments));
                }
            } else if (!model_state) {
                // model collection
                GrepolisCollection.prototype.add.apply(this, Array.prototype.slice.call(arguments));
            }
        },

        /**
         * test if there are viable or running quests for the given island coordinates
         *
         * @param {Integer} island_x
         * @param {Integer} island_y
         *
         * @return {Boolean}
         */
        hasViableOrRunningNotTimeBasedQuestsForIsland : function(island_x, island_y) {
            var quests = this.getViableOrRunningNotTimeBasedQuestsForIsland(island_x, island_y);
            return quests.length > 0;
        },

        /**
         * get viable quests for the given island coordinates
         *
         * @param {Integer} island_x
         * @param {Integer} island_y
         *
         * @return {Array}
         */
        getViableOrRunningNotTimeBasedQuestsForIsland : function(island_x, island_y) {
            return this.filter(function(island_quest) {
                function isNotTimeBasedQuest() {
                    return island_quest.getChallengeType() !== QUESTS.BEAR_EFFECT &&
                        island_quest.getChallengeType() !== QUESTS.WAIT_TIME;
                }

                return  island_quest.getIslandX() === island_x &&
                    island_quest.getIslandY() === island_y &&
                    (island_quest.isViable() ||
                    (island_quest.isRunning() && isNotTimeBasedQuest()));
            });
        },

        getIslandQuestWithProgressableId: function (island_x, island_y, progressable_id) {
            return this.filter(function (quest) {
                return quest.getIslandX() === island_x &&
                    quest.getIslandY() === island_y &&
                    quest.getId() === progressable_id;
            });
        },

        unitRuntimes: function (target_town_id, callback) {
            this.execute(
                'unitRuntimes',
                {target_town_id: target_town_id},
                {
                    success: function (data) {
                        if (typeof callback === 'function') {
                            callback(data);
                        }
                    },
                    error: function (data) {

                    }
                }
            );
        },

        sendUnits: function (target_town_id, attacking_units, type, attacking_strategy, callback) {
            var attacking_strategies = attacking_strategy instanceof Array ? attacking_strategy : [attacking_strategy],
                json = {
                    target_id: target_town_id,
                    sending_type: type,
                    attacking_strategy: attacking_strategies,
                    params: attacking_units
                };

            this.execute(
                'sendUnits',
                json,
                {
                    success: function (data) {
                        //console.log('units sent:', data);
                        if (callback) {
                            callback(data);
                        }
                    },
                    error: function (data) {

                    }
                }
            );
        },

        chooseSide: function (side, context, callback) {
            this.execute(
                'decide',
                {
                    decision: side,
                    progressable_name: context
                }, callback
            );
        },

        exchange: function (decision, context, callbacks) {
            this.execute(
                'exchange',
                {
                    island_quest_id: decision.id,
                    progressable_name: context
                },
                {
                    success: function (data) {
                        WMap.pollForMapChunksUpdate();

                        if (callbacks && typeof callbacks.success === 'function') {
                            callbacks.success(data);
                        }
                    },
                    error: function (data) {
                        if (callbacks && typeof callbacks.error === 'function') {
                            callbacks.error(data);
                        }
                    }
                }
            );
        },

        skipQuestCooldown: function (callbacks) {
            this.execute(
                'skipQuestCooldown',
                {},
                {
                    success: function (data) {
                        WMap.pollForMapChunksUpdate();

                        if (callbacks && typeof callbacks.success === 'function') {
                            callbacks.success(data);
                        }
                    },
                    error: function (data) {
                        if (callbacks && typeof callbacks.error === 'function') {
                            callbacks.error(data);
                        }
                    }
                }
            );
        },

        claimReward: function (reward_action, state, context, callbacks) {
            this.execute(
                'claimReward',
                {reward_action: reward_action, state: state, progressable_id: context},
                {
                    success: function (data) {
                        if (callbacks && typeof callbacks.success === 'function') {
                            callbacks.success(data);
                        }
                    },
                    error: function (data) {
                        if (callbacks && typeof callbacks.error === 'function') {
                            callbacks.error(data);
                        }
                    }
                }
            );
        },

        challenge: function (challenge, context, callback) {
            this.execute(
                'challenge',
                {challenge: challenge, progressable_name: context},
                {
                    success: function (data) {
                        if (callback) {
                            callback();
                        }
                    },
                    error: function (data) {
                        //console.log('error during challenge start:', data);
                    }
                }
            );
        },

        challengeResources: function (challenge, context) {
            this.execute(
                'challengeResources',
                {challenge: challenge, progressable_name: context},
                {
                    success: function (data) {
                        //console.log('res challenge successfully started:', data);
                    },
                    error: function (data) {
                        //console.log('error during res challenge start:', data);
                    }
                }
            );
        },

        getTimeToNextQuest: function (callback) {
            this.execute('getTimeToNextQuest', {}, {
                success: function (data) {
                    if (callback) {
                        callback(data);
                    }
                }.bind(this)
            });
        },

        markAsRead: function (decision_id) {
            this.execute('markAsRead', {
                progressable_id: decision_id
            });
        },

        onQuestReadMarkChanged: function (obj, callback) {
            obj.listenTo(this, 'change:read', callback);
        },

        onQuestProgressChanged: function (obj, callback) {
            obj.listenTo(this, 'change:progress', callback);
        },

        getFirstQuestDecisionId: function () {
            return this.length > 0 ? this.at(0).getId() : null;
        },

        onQuestAdded: function (obj, callback) {
            obj.listenTo(this, 'add', callback);
        },

        onQuestRemoved: function (obj, callback) {
            obj.listenTo(this, 'remove', callback);
        },

        onQuestStateChange: function (obj, callback) {
            obj.listenTo(this, 'change:state', callback);
        },

        getUnreadAndViableQuests: function () {
            return this.where({
                read: false,
                state: QUESTS.VIABLE
            });
        }
    });

    window.GameCollections.IslandQuests = IslandQuests;

    return IslandQuests;
});
