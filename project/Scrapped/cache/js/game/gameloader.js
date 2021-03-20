/*global $, debug, Raven, WMap, GameData, MM, WM, GameEvents, GPAjax, WQM, LocalStore, gpAjax, us, ITowns, Game,
HumanMessage, GPMinimap */

// This file initializes and loads the gameData
// and ensures all data has been fetched before interface would make avialable.

// Things we have to load:
//  layout
//	gamedata units, buildings, powers
//	mapdata for first viewport
window.GPGameLoader = function(params) {
	'use strict';

	var that = this,
		DebugCheck = require('misc/debug_check'),
		outstanding = 0,
		template,
		elm = {
			'bar' : $('#load_progress_bar')
		},
		remotedates = params.data_dates,
		requests = [],
		finishloadhooks = [],
		outstandings = [],
		// for 'map' data request.
		map = {
			'mapTemplate': null,
			'mapData': null
		},
		verbose = false,
		$loader = null,
		loading_done = false;

	this.addFinishLoadedHook = function (fn) {
		if (loading_done) {
			fn();
		} else {
			finishloadhooks.push(fn);
		}
	};

	this.isLoadingDone = function() {
		return loading_done;
	};

	function initializeMap() {
		if (window.isForum) {
			// we need no map in the forum
			return;
		}

		// Check needed variables
		if (!map.mapTemplate) {
			debug('Gameloader::mapTemplate is null!');
			return;
		} else if (!map.mapData) {
			debug('Gameloader::mapData is null!');
			return;
		}

		// Render template
		// Clone content div; clean it; set it to hidden
		var wmap = $('#content').clone();
		// apply map template
		wmap
			.empty()
			.attr('id', 'wmap')
			.css({
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%'
			})
			.appendTo('#main_area')
			.html(map.mapTemplate);

		// remove old content node
		$('#content').remove();
		template.remove();
		$loader = null;
		template = null;
		elm = null;

		//Initialize data structure
		WMap.initialize(
			map.mapData.islands, // island types gfx and so
			{'islandType' : map.mapData.island_id, 'x' : map.mapData.town_island_x, 'y' : map.mapData.town_island_y},
			map.mapData.map_size,
			map.mapData.map_chunk_pixel_size,
			map.mapData.map_arrow_type,
			map.mapData.data,
			params.models.unit_time_to_arrival
		);

		window.Minimap = new GPMinimap(0.2);

		var MapMovements = require('map/map_movements');
		MapMovements.initialize();

		params.models.unit_time_to_arrival.initializeValues(map.mapData);

		// Cleanup
		map.mapTemplate = null;
		map.mapData = null;
	}

	function everythingLoaded() {
		var i, l = finishloadhooks.length;

		loading_done = true;

		if (verbose) {
			debug('GameLoader: call finishloading hooks');
		}

		for (i = 0; i < l; i++) {
			if (Game.dev) {
				finishloadhooks[i]();
			} else {
				try {
					finishloadhooks[i]();
				} catch (e) {
					Raven.captureException(e);
				}
			}
		}

		initializeMap();

		//Start opening windows which should be show at the start of the game
		WQM.initialize();

		// if login as admin show message
		if (Game.admin) {
			HumanMessage.success(_('No notifications will be deleted as Admin.'));
		}

		$.Observer(GameEvents.game.load).publish({});

		if (Game.debug_check && !Game.admin) {
            DebugCheck.startCheck();
		}
	}

	//
	function loadSuccess(item) {
		// loader_step_<type> hide

		$('#loader_step_' + item).addClass('loading_done');

		if (--outstanding === 0) {
			window.setTimeout(everythingLoaded, 2); // call async.
		}

		elm.bar.css('width', Math.min(((1 - outstanding / 5) * 100), 100).toString() + '%');
	}//end function: loadSuccess

	/**
	 * @param item
	 * @return void
	 */
	function requestRemote(item) {
		var obj = {
			'type': item
		};

		if (item === 'map') {
			var MapHelpers = require('map/helpers');
			obj.param = MapHelpers.pixel2Map($loader.width(), $loader.height());
		}

		requests.push(obj);
	}

    /**
     * @param ok
     * @param data
     * @param item
     * @return void
     */
	function retrieveDataFromCacheCallback(ok, data, item) {
        // Integrity check
		if (!ok || !data || !data.mtime || data.mtime !== remotedates[item] || data.locale_lang !== Game.locale_lang) {
			if (verbose) {
				debug('GameLoader: local integrity check on [' + item + '] failed - requesting remote');
			}

            // On failed integrity check reload from sever
			requestRemote(item);
		} else {
			if (verbose) {
				debug('GameLoader local integry check on [' + item + '] ok - use data');
			}

            var obj = {};
            obj[item] = data.data;
            GameData.add(obj);

            // hook for visualization(UI):
            loadSuccess(item);
		}
	}

	/**
	 * To store elements in the localstorage this function simplifys the call
	 * @param mtime
	 * @param key
	 * @param data
	 * @return void
	 */
	function storeToCache(key, mtime, data) {
		if (LocalStore !== null) {
			LocalStore.gset(key, {mtime: mtime, data: data, locale_lang: Game.locale_lang});
		}
	}

	function handleBackboneData(item) {
		// step over models
		var item_models_length = item.models ? item.models.length : 0,
			single_item;

		for (var idx_item = 0; idx_item < item_models_length; ++idx_item) {
			single_item = item.models[idx_item];

			WM.markPersistentData('models', single_item.model_class_name);
			MM.checkAndPublishRawModel(single_item.model_class_name, single_item.data);
		}

		// step over collections
		var item_collections_length = item.collections.length;

		for (idx_item = 0; idx_item < item_collections_length; ++idx_item) {
			single_item = item.collections[idx_item];

			WM.markPersistentData('collections', single_item.class_name);
			// step over data from collection
			var item_data_length = single_item.data.length;
			for (var idx_data = 0; idx_data < item_data_length; ++idx_data) {
				var col_data = single_item.data[idx_data];
				var model_name = col_data.c,
					model_attributes = col_data.d;

				MM.checkAndPublishRawModel(model_name, model_attributes, {
					sort: false
				});
			}
		}
	}

	// Remote Receive callback
	function receiveRemoteCallback(data) {
		var item,
			idx = 0,
			len = outstandings.length,
            outstanding_item;

		for (; idx < len; ++idx) {
			outstanding_item = outstandings[idx];
			if ((item = data[outstanding_item])) {
				switch (outstanding_item) {
					case 'map':
						map.mapData = item.data;
						map.mapTemplate = item.view;
						break;
					case 'bar':
						window.TempBarData = item.data;
						break;
					case 'backbone':
						handleBackboneData(item);
						break;
					default:
                        storeToCache(outstanding_item, item.mtime, $.parseJSON(item.data));
						GameData[outstanding_item] = $.parseJSON(item.data);
						break;
				}
			}
			loadSuccess(outstanding_item);
		}

		$.Observer(GameEvents.game.start).publish();
		//console.timeEnd('loadingTime');
		// Uncomment to get reliable startup Profiles
		//console.profileEnd('loadingTime');
	}

	this.handleBackboneData = handleBackboneData;

	/**
	 * used by the gameloader to check if data is already locally stored and if its timestamp is correct
	 *
	 * @param {String} _type the type of information that should be loaded, eg. powers
	 */
	function retrieveData(item) {
        // is local store available?
        if (remotedates[item] !== undefined && LocalStore !== null && LocalStore.check()) {
            LocalStore.gget(item, retrieveDataFromCacheCallback, item, that);
        } else {
            // item is not defined in 'remotedates' object or no valid local store; so cant have local copy
            // request on data controller:
            requestRemote(item);
        }
	}

	function addOutstanding(thing) {
		outstandings.push(thing);
		++outstanding;
	}

	/**
	 * BE pushes some collections only with the current town, but we expect there to be more data
	 * We update the data async via a forceUpdate / read call to the API
	 * This helps to load the game and then enables town switching later
	 */
	function reFetchCollectionsOnGameStart() {
		var towns_collection = MM.getOnlyCollectionByName('Town'),
			town_group_town_collection = MM.getOnlyCollectionByName('TownGroupTown'),
			building_build_datas_collection = MM.getOnlyCollectionByName('BuildingBuildData'),
			units_collections = MM.getCollections().Units,
			options = {
				silent: true,
				sort: false
			};

		// re-fetch building-build datas which is not town agnostic
		building_build_datas_collection.reFetch(function() {}, options);

		towns_collection.reFetch(null, options).then(function() {
			// refresh the UI since we update silent
			ITowns.updateFromCollection();
			towns_collection.trigger('add', towns_collection.getCurrentTown());
			town_group_town_collection.reFetch(null, options).then(function() {
				town_group_town_collection.sort();
			});
		});

		// mark 'persistent', otherwise closing a game window deletes the collection
		WM.markPersistentData('collections', 'Towns');
		WM.markPersistentData('collections', 'Units');
		WM.markPersistentData('collections', 'BuildingBuildData');
		WM.markPersistentData('collections', 'CastedPowers');

		// units collection may be town agnostic and can not reFetch (since it is not a GrepolisCollection)
		// so we may have a couple of collections which we all need to refresh
		var refetch_collection = new window.GameCollections.Units();

		// trigger refetch on just one collection, but repopulate all of them (including TownAgnostic)
		refetch_collection.reFetch(null, options).then(function() {
			us.each(units_collections, function(collection) {
				collection.repopulate(options);
			});
			//console.profileEnd('collection_refetch');
		});
	}

	function init() {
		var remote_id,
			item, idx, len;

		//console.time('loadingTime');
		// Uncomment to get reliable startup Profiles
		//console.profile('loadingTime');
		window.gpAjax = new GPAjax(null, false);

		if (verbose) {
			debug('GameLoader - Init!');
		}

		$loader = $('#loader');

		template = $loader.appendTo('body');

		//
		if (verbose) {
			if (LocalStore.check()) {
				debug('GameLoader: local Storage (persist) is available (Type: ' + LocalStore.getType() + ')');
			}
		}

		if (!window.gpAjax) {
			if (verbose) {
				debug('cannot initialize gpajax loader.');
			}
			throw 'Cannot initialize gpajax loader for gameloader!';
		}

		// static stuff
		// until refactored remember to put a corresponding call
		// at AbstractGameController::createDefaultResponse
		// to get the mtime to work
		for (remote_id in remotedates) {
			if (remotedates.hasOwnProperty(remote_id)) {
				// add this static things in AbstractGameController->createDefaultResponse into $params['datadate']
				addOutstanding(remote_id);
			}
		}

		// dynamic stuff
		if (!window.isForum) {
			addOutstanding('map');
			addOutstanding('bar');
			addOutstanding('backbone');
		}

		len = outstandings.length;
		// loop thru all outstanding objects, check for local copy!
		for (idx = 0; idx < len; ++idx) {
			item = outstandings[idx];
            retrieveData(item);
		}

		if (requests.length) {
			gpAjax.ajaxPost('data', 'get', {types: requests}, false, function(data) {
				receiveRemoteCallback(data);
			});
			reFetchCollectionsOnGameStart();
		}
	}

	init();
};
