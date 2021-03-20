/* global ITowns, BuildingWindowFactory, PlaceWindowFactory, GameData, GameEvents, Game, Timestamp, gpAjax, GPWindowMgr, BuyForGoldWindowFactory, ConfirmationWindowFactory */
(function() {
	'use strict';

	var BuildingPlace = {
		celebration_finished_at: {},
		index_data:{},
		wnd_handle:null,
		olympic_games_duration : 0,

		init: function() {
			$.Observer(GameEvents.command.support.send_back).subscribe(['building_place_js'], function(event, data) {
				// notice: place_units_XXX are in building_place/units_beyond.tpl template; outer_troops_units_XXX in town_overviews/outer_units.tpl
				var elem = $('#place_units_' + data.support_id).length > 0 ? $('#place_units_' + data.support_id) : $('#outer_troops_units_' + data.support_id);
				if (elem.length > 0) {
					elem.remove();

					if (data.no_units_html !== undefined) {
						// overviews
						$('#outer_troops_list').html(data.no_units_html);
						// agora
						$('#units_beyond_list').html(data.no_units_html);
					}
				}
			});
		},

		renderIndex: function(wnd) {
			BuildingPlace.wnd_handle = wnd;
			wnd.setContent2(us.template(GameData.BuildingPlaceTemplate, BuildingPlace.index_data));
			$('a.place_sendback_all').tooltip('<strong>'+_('Return units')+'</strong>');
			$('#place_defense .return_all_units').tooltip(_('Send back all supporting units'));

			//Set tooltips for units
			$.each(GameData.units, function(unit) {
				$('div.unit_' + unit).setPopup(unit + '_details');
			});

			//Set tooltips for heroes
			if (GameData.heroes) {
				$.each(GameData.heroes, function(hero_id) {
					var name = GameData.heroes[hero_id].name;

					$('div.unit_' + hero_id).tooltip(name);
				});
			}
		},

		handleEvents: function(current_tab, wnd){
			switch(current_tab){
				case 'index':
					var i,unit_id;
					var units = ITowns.getTown(Game.townId).units(),
						data_units = GameData.units;

					BuildingPlace.index_data.all_units = {};
					BuildingPlace.index_data.player_units = {};
					for(unit_id in data_units){
						if (data_units.hasOwnProperty(unit_id)) {
							BuildingPlace.index_data.all_units[unit_id] = 0;
							BuildingPlace.index_data.player_units[unit_id] = 0;
						}
					}

					for(i in BuildingPlace.index_data.support_array){
						if (BuildingPlace.index_data.support_array.hasOwnProperty(i)) {
							var support = BuildingPlace.index_data.support_array[i];

							for(unit_id in support.units){
								if (support.units.hasOwnProperty(unit_id)) {
									BuildingPlace.index_data.all_units[unit_id] += support.units[unit_id];
								}
							}
						}
					}

					for(unit_id in units) {
						if(units.hasOwnProperty(unit_id)) {
							if(!window.isNumber(units[unit_id]) || units[unit_id] === 0){
								continue;
							}
							BuildingPlace.index_data.player_units[unit_id] += units[unit_id];
							BuildingPlace.index_data.all_units[unit_id] += units[unit_id];
						}
					}

					for(unit_id in data_units){
						if (data_units.hasOwnProperty(unit_id)) {
							if(BuildingPlace.index_data.all_units[unit_id] === 0){
								delete BuildingPlace.index_data.all_units[unit_id];
							}
							if(BuildingPlace.index_data.player_units[unit_id] === 0){
								delete BuildingPlace.index_data.player_units[unit_id];
							}
						}
					}

					BuildingPlace.renderIndex(BuildingPlace.wnd_handle);
					break;
				default:
					break;
			}
		},

		startCountdown: function() {
			var that = this;
			$.each(this.celebration_finished_at, function(type, at){
				if (at > Timestamp.now()) {
					var current_celebration = $('#countdown_' + type);
					current_celebration.countdown(at, {});

					// Reload on finish
					current_celebration.bind('finish', function() {
						gpAjax.ajaxGet('building_place', 'culture', {}, true, function(data){
							if(that.isBuildingPlaceWindowOpen()){
								BuildingWindowFactory.getWnd().setContent2(data.html);
								BuildingWindowFactory.getWnd().getHandler().registerBuildingPlaceComponents();
							}
						});
					});
				}
			});
		},

		/**
		 *
		 * @param celebration_type
		 * @param {jQuery Button Component} [_btn]
		 */
		startCelebration: function(celebration_type, _btn) {
			var that = this;

			// function to be executed if olympic games are confirmed (see below)
			var callback = function() {
				gpAjax.ajaxPost('building_place', 'start_celebration', {celebration_type:celebration_type}, true, function(data) {
					if (typeof data.enough_gold !== 'undefined' && data.enough_gold === false) {

					}
					else {
						$.Observer(GameEvents.celebration.start).publish({celebration_type : celebration_type});

						if (that.isBuildingPlaceWindowOpen()) {
							//Should be 1 window max
							var opened_agora_windows = GPWindowMgr.getByType(GPWindowMgr.TYPE_BUILDING);

							//Since components are initialized, we have to request new data again to call 'onRcvData'
							for (var i = 0, l = opened_agora_windows.length; i < l; i++) {
								opened_agora_windows[i].getHandler().refresh();
							}
						}
					}
				});
			};

			if (celebration_type === 'games' && !_btn.hasClass('for_free')) {
				BuyForGoldWindowFactory.openCelebrateOlympicGamesForGoldWindow(_btn, this.olympic_games_duration, callback);
			}
			else {
				callback();
			}
		},

		isBuildingPlaceWindowOpen: function() {
			return BuildingWindowFactory.getWnd() &&
				BuildingWindowFactory.getWnd().getHandler() &&
				BuildingWindowFactory.getWnd().getHandler().currentBuilding === 'place';
		},

		insertUnitsToSimulator: function(units, defender_town_id) {
			var id_of_defender_town = defender_town_id;
			if (typeof id_of_defender_town === 'undefined') {
				id_of_defender_town = BuildingPlace.defender_town_id;
			}
			PlaceWindowFactory.openPlaceWindow('simulator', {'units' : units, 'defender_town_id' : id_of_defender_town});
		},

		sendBackAllUnits: function(is_beyond_units, for_all_towns, has_selected_cities) {
			var on_confirm = function () {
                if (is_beyond_units) {
                    BuildingPlace.onConfirmSendBackAllUnitsBeyond(for_all_towns);
                } else {
                    BuildingPlace.onConfirmSendBackAllUnitsSupport();
                }
            };

			ConfirmationWindowFactory.openConfirmationReturnAllUnits(on_confirm, null, has_selected_cities);
		},

		sendBackSupport: function(support_id) {
			var callback = function (data) {
                var all_units = data.all_units;
                var player_units = data.player_units;
                var support_units = data.support_array;

                $('#support_units_' + support_id).remove();

                if ($(support_units).length === 0) {
                    $('#support_units').remove();
                }
                $.each(GameData.units, function(unit) {
                    if (all_units[unit] > 0) {
                        $('#all_units_' + unit + ' span').text(all_units[unit]);
                    } else {
                        $('#all_units_' + unit).remove();
                    }
                    if (player_units[unit] > 0) {
                        $('#player_units' + unit + ' span').text(player_units[unit]);
                    } else {
                        $('#player_units' + unit).remove();
                    }
                });
            };

            ConfirmationWindowFactory.openConfirmationReturnAllUnitsFromTown(function () {
                BuildingPlace.onConfirmSendBack(support_id, callback);
            });
		},

		sendBackBeyond: function(support_id) {
			var callback = function (data) {
                $.Observer(GameEvents.command.support.send_back).publish({support_id : support_id, no_units_html : data.no_units_html});
            };

            ConfirmationWindowFactory.openConfirmationReturnAllUnitsFromTown(function () {
				BuildingPlace.onConfirmSendBack(support_id, callback);
			});
		},

		/**
		 *
		 *
		 */
		initSendBackTab: function(researches) {
			var p = $('#place_defense');
			this.researches = researches;

			// set mouseover
			$.each(GameData.units, function(unit) {
				p.find('a.unit_' + unit).setPopup(unit + '_details');
			});
		},

		selectUnit: function(elm) {
			elm = $(elm);

			var input_container = elm.parent().find('div.place_send_part');
			var outer_units_id = parseInt(input_container[0].id.match(/\d+/), 10);
			var div = $('#place_send_part_'+ outer_units_id);
			if (div.is(':visible')) {
				var unit_id = elm[0].className.match(/unit_(\w+)/)[1];
				var count = parseInt(elm.find('span').html(), 10);
				var $place_part = $('#place_part_' + outer_units_id + '_' + unit_id);
				var prev = parseInt($place_part.val(), 10);
				// toggle units if all units were selected
				var new_val = prev === count ? 0 : count;
				$place_part.val(new_val);
			}
		},


		toggle : function(units_id, base_id) {
			var div, li, pop, cap, progress, units,
				that = this;

			base_id = base_id || 'place';

			div = $('#' + base_id + '_send_part_'+units_id);
			li = div.parent();

			units = li.find('input');

			if (!div.is(':visible')) {
				progress = li.find('div.progress');
				pop = progress.find('span.capacity_current');
				cap = progress.find('span.capacity_max');

				window.recalcCapacity(units, this.researches, pop, cap, progress);

				units.unbind().bind('keyup change', function() {
					window.recalcCapacity(units, that.researches, pop, cap, progress);
				});

				li.find('a.place_unit.unit').unbind().bind('click',function() {
					BuildingPlace.selectUnit(this);
					window.recalcCapacity(units, that.researches, pop, cap, progress);
				});
			} else {
				units.unbind();
			}

			div.animate({
				height: 'toggle'
			}, 500, function(){}).parent();
		},

		onConfirmSendBack: function(support_id, callback) {
			gpAjax.ajaxPost('building_place', 'send_back', {support_id: support_id}, false, callback);
		},

		onConfirmSendBackAllUnitsBeyond: function(for_all_towns) {
		    var params = {
		    	'is_beyond': true,
				'for_all_towns': for_all_towns
		    };

			gpAjax.ajaxPost('building_place', 'send_back_all_units', params, false, BuildingPlace.clearOuterUnitsList);
		},

		onConfirmSendBackAllUnitsSupport: function () {
            gpAjax.ajaxPost('building_place', 'send_back_all_units', {'is_beyond': false, 'for_all_towns': false}, false, function (data) {
                var units_array = data.units_array;

                if (units_array.length === 0) {
                    $('#support_units').remove();
                    $('.support_units_from_other_town').remove();
                    $('.return_all_units').remove();
                }
            });
		},

        clearOuterUnitsList: function (data) {
            var $outer_list = $('#outer_troops_list');
            $('.place_units').remove();
            $outer_list.empty();
            $('.return_all_units').remove();
            if (typeof data.no_units_html !== undefined) {
                $('#units_beyond_list').html(data.no_units_html);
                $outer_list.html(data.no_units_html);
            }
        },

		sendBackPart: function(units_id, town_id, base_id) {
			base_id = base_id || 'place';

			var params = {};
			var inputs = $('#'+base_id+'_send_part_'+units_id+' :input');

			inputs.each(function() {
				var elm = $(this);
				var name = elm.attr('name');
				if (name) {
					params[name] = parseInt(elm.val() || 0, 10);
				}
				elm.val('');
			});

			params.units_id = units_id;
			params.town_id = town_id;

			BuildingPlace.toggle(units_id,base_id);

			gpAjax.ajaxPost('units_beyond_info', 'send_back_part', params, false, function (data) {
				if (data.close) {
					$('#'+base_id+'_units_' + units_id).remove();
				} else {
					$.each(data.remaining_units, function(name, count) {
						if (count === 0) {
							$('#'+base_id+'_units_' + data.remaining_units.id + ' a.place_unit.unit_' + name).remove();
							$('#'+base_id+'_part_' + data.remaining_units.id + '_' + name).parent().remove();
						} else {
							$('#'+base_id+'_units_' + data.remaining_units.id + ' a.unit_' + name + ' span').text(count);
						}
					});
				}
			});
		}
	};

	window.BuildingPlace = BuildingPlace;
}());
