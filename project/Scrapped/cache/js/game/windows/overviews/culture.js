/*globals CM, gpAjax, GameEvents, GPWindowMgr, is_array, HumanMessage, BuyForGoldWindowFactory, Game, Timestamp */
(function() {
	var CultureOverview = {
		running_celebration_data: {},
		celebration_duration_data: {},
		l10n : {},
		wnd : null,

		init: function (_running_celebration_data, _celebration_duration_data) {
			var l10n = this.l10n, root = this.wnd.getJQElement();

			this.running_celebration_data = is_array(_running_celebration_data) ? {} : _running_celebration_data;
			this.celebration_duration_data = _celebration_duration_data;

			CultureOverview.updateCelebrationProgress();

			$('#start_all_celebrations').click(this.startAllCelebrations.bind(this));

			CM.register(this.wnd.getContext(), 'place_celebration_select', root.find("#place_celebration_select").dropdown({
				options : [
					{value : 'party', name : l10n.party},
					{value : 'games', name : l10n.games},
					{value : 'triumph', name : l10n.triumph},
					{value : 'theater', name : l10n.theater}
				],
				value : 'party'
			}));
		},

		setWndHandler : function(wnd) {
			this.wnd = wnd;
		},

		setl10n : function(l10n) {
			this.l10n = l10n;
		},

		addCelebrationToData: function(town_id, type, finished_at) {
			if (!this.running_celebration_data.hasOwnProperty(town_id)) {
				this.running_celebration_data[town_id] = {};
			}

			var town_celeb_data = this.running_celebration_data[town_id];
			town_celeb_data[type] = finished_at;
		},

		updateCelebrationsInProgess: function(running_celebrations_count) {
			var new_text = CultureOverview.l10n.in_progress_text + ' ' + running_celebrations_count;
			$("#culture_points_overview_bottom #place_culture_in_progress").text(new_text);
		},

		startAllCelebrations: function() {
			var self = this,
				type = CM.get(CultureOverview.wnd.getContext(), 'place_celebration_select').getValue(),
				confirm = function() {
					gpAjax.ajaxPost('town_overviews', 'start_all_celebrations', {
						'celebration_type': type
					}, false, function(data) {
                        $.Observer(GameEvents.celebration.start).publish({celebration_type : type});
						// replace content:
						var wnd = GPWindowMgr.getOpenFirst(GPWindowMgr.TYPE_TOWN_OVERVIEWS);

						if (wnd && data.html) {
							CM.unregisterSubGroup(CultureOverview.wnd.getContext());
							wnd.setContent(data.html);
						}

						//update celebrations running counter
						CultureOverview.updateCelebrationsInProgess(data.all_running_celebrations_count);
					});
				},

				dummy_btn = {
					enable: function() {},
					disable: function() {}
				};

			if (type === 'games') {
				gpAjax.ajaxGet('town_overviews', 'get_cost_for_games', {}, true, function(data) {
					if (!data.available_towns) {
						if(data.available_gold >= data.total_cost){
							return HumanMessage.error(_('No festivals could be organized.'));
						}
					} else if (data.total_cost > 0) {
						BuyForGoldWindowFactory.openCelebrateOlympicGamesForGoldWindow(
							dummy_btn,
							{
								duration: self.celebration_duration_data.games/60/60,
								cost: data.total_cost
							},
							confirm
						);
					} else {
						confirm();
					}
				});
			} else {
				confirm();
			}

		},

		startCelebration: function(celebration_type, town_id) {
			var button = $('#ov_town_' + town_id + ' .type_' + celebration_type);
			// function to be executed if olympic games are confirmed (see below)
			var callback = function() {
				var data = {};
				data.town_id = town_id;
				data.celebration_type = celebration_type;
				data.no_bar = town_id !== Game.townId ? 1 : 0;

				gpAjax.ajaxPost('town_overviews', 'start_celebration', data, false, function(return_data) {
					$.Observer(GameEvents.celebration.start).publish({celebration_type : celebration_type});

					button.toggleClass('disabled');

					var town_id = return_data.town_id;

					$.each(return_data.startable_celebrations, function(type, data) {
						if (!data) {
							var tempbutton = $('#ov_town_' + town_id + ' .type_' + type);
							if (!tempbutton.hasClass('disabled')) {
								tempbutton.addClass('disabled');
							}
						}
					});
					// If the player does not have enough battle points to start a new triumph, disable all buttons to start a new triumph.
					if (return_data.player_kills < return_data.needed_kills_for_next) {
						$.each($('#culture_overview_towns a.type_triumph'), function(i, tempbutton) {
							if (!$(tempbutton).hasClass('disabled')) {
								$(tempbutton).addClass('disabled');
							}
						});
					}

					CultureOverview.addCelebrationToData(town_id, return_data.celebration_type, return_data.finished_at);

					//add current running celebration
					var item = $('#town_' + town_id + '_timer_' + return_data.celebration_type + '.celebration_progressbar');
					item.html($('<div></div><span class="eta">' + return_data.finished_at + '</span>'));
					var eta = item.children('.eta');
					eta.countdown(eta.html(), {});

					//update celebrations running counter
					CultureOverview.updateCelebrationsInProgess(return_data.all_running_celebrations_count);

					//add new battle points
					var points_wrapper = $('#place_battle_points');
					points_wrapper.find('div.points_count').html(return_data.player_kills + '/' + return_data.needed_kills_for_next);
					points_wrapper.find('div.points_bar').width(return_data.player_kills > return_data.needed_kills_for_next ? '150px' : (return_data.player_kills * 150 / return_data.needed_kills_for_next) + 'px');
				}.bind(button), {}, 'start_celebration');
			};

			if (button.hasClass('disabled')) {
				return false;
			}

			// show gold confirmation popup before spending gold
			if (celebration_type === 'games') {
				var btn = {
					enable: function() { button.removeClass('diasbled'); },
					disable: function() { button.addClass('diasbled'); }
				};

				BuyForGoldWindowFactory.openCelebrateOlympicGamesForGoldWindow(btn, this.celebration_duration_data.games/60/60, callback);
			} else {
				callback();
			}

			return false;
		},

		updateCelebrationProgress: function() {
			var town_id, celeb_type;
			for (town_id in CultureOverview.running_celebration_data) {
				if (CultureOverview.running_celebration_data.hasOwnProperty(town_id)) {
					var town_celeb_data = CultureOverview.running_celebration_data[town_id];

					for (celeb_type in town_celeb_data) {
						if (town_celeb_data.hasOwnProperty(celeb_type)) {
							var progress = 100 * (1 - ((town_celeb_data[celeb_type] - Timestamp.now()) / CultureOverview.celebration_duration_data[celeb_type]));

							if (progress >= 100) {
								progress = 100;
								delete CultureOverview.running_celebration_data[town_id];
								$('#town_' + town_id + '_timer_' + celeb_type + '.celebration_progressbar').html('');
							} else {
								var item = $('#town_' + town_id + '_timer_' + celeb_type + '.celebration_progressbar').children().first('div');
								progress = Math.floor(progress);
								item.css('width', progress + '%');
							}
						}
					}
				}
			}

			if ($('#culture_overview_wrapper').length) {
				window.setTimeout(CultureOverview.updateCelebrationProgress, 20000);
			}
		}
	};

	window.CultureOverview = CultureOverview;
}());