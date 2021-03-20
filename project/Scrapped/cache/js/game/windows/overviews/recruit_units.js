/*global jQuery, GameData, Game, _, Slider, Timestamp, s, isNumber,
 gpAjax, ITowns, DateHelper, TM */

(function($, window) {
	'use strict';

	var RecruitUnits = {
		units: [],
		current_town_id: null,
		current_unit_id: null,
		slider: null,
		help: false,
		popup: $('<div id="overview_help" class="small"><div class="top"></div><div class="middle"></div><div class="bottom"></div></div>'),
		c_width: 735,
		c_height: 370,
		recruit_units: null,
		recruit_tabs: null,
		showAllUnits: false,
		res: {},
		old_value: [],
		max_build: [],
		towns: {},
		special: null,
		regular: null,
		regular_visible: null,
		casted_powers_collection: MM.getOnlyCollectionByName('CastedPowers'),

		init: function() {
			this.$el = $('#town_units_overview');

			this.$el.find('.recruit_overview .max_build').off('.recruit_units').on('click.recruit_units', function() {
				if (!$(this).next().hasClass('inactive')) {
					$(this).parent().find('input').val(parseInt($(this).html().match(/\d+/), 10));
				}
			});

			$('#recruit_tabs').off('.recruit_units').on('click.recruit_units', function(event) {
				RecruitUnits.select(event.target || event.srcElement);
				event.stopPropagation();
			});

			this.$el.find('#unit_overview_town_list').off('.recruit_units').on('click.recruit_units', '.unit_town', function(event) {
				RecruitUnits.selectTown(event);
			});

			RecruitUnits.recruit_units = $('#recruit_units').detach();
			RecruitUnits.recruit_units.off('.recruit_units').on('click.recruit_units', function(event) {
				event.stopPropagation();
			});

			RecruitUnits.initSlider();

			RecruitUnits.reInitializeOrders();

			this.casted_powers_collection = MM.getOnlyCollectionByName('CastedPowers');
		},

		selectTown: function(e) {
			var $list = this.$el.find('#unit_overview_town_list'),
				$selected_element = $(e.currentTarget);

			var current_town_id = RecruitUnits.current_town_id = parseInt($selected_element.attr('id').replace(/\D+/g, ''), 10);
			var already_selected = $selected_element.hasClass('selected');

			function hidePreviouslyOpenedRow() {
				var $row = $list.find('.town_item.selected');

				RecruitUnits.recruit_units.slideUp('400', function() {
					// Hide unit recruitments
					RecruitUnits.recruit_units.hide();

					//Show units
					$row.find('.current_units').show();
					//Hide queues
					$row.find('.queues').removeClass('active');
					$row.find('.queues').children().hide();

					//Remove class selected
					$row.removeClass('selected');
				});
			}

			function openCloseTown() {
				hidePreviouslyOpenedRow();

				//Have not checked exactly this code...
				$selected_element.find('#units_' + current_town_id).append(RecruitUnits.recruit_units);
				RecruitUnits.showAvailableUnits();

				//Hide units
				$selected_element.find('.current_units').hide();

				//Show queues
				$selected_element.find('.queues').addClass('active');
				$selected_element.find('.queues').children().show();

				//Add class selected
				$selected_element.addClass('selected');
			}


			this.casted_powers_collection.off(null, null, 'RecruitUnits');
			this.casted_powers_collection.on('add remove', function(casted_power_model) {
				gpAjax.ajaxGet('town_overviews', 'town_units', {town_id : casted_power_model.getTownId()}, false, function(response) {
					RecruitUnits.units[casted_power_model.getTownId()] = {units : response};
					if (casted_power_model.getTownId() == current_town_id) {
						openCloseTown();
					}
				});
			}, 'RecruitUnits');

			if (already_selected) {
				hidePreviouslyOpenedRow();
			}
			else if (RecruitUnits.units[current_town_id]) {
				openCloseTown();
			}
			else {
				gpAjax.ajaxGet('town_overviews', 'town_units', {town_id : RecruitUnits.current_town_id}, false, function(response) {
					RecruitUnits.units[RecruitUnits.current_town_id] = {units : response};
					openCloseTown();
				});
			}
		},

		/**
		 * Looks for the LI.town_item
		 */
		getParentTownElement : function($el) {
			var wanted_class = 'town_item';

			if (!$el.hasClass(wanted_class) && $el.parent() !== undefined) {
				return this.getParentTownElement($el.parent());
			}

			if ($el.hasClass(wanted_class)) {
				return $el;
			}

			return false;
		},

		orderSelectedUnit: function() {
			var order_count = parseInt(this.$el.find('#recruit_amount').val(), 10),
				naval = GameData.units[RecruitUnits.current_unit_id].transport === null;

			//if no units are selected, do nothing
			if (order_count === 0) {
				return;
			}

			var unit_image = '<div id="recruit_order_%1" class="place_unit ordered_unit_' +
				this.current_unit_id + ' unit_icon25x25 ' + this.current_unit_id + '"><span class="place_unit_black small bold">' +
				order_count +	'</span><span class="place_unit_white small bold">' +
				order_count +	'</span><span class="finished_at" style="display:none;">%2</span>' +
				'<span class="order_unit_type" style="display:none;">%3</span></div>';

			var town_id = parseInt(this.current_town_id, 10);

			var ajax_data = {
				towns : {

				}
			};

			ajax_data.towns[town_id] = {};
			ajax_data.towns[town_id][this.current_unit_id] = order_count;
			ajax_data.no_bar = town_id !== Game.townId ? 1 : 0;

			var queue = this.$el.find('#units_' + this.current_town_id + ' .queues').find('.naval , .ground');
			var $el = this.$el;

			gpAjax.ajaxPost('town_overviews', 'recruit_units', ajax_data, false, function(return_data) {
				var orders, last_order;

				if (return_data.handled_towns[town_id]) {
					orders = return_data.handled_towns[town_id].orders[naval ? 'docks' : 'barracks'];
					last_order = orders[orders.length - 1];
				}

				$.each(ajax_data.towns[town_id], function(type, amount) {
					RecruitUnits.units[town_id].units[type].max_build -= parseInt(amount, 10);

					unit_image = unit_image.replace('%1', last_order.id);
					unit_image = unit_image.replace('%2', last_order.to_be_completed_at);
					unit_image = unit_image.replace('%3', type);

					queue[naval ? 1 : 0].getElementsByTagName('div')[1].innerHTML += unit_image;

					//update resources
					var res_span = $el.find('#units_' + town_id + ' .unit_town_resources .resource_count .count');
					var i = 0;
					var unit_res = $.extend(true, {}, GameData.units[type].resources, {
						population: GameData.units[type].population
					}), //deepcopy, also merge population into new object
						res, recruit_units = function(index, town) {
							if (town.id === town_id) {
								town_index = index;
							}
						};

					for (res in unit_res) {
						if (unit_res.hasOwnProperty(res)) {
							var ele = res_span[i++];
							//					ele.innerHTML = ~~ele.innerHTML - unit_res[res]*amount;
							RecruitUnits.units[town_id][res] = ele.innerHTML = parseInt(ele.innerHTML - unit_res[res] * amount * RecruitUnits.getResearchModificationFactor(town_id, type), 10);

							var town_index = 0;
							$.each(RecruitUnits.towns, recruit_units);
							RecruitUnits.towns[town_index].resources[res] = parseInt(ele.innerHTML, 10);

							//after building units, the storage can not be full
							if (unit_res[res] > 0) {
								$(ele).removeClass('town_storage_full');
							}
						}
					}
				});

				// update timer tooltip
				var i, l = orders.length, order, $order;

				for (i = 0; i < l; i++) {
					order = orders[i];
					$order = $('#order_' + order.id);

					$order.unbind();

					// do only one id-change for the first element
					if (i === 0) {
						$el.find('#order_tmp').attr('id', 'order_' + order.id);
						$order.addClass('orderer_unit_' + order.unit_type);
					}
					$order.tooltip('<div id="ordered_unit_popup">' +
						GameData.units[order.unit_type].name + '<br /><img src="'+Game.img()+'/game/res/time.png" alt=""/><span class="eta"></span></div>' +
						'<script type="text/javascript">$("#ordered_unit_popup").find(".eta").countdown(' + order.to_be_completed_at + ')<\/script>');
				}

				var units = RecruitUnits.units[town_id].units, unit;

				for (unit in units) {
					if (units.hasOwnProperty(unit)) {
						if (units[unit].max_build > 0) {
							var resources = $.extend(true, {}, GameData.units[unit].resources, {
								population: GameData.units[unit].population
							}), res;

							for (res in resources) {
								if (resources.hasOwnProperty(res)) {
									var new_max = parseInt(RecruitUnits.units[town_id][res] / (resources[res]), 10);
									new_max = Math.max(new_max, 0);

									if (new_max < units[unit].max_build) {
										units[unit].max_build = new_max;
									}
								}
							}
						}
					}
				}

				RecruitUnits.showAvailableUnits();
				RecruitUnits.reInitializeOrders();
			});
		},

		getResearchModificationFactor : function(town_id, unit_id) {
			var itown = ITowns.getTown(town_id),
				gd_unit = GameData.units[unit_id];

			return (gd_unit.is_naval && itown.getResearches().hasResearch('mathematics')) ||
				(!gd_unit.is_naval && itown.getResearches().hasResearch('conscription')) ? 0.9 : 1;
		},

		reInitializeOrders: function() {
			var $el = this.$el;

			$el.find('div.units_order_overview span.finished_at').each(function(index, elem) {
				var finished_at = parseInt($(elem).html(), 10);
				if (!isNumber(finished_at)) {
					return;
				}
				var recruit_order_id = parseInt($(elem).parent().attr('id').substr(14), 10); // 14 == string length of 'recruit_order_'

				if (RecruitUnits.setupOrderTimer(finished_at, recruit_order_id) === false) {
					$(elem).parent().remove();
					return;
				}

				$el.find('#recruit_order_' + recruit_order_id).tooltip(s(_('Completion %1'), DateHelper.formatDateTimeNice(finished_at, false)));
			});
		},

		setupOrderTimer: function(finished_at, recruit_order_id) {
			var delay = (finished_at - Timestamp.now()) * 1000;
			delay = Math.max(delay, 0);

			if (delay === 0) {
				return false;
			}

			TM.unregister('recruit_order_' + recruit_order_id);
			TM.register('recruit_order_' + recruit_order_id, delay, function() {
				$('#recruit_order_' + recruit_order_id).remove();
			}, {max: 1});

			return true;
		},

		select: function(ele) {
			//get tab
			if (typeof ele !== 'string') {
				while(ele.parentNode.className.indexOf('recruit_tab') !== -1 || ele.parentNode.id !== 'recruit_tabs') {
					ele = ele.parentNode;
				}
			} else {
				ele = this.$el.find('#' + ele).parent()[0];
			}

			//fix for fast clicking
			if (!ele) {
				return;
			}

			var unit_id = RecruitUnits.current_unit_id = ele.getElementsByTagName('div')[0].id;

			//remove 'selected'-class
			RecruitUnits.recruit_tabs.parent().removeClass('selected');

			//set slider, update image
			RecruitUnits.slider.setMax(RecruitUnits.units[RecruitUnits.current_town_id].units[unit_id].max_build);
			RecruitUnits.slider.setValue(RecruitUnits.units[RecruitUnits.current_town_id].units[unit_id].max_build);

			var $image = RecruitUnits.recruit_units.find('#units_overview_order');
				$image.attr('title', GameData.units[unit_id].name);
				$image.removeClass().addClass('thin_frame unit_icon90x90 ' + unit_id);

			//update name
			this.$el.find('#unit_order_unit_name')[0].innerHTML = GameData.units[unit_id].name;

			RecruitUnits.showCosts({
				unit_id: unit_id,
				count: RecruitUnits.slider.getValue()
			});
			RecruitUnits.showCosts({
				count: 1
			});

			$(ele).addClass('selected');
		},

		//Displays how much selected units cost and updates values if desired unit count is included in 'options'-param
		showCosts: function(options) {
			var $el = RecruitUnits.recruit_units;

			RecruitUnits.unit_id = options.unit_id || RecruitUnits.current_unit_id;
			RecruitUnits.count = options.count || 1;

			var all = RecruitUnits.count > 1 ? 'all' : 'unit';
			var unit = RecruitUnits.units[RecruitUnits.current_town_id].units[RecruitUnits.unit_id];
			var res_id;

			for (res_id in unit.resources) {
				if (unit.resources.hasOwnProperty(res_id)) {
					$el.find('#unit_order_' + all + '_' + res_id)[0].innerHTML = unit.resources[res_id] * RecruitUnits.count;
				}
			}

			this.$el.find('#unit_order_' + all + '_favor')[0].innerHTML = unit.favor * RecruitUnits.count;
			this.$el.find('#unit_order_' + all + '_pop')[0].innerHTML = unit.population * RecruitUnits.count;
			this.$el.find('#unit_order_' + all + '_build_time')[0].innerHTML = DateHelper.readableSeconds(unit.build_time * RecruitUnits.count);
		},

		initSlider: function() {
			var elements = RecruitUnits.recruit_units.children('#recruit_box').children().children();

			RecruitUnits.slider = new Slider({
				elementMin: $(elements[1]),
				elementMax: $(elements[2]),
				elementDown: $(elements[3]),
				elementUp: $(elements[5]),
				elementInput: $(elements[6]),
				elementSlider: $(elements[4])
			});
			RecruitUnits.slider._elementSlider.bind('change', function() {
				RecruitUnits.showCosts({
					count: RecruitUnits.slider.getValue()
				});
			});
		},

		showAvailableUnits: function() {
			var type;

			RecruitUnits.recruit_units.hide();
			RecruitUnits.recruit_units.slideDown();
			RecruitUnits.recruit_tabs = $('#recruit_tabs').find('.recruit_unit');

			//show and update values
			RecruitUnits.recruit_tabs.each(function() {
				type = this.id;
				var tab = $(this);
				var unittype = RecruitUnits.units[RecruitUnits.current_town_id].units[type];

				if (unittype && unittype.count >= 1000) {
					tab.addClass('four_digit_number');
				}

				if (unittype && unittype.max_build > 0) {
					tab.parent().show();
					tab.children()[0].innerHTML = tab.children()[1].innerHTML = unittype.count;
					tab.next()[0].innerHTML = '+' + unittype.max_build;
				} else {
					tab.parent().hide();
				}
			});

			//select alway sword as first unit
			RecruitUnits.select('sword');
		},

		toggleTownUnits: function() {
			var $el = this.$el;

			if (!RecruitUnits.showAllUnits) {
				gpAjax.ajaxGet('town_overviews', 'all_units', {}, false, function(return_data) {
					RecruitUnits.showAllUnits = !RecruitUnits.showAllUnits;
					$.each(return_data.all_units, function(town_id, units) {
						var list = $el.find('#units_' + town_id + ' .current_units').html('');

						$.each(units, function(type, sum) {
							$el.find('tr#ov_town_' + town_id + ' span.count_' + type).html(sum);
							if (sum > 0 && type !== 'town_id') {
								list.append('<div class="place_unit unit_' + type + ' unit_icon25x25 ' + type + '"><span class="place_unit_black bold small">' + sum + '</span><span class="' + (GameDataHeroes.isHero(type) ? 'place_unit_hero' : 'place_unit_white') + ' bold small">' + sum + '</span></div>');
							}
						});
						$el.parent().find('#toggle_unit_link .middle').text(_('Show only own troops'));
					});
				});
			} else {
				gpAjax.ajaxGet('town_overviews', 'own_units', {}, false, function(return_data) {
					RecruitUnits.showAllUnits = !RecruitUnits.showAllUnits;
					$.each(return_data.own_units, function(town_id, units) {
						var list = $el.find('#units_' + town_id + ' .current_units').html('');

						$.each(units, function(type, sum) {
							$el.find('tr#ov_town_' + town_id + ' span.count_' + type).html(sum);
							if (sum > 0 && type !== 'town_id') {
								list.append('<div class="place_unit unit_' + type + ' unit_icon25x25 ' + type + '"><span class="place_unit_black bold small">' + sum + '</span><span class="' + (GameDataHeroes.isHero(type) ? 'place_unit_hero' : 'place_unit_white') + ' bold small">' + sum + '</span></div>');
							}
						});
						$el.parent().find('#toggle_unit_link .middle').text(_('Show all troops'));
					});
				});
			}
		}

	};

	window.RecruitUnits = RecruitUnits;
}(jQuery, window));

