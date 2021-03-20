/* globals us */

define('tutorial/arrow_model', function(require) {
	'use strict';

	var burnouts = {settings: {
			interval: 2000 //ms
	}, list: {}};

	var data = {};

	/**
	 * Model
	 */
	return {

		initialize : function(input_data) {
			data = input_data;
		},

		/*
		 * Gets burnouts settings object
		 *
		 * @return {object} settings
		 */
		getBurnoutsSettings: function () {
			return burnouts.settings;
		},

		/*
		 * Gets collection of burnouts for set
		 *
		 * @param {string} setId - ID of set to look for
		 *
		 * @return {object} - object of burnouts
		 */
		getBurnoutsForSet: function (setId) {
			return burnouts.list[setId];
		},

		/*
		 * Gets single burnout from set
		 *
		 * @param {object} o - main settings object
		 * @param {string} setId - ID of set which this helper belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 * @return {string | false} - burnout ID
		 */
		getBurnout: function (o) {
			if (burnouts.list[o.setId]) {
				return burnouts.list[o.setId][o.helperNo];
			} else {
				return false;
			}
		},

		/*
		 * Sets single burnout for set
		 *
		 * @param {object} o - main settings object
		 * @param {string} setId - ID of set which this helper belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 * @param {string} id - burnout ID
		 *
		 */
		setBurnout: function (o) {
			burnouts.list[o.setId] = burnouts.list[o.setId] || {};
			burnouts.list[o.setId][o.helperNo] = o.id;
		},

		/*
		 * Removes all burnouts for set
		 *
		 * @param {string} setId - ID of set to clear
		 *
		 */
		removeBurnoutsForSet: function (setId) {
			delete burnouts.list[setId];
		},

		/*
		 * Removes single burnout from set
		 *
		 * @param {object} o - main settings object
		 * @param {string} setId - ID of set which this helper belongs to
		 * @param {num} helperNo - helper's order no in the collection
		 *
		 */
		removeBurnout: function (o) {
			if (burnouts.list[o.setId]) {
				delete burnouts.list[o.setId][o.helperNo];
			}
		},

		/*
		 * Gets a status of helpers sniffers
		 *
		 * @return {bool} sniffers active / inactive
		 */
		getSniffersStatus: function () {
			return data.sniffers;
		},

		/*
		 * Sets status of helper sniffers
		 *
		 * @param {bool} bool - sniffers active / inactive
		 */
		setSniffersStatus: function (bool) {
			data.sniffers = bool;
		},

		/*
		 * Gets all sets from the model filtered for arrogant
		 * If sets contain a stepset w
		 * hich is arrogant, only this one is returned
		 *
		 * @return {object | false} - object of all sets
		 */
		getSets: function () {
			var arrogant_sets = {}, all_sets = data.sets, setId;

			for (setId in all_sets) {
				if (all_sets.hasOwnProperty(setId) && all_sets[setId].arrogant === true) {
					arrogant_sets[setId] = all_sets[setId];
					return arrogant_sets;
				}
			}

			return data.sets;
		},

		/*
		 * Gets set by ID
		 *
		 * @param {string} setId - ID of set to return
		 *
		 * @return {object | false} - object of all sets
		 */
		getSetById: function (setId) {
			if (this.getSets()) {
				return data.sets[setId];
			} else {
				return false;
			}
		},

		hasSetForId: function (setId) {
			return !!this.getSetById(setId);
		},

		getStepsForSet: function (setId) {
			var set = this.getSetById(setId);
			if (set) {
				return set.steps;
			} else {
				return false;
			}
		},
		/*
		 * not needed ATM?
		 *
		getFirstInactiveStepFromSet: function (setId) {
			var set = data.sets[setId],
				steps = set.steps,
				s_l = steps.length,
				i;
			for (i = 0; i < s_l; i++) {
				if (steps[i].status !== stepStatus.active && steps[i].status !== stepStatus.done) {
					return {step: steps[i], id: i};
				}
			}
		},*/

		/*
		 * Gets active step for specified set
		 *
		 * @param {string} setId - ID of set to look for
		 *
		 * @return {object | false} - object of active step
		 */
		getActiveStepFromSet: function (setId) {
			var set = this.getSetById(setId);
			if (set) {
				return set.activeStep || false;
			} else {
				return false;
			}
		},

		/*
		 * Set a active step in set
		 *
		 * @param {object} o - settings object
		 *
		 * @param {string} setId - ID of set to modify
		 * @param {object} step - reference to step object
		 */
		setActiveStep: function (o) {
			var set = this.getSetById(o.setId);
			if (set) {
				if (set.activeStep) {
					set.activeStep.status = false;
				}
				set.activeStep = o.step;
			} else {
				throw 'Trying to set active step for non existing set';
			}
		},

		removeActiveStep: function (setId) {
			var set = this.getSetById(setId);
			if (set && set.activeStep) {
				set.activeStep.status = false;
				set.activeStep = false;
			}
		},

		/*
		 * Adds set of helpers to data.
		 * If set for given ID already exists - it will be replaced
		 *
		 * @param {object} o - settings object
		 * @param {string} setId - unique ID of set to add.
		 * @param {array} steps - array of steps objects
		 *
		 */
		addSet: function (o) {
			data.sets = data.sets || {};

			data.sets[o.setId] = {
				arrogant : o.arrogant === true,
				activeStep: null,
				steps: o.steps
			};

			if (o.groupId) {
				data.sets[o.setId].groupId = o.groupId;

				data.setGroups = data.setGroups || {};
				data.setGroups[o.groupId] = data.setGroups[o.groupId] || [];
				if (!us.contains(data.setGroups[o.groupId], o.setId)) {
					data.setGroups[o.groupId].push(o.setId);
				}
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
			var set = this.getSetById(o.setId);
			if (set) {
				set.steps.push(o.steps);
			} else {
				this.addSet(o);
			}
		},

		removeSetById: function (setId) {
			if (this.getSetById(setId)) {
				var groupId = this.getSetById(setId).groupId,
					group, position;
				if (groupId) {
					group = this.getGroupById(groupId);
					if (group.length > 1) {
						position = $.inArray(setId, group);
						if (position !== -1) {
							group.splice(position, 1);
						}
					} else {
						delete data.setGroups[groupId];
					}
				}
				delete data.sets[setId];
			} else {
				return false;
			}
		},

		isSetListEmpty: function () {
			return us.isEmpty(data.sets);
		},

		setStepsforSet: function (o) {
			data.sets[o.setId].steps = o.steps;
			data.sets[o.setId].activeStep = null;
		},

		getGroups: function () {
			return data.setGroups;
		},

		getGroupById: function (groupId) {
			if (this.getGroups()) {
				return this.getGroups()[groupId];
			} else {
				return false;
			}
		},

		getFirstFromGroup: function (groupId) {
			if (this.getGroupById(groupId)) {
				return us.first(this.getGroupById(groupId));
			} else {
				return false;
			}
		},

		prioritizeInGroup: function (setId) {
			var groupId, group;
			if (this.getSetById(setId)) {
				groupId = this.getSetById(setId).groupId;
				group = this.getGroupById(groupId);

				if (us.first(this.getGroupById(groupId)) !== setId) {
					group.splice(0, 0, group.splice($.inArray(setId, group), 1)[0]);

					return groupId;
				} else {
					return false;
				}
			} else {
				return false;
			}
		},

		removeGroupById: function (groupId) {
			if (this.getGroupById(groupId)) {
				$.each(this.getGroupById(groupId), function (i, setId) {
					if (this.removeSetById) {
						this.removeSetById(setId);
					}
				});
			} else {
				return false;
			}
		},

		destroy : function () {}
	};
});
