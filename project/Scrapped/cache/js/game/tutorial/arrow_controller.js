/* global TM, debug,us */

define('tutorial/arrow_controller', function(require) {

	var templates = {}, data = {}, l10n = {};

	var model = require('tutorial/arrow_model');
	var view = require('tutorial/arrow_view');

	var helperType = {
			arrow: 'arrow',
			highlighter: 'highlight'
		};
	var stepStatus = {
			active: 'active',
			done: 'done'
		},
		helperStatus = {
			skip: 'skip'
		};

	//@TODO remove
	var controller = 'thats me!';

	/**
	 * Controller Singleton
	 */
	return {

		displayedSteps : {},

		initialize : function (o) {
			templates = o.templates || {};
			data = o.data || {};
			l10n = o.l10n || {};

			view.initialize(model, templates, this);

			//@TODO : used to avoid binding issues while migration to require
			//@TODO remove
			controller = this;
		},

		_getKey : function(set_id, group_id) {
			return group_id + '#' + set_id;
		},

		/**
		 * check if step was displayed
		 *
		 * @param {String} set_id
		 * @param {String} group_id
		 * @param {Object} step
		 * @return {Boolean}
		 */
		wasStepDisplayed : function(set_id, group_id, step) {
			var key = this._getKey(set_id, group_id);

			if (!this.displayedSteps[key]) {
				return false;
			}

			return this.displayedSteps[key][step.search] === true;
		},

		resetStepsDisplayed : function(set_id, group_id) {
			var key = this._getKey(set_id, group_id);

			if (this.displayedSteps[key]) {
				delete this.displayedSteps[key];
			}
		},

		/*
		 *	Set sniffers that look for changes in game
		 */
		setSniffers : function () {
			TM.unregister('gamehelpers_setSniffers');
			TM.register('gamehelpers_setSniffers', 500, this.doAction.bind(this));
			model.setSniffersStatus(true);
		},

		/*
		 * Adds set of helpers to data.
		 * If set for given ID already exists - it will be replaced
		 *
		 * @param {object | array} set - settings object or collection of objects
		 * @param {string} setId - unique ID of set to add.
		 * @param {array} steps - array of steps objects
		 *
		 */
		addSet : function (set) {
			if (!set) {
				throw 'No data specified';
			}

			if ($.isArray(set)) {
				$.each(set, function (i, setObj) {
					model.addSet(setObj);
				});
			} else {
				model.addSet(set);
			}

			if (!model.getSniffersStatus()) {
				this.setSniffers();
			}
		},

		/*
		 * Extends set of helpers by new data. If set does not exist - will create new one
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set to extend
		 * @param {array} steps - array of steps objects
		 *
		 */
		extendSet: function (o) {
			model.extendSet(o);
		},

		/*
		 * Checks if set for given ID exists in data
		 *
		 * @param {string} setId - ID of set to check
		 *
		 * @return {bool}
		 *
		 */
		hasSet: function (setId){
			return model.hasSetForId(setId);
		},

		isSetShown: function (setId){
			if (model.hasSetForId(setId)) {
				if (model.getSetById(setId).groupId) {
					return (model.getFirstFromGroup(model.getSetById(setId).groupId) === setId);
				} else {
					return true;
				}
			} else {
				return false;
			}
		},

		/*
		 * Calls render of helpers for active step.
		 * Step can have multiple helpers
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set this step belongs to
		 * @param {object} step - step object
		 *
		 */
		renderStep: function (o) {
			$.each(o.step.show, function (i, helper) {
				if (helper.status !== helperStatus.skip) {
					if (helper.type && helper.type !== helperType.arrow) {
						if (helper.type === helperType.highlighter) {
							view.renderHighlighter({helper: helper, setId: o.setId, groupId: o.groupId, helperNo: i, re_render: o.re_render});
						} else if (helper.type === 'none') {
							debug('do nothing, just block the display');
						}
					} else {
						view.renderArrow({helper: helper, setId: o.setId, groupId: o.groupId, helperNo: i, re_render: o.re_render, re_position: o.re_position});
					}
				}
			});
			o.step.status = stepStatus.active;
		},

		last_step : null,

		/*
		 * Fired on sniff events; checks if there's a change in displayed helpers set and calls re-render, if neeeded
		 *
		 * @param {string | array} options.setList - ID of set(s) to render;
		 *
		 */
		doAction: function (/*e, options*/) {
			var found_steps = {},
				controller = this,
				last_known_step = this.last_step;

			$.each(model.getSets(), function (setId, set) {
				// if there is a group and this set is not the first from the group - ignore
				if (set.groupId && model.getGroupById(set.groupId) && model.getGroupById(set.groupId)[0] !== setId) {
					return true; // skip this step
				}

				if (set.steps === false) {
					return true; // we have no steps
				}

				// This loop filters each step by either a) it's search function or b) $(<search_string>)
				// found_steps will then contain the filtered list of steps
				found_steps[setId] = [];
				$.each(set.steps, function (stepId, step) {
					if (step.status === stepStatus.done) {
						return;
					}

					// ignore already displayed steps in sets with length > 1
					if (controller.wasStepDisplayed(setId, set.groupId, step) && set.steps.length >= 1) {
						 return;
					}

					if (typeof step.search_function === 'function') {
						if (step.search_function.call(null, step.search)) {
						   found_steps[setId].push(step);
						} else {
							// do nothing
						}
					} else if ($(step.search).length > 0) {
						found_steps[setId].push(step);
					}
				});


		//console.log('got filterd steps', found_steps[setId].length, found_steps[setId]);

				// if no steps found, cleanup and exit
				if (found_steps[setId].length === 0) {
		//console.log('no steps found, clean up and exit');
					controller.removeBurnoutsForSet(setId);
					view.removeHelpersForSet(setId);
					model.removeActiveStep(setId);
					controller.last_step = null; // if we show nothing we have to reset our last step
					return;
				}

				// given a filtered set of steps, find the last one, then decide on what and how to render

				controller.last_step = found_steps[setId].pop();

				// decide on: last_step active or not
				if (controller.last_step.status === stepStatus.active) {
					if (!controller._areStepsEqual(last_known_step, controller.last_step)) {
						view.removeHelpersForSet(setId);
						controller.renderStep({setId: setId, groupId: set.groupId, step: controller.last_step, re_render: true});
					} else {
						// same step, try to correct positions
						controller.renderStep({setId: setId, groupId: set.groupId, step: controller.last_step, re_position: true});
					}
				} else {
					if (!controller._areStepsEqual(last_known_step, controller.last_step)) {
						controller.removeBurnoutsForSet(setId);
						view.removeHelpersForSet(setId);
						controller.renderStep({setId: setId, groupId: set.groupId, step: controller.last_step});
						model.setActiveStep({setId: setId, step: controller.last_step});
					} else {
						// same step, try to correct positions
						controller.renderStep({setId: setId, groupId: set.groupId, step: controller.last_step, re_position: true});
					}
				}
			});
		},

		/**
		 * @private
		 * @param {object} previous_step
		 * @param {object} next_step
		 * @returns {boolean}
		 */
		_areStepsEqual : function(previous_step, next_step) {
			return previous_step && previous_step.search && next_step && next_step.search && previous_step.search === next_step.search;
		},

		/*
		 * Checks if active step has all it's helpers displayed.
		 *
		 * @param {object} o - optional settings object
		 * @param {string | array} setId - display data only for specified ID(s).
		 * @param {object} step - step object
		 *
		 * @return {bool}
		 *
		 */
		checkForConsistency: function (o) {
			var displayed_steps_count = $('.helpers.set_' + o.setId).length,
				expected_steps_count = us.reject(o.step.show, function (el, i){
					return el.status === helperStatus.skip;
				}).length;
			return displayed_steps_count === expected_steps_count;
		},

		/*
		 * Adds burnout to TimeManager, extends local collection of burnouts IDs
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set this step belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 */
		addBurnout: function (o) {
			var id = 'helpers_set_' + o.setId + '_helper_no_' + o.helperNo;
			if (!TM.exists(id)) {
				TM.register(id, model.getBurnoutsSettings().interval, function (){controller.handleBurnout(o);} , {max: 1} );
				model.setBurnout({setId: o.setId, helperNo: o.helperNo, id: id});
			}
		},

		/*
		 * Handles burnout for specified helper
		 * Function called by TM; means that condition for burnout has been meet and specified helper should receive a skip flag
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set this step belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 */
		handleBurnout: function (o) {
			if (model.getSetById(o.setId)){
				model.getActiveStepFromSet(o.setId).show[o.helperNo].status = helperStatus.skip;
				model.removeBurnout(o);
			}
		},

		/*
		 * Clears burnouts for all helpers from set (IF they have a burnout)
		 * Function called by controller if displayed step has changed. Removes the (unfulfilled) burnouts from TM and local collection
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set this step belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 */
		removeBurnoutsForSet: function (setId) {
			var burnouts = model.getBurnoutsForSet(setId);

			if (burnouts) {
				$.each(burnouts, function (helperNo, id){
					if (TM.exists(id)) {
						TM.unregister(id);
					}
				});
				model.removeBurnoutsForSet(setId);
			}
		},

		/*
		 * Clears burnout for specified helper
		 * Function called by controller after the Burnout condition got fulfilled
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - ID of set this step belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 */
		removeBurnout: function (o) {
			var id = 'helpers_set_' + o.setid + '_helper_no_' + o.helperNo;
			if (TM.exists(id)) {
				TM.unregister(id);
			}
			model.removeBurnout(o);
		},

		getActiveInGroup: function(groupId) {
			var setId = model.getFirstFromGroup(groupId);
			if(setId) {
				return {group: groupId, setId: setId};
			}
			else {
				return false;
			}
		},

		prioritizeInGroup: function (setId) {
			var groupId = model.prioritizeInGroup(setId);
			if (groupId) {
				view.removeHelpersForGroup(groupId);
			}
		},

		/*
		 * Logger displaying status of game helpers
		 * By default: displays active steps for all configured sets
		 *
		 * @param {object} o - optional settings object
		 * @param {string | array} setId - display data only for specified ID(s).
		 * @param {bool} showAll - show all steps for sets instead of only the active one
		 *
		 */
		showStatus: function (o) {
			o = o || {};
			var set, active, helperInfo, showActive, showAll, showData, pointer;

			helperInfo = function (i, helper){
				if (helper.type === helperType.highlighter) {
					//console[(helper.status && helper.status == helperStatus.skip) ? 'error' : 'log'](i + '.', 'highlighter', helper.show_once?'show once':'', 'status: ' + helper.status, 'selector: ' + helper.selector);
					console.log((helper.status && helper.status === helperStatus.skip) ? String.fromCharCode(0x2613) : (helper.status || ''), i + '.', String.fromCharCode(0x274F), helper.show_once?'show once':'', 'selector: ' + helper.selector);
				} else {
					switch(helper.direction) {
						case 'e':
							pointer = String.fromCharCode(0x25B6);
							break;
						case 's':
							pointer = String.fromCharCode(0x25BC);
							break;
						case 'w':
							pointer = String.fromCharCode(0x25C0);
							break;
						default:
							pointer = String.fromCharCode(0x25B2);
							break;
					}

					console.log((helper.status && helper.status === helperStatus.skip) ? String.fromCharCode(0x2613) : (helper.status || '') , i + '.', pointer, 'selector: ' + helper.selector);
				}
			};

			showActive = function (setId) {
				set = model.getSetById(setId);
				if (!set) {
					console.error('NO set for ID:', setId);
					return false;
				}
				active = model.getActiveStepFromSet(setId);
				if (active) {
					console.group('Set ID: ' + setId, (set.groupId?'Group ID: ' + set.groupId : ''));
						console.info('Found selector: ', active.search, $(active.search));
						console.group('Helpers shown:');
							$.each(active.show, helperInfo);
						console.groupEnd();
					console.groupEnd();
				} else {
					console.error('There are no active helpers for set:', setId);
				}
			};

			showAll = function (setId) {
				console.log('::[ Show all ]::');
				set = model.getSetById(setId);
				if (!set) {
					console.error('NO set for ID:', setId);
					return false;
				}

				active = model.getActiveStepFromSet(setId);

				console.group('Set ID: ' + setId, (set.groupId?'Group ID: ' + set.groupId : ''));
					if (active) {
						console.info('Found selector: ', active.search, $(active.search));
						console.group('Helpers shown:');
							$.each(active.show, helperInfo);
						console.groupEnd();
					} else {
						console.error('There are no active helpers for set:', setId);
					}

					console.group('All steps:');
						$.each(set.steps, function (i, step){
							console.info('Search for: ', step.search, $(step.search));
							console.groupCollapsed('Helpers:');
								$.each(step.show, helperInfo);
							console.groupEnd();
						});

					console.groupEnd();

				console.groupEnd();
			};

			showData = function (setId){
				console.log('::[ Data ]::');
				set = model.getSetById(setId);
				if (!set) {
					console.error('NO set for ID:', setId);
					return false;
				}

				active = model.getActiveStepFromSet(setId);
				$.each(active.show, function (i,el){
					console.log(i, el);
				});
			};

			console.group('GameHelpers manager');
			if (model.getSets()) {
				if (o.setId) {
					if ($.isArray(o.setId)) {
						$.each(o.setId, function (i, setId) {
							if (o.show_all) {
								showAll(setId);
							} else {
								showActive(setId);
							}
							if (o.data) {
								showData(setId);
							}
						});
					} else {
						if (o.show_all) {
							showAll(o.setId);
						} else {
							showActive(o.setId);
						}
						if (o.data) {
							showData(o.setId);
						}
					}
				} else {
					$.each(model.getSets(), function (setId, set) {
						if (o.show_all) {
							showAll(setId);
						} else {
							showActive(setId);
						}
						if (o.data) {
							showData(setId);
						}
					});
				}
			} else {
				console.error('There are no active helpers');
			}
			console.groupEnd();

			console.log(model.getGroups());
			return false;
		},

		/*
		 * Turn on / off animations
		 *
		 */
		changeAnimationStatus: function (o){
			if (o.animate){
				view.startAnimation(o);
			} else {
				view.stopAnimation(o);
			}
		},

		removeAllSets: function() {
			controller.clearSniffers();
		},

		/*
		 * Removes set from data. If no sets are left - removes GameHelpers' sniffers
		 *
		 * @param {string} setId - ID of set to remove
		 *
		 */
		removeSet: function (o){
			var setId, groupId;

			if (typeof o === 'string') {
				setId = o;
			} else if ($.isPlainObject(o)){
				setId = o.setId;
				groupId = o.groupId;
			}

			if (!setId && ! groupId ) {
				throw 'No set specified for deletion. Required setId or groupId';
			}

			if (setId){ //remove a single element
				if (!model.getSetById(setId)){
					return false;
				}

				groupId = model.getSetById(setId).groupId;
				view.removeHelpersForSet(setId);
				model.removeSetById(setId);
			} else if (groupId) { // remove every set from a group
				view.removeHelpersForGroup(groupId);
				model.removeGroupById(groupId);
			}

			if (model.isSetListEmpty()){
				controller.clearSniffers();
			}
		},

		/*
		 * Remove sniffers
		 */
		clearSniffers: function () {
			model.setSniffersStatus(false);
			controller.last_step = null;
		},

		/*
		 * Just remove the garbage
		 */
		destroy : function () {
			templates = data = l10n = null;
			controller.clearSniffers();
			view.destroy();
			model.destroy();
		}
	};
});
