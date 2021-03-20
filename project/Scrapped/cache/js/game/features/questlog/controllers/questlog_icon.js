/* global WM */

define('features/questlog/controllers/questlog_icon', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/questlog/views/questlog_icon');
	var QuestlogWindowFactory = require('features/questlog/factories/questlog');
	var QuestWelcomeWindowFactory = require('factories/windows/quest_welcome_window_factory');
	var QUESTS = require('enums/quests');
	var GameEvents = require('data/events');
	var GameHelpers = require_legacy('GameHelpers');
	var windows = require('game/windows/ids');
	var Progressable = window.GameModels.Progressable;

	return GameControllers.BaseController.extend({

		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.tutorial_quest_collection  = this.getCollection('tutorial_quests');
			this.island_quest_collection = this.getCollection('island_quests');
			this.initializeView();
		},

		registerEventListeners : function() {
			var updateCounter = function() {
				this.counterChange();
				this.view.setTooltipText();
			}.bind(this);

			var	removeFinishIcon = function() {
				this.view.removeFinishedIconState();
				this.view.setTooltipText();
			}.bind(this);

			var finishQuest = function(model) {
				if(model.getState() === QUESTS.SATISFIED) {
					updateCounter();
					this.view.showQuestFinishedAnimation();
					this.view.playQuestFinishedSound(model.getId());

				}
			}.bind(this);

			this.stopListening();

			this.stopObservingEvent(GameEvents.game.load);

			this.observeEvent(GameEvents.game.load, function() {
				// Calling this event once to preload the tutorial quest related sounds
				$.Observer(GameEvents.window.quest.init_icon).publish({});
			}.bind(this));

			this.tutorial_quest_collection.onQuestAdded(this, function(quest) {
				if (quest.showWindow() && quest.isRunning()) {
					this.openWelcomeWindow();
				}
				updateCounter();
			}.bind(this));

			this.island_quest_collection.onQuestAdded(this, updateCounter);
			this.tutorial_quest_collection.onQuestRemoved(this, removeFinishIcon);
			this.island_quest_collection.onQuestRemoved(this, removeFinishIcon);
			this.tutorial_quest_collection.onQuestReadMarkChanged(this, updateCounter);
			this.island_quest_collection.onQuestReadMarkChanged(this, updateCounter);

			this.tutorial_quest_collection.onQuestStateChange(this, function(model) {
				finishQuest(model);
				if (this.isActiveQuestAndHelpersAreOn(model)) {
					this.showTutorialArrowOnIcon(model);
				}
			}.bind(this));

			this.island_quest_collection.onQuestStateChange(this, finishQuest);
		},


		/**
		 * true, if the quest given is currently having an arrow active
		 * @param {TutorialQuest} quest_model
		 * @returns {Boolean}
		 */
		isActiveQuestAndHelpersAreOn: function(quest_model) {
			return GameHelpers.isSetShown(Progressable.ID_PREFIX + quest_model.getId());
		},

		/**
		 * quit all arrows for the quest and point to the questlog icon,
		 * if the questlog window is closed
		 * @param {TutorialQuest} quest_model
		 */
		showTutorialArrowOnIcon : function(quest_model) {
			var questId = quest_model.getId();

			GameHelpers.remove(Progressable.ID_PREFIX + questId );

			if (!WM.isOpened(windows.QUESTLOG)) {
				GameHelpers.add({
					setId: Progressable.ID_PREFIX + questId,
					groupId: 'quest',
					state: 'finish',
					steps: [
						{
							search: '#icons_container_left .questlog_icon.finished',
							show: [
								{
									selector: '#icons_container_left .questlog_icon.finished',
									type: 'arrow',
									direction: 'nw',
									offset: {x: -5, y: -25}
								}
							]
						}
					]
				});
			}
		},

		getCounter: function() {
			return this.counter;
		},

		getUnreadCount : function() {
			// the island quest collection has 2 models per viable quests
			return this.tutorial_quest_collection.getUnreadAndRunningQuests().length +
				Math.ceil(this.island_quest_collection.getUnreadAndViableQuests().length / 2);
		},

		counterChange : function() {
			if(this.getUnreadCount() !== this.getCounter()) {
				this.counter = this.getUnreadCount();
				this.view.changeCounter();
			}
		},

		initializeView : function() {
			this.view = new View({
				controller : this,
				el : this.$el
			});

			this.counter = 0;
			this.registerEventListeners();
		},

		openWindow : function() {
			QuestlogWindowFactory.openWindow();
		},

		closeWindow : function() {
			QuestlogWindowFactory.closeWindow();
		},

		openWelcomeWindow : function() {
			QuestWelcomeWindowFactory.openWindow(this.tutorial_quest_collection.getFirstModel());
		}

	});
});

