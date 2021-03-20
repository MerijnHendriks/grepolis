/* global require_legacy, us, Layout, TM, GameEvents, GrepoApiHelper, gpAjax, MM, Game */

define('features/commands/controller/commands', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('feature/commands/views/commands_menu');
	var CommandsHelper = require('helpers/commands');

	/**
	 * define the interval in which the timers are updated on screen
	 */
	var CLOCK_TIMER_RESOLUTION = 1000; //ms


	return  GameControllers.BaseController.extend({

		/**
		 * The movements are split over multiple collections and the controller does
		 * extra bookkeeping to quickly access the models in the correct order (their arrival time).
		 */

		/**
		 * sort_index is a sorted array of arrival_times
		 *
		 * [timestamp_1, timestamp_5, timestamp_7]
		 */
		sort_index : [],

		/**
		 * sort_models is a reference to all models per timestamp
		 *
		 * {
		 *     timestamp : [ model_1, model_2 ]
		 * }
		 */
		sort_models : {},

		// time to wait until next refetch (gradually increases on failures)
		poll_timeout : 1000,

		/**
		 * Initialize
		 * @param options
		 */
		initialize : function(options) {
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			// For game load and town switch we expect a complete change in models
			// so we can switch sorting to 'bulk mode'
			CommandsHelper.setCommandsBulkUpdateIncoming(true);
			this.renderList();

			this.registerTimer('commands_menu_clock', CLOCK_TIMER_RESOLUTION, this.updateTimers.bind(this));
		},

		getModelArrivalTime : function(model) {
			return model.getCommandFinishTimestamp();
		},

		reSortIndex : function() {
			this.sort_index.sort(function(a,b) {
				return a-b;
			});
		},

		/**
		 * keep the array of arrival times sorted for every insert
		 */
		addModelToSortIndex : function(model) {

			var value = this.getModelArrivalTime(model);

			// underscore.js provides us with binary search (third parameter = true)
			if (us.indexOf(this.sort_index, value, true) === -1) {
				this.sort_index.push(value);

				if (!this.sort_models[value]) {
					this.sort_models[value] = [];
				}

				this.sort_models[value].push(model.getId());
			} else {
				if (this.sort_models[value] && us.indexOf(this.sort_models[value], model.getId(), true) === -1) {
					this.sort_models[value].push(model.getId());
				}
			}
		},

		/**
		 * remove a given model from the bookkeeping
		 *
		 * @param model
		 */
		removeModelFromSortIndex : function(model) {
			var value = this.getModelArrivalTime(model),
				index = us.indexOf(this.sort_index, value, true);

			if (index === -1) {
				return;
			}

			this.sort_index.splice(index, 1);

			var model_index = us.indexOf(this.sort_models[value], model.getId());
			this.sort_models[value].splice(model_index, 1);

			if(this.sort_models[value].length === 0) {
				delete this.sort_models[value];
			}
		},

		/**
		 * changes on the collections need to be reflected on the sorting index
		 */
		registerEventListeners: function() {
			var addModel = function(model) {
				if (this.isListEmpty()) {
					this.view.hideNoResults();
				}

				if (CommandsHelper.isCommandsBulkUpdateIncoming()) {
					return;
				}
				this.addModelToSortIndex(model);
				this.reSortIndex();

				this.view.addNode(model);
			}.bind(this);

			var removeModel = function(model) {
				if (CommandsHelper.isCommandsBulkUpdateIncoming()) {
					return;
				}
				this.removeModelFromSortIndex(model);
				this.view.removeNode(model);

				if (this.isListEmpty()) {
					this.view.showNoResults();
				}
				if (this.getArrivedCommandsCount() === 0) {
					this.view.hideProcessingMovements();
				}
			}.bind(this);

			var changeModel = function(model) {
				removeModel(new model.constructor(model.previousAttributes()));
				addModel(new model.constructor(model.attributes));
				if (!CommandsHelper.isCommandsBulkUpdateIncoming()) {
					this.registerNextCommandArrivedTimer();
				}
                $.Observer(GameEvents.town.commands.update).publish({});
			};

			var bulk_update_done = function() {
				this.buildSortIndex();
				CommandsHelper.setCommandsBulkUpdateIncoming(false);
				this.view.bulkUpdateDone();
				this.registerNextCommandArrivedTimer();
			}.bind(this);

			us.each(this.getCollections(), function(collection) {
				collection.onAdd(this, function(model) {
					addModel(model);
					if (!CommandsHelper.isCommandsBulkUpdateIncoming()) {
						this.registerNextCommandArrivedTimer();
					}
                    $.Observer(GameEvents.town.commands.update).publish({});
				}.bind(this));
				collection.onRemove(this, function(model) {
					removeModel(model);
					if (!CommandsHelper.isCommandsBulkUpdateIncoming()) {
						this.registerNextCommandArrivedTimer();
					}
                    $.Observer(GameEvents.town.commands.update).publish({});
				}.bind(this));
				collection.onChange(this, changeModel);
			}.bind(this));

			this.observeEvent('game:load', bulk_update_done);

			this.observeEvent('town:town_switch', function() {
				this.view.hideProcessingMovements();
				this.view.invalidateView();
				var takeover = MM.getOnlyCollectionByName('Takeover'),
					incoming_takeover = takeover.getIncomingTakeOverForSpecificTown(Game.townId);
				if (incoming_takeover) {
					return;
				}
				CommandsHelper.setCommandsBulkUpdateIncoming(true);
				this._clearCaches();
				bulk_update_done();
				this.publishEvent(GameEvents.town.commands.bulk_update);
			}.bind(this));

			this.onCommandArrived(function() {
				return gpAjax.ajaxGet('frontend_bridge', 'refetch', {}, false, function(){
					TM.unregister('next_command_arrival');
					this.registerNextCommandArrivedTimer();
                }.bind(this));
			}, this);
		},

		registerNextCommandArrivedTimer: function() {
			var commands = this.getCommands(true, true),
				first_command = commands.length ? commands[0] : null;

			TM.unregister('next_command_arrival');

			if (first_command) {
				// in case realTimeLeft is not defined just refetch after 2 seconds
				var real_time_left = first_command.getRealTimeLeft ? first_command.getRealTimeLeft() : 2000;

				// if we have a daemon overdue, gradually increase refetch_time
				var min = this.poll_timeout;
				if (real_time_left < -20000) {
					this.poll_timeout = Math.min(1.5 * this.poll_timeout, 30 * 1000);
				} else {
					// fetch worked, reset poll timeout
					this.poll_timeout = 1000;
				}

				var refetch_time = Math.max(min, first_command.getTimeLeft() * 1000);

				var arrived_commands = this.getArrivedCommandsCount();

				if (arrived_commands) {
					var first_cmd_not_arrived_time = 0,
						poll_time_for_arrived_commands = (arrived_commands / 10) * 1000;
					var first_cmd_not_arrived = us.find(commands, function(command) {
						return command.getTimeLeft() > 0;
					});

					if (first_cmd_not_arrived) {
						first_cmd_not_arrived_time = first_cmd_not_arrived.getRealTimeLeft ? (first_cmd_not_arrived.getRealTimeLeft() * 1000) : 2000;
						refetch_time = (first_cmd_not_arrived_time < poll_time_for_arrived_commands) ? first_cmd_not_arrived_time : poll_time_for_arrived_commands;
						
					} else {
						refetch_time = poll_time_for_arrived_commands;
					}
				}

				TM.register('next_command_arrival', refetch_time, this.trigger.bind(this, 'command_arrived'), {max : 1});
			}
        },

		onCommandArrived : function(callback, context) {
			this.on('command_arrived', callback, context);
		},

		getArrivedCommandsCount : function() {
			var commands = this.getCommandList(),
				arrived_commands = commands.filter(function(command) {
					return command.getTimeLeft() === 0;
				});
			return arrived_commands.length;
		},

		getCommandList : function() {
			var movements_units = this.getCollection('movements_units').models,
				movements_spys = this.getCollection('movements_spys').models,
				movements_colonizations = this.getCollection('movements_colonizations').models,
				movements_revolts_attacker = this.getCollection('movements_revolts_attacker').models,
				movements_revolts_defender = this.getCollection('movements_revolts_defender').models,
				movements_conquerors = this.getCollection('movements_conquerors').models;

			var commands_list = [].concat(
				movements_units,
				movements_spys,
				movements_colonizations,
				movements_revolts_attacker,
				movements_revolts_defender,
				movements_conquerors
			);

			return commands_list;
		},

		getCommands : function() {
			var commands_list = this.getCommandList();

			return commands_list.sort(function(a, b) {
				var a_time_left = a.getTimeLeft(),
					b_time_left = b.getTimeLeft();

				//same arrival time - we need to sort more precisely
				if (a_time_left === b_time_left) {
					return a.getId() - b.getId();
				}
				return a_time_left - b_time_left;
			});
		},

		renderList : function() {
			this.initializeView();
			return this;
		},

		initializeView: function() {
			this.view = new View({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		isListEmpty : function() {
			return this.sort_index.length === 0;
		},

		buildSortIndex : function() {
			us.each(this.getCollections(), function(collection) {
				collection.each(this.addModelToSortIndex.bind(this));
			}.bind(this));

			this.reSortIndex();
		},

		_clearCaches : function() {
			this.sort_models = {};
			this.sort_index = [];
		},

		getCommandsCount: function() {
			var commands_count = 0;
			us.each(this.getCollections(), function(collection) {
				commands_count += collection.length;
			});
			return commands_count;
		},

		updateCommandsCounter: function() {
			this.view.updateCommandsCounter(this.getCommandsCount());
		},

		/**
		 * true if we are waiting for data, e.g. triggered from a town_switch
		 * @returns {boolean}
		 */
		isIncomingDataExpected : function() {
			return CommandsHelper.isCommandsBulkUpdateIncoming();
		},

		/**
		 * find a model by id in any of the different movement collections
		 * @param model_id
		 * @returns {model|null}
		 */
		getModelFromAnyMovementCollection : function(model_id) {
			var collection = us.find(this.getCollections(), function(collection) {
				return collection.get(model_id);
			});

			if (collection) {
				return collection.get(model_id);
			}
			return null;
		},

		/**
		 * given a timestamp, find the timestamp and index
		 * -just after- the given one
		 *
		 * @param {Number} timestamp
		 * @return {Number} next_timestamp or -1 for last element
		 */
		getNextTimeFor : function(timestamp) {
			var index = us.indexOf(this.sort_index, timestamp, true),
				next_index = index + 1;

			// Special case: last index
			if (next_index === this.sort_index.length) {
				return -1;
			}

			return this.sort_index[next_index];
		},

		/**
		 * open the detail window for a movement
		 *
		 * @param model_id
		 */
		openMovementWindow : function(model_id) {
			if (!model_id) {
				return;
			}

			var model = this.getModelFromAnyMovementCollection (model_id);

			if (!model) {
				return;
			}

			switch (model.getType()) {
				case 'attack_spy':
					// has no window
					break;
				case 'colonization':
					window.ColonizationCommandWindowFactory.openColonizationCommandWindow(this.l10n.city_foundation, model.getId());
					break;
				case 'revolt_arising':
					// has no window
					break;
				case 'revolt_running':
					// has no window
					break;
				case 'conqueror':
					Layout.conquerorWindow.open(model.getUnitId(), model.getTownId());
					break;
				default:
					window.AttackCommandWindowFactory.openAttackCommandWindow(model.getCommandName(), model.getCommandId());
					break;
			}
		},

		updateTimers : function() {
			this.view.updateTimers();
		},

		cancelMovement: function(model_id) {
			var model = this.getModelFromAnyMovementCollection(model_id),
				id = model ? model.getCommandId() : null;

			if (!model) {
				return;
			}

			if (model.getType() === 'attack_spy') {
				GrepoApiHelper.execute.call(this, 'Commands', 'cancelEspionage', {
					id : id
				});
			} else {
				GrepoApiHelper.execute.call(this, 'Commands', 'cancelCommand', {
					id : id
				});
			}
		},

		getCommandName : function(model) {
			var model_name = '';
			switch (model.getType()) {
				case 'attack_spy':
					model_name = this.l10n.espionage_tooltip;
					break;
				case 'colonization':
					model_name = this.l10n.colonization_tooltip;
					break;
				case 'revolt_arising':
					model_name = model.isBeyond() ? this.l10n.arising_revolt_tooltip : this.l10n.arising_revolt_own_town_tooltip;
					break;
				case 'revolt_running':
					model_name = model.isBeyond() ? this.l10n.running_revolt_tooltip : this.l10n.running_revolt_own_town_tooltip;
					break;
				case 'conqueror':
					model_name = this.l10n.conquest_tooltip;
					break;
				default:
					model_name = model.getCommandName();
					break;
			}
			return model_name;
		},

		destroy : function() {
		}
	});
});
