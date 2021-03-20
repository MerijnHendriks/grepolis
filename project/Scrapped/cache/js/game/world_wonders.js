(function() {
	'use strict';

	var WorldWonders = {
		spinners : {},
		wonder_nr : null,
		all_wonders : null,

		initiaiteSendResourcesTab : function(context, data, island) {
			var wnd = context.wnd, root = wnd.getJQElement(),
				wood_on_the_way = data.sum_ressources_on_the_way.wood || 0, stone_on_the_way = data.sum_ressources_on_the_way.stone || 0,
				iron_on_the_way = data.sum_ressources_on_the_way.iron || 0,
				wood_needed = 0, stone_needed = 0, iron_needed = 0,
				wood = 0, stone = 0, iron = 0;

			if (data.needed_resources) {
				wood_needed = data.needed_resources.wood;
				stone_needed = data.needed_resources.stone;
				iron_needed = data.needed_resources.iron;
			}

			if (data.wonder_res) {
				wood = data.wonder_res.wood;
				stone = data.wonder_res.stone;
				iron = data.wonder_res.iron;
			}

			var free_trade_capacity = data.free_trade_capacity,
				max_trade_capacity = data.max_trade_capacity,
				origin_wood = data.curr_town_resources.wood,
				origin_stone = data.curr_town_resources.stone,
				origin_iron = data.curr_town_resources.iron,
				origin_storage_volume = data.curr_town_storage_volume;

			var pb_capacity;
				//New Market: 'inverse' progressbar
				pb_capacity = root.find('#ww_big_progressbar').singleProgressbar({
						value : free_trade_capacity,
						max: max_trade_capacity,
						caption: _('Capacity:')
					}).on('pb:change:value', function(e, new_val, old_val) {
						el_free_trade_capacity.text(new_val);
					}).on('pb:change:extra', function(e, new_val, old_val) {
						el_free_trade_capacity.text(free_trade_capacity = free_trade_capacity - new_val + old_val);
					});
			var el_free_trade_capacity = root.find('#ww_free_trade_capacity');

			//Initialize time progressbar
			if (data.stage_started_at) {
				var pb_time = root.find('#ww_time_progressbar').singleProgressbar({
					'max': data.stage_completed_at - data.stage_started_at,
					'value': data.stage_completed_at - data.today,
					'type': 'time',
					'caption': _('Completion of the upgrade'),
					'countdown': true,
					'template' : 'tpl_pb_single_nomax',
					liveprogress : true,
					liveprogress_interval : 1
				});
			}

			WorldWonders.initializeWondersPager(data.all_wonders, island);

			var prev_wonder = WorldWonders.getPreviousWonder(),
				next_wonder = WorldWonders.getNextWonder(),
				el_prev_wonder = root.find('.prev_ww'),
				el_next_wonder = root.find('.next_ww');

			el_prev_wonder[!prev_wonder ? 'addClass' : 'removeClass']('hidden');
			el_next_wonder[!next_wonder ? 'addClass' : 'removeClass']('hidden');

			//Initialize progressbars
			var pb_wood = root.find('#ww_town_capacity_wood').progressbar({max : wood_needed, value : wood, value2 : wood_on_the_way, value3 : 0}),
				pb_stone = root.find('#ww_town_capacity_stone').progressbar({max : stone_needed, value : stone, value2 : stone_on_the_way, value3 : 0}),
				pb_iron = root.find('#ww_town_capacity_iron').progressbar({max : iron_needed, value : iron, value2 : iron_on_the_way, value3 : 0});

			//Initialize spinners
			var sp_wood = this.spinners.wood = root.find('#ww_trade_type_wood').spinner({
					value : 0, step : 500, max : origin_wood, tabindex : 71
				}).on('sp:change:value', function(e, new_val, old_val) {
					pb_capacity.decr(new_val - old_val);
					pb_wood.setValue(null, null, new_val);
				}),
				sp_stone = this.spinners.stone = root.find('#ww_trade_type_stone').spinner({
					value : 0, step : 500, max : origin_stone, tabindex : 72
				}).on('sp:change:value', function(e, new_val, old_val) {
					pb_capacity.decr(new_val - old_val);
					pb_stone.setValue(null, null, new_val);
				}),
				sp_iron = this.spinners.iron = root.find('#ww_trade_type_iron').spinner({
					value : 0, step : 500, max : origin_iron, tabindex : 73
				}).on('sp:change:value', function(e, new_val, old_val, arg) {
					pb_capacity.decr(new_val - old_val);
					pb_iron.setValue(null, null, new_val);
				});

			//Initialize Trade button
			root.find('.send_resources_btn').unbind('click').bind('click', function() {
				WorldWonders.sendResources(wnd, island, pb_capacity, pb_wood, pb_stone, pb_iron, sp_wood, sp_stone, sp_iron, el_free_trade_capacity);
			});

			//Clicking on the res icons sets max in the spinners
			root.find('.wonder_controls').unbind('click').bind('click', function(e) {
				var target = $(e.target);

				if (target.hasClass('icon')) {
					var name = target.attr('name'),
						// We manipulate the local spinner variable, rather than retrieving it via WorldWonders.spinners
						// (which could have been overwritten by another instance of the WW donation window)
						selected_spinner = (name == "wood")
							?  sp_wood
							: (name == "stone")
							? sp_stone : sp_iron,

						sum_val_rest_sp = name == "wood"
							? (sp_stone.getValue() + sp_iron.getValue())
							: (name == "stone"
							? (sp_wood.getValue() + sp_iron.getValue())
							: (sp_wood.getValue() + sp_stone.getValue())),
						res_max = name == "wood" ? origin_wood : (name == "stone" ? origin_stone : origin_iron),
						value = res_max < free_trade_capacity ? res_max : (free_trade_capacity > res_max ? res_max : free_trade_capacity);

					if (value + sum_val_rest_sp > free_trade_capacity) {
						value = free_trade_capacity - sum_val_rest_sp;
					}

					if (selected_spinner) {
						selected_spinner.setValue(selected_spinner.getValue() == value ? 0 : value);
					}
				}
				else if(prev_wonder && target.hasClass('prev_ww')) {
					context.island_x = prev_wonder.island_x;
					context.island_y = prev_wonder.island_y;

					wnd.requestContentGet('wonders', 'index', {island_x : prev_wonder.island_x, island_y : prev_wonder.island_y});
				}
				else if(next_wonder && target.hasClass('next_ww')) {
					context.island_x = next_wonder.island_x;
					context.island_y = next_wonder.island_y;

					wnd.requestContentGet('wonders', 'index', {island_x : next_wonder.island_x, island_y : next_wonder.island_y});
				}
			});
		},

		sendResources : function(wnd, island, pb_capacity, pb_wood, pb_stone, pb_iron, sp_wood, sp_stone, sp_iron, el_free_trade_capacity) {
			var _self = this;

			var wood = sp_wood.getValue(),
				stone = sp_stone.getValue(),
				iron = sp_iron.getValue(),
				total = wood + stone + iron;

			if (wood === '' && stone === '' && iron === '') {
				HumanMessage.error(_('No resource has been selected'));
			}
			else {
				wnd.requestContentPost('wonders', 'send_resources', {wood: wood, stone: stone, iron: iron, island_x : island.x, island_y : island.y}, function(arg1, arg2) {
					_self.refreshAllWorldWondersWindows();

					/*sp_wood.setValue(0);
					 sp_stone.setValue(0);
					 sp_iron.setValue(0);

					 pb_capacity.changeExtraBy(total).setValue(0);
					 pb_wood.changeValueBy('value2', wood);
					 pb_stone.changeValueBy('value2', stone);
					 pb_iron.changeValueBy('value2', iron);*/
				});
			}
		},

		refreshAllWorldWondersWindows : function() {
			var all_opened_windows = GPWindowMgr.getByType(GPWindowMgr.TYPE_WONDERS);

			for(var i = 0, l = all_opened_windows.length; i < l; i++) {
				all_opened_windows[i].getHandler().refreshOnResourcesSend();
			}
		},

		initializeWondersPager : function(all_wonders, island) {
			var i, l = all_wonders.length;

			this.all_wonders = all_wonders;

			for (i = 0; i < l; i++) {
				if (all_wonders[i].island_x == island.x && all_wonders[i].island_y == island.y) {
					this.wonder_nr = i;
				}
			}
		},

		getPreviousWonder : function() {
			return this.all_wonders[this.wonder_nr - 1];
		},

		getNextWonder : function() {
			return this.all_wonders[this.wonder_nr + 1];
		}
	};

	window.WorldWonders = WorldWonders;
}());
