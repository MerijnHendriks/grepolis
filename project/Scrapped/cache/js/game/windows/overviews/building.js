/* global us, GameData, GameDataBuildings, BuyForGoldWindowFactory, TooltipFactory, Game, ITowns, gpAjax */
(function() {
	'use strict';

	var BuildingOverview = {
		buidling_data: null,
		town_data : null,
		ele: null,
		col: null,
		special: null,
		regular: null,
		res: {},

		available_gold : 0,

		init: function (_building_data, _town_data, available_gold) {
			var list = $('table#building_overview tr td.building');
			this.building_data = _building_data;
			this.town_data = _town_data;
			this.available_gold = available_gold;
			var self = this;

			this.createBuildingHeader();

			this.special = $('.special');
			this.regular = $('.regular');

			$('table#building_overview tr').on('mouseover', function(ev) {
				var town_id = parseInt($(this).attr('id').split('_')[2], 10);
				if (town_id) {
					if (GameDataBuildings.isBuildCostReductionEnabled()) {
						self.addTooltipsForTown(town_id);
					}
				}
			});

			list.on('mouseover', '.building_upgrade_reduced, .building_upgrade, .building_tear_down', function(ev) {
				BuildingOverview.ele = $('#' + ev.currentTarget.className.replace(' ', '_'));

				var current_target = $(ev.currentTarget).data('buildingid');

				BuildingOverview.col = $('table#building_overview tr td.' + current_target);

				BuildingOverview.highlightColumn(ev);

				$(ev.currentTarget).bind('mouseout', function() {
					BuildingOverview.ele.removeClass('selected');
					//BuildingOverview.col.toggleClass('hover')
					$(this).unbind('mouseout');
				});
			});

			//Initialize Demolition tooltips (why here ?: performance reasons)
			list.on('mouseover', '.building_tear_down', function(e) {
				var $el = $(e.currentTarget);
				var building_id = $el.data('building_id');
				var town_id = $el.data('town_id');
				var demolish_data = this.building_data[town_id][building_id];

				$el.tooltip(GameDataBuildings.getBuildingDemolishionTooltip(building_id, demolish_data.population_free, demolish_data.tear_down_time)).showTooltip(e);
			}.bind(this));
		},

		createBuildingHeader: function() {
			//<div style="background-image: url(<?= urlImg('/game/main/' . $building_id . '.png') ?>);" class="overviews_building <?= !empty($data->special) ? 'special' : 'regular' ?>" id="icon_building_<?= $building_id ?>"></div>
			var template = '<div class="building_header building_icon40x40 <%= building_id %> <%= is_special ? "special" : "regular" %>" id="icon_building_<%= building_id %>"></div>',
				$header = $('.building_overview #fixed_table_header');

			us.each(GameData.buildings, function(building_data, building_id) {
				// agora can not be upgraded
				if (building_id === 'place') {
					return;
				}
				var popup_text = '<h3>' + building_data.name + '</h3>';

				$header.append(us.template(template, {
					 is_special : building_data.special,
					 building_id: building_id
				}));

				popup_text += '<p>' + building_data.description + '</p>';
				$('#icon_building_' + building_id).tooltip(popup_text);
			});
		},

		/**
		 * Object compatible with TooltipFactory building object
		 *
		 */
		createBuildingObject : function(building_id, building_data) {
			var gd_building = GameData.buildings[building_id];

			return {
				max_level : building_data.has_max_level,
				name : gd_building.name,
				level : building_data.level,
				needed_resources : building_data.resources_for,
				pop : building_data.population_for,
				build_time : building_data.building_time,
				get_dependencies : building_data.missing_dependencies,
				enough_storage : building_data.enough_storage,
				description : gd_building.description
			};
		},

		addTooltips : function() {
			var towns = this.building_data, town_id;

			for (town_id in towns) {
				if (towns.hasOwnProperty(town_id)) {
					this.addTooltipsForTown(town_id);
				}
			}
		},

		isBuildingQueueFull : function(town_id) {
			return this.town_data[town_id].is_building_order_queue_full;
		},

		addTooltipsForTown : function(town_id) {
			var _self = this, town_buildings = this.building_data[town_id],
				$building_reduced = $('#ov_town_' + town_id + ' .building_upgrade_reduced'),
				$building_upgrade = $('#ov_town_' + town_id + ' .building_upgrade');

			//Build buttons
			$building_upgrade.each(function(index, el) {
				var $el = $(el), building_id = $el.parent().attr('data-buildingid'),
					building = _self.createBuildingObject(building_id, town_buildings[building_id]),
					popup_html = TooltipFactory.getBuildingConstructionRequirements(town_id, building, _self.isBuildingQueueFull(town_id), true);

				$el.tooltip(popup_html.result, {width : 350});
			});

			//Build reducted buttons
			$building_reduced.each(function(index, el) {
				var $el = $(el), building_id = $el.parent().attr('data-buildingid'),
					building = _self.createBuildingObject(building_id, town_buildings[building_id]),
					popup_html = TooltipFactory.getBuildingConstructionRequirementsWidthCostReduction(town_id, building, _self.available_gold);

				$el.tooltip(popup_html.result, {width : 350});
			});
		},

		//This code is not mine, I just made it looked better
		highlightColumn: function(ev) {
			var $target = $(ev.target),
				$current_target = $(ev.currentTarget),
				with_cost_reduction = $target.hasClass('building_upgrade_reduced'),
				is_tear_down = $target.hasClass('building_tear_down'),
				t_id = $current_target.parents('.place_command').get(0).id.replace('ov_town_', ''),
				t_info = document.getElementById('town_' + t_id + '_res'),
				res_info = t_info.getElementsByTagName('div'),
				b_id = $current_target.parents('.building').data('buildingid');


			var building_data = this.building_data[t_id][b_id], res_info_jQElem = [], i;

			if (is_tear_down) {
				this.res.needed = {wood: 0, stone: 0, iron: 0};
				this.res.needed.town_population = -building_data.population_free;
			} else {
				this.res.needed = with_cost_reduction ? building_data.resources_for_reduced : building_data.resources_for;
				this.res.needed.town_population = building_data.population_for;
			}

			for (i = 0; i < 4; i++) {
				res_info_jQElem.push($(res_info[i]));
			}

			this.res.current = {
				wood : parseInt(res_info_jQElem[0].find('.count').html(), 10),
				stone : parseInt(res_info_jQElem[1].find('.count').html(), 10),
				iron : parseInt(res_info_jQElem[2].find('.count').html(), 10),
				town_population : parseInt(res_info_jQElem[3].find('.count').html(), 10)
			};

			var obj_diff, key, j = 0;

			for (key in this.res.needed) {
				if (this.res.needed.hasOwnProperty(key)) {
					obj_diff = res_info_jQElem[j].find('.diff');
					obj_diff.toggleClass('notenough', this.res.current[key] < this.res.needed[key]);
					obj_diff.html(-this.res.needed[key]);
					j++;
				}
			}

			this.ele.addClass('selected');
		},

		updateResAndLevel : function (t_id, object, b_id, data) {
			//update res
			var itown = ITowns.getTown(t_id),
				t_info = $('#town_' + t_id + '_res'),
				town_resources = itown.resources();

			// update town row with itowns data, since new ui this is always up2date
			t_info.find('.wood .count').html(town_resources.wood).removeClass('town_storage_full');
			t_info.find('.stone .count').html(town_resources.stone).removeClass('town_storage_full');
			t_info.find('.iron .count').html(town_resources.iron).removeClass('town_storage_full');
			t_info.find('.town_population .count').html(town_resources.population);

			//update level
			var lvl = parseInt(object.parentNode.getElementsByTagName('a')[1].innerHTML.replace(/\W/g, ''), 10);

			object.parentNode.getElementsByTagName('a')[1].innerHTML = lvl + 1;
			//animate stuff
			$(t_info).animate({
				color: '#e72200'
			}, 250, function() {
				$(this).animate({
					color: '#000'
				});
			});

			//update building data
			this.building_data[t_id] = data.building_data;
			this.available_gold = data.available_gold;

			//update town data
			this.town_data[t_id].is_building_order_queue_full = data.is_building_order_queue_full;

			if (GameDataBuildings.isBuildCostReductionEnabled()) {
				this.updateTownRow(t_id);
				this.addTooltipsForTown(t_id);
			}
		},

		updateTownRow : function(town_id) {
			var $container = $('#ov_town_' + town_id),
				$buildings = $container.find('.building'),
				buildings_data = this.building_data[town_id],
				gd_buildings = GameData.buildings;

			$buildings.each(function(index, el) {
				var $el = $(el), $el_reduced = $el.find('.building_upgrade_reduced'), $el_build = $el.find('.building_upgrade '),
					$el_current_level = $el.find('.current_level'), $el_tear_down = $el.find('.building_tear_down'),
					building_id = $el.attr('data-buildingid'),
					building_data = buildings_data[building_id],
					gd_building = gd_buildings[building_id],
					has_dependencies = !us.isArray(building_data.missing_dependencies);

				//BUILDONG NODE

				if (building_data.has_max_level) {
					$el.addClass('max_level');
				} else {
					$el.removeClass('max_level');
				}

				if (building_data.group_locked) {
					$el.addClass('group_locked');
				} else {
					$el.removeClass('group_locked');
				}

				//Get rid of css classes
				$el.removeClass('locked special regular');

				//Add new classes
				if (has_dependencies || building_data.has_max_level) {
					$el.addClass('locked');
				}

				$el.addClass(gd_building.special ? 'special' : 'regular');

				//BUILD REDUCED BUTTON
				$el_reduced.toggleClass('disabled', !building_data.can_upgrade_reduced || has_dependencies);

				//BUILD BUTTON
				$el_build.toggleClass('disabled', !building_data.can_upgrade || has_dependencies);
				$el_build.text(building_data.next_level);

				//CURRENT LEVEL CAPTION
				$el_current_level.text(building_data.level);

				//TEAR DOWN BUTTON
				$el_tear_down.toggleClass('disabled', !building_data.can_tear_down);
				$el_tear_down.text(building_data.tear_down_level);

			});
		},

		build: function(building_id, town_id, tear_down, object, build_for_gold) {
			build_for_gold = build_for_gold || false;

			var building_data = this.building_data[town_id][building_id];
			var has_dependencies = !us.isArray(building_data.missing_dependencies);

			if ((tear_down === true && building_data.can_tear_down === false)) {
				return false;
			}
			if ((tear_down === false && build_for_gold === false && (building_data.can_upgrade === false || has_dependencies))) {
				return false;
			}
			if ((tear_down === false && build_for_gold === true && (building_data.can_upgrade_reduced === false || has_dependencies))) {
				return false;
			}

			var data = {
				building_id : building_id,
				town_id : town_id,
				tear_down : tear_down ? 1 : 0,
				no_bar : town_id !== Game.townId ? 1 : 0,
				build_for_gold : build_for_gold
			};

			var onConfirm = function() {
				gpAjax.ajaxPost('town_overviews', 'build_building', data, false, function(data) {
					BuildingOverview.updateResAndLevel(town_id, object, building_id, data, build_for_gold);
				});
			};

			var $button = $(object);
			var btn = {
				enable: function() { $button.removeClass('diasbled'); },
				disable: function() { $button.addClass('diasbled'); }
			};

			if (build_for_gold) {
				BuyForGoldWindowFactory.openReductBuildingBuildCostForGoldWindow(
					btn,
					{
						building_type: building_id
					},
					onConfirm);
			}
			else {
				onConfirm();
			}

			return false;
		},

		toggleSpecialBuildings: function(ele) {
			if (this.special === null && this.regular === null) {
				this.special = $('.special');
				this.regular = $('.regular');
			}
			if (this.special.first().is(':hidden')) {
				ele.className = 'game_arrow_left recruit_overview_toggle';
				this.special.show();
				this.regular.css({
					display: 'none'
				});
				$('.game_inner_box.recruit_overview').css('width','600px');
				$('#toggle').tooltip($('#toggle').data('tooltip-hide'));
			} else {
				ele.className = 'game_arrow_right recruit_overview_toggle';
				this.regular.show();
				this.special.css({
					display: 'none'
				});
				$('.game_inner_box.recruit_overview').css('width','760px');
				$('#toggle').tooltip($('#toggle').data('tooltip-show'));
			}
		}
	};

	window.BuildingOverview = BuildingOverview;
}());
