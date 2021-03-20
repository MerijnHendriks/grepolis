/* global us, MM, hOpenWindow, AcademyWindowFactory, GPWindowMgr, HelperTown, debug, PremiumWindowFactory */
/**
 * All the in-game events that should fire a web notification are registered here.
 * Each notification is only shown if the document (i.e. browser tab with the game) is not visible.
 * Keep in mind, that requestAnimationFrame is used by timer manager TM and thus,
 * it's timer events won't be triggered when the document is not visible and can't cause a notification.
 * Use regular timers (setTimeout) for that.
 *
 * The DEFINITIONS object defines
 * 	* categories
 * 		* event_ids (to lookup translations)
 * 			* event: the $.Observer event name
 * 			* onclick(data, event): optional notification click handler
 * 				(data is the object passed to $.Observer)
 * 				(the game tab is automatically focused before)
 */
define('features/web_notifications/notification_listeners', function() {
	'use strict';

	var web_notifications = require('features/web_notifications/web_notifications');
	var GameEvents = require('data/events');
	var DM = require_legacy('DM');
	var VisibilityWrapper = require('features/web_notifications/visibility');
	var l10n = DM.getl10n('web_notifications');
	var advisor_l10n = DM.getl10n('advisor');
	var HeroesWindowFactory = require_legacy('HeroesWindowFactory');

	var noop = function() {};
	var focus = function() { window.focus(); };


	// jump to town on map and show arrow on it:
	// WMap.mapJump(options.town, false, function() {
	//	MapTiles.focusTown(options.town.id);
	// });

	var ACTIONS= {
		openAttackPlan: function(data) {
			hOpenWindow.viewAttackPlan(data.attack_id);
		},
		switchToHeroCityOrOpenCouncil: function(player_hero) {
			var home_town = player_hero.getHomeTownId();
			if (home_town) {
				HelperTown.townSwitch(home_town);
			} else {
				HeroesWindowFactory.openHeroesWindow();
			}
		},
		goToCityOverview: function() {
			$.Observer(GameEvents.ui.bull_eye.radiobutton.city_overview.click).publish();
		},
		openAcademy: function() {
			AcademyWindowFactory.openAcademyWindow();
		},
		openSpellsMenu: function(god_ids) {
			ACTIONS.goToCityOverview();
			$.Observer(GameEvents.ui.spells_menu.request_open).publish({});
		},
		openBuildMenu: function() {
			// TODO switch to full town
			ACTIONS.goToCityOverview();
			$.Observer(GameEvents.ui.layout_construction_queue.construction_mode.activated).publish({});
		},
		openReports: function(notification) {
			hOpenWindow.viewReport(notification.param_id);
		},
		openMessages: function(data) {
			hOpenWindow.viewMessage(data.message_id);
		},
		openTradeOverview: function() {
			hOpenWindow.viewResTransport();
		},
		openAllianceForum: function() {
			GPWindowMgr.Create(GPWindowMgr.TYPE_ALLIANCE_FORUM);
		}
	};

	var DEFINITIONS = {
		combat: {
			attack_incoming: {
				event: GameEvents.attack.incoming
			},
			attack_reminder: {
				event: GameEvents.attack.planner_reminder,
				onclick: ACTIONS.openAttackPlan
			},
			hero_healed: {
				event: GameEvents.hero.healed,
				onclick: ACTIONS.switchToHeroCityOrOpenCouncil
			}
		},
		communication: {
			report_arrived: {
				event: GameEvents.notification.report.arrive,
				onclick: ACTIONS.openReports
			},
			message_arrived: {
				event: GameEvents.notification.message.arrive,
				onclick: ACTIONS.openMessages
			},
			alliance_message_arrived: {
				event: GameEvents.alliance.new_message,
				onclick: ACTIONS.openAllianceForum
			}
		},
		island: {
			island_quest_satisfied: {
				event: GameEvents.island_quest.satisfied
			},
			island_quest_added: {
				event: GameEvents.island_quest.add
			}
		},
		resources: {
			storage_full: {
				event: GameEvents.town.resources.limit_reached,
				onclick: ACTIONS.openBuildMenu
			},
			favor_full: {
				event: GameEvents.town.favor.full,
				onclick: ACTIONS.openSpellsMenu
			},
			trade_arrived: {
				event: GameEvents.town.trade.arrived,
				onclick: ACTIONS.openTradeOverview
			}

		},
		city: {
			building_upgraded: {
				event: GameEvents.town.building.order.done,
				onclick: ACTIONS.goToCityOverview
			},
			// TODO split this into barracks and docks
			barracks_unit_order_done: {
				event: GameEvents.unit.order.change,
				onclick: ACTIONS.goToCityOverview
			},
			// TODO docks_unit_order_done
			research_completed: {
				event: GameEvents.town.research.done,
				onclick: us.compose(ACTIONS.goToCityOverview, ACTIONS.openAcademy)
			}
		}
	};

	/**
	 * Looks up definition and registers an event handler,
	 * that checks visibility and shows a notification.
	 *
	 * @param {string} category - 1st level key in DEFINITIONS
	 * @param {string} event_id - 2nd level key in DEFINITIONS
	 * @private
	 */
	function _registerForNotification(category, event_id) {
		var definition = DEFINITIONS[category][event_id],
			player_settings = MM.getModelByNameAndPlayerId('PlayerSettings'),
			onGameEvent = function(event, data) {
				// if the tab is in the background show notification
				if (player_settings.showWebNotificationsInForegroundTab() || VisibilityWrapper.isHidden()) {
					var onclick = definition.onclick ? definition.onclick.bind(null, data) : noop;
					web_notifications.createBrowserNotification(
						l10n[event_id].title,
						l10n[event_id].body,
						event_id,
						us.compose(onclick, focus)
					);
				}
			};

		if ( !player_settings.isWebNotificationEnabled(category, event_id) ) {
			return;
		}

		$.Observer(definition.event).subscribe(['web_notifications'], onGameEvent);
	}

	function _registerSpecialCases() {
		$.Observer(GameEvents.premium.adviser.expire_soon).subscribe(['web_notifications'], function(event, data) {
			web_notifications.createBrowserNotification(
				l10n.advisor_running_out.title(advisor_l10n[data.advisor_id]),
					l10n.advisor_running_out.body,
				'advisor_running_out',
				function() {
					focus();
					PremiumWindowFactory.openBuyAdvisorsWindow();
				}
			);
		});
	}

	var WebNotificationListeners =  {
		initialize: function() {
			if (web_notifications.notificationsEnabled()) {

				Notification.requestPermission( function(status) {
					// 'granted', 'denied', 'default' (=dismissed)
					// TODO maybe track the player selection
					debug('Browser notification permission status: ' + status);
				});

				_registerSpecialCases();

				Object.keys(DEFINITIONS).forEach(function(category) {
					Object.keys(DEFINITIONS[category]).forEach(function(ev_name) {
						_registerForNotification(category, ev_name);
					});
				});
			}
		},

		destroy: function() {

		}
	};

	// Export needed to make listeners work -> see listeners_manager.js
	window.GameListeners.WebNotificationListeners = WebNotificationListeners;

	return WebNotificationListeners;
});