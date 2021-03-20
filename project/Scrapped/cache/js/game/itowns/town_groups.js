/*globals GameData, HelperTown, GameDataPremium, gpAjax, GameEvents, MM */
/**
 * TownGroups class.
 * Storage of all related information of town groups.
 */

(function() {
	'use strict';

	function TownGroups(town_groups_collection) {

		/**
		 * Private members
		 */

		var that =  this,
		// active group id = {0 [no group active], N [active group]}
			active_group_id = '0',
		// at least a virtual group exists with id = 0
		// the variable is formatted as follows:
		// groups = {0: {id: 0,name: 'virtual', towns:{}}, 'null': {id: null,name: null,towns:{}}, ...}
		// group 'null' is a container for all towns which are not assigned to one group
			groups = {},
			dropdown = null;

		/**
		 * Public methods
		 */

		this.initialize = function(data) {
			var i,
			// sort towns according to our needs
				group,
				virtual_group = {
					id: '0',
					name: 'virtual',
					towns: {}
				}; // virtual group container for all of our towns
			groups = {};

			active_group_id = town_groups_collection.getActiveGroupId();

			if (!data.groups) {
				// no premium:
				groups = {
					'null': {
						id: null,
						name: null,
						towns: {}
					}
				};
			} else {
				// premium
				var l = data.groups.length;
				for (i = 0; i < l; i++) {
					group = data.groups[i];

					groups[group.id] = {
						id: group.id,
						name: group.name,
						towns: {}
					};
					if (group.active) {
						active_group_id = group.id;
					}
				}
			}

			//add towns to groups
			for (i = 0; i < data.towns.length; i++) {
				var gid = data.towns[i].group_id || null,
					tid = data.towns[i].id;

				if (!groups[gid]) {
					groups[gid] = {
						id: gid,
						towns: {}
					};
				}

				groups[gid].towns[tid] = {
					id: data.towns[i].id,
					group_id: gid
				};

				virtual_group.towns[tid] = {
					id: data.towns[i].id
				};
			}

			if (data.tmpl) {
				GameData.add({
					'TownListTemplate' : data.tmpl
				});
			}

			groups['0'] = virtual_group;

			town_groups_collection.on('change:active add', function() {
				active_group_id = town_groups_collection.getActiveGroupId();
			});
		};

		this.townSwitch =  function(gid, tid) {
			HelperTown.townSwitch(tid);
			that.setActiveTownGroup(gid);
		};

		this.setDropdown = function (_dropdown) {
			dropdown = _dropdown;
		};

		/**
		 * Add town to group != {null||0}
		 */
		this.addTo =  function(params) {
			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'add_town_to_group', params, false, that.callbackAdd);
			}
		};

		/**
		 * Callback for adding towns to a group
		 */
		this.callbackAdd = function(return_data) {
			// if successful, do stuff
			if (return_data.success) {
				$.Observer(GameEvents.itowns.town_groups.add).publish(return_data);
			}
		};

		/**
		 * Remove town from group
		 *
		 * @param {Function} [callback]
		 */
		this.removeFrom = function(params, callback) {
			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'remove_town_from_group', params, false, function (return_data) {
					if (return_data.success) {
						$.Observer(GameEvents.itowns.town_groups.remove).publish(return_data);

						if (typeof callback === "function") {
							callback();
						}
					}
				});
			}
		};

		/**
		 * Remove town from group (locally)
		 *
		 * @deprecated
		 */
		this.remove =  function(tid, gid) {

		};

		this.setActiveTownGroup = function(id, callback, props) {
			props = props || {};

			if (id == 'null' || !id) {
				id = '0';
			}

			if ((that.isGroupEmpty(id) || id == active_group_id) && !props.force) {
				return;
			}

			if (GameDataPremium.hasCurator()) {
				gpAjax.ajaxPost('town_group_overviews', 'set_active_town_group', {
					'group_id': id
				}, false, function (data) {
					if (data.success) {
						active_group_id = data.town_group_id;

						if (dropdown) {
							dropdown.find('.fieldset').removeClass('active');
							dropdown.find('#g' + data.town_group_id).parent().addClass('active');
						}

						$.Observer(GameEvents.itowns.town_groups.set_active_group).publish(data);

						if (typeof callback === "function") {
							callback();
						}
					}
				});
			}
		};

		this.getActiveTownGroup = function() {
			return groups[active_group_id];
		};

		this.getGroups = function() {
			var town_groups_towns = MM.getCollections().TownGroupTown[0],
				town_groups = MM.getCollections().TownGroup[0], groups = {};

			town_groups_towns.each(function(town_group_town) {
				var gid = town_group_town.getGroupId(),
					group = groups[gid], town_id = town_group_town.getTownId();

				if (!group) {
					groups[gid] = group = {id: gid, name: town_groups.get(gid).getName(), towns: {}};
				}

				group.towns[town_id] = {id: town_id};
			});

			return groups;
		};

		this.isGroupEmpty = function(id) {
			var town_groups_towns = MM.getCollections().TownGroupTown[0];

			return town_groups_towns.isGroupEmpty(id);
		};

		/**
		 * Callback function for jquery draggable, which is called if sort is finished (town is dropped to list)
		 * Updates group object and recreates the list afterwards.
		 */
		this.stopSort =  function(params, next_row) {
			var ids = params.draggable.attr('id').match(/\d+|null/g),
				town_id = ids[0],
				old_group_id = ids[1],
			/* if not set, the draggable had something like '_gnull'
			 as id, so it was previously ungrouped. */
				group_id = params.draggable.parent().attr('id').substr(1);

			//if already in destination group...
			if (groups[group_id].towns[town_id]) {
				//next_row is used to put the node back in the same place as it was
				params.draggable.insertBefore(next_row);
				return false;
			}

			if (group_id === 'null') {
				that.removeFrom({town_id : town_id, group_id : old_group_id});
			} else {
				//when you drag node, its removed from the origin list, we don't want to show that to user
				params.draggable.insertBefore(next_row);
				that.addTo({town_id : town_id, group_id : group_id});
			}
		};
	}

	window.TownGroups = TownGroups;
}());
