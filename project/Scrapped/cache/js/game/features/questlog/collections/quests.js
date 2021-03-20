/*global $, GameHelpers, GameDataQuests, us, MM, Game */

define('features/questlog/collections/quests', function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var Progressable = window.GameModels.Progressable;
	var TutorialQuest = window.GameModels.TutorialQuest;
	var GameEvents = window.GameEvents;
	var QUESTS = require('enums/quests');

	var Quests = GrepolisCollection.extend({
		model: TutorialQuest,
		model_class: 'TutorialQuest',
		// Backend calls this 'VisibleProgressables', but its TutorialQuests only, Island Quests are seperated
		//url_root: 'VisibleProgressable',

		initialize: function () {
			this.on('remove', function(model/*, data, options*/){
				if (model.has('quests_closed')) {
					var closed_quests = model.get('quests_closed') + 1;

					$.Observer(GameEvents.quest.close).publish({
						closed_quests : closed_quests
					});
				}
				if (model.has('steps_shown')) {
					GameHelpers.remove(Progressable.ID_PREFIX + model.get('id'));
				}
			});

			this.on('change:state', function (model) {
				if (model.isClosed() || model.isAborted()) {
					if (MM.getModels().Player[Game.player_id].getQuestsClosed() === GameDataQuests.getEndOfDeadZoneQuestCount()) {
						$.Observer(GameEvents.quest.tutorial_dead_zone_finished).publish({});
					}
					this.remove(model);
					model.unregisterFromModelManager();
				}
			}).on('change:steps_shown', function(model, value, options) {
				if(options.dontBubble || !value) {
					return this;
				}
				us.each(
					us.without(this.where({'steps_shown': true}), model),
					function(local_model){
						local_model.set({'steps_shown': false}, {dontBubble: true});
					}
				);
			});

			/**
			 * we do not sort on model.add during gameload, so we have to do it here manually
			 */
			$.Observer(GameEvents.game.start).subscribe(['eager_quests'], function() {
				this.sort();

				// re-sort when something happens
				this.on('add remove change', this.sort.bind(this));
			}.bind(this));
		},

		/**
		 * Overrides the default add behaviour to filter out quests that are in the state closed, because
		 * there is no reason for closed quests to be added to the collection.
		 */
		add: function(models, options) {
			var filteredModels;
			if (models !== undefined && !us.isArray(models)) {
				filteredModels = models.isClosed() ? undefined : models;
			} else {
				filteredModels = us.reject(models, function(model){
					return model.isClosed();
				});
			}
			return GrepolisCollection.prototype.add.apply(this, [filteredModels, options]);
		},

		/**
		 * compare two quests: 'satisfied' quest always have precedence over non-satisfied
		 * if both are equal, then newer quest have precedence over older quests
		 * (higher ids = newer)
		 */
		comparator: function (a, b) {
			var quest_type_order = {
				blue: 1,
				red: 2,
				green: 3,
				yellow: 4
			};

			if ((a.isSatisfied() && b.isSatisfied()) || (!a.isSatisfied() && !b.isSatisfied())) {
				if (a.getQuestType() === b.getQuestType()) {
					return a.getId() > b.getId() ? 1 : -1; //oldest quest first
                }
                else {
                    return quest_type_order[a.getQuestType()] <= quest_type_order[b.getQuestType()] ? -1 : 1;
                }
			}
			else {
				return a.isSatisfied() && !b.isSatisfied() ? -1 : 1;
			}
		},

		setStepsShownStatus: function() {
			var active = GameHelpers.getActiveInGroup('quest'),
				model;
			if (active) {
				model = this.get(active.setId.replace(Progressable.ID_PREFIX, ''));
				if (model) {
					model.set({'steps_shown': true});
				}
			}
		},

		/**
		 * Test if start tutorial quest is render blocked
		 * Used to toggle visibility of tutorial progressbar
		 *
		 * @return {Boolean}
		 */
		isFirstQuestRenderBlocked: function() {
			var model = this.where({progressable_id: 'StartTutorialQuest'});
			return model && model.length && model[0].getBlockRender() && model[0].getStatus() === QUESTS.VIABLE;
		},

		/**
		 * test if given quest is running
		 *
		 * @param {String} progressable_id
		 * @returns {boolean}
		 */
		isQuestRunning: function(progressable_id) {
			var props = {
				progressable_id: progressable_id,
				state: 'running'
			};
			return this.findWhere(props) !== undefined;
		},

		/**
		 * return all quests for a given category
		 * @returns {TutorialQuest}
		 */
		getQuestsForCategory: function(category) {
			return this.findWhere({
				category: category
			});
		},

		getRunningQuests: function() {
			return this.where({
				state: QUESTS.RUNNING
			});
		},

		getFinishedQuests: function() {
			return this.where({
				state: QUESTS.SATISFIED
			});
		},

		getNewQuests: function() {
			return this.where({
				read: false
			});
		},

		getQuestIdByProgressableId: function(progressable_id) {
			var quest_model = this.findWhere({
				progressable_id: progressable_id
			});
			if (quest_model) {
				return quest_model.getId();
			}

			return false;
		},

		onQuestAdded: function(obj, callback) {
			 obj.listenTo(this, 'add', callback);
		},

		onQuestRemoved: function(obj, callback) {
			obj.listenTo(this, 'remove', callback);
		},

		onQuestStateChange: function(obj, callback) {
			obj.listenTo(this, 'change:state', callback);
		},

		getQuest : function(quest_id) {
			 return this.get(quest_id);
		},

		hasQuests : function() {
			 return this.models.length > 0;
		},

		getUnreadAndRunningQuests: function() {
			return this.where({
				read: false,
				state: QUESTS.RUNNING
			});
		},

		onQuestReadMarkChanged: function(obj, callback) {
			obj.listenTo(this, 'change:read', callback);
		},

		onQuestProgressChanged : function(obj, callback) {
			obj.listenTo(this, 'change:progress change:progress_new', callback);
		}
	});

	window.GameCollections.Quests = Quests;

	return Quests;
});
