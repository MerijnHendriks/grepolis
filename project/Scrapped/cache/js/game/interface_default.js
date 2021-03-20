/* global LayoutModules, ContextMenu, ReportViewer, Game, GameEvents, GameDataQuests, ITowns, gpAjax, Layout, WMap, GPWindowMgr, GrepoNotificationStack, CM, TooltipFactory, TM, QuestProgressWindowFactory */
(function() {
	'use strict';

	function GPLayout(opt) {
		// PRIVATE VARS
		var options = opt,
			that = this,

		// cached jQuery objects
			jQElem = {
				'delAllNot': $('#delete_all_notifications'),
				'box': $('#ui_box')
			},

		// cached HTML elements
			elem = {
				'ajaxLoader' : null
			};

		var $document = $(document);

		this.linkHandling = new LayoutModules.LinkHandling();

		this.new_construction_queue = null;

		// PRIVATE METHODS
		function deleteAllNotifications() {
			gpAjax.ajaxPost('notify', 'delete_all', {}, false, function (data) {
				GrepoNotificationStack.loop(function (i, elem, arr) {
					elem.destroy();
					arr.remove(i);
				});
				$.Observer(GameEvents.notification.del_all).publish({
					notifications_count: 0
				});
			});
		}

		/**
		 * Handles messages from the cookie com-link
		 *
		 * @return void
		 */
		function checkCookieTxRxData() {
			//fetch cookie data
			var data = $.cookie('txrx_lnk'),
				menu;

			if (!data) {
				return;
			}
			//reset cookie
			$.cookie('txrx_lnk', '{}', {expires: -1, path: '/'});
			//convert data to object
			data = $.parseJSON(data);

			// com type is forum tab
			if (data.com_type && data.com_type === 1) {
				//open context menu and trigger action
				menu = new ContextMenu({
					'type': 'determine',
					'town': data
				});

				//TODO: trigger action instantly
				// $(menu).find('#' + data.cmd).trigger('mousedown').hide().unbind().remove();
				menu.open(0 ,0);
				$('#context_menu').find('#' + data.cmd).trigger('click');
				menu.close();
			} else if (data.com_type && data.com_type === 2) {
				//TODO: replace array with object
				ReportViewer.dates[data.report_id] = data.report_data;
				if (data.cmd === 'all') {
					ReportViewer.insertAllUnitsToSimulator(true, true, data.report_id);
				} else {
					ReportViewer.insertRemainingUnitsToSimulator(true, true, data.report_id);
				}
			}
		}

		/**
		 * Bind notification events
		 */
		function bindGlobalEvents() {
			$(window).focus(checkCookieTxRxData);
		}

		//TODO: put all layout-onclicks in here.
		function bindEvents() {
			// add a single listener for all town links
			// (and pray that bubbling is not prevented ...)
			if (Game.isiOs()) {
				$document.on('touchstart.tname', 'a', that.linkHandling.decodeFragment);
			} else {
				$document.on('click.tname', 'a', that.linkHandling.decodeFragment);
			}

			//Button to remove all notifications
			jQElem.delAllNot.click(deleteAllNotifications);

			// toggle power

			var popup_div = $('#popup_div');
			popup_div.unbind('.popup').bind({
				'mouseleave.popup' : function () {
					$('#popup_div').hide().clearQueue();
				}
			});
		}

		function initialize(onInit) {
			bindGlobalEvents();
			bindEvents();

			if (typeof onInit === 'function') {
				that.abPlugin = onInit();
			}
		}

		/**
		 *	create Ajax spinner
		 */
		function createAjaxLoader() {
			var top = (jQElem.box.height() / 2),
				left= (jQElem.box.width() / 2),

				$container = $('<div/>', {
					id: 'ajax_loader'
				}),
				$animation = $('<div/>', {
					id: 'ajax_loader_anim'
				});

			$container.css('top', top).css('left', left);
			$container.append($animation);

			jQElem.box.append($container);

			return $container;
		}

		/**
		 *
		 * @param object event
		 * @param object notification
		 */
		function handleConquerAndColonizationUpdate(event, notification) {
			var i,
				towns,
				n,
				ns = event.namespace || '';

			//check which notification-event has been triggered
			if (ns.indexOf('farmConquered') > -1) {
				//if (notification.param_id === 1) { //player has conquered a town
				//} else
				if (notification.param_id === 0) { //player town conquered
					towns = ITowns.getTowns();
					n = 0;
					for (i in towns) {
						if (towns.hasOwnProperty(i)) {
							n++;
						}
					}

					if (n <= 1) {
						//Logout since player's only town is being conquered
						gpAjax.ajaxPost('player', 'logout', {}, true, function (data) {
							// noop
						});
						return;
					} else if (notification.param_str.town_id === Game.townId) {//Auto switch to next town if necessary
						Layout.nextTown();
					}
				}
				/*} else if (ns.indexOf('uninhabitedPlaceColonized') > -1) {*/
			}

			WMap.pollForMapChunksUpdate();
			ITowns.refetch(function () {

			});

			var w = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS);

			if (w) {
				w.getHandler().reloadContent();
			}
		}

		$.Observer(GameEvents.notification.system.arrive).subscribe(['conquestInfo', 'interface_default_js'], handleConquerAndColonizationUpdate);
		$.Observer(GameEvents.notification.system.arrive).subscribe(['uninhabitedPlaceColonized', 'interface_default_js'], handleConquerAndColonizationUpdate);

		/**
		 * Display short message popup
		 * @param Object params
		 */
		this.showShortMessagePopup = function (params) {
			return GPWindowMgr.Create(GPWindowMgr.TYPE_NOTIFICATION_POPUP, params.title, params);
		};

		/**
		 * show ajax spinner, create it if it doesn't exist
		 */
		this.showAjaxLoader = function () {
			if (!elem.ajaxLoader) {
				elem.ajaxLoader = createAjaxLoader();
			}
			$(elem.ajaxLoader)
				.css('zIndex', 10000)
				.css('visibility', 'visible');
		};

		/**
		 * hide spinner
		 */
		this.hideAjaxLoader = function () {
			$(elem.ajaxLoader).css('visibility', 'hidden');
		};

		/**
		 * Show context Menu at mousepos
		 *
		 * @param ev Event
		 * @param type String 'town', 'farm_town', ...
		 * @param town Town Object from Map
		 */

		this.obj_context_menu = null;
		this.contextMenu = function (ev, type, town) {
			//Remove previously created context menu
			if (this.obj_context_menu !== null) {
				this.obj_context_menu.close();
				this.obj_context_menu = null;
			}

			var radius = 120,
				menu = new ContextMenu({
					'type': type,
					'town': town
				}),
				is_click_on_map = $(ev.target).parents('#map').length;

			this.obj_context_menu = menu;

			// set to mousepos
			// mousepos +  scroll_offset- menu_size/2
			var mouseX, mouseY;

			ev = ev.originalEvent || ev;

			mouseX = ev.clientX + $document.scrollLeft() - 18;
			mouseY = ev.clientY + $document.scrollTop() - 18;

			if (Game.isiOs() && ev.type !== 'btn:click') {
				// see GP-14871: the button component passes btn:click instead of tap on iOs
				if (ev.touches && ev.touches.length) {
					mouseX = ev.touches[0].pageX - 18;
					mouseY = ev.touches[0].pageY - 18;
				} else if (ev.changedTouches) {
					mouseX = ev.changedTouches[0].pageX - 18;
					mouseY = ev.changedTouches[0].pageY - 18;
				}
			}

			var maxX = ($(document).width() - radius),
				maxY = ($(document).height() - radius),
				min  = radius,
				l = mouseX < min,
				r = mouseX > maxX,
				t = mouseY < min,
				b = mouseY > maxY,
				xdiff = 0,
				ydiff = 0;

			if (r  || l || b || t) {
				// calculate offset:
				if (l) {
					xdiff = -(mouseX - min);
				} else if (r) {
					xdiff = maxX - mouseX;
				}
				if (t) {
					ydiff = -(mouseY - min);
				} else if (b) {
					ydiff = maxY - mouseY;
				}
				if (is_click_on_map) {
					WMap.reCenter({
						'x': -xdiff / 2,
						'y': -ydiff / 2
					}, 200, function () {
						menu.open(mouseX + xdiff, mouseY + ydiff);
					});
				} else {
					menu.open(mouseX + xdiff, mouseY + ydiff);
				}
			} else {
				menu.open(mouseX, mouseY);
			}

			$.Observer(GameEvents.map.context_menu.click).publish();
		};

		/**
		 * IMPORTANT !!! - Use data/windows/dialog/confirmation
		 */
		this.showConfirmDialog = function (title, text, onConfirmation, confirm_text, onCancel, cancel_text, onCheck, check_text, css_class, use_player_hint) {
			window.hOpenWindow.showConfirmDialog(title, text, onConfirmation, confirm_text, onCancel, cancel_text, onCheck, check_text, css_class, use_player_hint);
		};

		/* =========================
		 * Window System
		 * (moved to own file: gpwindowmgr.js)
		 * =========================
		 */
		this.wnd = GPWindowMgr;
		this.wnd.extendLayoutWithShortLinks(this);
		this.wnd.setMaxConcurrent(options.wndMaxConcurrent);

		this.supportPopup = function (url, width, height) {
			var w = window.open(url, 'popup', 'width=' + width + ',height=' + height + ',resizable=yes,scrollbars=yes');
			w.focus();
		};

		this.insertEventTrackingCode = function (event_tracking_code) {
			$('#event_tracking_code').html(event_tracking_code);
		};

		/**
		 * IMPORTANT: DO NOT REMOVE FOR QUICKBAR COMPATIBILITY!!!!
		 *
		 * @type {{open: Function}}
		 */
		this.buildingWindow = {
			open : function(type) {
				switch(type) {
					case 'main':
						window.MainWindowFactory.openMainWindow();
						break;
					case 'barracks':
						window.BarracksWindowFactory.openBarracksWindow();
						break;
					case 'docks':
						window.BarracksWindowFactory.openDocksWindow();
						break;
					case 'place':
						window.PlaceWindowFactory.openPlaceWindow();
						break;
					case 'temple':
                        window.GodSelectionWindowFactory.openWindow();
						break;
					case 'academy':
						window.AcademyWindowFactory.openAcademyWindow();
						break;
					case 'market':
						window.MarketWindowFactory.openWindow();
						break;
					case 'hide':
						window.HideWindowFactory.openHideWindow();
						break;
				}
			}
		};

		this.initProgressableViews = function(tutorial_quests_collection, island_quests, questlog_icon_l10n) {
			var QuestlogIconController = require('features/questlog/controllers/questlog_icon');

			this.tutorialQuestsView = new QuestlogIconController({
				el: $('#questlog'),
				cm_context : {
					main : 'questlog',
					sub : 'questlog_icon'
				},
				collections: {
					tutorial_quests: tutorial_quests_collection,
					island_quests : island_quests
				},
				l10n : {
					questlog_icon_l10n : questlog_icon_l10n
				}
			});
		};

		this.initDailyLoginIcon = function(daily_login_model, daily_login_l10n) {
			var DailyLoginController = require('features/daily_login/controllers/daily_login_icon');
			this.daily_login_icon_controller = new DailyLoginController({
				el: $('#daily_login_icon'),
				cm_context : {
					main : 'new_ui',
					sub : 'daily_login_icon'
				},
				models : {
					daily_login : daily_login_model
				},
				l10n : {
					daily_login : daily_login_l10n
				}
			});
		};

		this.initEffectsIcon = function (benefits_collection, l10n) {
			var EffectsIconController = require('features/effects_icon/controllers/effects_icon');

			this.effects_icon_controller = new EffectsIconController({
				el: $('#effects_icon'),
				cm_context: {
					main: 'effects',
					sub: 'effects_icon'
				},
				collections: {
					benefits: benefits_collection
				},
				l10n: l10n
			});
		};

		this.questProgress = function() {
			var init, set, finish, progress, hideProgressbar, _setMousePopup;

			init = function(tutorial_quests_collection, from_bootstrap) {
				var max = GameDataQuests.getTutorialQuestsCount();

				if (!max) {
					return false;
				}

				var $quest_container = $('#quest_progress_container');

				$quest_container.append('<div class="quest_progress"><div class="chest"></div><div class="single-progressbar2 orange-progressbar"></div></div>');
				$quest_container.hide();

				var value = GameDataQuests.getFinishedTutorialQuestsCount();
				progress = CM.register({
					main: 'index', sub:'quest'
				}, 'quest_progress',  $quest_container.find('.quest_progress .single-progressbar2').singleProgressbar({
					value: value ? value : 0,
					max: max,
					animate: true,
					prevent_overloading: true,
					type: 'percentage',
					template: 'tpl_pb_single_nomax'
				}));

				if (!tutorial_quests_collection.isFirstQuestRenderBlocked()) {
					$quest_container.show();

					// if called from bootstrap re-animate the saved progress when shown
					if (from_bootstrap) {
						from_bootstrap = false;
						var progress_value = GameDataQuests.getFinishedTutorialQuestsCount();
						progress.setValue(progress_value);
					}
				}

				_setMousePopup();

				$.Observer(GameEvents.quest.close).subscribe(['interfaceDefault'], function(e, data) {
					Layout.questProgress.set(data.closed_quests);
				});
			};

			_setMousePopup = function() {
				$('#icons_container_left .quest_progress').tooltip(TooltipFactory.getTutorialQuestsProgressbarTooltip());
			};

			//@todo if someone will refactor it, please rename it to something else
			set = function(value) {
				if (!progress) {
					return false;
				}

				if(value >= progress.getMax()) {
					this.finish();
				} else if (value > progress.getValue()) {
					progress.setValue(value);
					_setMousePopup();
				}
			};

			hideProgressbar = function() {
				CM.unregister({main: 'index', sub:'quest'}, 'quest_progress');
				$('#icons_container_left .quest_progress').remove();
			};

			finish = function(force) {
				var openWindow = function () {
					QuestProgressWindowFactory.openQuestProgressWindow();
				};

				if (!progress) {
					if(force) {
						openWindow();
					}
					return false;
				}

				progress.setValue(progress.getMax());
				$('#icons_container_left .quest_progress').addClass('finished');

				progress = false;
				openWindow();

				TM.unregister('cleanup_after_quest_progress');
				TM.register('cleanup_after_quest_progress', 3000, hideProgressbar);
			};

			return {
				init: init,
				set: set,
				finish: finish,//is this really necessary ? I could not find any code which uses it from outside, please don't expose if not necessary
				hideProgressbar: hideProgressbar
			};
		}();

		//Check if only class should be instantiated but no further initialization code should be executed
		if (options.onlyInstantiate !== true) {
			//bind events on object creation
			initialize(options.onInit);
		}
	}

	window.GPLayout = GPLayout;
}());
