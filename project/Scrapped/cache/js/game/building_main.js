/* global GameModels, TooltipFactory, BuildingWindowFactory, GameDataBuildings, GameEvents, Game , BuyForGoldWindowFactory*/
(function() {
	'use strict';

	var BuildingMain = {
		special_buildings_combined_group : null,
		buildings : null,
		full_queue : false,

		confirm_finish_for_gold_dialog: null,
		confirm_building_cancel_dialog: null,
		tear_down_menu: false,
		last_action_on_building: false,

		available_gold : 0, //building_main/index.tpl.php

		wnd: null,

		initializeMousePopups: function() {
			$('#main_show_not_possible').tooltip(_('Show buildings for which the construction requirements have not yet been fulfilled'));
		},

		/**
		 * handle events for main building
		 *
		 * @param object event
		 * @param object data
		 */
		handleEvents: function(event, data){
			//handle resources update max. trigger rate 1/s
			if (event.type === GameEvents.town.resources.update) {
				//check building constraints / only on normal build tab
				if (!BuildingMain.tear_down_menu){
					BuildingMain.buildingMousePopup();
				}
			}
		},

		/**
		 * replace button with the pedant of a forbidden button
		 *
		 * @param string building_name
		 * @param boolean flag_special_building
		 */
		replaceWithForbiddenButton: function(building_name, flag_special_building){
			var html_str = '';

			if (flag_special_building === true) {
				$('#special_building_'+building_name).css('background-image','url('+Game.img()+'/game/main/'+building_name+'_passive.png)');
				$('#special_building_' + building_name).removeAttr('onclick');

			} else {
				if($('#building_main_not_possible_button_'+building_name).length <= 0){
					html_str = '<div class="build_grey small bold build_up button_build" id="building_main_not_possible_button_' + building_name + '">' + _('Not possible') + '</div>';

					$('#building_main_'+building_name+' a.build').remove();
					$('#building_main_'+building_name+' div.building').append($(html_str));

				}
			}
		},

		/**
		 * replace button with the pedant of a granted button
		 *
		 * @param string building_name
		 * @param object building
		 * @param boolean flag_special_building
		 */
		replaceWithGrantedButton: function(building_name, building, flag_special_building, first_level){
			var html_str = '';

			if (flag_special_building) {

				$('#special_building_'+building_name).css('background-image','url('+Game.img()+'/game/main/'+building_name+'.png)');
				//$('#special_building_'+building_name).css('cursor','pointer');
				var temp_building = document.getElementById('special_building_'+building_name);
				if (temp_building) {
					temp_building.onclick = function(){
						BuildingMain.buildBuilding(building_name);
						return false;
					};
				}
			} else {
				if ($('#building_main_'+building_name+' a.build').length <= 0 ) {
					var exp_str = first_level ? _('Build') : _('Upgrade to %1').replace('%1', building.next_level);
					html_str = '<a href="#" onclick="BuildingMain.buildBuilding(\''+building_name+'\'); return false;" class="button_build build_up build small">'+exp_str+'</a>';
					$('#building_main_not_possible_button_'+building_name).remove();
					$('#building_main_'+building_name+' div.building').append($(html_str));
				}
			}
		},

		/**
		 * replace button to cost reduction with the pedant of a forbidden button
		 *
		 * @param string building_name
		 * @param boolean flag_special_building
		 */
		replaceCostReductionWithForbiddenButton: function(building_name, flag_special_building){
			var build_cost_reduction;

			if (flag_special_building === true) {
				build_cost_reduction = $('.' + building_name + '.build_cost_reduction');

				if (build_cost_reduction.length > 0) {
					build_cost_reduction.addClass('disabled').removeAttr('onclick').off('click');
				}

			} else {
				if($('#building_main_not_possible_button_'+building_name).length <= 0){
					build_cost_reduction = $('#building_main_' + building_name + ' .build_cost_reduction');

					if (build_cost_reduction.length > 0) {
						build_cost_reduction.addClass('disabled').removeAttr('onclick').off('click');
					}
				}
			}
		},

		/**
		 * replace cost reduction button with the pedant of a granted button
		 *
		 * @param string building_name
		 * @param object building
		 * @param boolean flag_special_building
		 */
		replaceCostReductionWithGrantedButton: function(building_name, building, flag_special_building){
			var build_cost_reduction;

			if(flag_special_building === true){

				build_cost_reduction = $('.' + building_name + '.build_cost_reduction');

				if (build_cost_reduction.length > 0) {
					build_cost_reduction.removeClass('disabled');
					build_cost_reduction.removeAttr('onclick').off('click').on('click', function() {
						BuildingMain.buildBuilding(building_name, building.next_level, true);
						return false;
					});
				}

			} else {

				build_cost_reduction = $('#building_main_' + building_name + ' .build_cost_reduction');

				if (build_cost_reduction.length > 0) {
					build_cost_reduction.removeClass('disabled');
					build_cost_reduction.removeAttr('onclick').off('click').on('click', function() {
						BuildingMain.buildBuilding(building_name, building.next_level, true);
						return false;
					});
				}
			}
		},

		tearDown: function(building_id) {
			var tearDownOrder = new GameModels.BuildingOrder({
				building_type : building_id
			});
			tearDownOrder.tearDown(function() {
				$.Observer(GameEvents.building.demolish).publish({building_id : building_id});
			});
		},

		buildBuilding: function(building_id, level, build_for_gold) {
			var onConfirm = function() {
				var upgradeOrder = new GameModels.BuildingOrder({
					building_type : building_id
				});
				upgradeOrder.buildUp(build_for_gold, function() {
					$.Observer(GameEvents.building.expand).publish({building_id : building_id});

					if (build_for_gold) {
						$.Observer(GameEvents.premium.build_cost_reduction).publish({type : 'building', id : building_id, place_name : 'senate'});
					}
				});
			};

			if (build_for_gold) {
				var building;
				if (BuildingMain.buildings.hasOwnProperty(building_id)) {
					building = BuildingMain.buildings[building_id];
				} else {
					building = BuildingMain.special_buildings_combined_group[building_id];
				}

				var button = $('<div></div>').button({}),// magic button hack for legacy code without components, confirmation window needs a button to disable
					saved_resources_resources = TooltipFactory.getSavedResourcesForReducedBuilding(building);

				BuyForGoldWindowFactory.openReductBuildingBuildCostForGoldWindow(button, saved_resources_resources, onConfirm);
			} else {
				onConfirm();
			}
		},

		reloadContent: function() {
			BuildingWindowFactory.refreshIfOpened();
		},

		bindClickeventsOnUpgradeAndTearDownButtons: function() {
			$('#upgrade_buildings').click(BuildingMain.buildClick);
			$('#tear_down_buildings').click(BuildingMain.tearDownClick);
		},

		buildClick: function() {
			var wnd = BuildingWindowFactory.getWnd();

			if (wnd) {
				wnd.getHandler().switch_town_callback = function() {
					$('#upgrade_buildings').click();
				};
			}

			$('#buildings a.tear_down,#buildings div.tear_down,#buildings div.special_tear_down').hide();
			$('#buildings a.build,#buildings div.build_up,#buildings div.special_build').show();

			$('#techtree.build_cost_reduction_enabled_disabled').removeClass('build_cost_reduction_enabled_disabled').addClass('build_cost_reduction_enabled');
			$('#buildings.build_cost_reduction_enabled_disabled').removeClass('build_cost_reduction_enabled_disabled').addClass('build_cost_reduction_enabled');

			BuildingMain.buildingMousePopup();
			BuildingMain.tear_down_menu = false;

			BuildingMain.managePopups('build');
		},

		tearDownClick: function() {
			var wnd = BuildingWindowFactory.getWnd();

			if (wnd) {
				wnd.getHandler().switch_town_callback = function() {
					$('#tear_down_buildings').click();
				};
			}
			$('#buildings a.build,#buildings div.build_up,#buildings div.special_build').hide();
			$('#buildings a.tear_down,#buildings div.tear_down,#buildings div.special_tear_down').show();

			$('#buildings.build_cost_reduction_enabled').removeClass('build_cost_reduction_enabled').addClass('build_cost_reduction_enabled_disabled');
			$('#techtree.build_cost_reduction_enabled').removeClass('build_cost_reduction_enabled').addClass('build_cost_reduction_enabled_disabled');

			BuildingMain.tearDownMousePopup();
			BuildingMain.tear_down_menu = true;

			BuildingMain.managePopups('tear');
		},

		managePopups : function(type) {
			//cost reduction
			var $buttons = $('#buildings .build_cost_reduction'),
				action = type === 'tear' ? 'disable' : 'enable';

			//Disable popups
			$buttons.each(function(index, el) {
				var $el = $(el), popup_obj = $el.data('popup_obj');

				if (popup_obj && popup_obj[action]) {
					popup_obj[action]();
				}

				$el[type === 'build' ? 'show' : 'hide']();
			});

			/*
			if (type === 'tear') {
				$('#buildings .button_build.tear_down').each(function(index, el) {
					var $el = $(el), popup_obj = $el.data('popup_obj');

					popup_obj.disable();
				});
			}
			*/

			$buttons.filter('.tear_down')[type === 'tear' ? 'show' : 'hide']();
		},

		/**
		 * generates the mousepopups for buildings and checks whether
		 * the build-buttons in main should change their state
		 */
		buildingMousePopup: function() {
			var build_cost_reduction_enabled = GameDataBuildings.isBuildCostReductionEnabled();

			var popup_html, popup_html2, popup_html3,
				building,
				building_name,
				first_level, $el, town_id = Game.townId;

			//normal buildings
			for (building_name in BuildingMain.buildings) {
				if(!BuildingMain.buildings.hasOwnProperty(building_name)){
					continue;
				}

				building = BuildingMain.buildings[building_name];
				popup_html = TooltipFactory.getBuildingConstructionRequirements(town_id, building, BuildingMain.full_queue, true);
				first_level = building.level === 0 ? true : false;

				if (popup_html.max_level_reached === false) {
					if(popup_html.upgrade_not_possible === true){
						BuildingMain.replaceWithForbiddenButton(building_name, false, first_level);
					}
					else {
						BuildingMain.replaceWithGrantedButton(building_name, building, false, first_level);
					}
				}

				$el = $('#building_main_' + building_name);
				$el.find('.button_build').tooltip(popup_html.result, {width : 350});

				if (build_cost_reduction_enabled) {
					popup_html2 = TooltipFactory.getBuildingConstructionRequirementsWidthCostReduction(town_id, building, this.available_gold);
					$el.find('.build_cost_reduction').tooltip(popup_html2.result, {width : 350});

					if(popup_html2.max_level_reached === true || popup_html2.upgrade_not_possible === true || BuildingMain.full_queue === true){
						BuildingMain.replaceCostReductionWithForbiddenButton(building_name, false, first_level);
					} else {
						BuildingMain.replaceCostReductionWithGrantedButton(building_name, building, false, first_level);
					}
				}

				//Remove tooltip which is created in "Demolish tab"
				var existing_popup_obj = $el.data('popup_obj');

				if (existing_popup_obj && existing_popup_obj.destroy) {
					existing_popup_obj.destroy();
				}
			}

			//special buildings
			for (building_name in BuildingMain.special_buildings_combined_group) {
				if(!BuildingMain.special_buildings_combined_group.hasOwnProperty(building_name)){
					continue;
				}

				building = BuildingMain.special_buildings_combined_group[building_name];
				popup_html3 = TooltipFactory.getBuildingConstructionRequirements(town_id, building, BuildingMain.full_queue, true);

				if (popup_html3.max_level_reached === false){
					if (popup_html3.upgrade_not_possible === true){
						BuildingMain.replaceWithForbiddenButton(building_name, false, false);
					}
					else{
						BuildingMain.replaceWithGrantedButton(building_name, building, true, false);
					}
				}

				$('#special_building_' + building_name).tooltip(popup_html3.result, {width : 350});

				if (build_cost_reduction_enabled) {
					popup_html2 = TooltipFactory.getBuildingConstructionRequirementsWidthCostReduction(town_id, building, this.available_gold);
					$('.building_special .build_cost_reduction.' + building_name).tooltip(popup_html2.result, {width : 350});
				}

			}
		},

		tearDownMousePopup: function() {
			var building_id;

			for (building_id in BuildingMain.buildings) {
				if (!BuildingMain.buildings.hasOwnProperty(building_id)){
					continue;
				}

				var building = BuildingMain.buildings[building_id];

				$('#building_main_' + building_id + ' .tear_down').tooltip(GameDataBuildings.getBuildingDemolishionTooltip(building_id, building.pop_tear_down, building.tear_down_time));

			}
		}
	};

	window.BuildingMain = BuildingMain;
}());
