/* global Layout, GPWindowMgr, _, GameEvents, gpAjax, GameData, GameDataPremium, Game, NotesWindowFactory, BuildingWindowFactory, MarketWindowFactory */
(function($, window) {
	'use strict';

	var features = require('data/features'); //jshint ignore:line
	var FarmTownWindowFactory = require('features/farmtowns/factories/farm_town_window_factory'); //jshint ignore:line

	//@todo this entire "module" is refered only from two places, maybe we can move it to interface default ?

	var LayoutModules = window.LayoutModules || (window.LayoutModules = {});

	LayoutModules.LinkHandling = function() {
		this.decodeFragment = function (e) {
			var link = $(e.target).closest('a'),
				href = link.attr('href'),
				c_name = link.attr('class'),
				fragment,
				gptown, gpplayer, gpisland, gpwonder, gpgoto_wonder, gp_inventory, gp_item_reward,
				gp_item_reward_not_stashable, gp_item_reward_all, gp_premium_exchange,
				parent;

			if (!href) {
				//check if parent node has href
				parent = $(e.target).parent('a');

				if(parent.length){
					href = parent.attr('href');
				} else {
					return null;
				}
			}

			gptown = c_name === 'gp_town_link';
			gpplayer = c_name && c_name.indexOf('gp_player_link') !== -1;
			gpisland = c_name === 'gp_island_link';
			gpwonder = c_name === 'gp_wonder_link';
			gpgoto_wonder = c_name === 'gp_goto_wonder_link';
			gp_inventory = c_name === 'gp_inventory_link';
			gp_item_reward_not_stashable = (c_name && c_name.indexOf('gp_item_reward_not_stashable') !== -1);
			gp_item_reward_all = (c_name && c_name.indexOf('gp_item_reward_all') !== -1);
			gp_item_reward = (!gp_item_reward_all && !gp_item_reward_not_stashable && c_name && c_name.indexOf('gp_item_reward') !== -1);
			gp_premium_exchange = c_name === 'gp_premium_exchange_link';

			if (gp_premium_exchange)  {
				e.preventDefault();
				MarketWindowFactory.openWindow();
				return;
			}

			// chop off fragment
			fragment = [];
			if (href) {
				fragment = href.split('#').reverse()[0].split('.');
			}
			if (!fragment[0] || !fragment.length || (e.originalEvent && e.originalEvent.button) || (e.button && e.button !== 0)) {
				return null;
			}

			// TODO remove bit-magic in favor of clean code
			// jshint ignore:start
			if ((gptown | gpplayer | gpisland | gpwonder | gpgoto_wonder | gp_inventory | gp_item_reward | gp_item_reward_not_stashable | gp_item_reward_all)) {
				e.preventDefault();
				return this.checkTownOrPlayerLink(e, fragment[0], (gp_item_reward_all << 8) + (gp_item_reward_not_stashable << 7) + (gp_item_reward << 6) + (gptown << 5) + (gpplayer << 4) + (gpisland << 3) + (gpwonder << 2) + (gpgoto_wonder << 1) + gp_inventory);
			} else if (this.Menu.followLink(fragment, link)) {
				e.preventDefault();
			}
			// jshint ignore:end
		}.bind(this);
	};

	//TODO remove bit-magick
	//jshint ignore:start
	/**
	 * checks if a event was triggered by a town link.
	 * if so, it opens the context menu.
	 *
	 * @param e Event
	 * @param fragment String URI-Fragment, should be base64-encoded
	 * @param bitmask Number contains type (player/window/island ...)
	 */
	LayoutModules.LinkHandling.prototype.checkTownOrPlayerLink = function(e, fragment, bitmask) {
		var data,
			gptown   = bitmask & 32,
			//gpplayer = bitmask & 16,
			gpisland = bitmask & 8,
			gpwonder = bitmask & 4,
			gpgoto_wonder = bitmask & 2,
			gp_inventory = bitmask & 1,
			gp_item_reward = bitmask & 64,
			gp_item_reward_not_stashable = bitmask & 128,
			gp_item_reward_all = bitmask & 256;

		// decode base64-encoded json:
		data = fragment !== 'skip_parsing' ? $.parseJSON(atob(fragment)) : {};

		if (gptown) {
			// open farm villages and player town differently
			if (features.battlepointVillagesEnabled()) {
				if (data.tp === 'farm_town') {
					FarmTownWindowFactory.openWindow(data.id);
				} else {
					// let the system figure out which correct type (own_town, town, current_town)
					Layout.contextMenu(e, 'determine', data);
				}
			} else {
				// old behavior - figure out all types of towns
				Layout.contextMenu(e, 'determine', data);
			}
		} else if (gpisland) {
			// ... island info ...
			Layout.contextMenu(e, 'island', data);
		} else if (gpwonder) {
			Layout.contextMenu(e, 'wonder', data);
		} else if (gp_inventory) {
			Layout.contextMenu(e, 'inventory', $.extend(data, {
				item_position: {
					inventory_trash: {
						x: 0,
						y: -1
					}
				}
			}));
		} else if (gp_item_reward) {
			Layout.contextMenu(e, 'item_reward', data);
		} else if (gp_item_reward_not_stashable) {
			Layout.contextMenu(e, 'item_reward_not_stashable', data);
		} else if (gp_item_reward_all) {
			Layout.contextMenu(e, 'item_reward_all', data);
		} else {
			// ... or player info
			Layout.playerProfile.open.call(Layout, data.name, data.id);
		}

		return data;
	};
	//jshint ignore:end

	/**
	 * !!! This method is DEPRECATED, please do NOT use it anymore !!!
	 *
	 * I left it here, because there are too many uses of it.
	 */
	LayoutModules.LinkHandling.prototype.Menu = {
		// jshint maxcomplexity: 25
		followLink: function(type, target) {
			var namespace = type[1],
				params = {};
			switch (type[0]) {
				case 'messages':
					Layout.wnd.Create(GPWindowMgr.TYPE_MESSAGE, _('Messages'));
					$.Observer(GameEvents.menu.click).publish({option_id : 'messages'});
					return true;
				case 'reports':
					Layout.wnd.Create(GPWindowMgr.TYPE_REPORT, _('Reports'));
					$.Observer(GameEvents.menu.click).publish({option_id : 'reports'});
					return true;
				case 'alliance':
					Layout.wnd.Create(GPWindowMgr.TYPE_ALLIANCE);
					$.Observer(GameEvents.menu.click).publish({option_id : 'alliance'});
					return true;
				case 'allianceforum':
					Layout.allianceForum.open();
					$.Observer(GameEvents.menu.click).publish({option_id : 'allianceforum'});
					return true;
				case 'settings':
					Layout.wnd.Create(GPWindowMgr.TYPE_PLAYER_SETTINGS, _('Settings'));
					$.Observer(GameEvents.menu.click).publish({option_id : 'settings'});
					return true;
				case 'profile':
					Layout.wnd.Create(GPWindowMgr.TYPE_PLAYER_PROFILE_EDIT, _('Edit profile'));
					$.Observer(GameEvents.menu.click).publish({option_id : 'profile'});
					return true;
				case 'activate':
					if (namespace) {
						gpAjax.ajaxGet('premium_features', 'enough_gold_for_advisor', {
							'advisor': namespace
						}, true, function(data) {
							var text;

							if (data.enough) {
								text = GameData.texts[namespace + '_confirm'];
								Layout.showConfirmDialog(text.title, text.content, function(){
									GameDataPremium.getPremiumFeaturesModel().extend(namespace, false);
								}, null, 'onCancel', null, 'onCheck', text.check);
							} else {
								window.NoGoldDialogWindowFactory.openWindow('buy_advisor');
							}
						});
					}
					return true;
				case 'premium':
					// #premium.name_of_advisor:
					if (namespace) {
						params = {sub_content : 'premium_overview', sub_tab: namespace};
					}
					Layout.wnd.Create(GPWindowMgr.TYPE_PREMIUM, _('Premium'), params);
					return true;
				case 'premium_buy_gold':
					params.sub_content = 'buy_gold';
					if (namespace) {
						params.source = namespace;
					}
					Layout.wnd.Create(GPWindowMgr.TYPE_PREMIUM, _('Premium'), params);

					//Triggers
					$.Observer(GameEvents.menu.click).publish({option_id : 'premium_buy_gold'});
					$.Observer(GameEvents.button.buy_gold.click).publish({});

					return true;
				case 'logout':
					gpAjax.ajaxPost('player', 'logout', {}, true, function() {});
					return true;
				case 'memo':
					NotesWindowFactory.showMemoWindow();
					return true;
				case 'building':
					BuildingWindowFactory.open(namespace);
					return true;
				case 'invite_friends':
					Layout.wnd.Create(GPWindowMgr.TYPE_INVITE_FRIENDS, _('Invite players'));
					Game.invitation_path = {src: 'menu'};
					$.Observer(GameEvents.menu.click).publish({option_id : 'invite_friends'});
					return true;
				case 'forum':
				case 'help':
					if (target) {
						window.open(target.attr('js-data'));
						$.Observer(GameEvents.menu.click).publish({option_id : type[0]});
					}
					return true;
				default:
					return false;
			}
		}
	};
})(jQuery, window);
