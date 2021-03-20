/* global DM, ITowns, HelperTown, WMap, MapTiles, GPWindowMgr, GameEvents, Game,
GameDataPowers, ConfirmationWindowFactory, Timestamp */
/*
 * Replacement for TownInfo
 */

(function() {
	'use strict';

	var OlympusHelper = require('helpers/olympus');

	//PRIVATE METHODS
	function townType(town) {
		var active_town_id = Game.townId;
		if(typeof ITowns === 'undefined' || ITowns.getTown(town.id) === undefined) {
			return 'town';
		} else if(parseInt(active_town_id, 10) === parseInt(town.id, 10)) {
			return 'current_town';
		} else {
			return 'own_town';
		}
	}

	function getTempleMenuIcons(temple_data) {
		var OlympusStages = require('enums/olympus_stages'),
			olympus = OlympusHelper.getOlympusModel(),
			small_temple_stage_timestamp = olympus.getOlympusSmallOceanTempleStageTimestamp(),
			olympus_stage_timestamp = olympus.getOlympusOlympusStageTimestamp(),
			is_pre_temple_stage = olympus.getOlympusStage() === OlympusStages.PRE_TEMPLE_STAGE,
			is_olympus_stage = olympus.getOlympusStage() === OlympusStages.OLYMPUS_STAGE,
			temple = OlympusHelper.getTempleByIslandXAndIslandY(temple_data.ix, temple_data.iy),
			is_owner =  Game.alliance_id && temple.getAllianceId() === Game.alliance_id,
			now = Timestamp.now(),
			result = ['info', 'jump_to'];

		is_pre_temple_stage = is_pre_temple_stage || small_temple_stage_timestamp > now;
		is_olympus_stage = is_olympus_stage || olympus_stage_timestamp <= now;

		if (!is_pre_temple_stage) {
			result = result.concat('attack', 'support');
		}

		if (is_olympus_stage && temple.isPortalTemple() && is_owner) {
			result = result.concat('portal_attack_olympus', 'portal_support_olympus');
		}

		return result;
	}

	function ContextMenu(opt){
		var options = opt,//contains type
			texts = DM.getl10n('context_menu', 'titles');

		var event_sub_context = 'context_menu';

		var menu_node;

		function executeOlympusTempleAction(action, data) {
			var OlympusWindowFactory = require('features/olympus/factories/olympus_window_factory'),
				temple = OlympusHelper.getTempleByIslandXAndIslandY(data.ix, data.iy);

			switch (action) {
				case 'info':
					OlympusWindowFactory.openTempleInfoWindow(temple.getId());
					break;
				case 'attack':
				case 'support':
					GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, temple.getName(), {'action': action}, {id: temple.getId()});
					break;
				case 'portal_attack_olympus':
				case 'portal_support_olympus':
					OlympusHelper.openPortalActionWindow(action, temple.getId());
					break;
				case 'jump_to':
					WMap.mapJump(data, false, function () {
						$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
					});
					break;
				default:
					break;
			}
		}

		/**
		 *
		 */
		function executeAction(action) {
			var UIopt = {'action' : action};
			if (opt.type === 'farm_town') {
				//farm town
				var title_postfix = '<span class="farm_town_title_postfix">' + options.town.name + '</span>',
					title_prefix = DM.getl10n('context_menu', 'title_prefixes')[action],
					origin_town_id;

				//If user want to attak some farm in the farm overview, but the farm is on the different island
				var farm_town_window = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_FARM_TOWN_OVERVIEWS);

				if (farm_town_window) {
					var root = farm_town_window.getJQElement(),
						selected_town = root.find('#fto_town_list li.active');

					origin_town_id = ((selected_town.attr('class') || '').match(/town(\d+)/)[0]).substr(4);
				}

				if (options.town.origin_town_id) {
					origin_town_id = options.town.origin_town_id;
				}

				if (origin_town_id && origin_town_id !== Game.townId) {
					HelperTown.townSwitch(origin_town_id);
				}

				GPWindowMgr.Create(GPWindowMgr.TYPE_FARM_TOWN, title_prefix + ' ' + title_postfix, UIopt, options.town.id);
			} else if (opt.type === 'wonder' || opt.type === 'alliance_wonder_list') {
				// wonder
				switch(action){
					case 'info':
						GPWindowMgr.Create(GPWindowMgr.TYPE_WONDERS, options.town.name, {}, options.town.ix, options.town.iy);
						break;
					case 'jump_to':
						WMap.mapJump(options.town);
						$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
						break;
					case 'wonder_donations':
						require('features/world_wonder_donations/factories/world_wonder_donations')
							.openWindow(options.town.wonder_type);
						break;
				}
			} else if (opt.type === 'island') {
				switch(action){
					case 'island_info':
						GPWindowMgr.Create(GPWindowMgr.TYPE_ISLAND, '', {}, opt.town);
						break;
					case 'jump_to_island':
						WMap.mapJump(opt.town);
						$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
						break;
					case 'ww_info':
						GPWindowMgr.Create(GPWindowMgr.TYPE_WONDERS, options.town.wn, {}, options.town.ix, options.town.iy);
						break;
				}
			} else if (opt.type === 'invite_to_colo_flag') {
				// only used for invitation spots + colo flags
				switch (action) {
					case 'colonize':
						require('features/colonization/factories/colonization_window').openWindow({
							'target_x': opt.town.ix,
							'target_y': opt.town.iy,
							'target_number_on_island': opt.town.nr
						});
						break;
					case 'invite_a_friend':
						window.WndHandlerInviteFriends.selectSpotOnMap(opt.town);
						break;
				}
			} else if(opt.type === 'temple') {
				executeOlympusTempleAction(action, opt.town);
			} else {
				// town
				var id = {
					id : options.town.id
				};

				switch (action) {
					case 'goToTown': // Town Index
						// Switch town
						HelperTown.townSwitch(options.town.id);

						$.Observer(GameEvents.ui.bull_eye.radiobutton.city_overview.click).publish();
						break;
					case 'select_town':
						HelperTown.townSwitch(options.town.id);
						break;
					case 'attack': // Attack tab
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name ,UIopt, id);
						break;

					case 'support': // Support tab
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name ,UIopt, id);
						break;

					case 'jump_to':
						// in some cases towns have ix and iy and in other cases x and y, so check which type we have here
						//var x = options.town.ix == undefined ? options.town.x : options.town.ix;
						//var y = options.town.iy == undefined ? options.town.y : options.town.iy;

						WMap.mapJump(options.town, false, function() {
							MapTiles.focusTown(options.town.id);
						});

						$.Observer(GameEvents.ui.bull_eye.radiobutton.island_view.click).publish();
						break;

					case 'info':
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name, UIopt, id);
						break;

					case 'trading':
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name, UIopt, id);
						break;

					case 'espionage':
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name,UIopt, id);
						break;

					case 'god':
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name, UIopt, id);
						break;

				/**
				 * inventory menu
				 */
					case 'inventory_use':
						$.Observer(GameEvents.window.inventory.use).publish({id : options.town.id, options : options});
						break;

					case 'inventory_trash':
						$.Observer(GameEvents.window.inventory.trash).publish({id : options.town.id, options : options});
						break;

				/**
				 * general handling for rewards stored from some events
				 */
					case 'item_reward_use':
						if(typeof options.town.reward_data !== 'undefined' &&
							typeof options.town.reward_data.power_id !== 'undefined' &&
							GameDataPowers.isWasteable(options.town.reward_data.power_id)) {

							var ResourceRewardDataFactory = require('factories/resource_reward_data_factory'),
								reward_data = ResourceRewardDataFactory.fromRewardPowerData(options.town.reward_data);

							ConfirmationWindowFactory.openConfirmationWastedResources(function() {
								$.Observer(options.town.event_group.use).publish({id : options.town.id, data : options.town.data});
							}, null, reward_data);
						} else {
							$.Observer(options.town.event_group.use).publish({id : options.town.id, data : options.town.data});
						}
						break;

					case 'item_reward_stash':
						$.Observer(options.town.event_group.stash).publish({id : options.town.id, data : options.town.data});
						break;

					case 'item_reward_trash':
						$.Observer(options.town.event_group.trash).publish({id : options.town.id, data : options.town.data});
						break;

					default:
						GPWindowMgr.Create(GPWindowMgr.TYPE_TOWN, options.town.name, UIopt, id);
						break;
				}

			}

		}

		/**
		 * Handles animation of menu icons
		 *
		 * @param menu Object List of all elements to be amimated: {icon_name:HTMLElement}
		 * @param pos Object x-  and y-coordinates for circular icon arrangement {icon_name: {{x: Number, y: Number}}
		 * @param r Number Current radius of icons
		 * @param timeout Number Time to pass until recursion begins
		 */
		function animateMenuIcons(menu, pos, r,timeout) {
			var i,
				round_2_decimals = function(n) { return Math.round(n*100)/100; };

			if (r > 60) {
				return;
			}

			for(i in pos){
				if (pos.hasOwnProperty(i)) {
					menu[i].style.left = round_2_decimals(r * pos[i].x) + 'px';
					menu[i].style.top = round_2_decimals(r * pos[i].y) + 'px';
				}
			}
			// recursion
			window.setTimeout(function(){
				animateMenuIcons(menu, pos, r+15, timeout);
			},timeout);
		}

		/**
		 * render context menu icons. first icons is centered, set to null if this
		 * behaviour is not desired.
		 * TODO: implement the feature above!
		 *
		 * @param names Array should contain a list of icon names to be displayed
		 * @return menu HTMLElement
		 */
		function arrangeMenuIcons(names){
			var menu = document.createElement('div');

			var r = 0,
				i,
				cos = Math.cos,
				sin = Math.sin,
				pi = Math.PI,
				pos = {},
				list = {};

			// inner function for markup creation
			function createHTML(name, front){
				var context_icon_caption =
					'<div class="icon_caption">' +
					'<div class="top"></div>' +
					'<div class="middle"></div>' +
					'<div class="bottom"></div>' +
					'<div class="caption">' + texts[name] + '</div>' +
					'</div>';

				var div = document.createElement('div'),
					$div = $(div);

				$div.html(context_icon_caption);

				div.id = name;
				div.className = 'context_icon';

				if (front) {// put element on top
					div.style.zIndex = '5';
				}

				$div.on({
					mouseover: function() {
						$div.data('prev_z_index', $div.css('z-index')).css('z-index', 100);
					},
					mouseout: function() {
						$div.css('z-index', $div.data('prev_z_index')).removeData('prev_z_index');
					}
				});

				// put element in menu list
				list[name] = div;
				//TODO:
				menu.appendChild(div);
			}

			// create stuff and do magic
			// if first icon is not null -> put into center of menu
			if (names[0]) {
				createHTML(names.shift(), true);
			}

			for (i = 0; i < names.length; i++) {
				// skip if empty, null or similar
				createHTML(names[i]);
				// put coordinates in position list
				if (options.town.item_position && options.town.item_position[names[i]]) {
					pos[names[i]] = options.town.item_position[names[i]];
				} else {
					pos[names[i]] = {
						x: cos((i)/names.length * 2 * pi),
						y: sin((i)/names.length * 2 * pi)
					};
				}
			}

			menu.id = 'context_menu';
			//start animation
			animateMenuIcons(list, pos, r, 20);
			//return menu to append to document
			return menu;
		}

		//return HTML to GrepoLayout

		// if type is not clear, get type
		if(opt.type === 'determine') {
			if(!opt.town.tp || opt.town.tp === 'town') {
				opt.type = townType(options.town);
			} else {
				opt.type = opt.town.tp;
			}
		}

		var features = require('data/features');

		switch (opt.type) {
			case 'farm_town':
				if(opt.town.relation_status === 1) {
					menu_node = arrangeMenuIcons(['claim_info', 'pillage_info', 'units_info', 'trading', 'info']);
				} else {
					menu_node = arrangeMenuIcons(['attack']);
				}
				break;
			case 'temple':
				menu_node = arrangeMenuIcons(getTempleMenuIcons(opt.town));
				break;
			case 'town':
				menu_node = arrangeMenuIcons(['info', 'attack','support', 'trading', 'espionage', 'god', 'jump_to']);
				break;
			case 'own_town': //own town
				//opt.town.town_on_map can be true or undefined
				//var town_link_on_the_map = opt.town.town_on_map && opt.town.town_on_map === true; - to enable this go to map_tiles line 687

				menu_node = arrangeMenuIcons(['goToTown', 'attack', 'support', 'trading', 'god', 'info', 'select_town']);
				break;
			case 'current_town': // cu
				menu_node = arrangeMenuIcons(['goToTown', 'god', 'info', 'jump_to']);
				break;
			case 'ghost_town':
				menu_node = arrangeMenuIcons(['info', 'attack', 'support', 'espionage', 'jump_to']);
				break;
			case 'wonder':
				if (features.isWorldWondersDonationScreenEnabled() && opt.town.can_see_donations) {
					menu_node = arrangeMenuIcons(['info', 'jump_to', 'wonder_donations']);
				} else {
					menu_node = arrangeMenuIcons(['info', 'jump_to']);
				}
				break;
			case 'inventory':
				menu_node = arrangeMenuIcons(['inventory_use', 'inventory_trash'/*, 'put_in'*/]);
				break;
			case 'island':
				if (!opt.town.lnk) {
					menu_node = arrangeMenuIcons([]);
					break;
				}

				if (opt.town.wn) {
					menu_node = arrangeMenuIcons(['island_info', 'jump_to_island', 'ww_info']);
				}
				else {
					menu_node = arrangeMenuIcons(['island_info', 'jump_to_island']);
				}
				break;
			case 'invite_to_colo_flag':
				menu_node = arrangeMenuIcons(['invite_a_friend', 'colonize']);
				break;
			case 'item_reward':
				menu_node = arrangeMenuIcons(['item_reward_use', 'item_reward_stash']);
				break;
			case 'item_reward_all':
				menu_node = arrangeMenuIcons(['item_reward_use', 'item_reward_stash', 'item_reward_trash']);
				break;
			case 'item_reward_not_stashable':
				menu_node = arrangeMenuIcons(['item_reward_use']);
				break;
			default:
				menu_node = false;
				break;
		}

		/**
		 * Public API
		 */
		this.open = function(x, y) {
			if (!menu_node) {
				return;
			}

			menu_node.style.left = x + 'px';
			menu_node.style.top  = y + 'px';

			this.open = true;

			// matcher for in-game and maximized forum
			$('#ui_box, #box.forum_tab_box').parent().append(menu_node);

			$(document).on('click', '#context_menu .context_icon', function(event) {
				if (event.originalEvent &&
					event.originalEvent.srcElement &&
					event.originalEvent.srcElement.id === 'compass') {
					// the pointer events polyfill causes extra click events to be triggered in IE10
					// so we ignore events that arise from the '#compass' element
					return false;
				}

				var $target = $(event.currentTarget),
					action = $target.attr('id');

				if (!window.isForum) {
					executeAction(action);
					$.Observer(GameEvents.map.context_menu.click).publish({name: name});
				}

				this.close();

				return false;
			}.bind(this));

			$(document).on('mousedown', '#ui_box, .ui-dialog, .classic_window', function(event) {
				this.close();
			}.bind(this));
		};

		this.close = function() {
			this.open = false;
			$(menu_node).empty().remove();
			$(document).off('click', '#context_menu .context_icon');
			$(document).off('mousedown', '#ui_box, .ui-dialog');
			$.Observer(GameEvents.window.open).unsubscribe(event_sub_context);
		};

		$.Observer(GameEvents.window.open).subscribe(event_sub_context, this.close.bind(this));

		return this;
	}

	window.ContextMenu = ContextMenu;
}());
