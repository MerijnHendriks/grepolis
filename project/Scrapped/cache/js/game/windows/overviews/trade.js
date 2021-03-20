/* global StringSorter, UnitSlider, CM, ITowns, gpAjax, NumberSorter, isNumber, HumanMessage */

(function() {
	'use strict';

	var TradeOverview = function TradeOverview(towns, town_tmpl, movements, mov_tmpl, wnd) {
		var filteredTownList,
			filteredMovList,
			sidebar_visible = false,
			that = this,
			selected = {
				from: null,
				to: null
			},
			resSliders = {
				wood : new UnitSlider(),
				iron : new UnitSlider(),
				stone : new UnitSlider()
			},
			capacity = {
				max: 0,
				left: 0,
				el: false
			};

		var root = wnd.getJQElement();

		/**
		 *
		 */
		function onCountdownFinish(e){
			var target = $(e.target),
				id = parseInt(target.parents('div.trade_movement').attr('id').match(/\d+/), 10),
				movement, town, i;

			// remove from list
			i = movements.length;
			while (i--) {
				movement = movements[i];
				if (movement.id === id) {
					movements.remove(i);
					break;
				}
			}

			// update incoming/outgoing
			i = towns.length;
			while (i--) {
				town = towns[i];

				if (movement) {
					if (town.id === movement.from.id) {
						town.out = --town.out || 0;
					}
					else if (town.id === movement.to.id) {
						town['in'] = --town['in'] || 0;
					}
				}
			}
			that.refreshView();
		}

		function filterTowns(filter) {
			filter = filter.toLowerCase();

			filteredTownList = towns.filter(function(element) {
				return (element.name.toLowerCase().match(filter));
			});

			filteredMovList = movements.filter(function(element) {
				return (element.from.tname.toLowerCase().match(filter) || element.to.tname.toLowerCase().match(filter));
			});

			that.refreshView();
		}

		function init() {
			var i;

			that.sortTownsByName();
			that.refreshView();

			// TODO: this is bad. (I guess author thought about the call in the callback)
			$.Observer(GameEvents.town.resources.update).subscribe(['trade_overview'], function(event, data) {
				that.refreshView(true);
			});

			CM.register(wnd.getContext(), 'txt_trade_filter_towns', root.find('#txt_trade_filter_towns').textbox({
				initial_message : _('Search for'), clear_msg_button : true, live : true
			})).on('txt:change:value', function(e, value, old_val, _txt) {
				filterTowns(value);
			}).on('txt:cleared', function() {
				filterTowns('');
			});

			$('#sort_towns').change(that.sortHandler);
			$('#trade_selected, #trade_control').click(that.clickControlHandler);
			$('#trade_overview_movements_wrapper').bind('finish', onCountdownFinish);

			capacity.el = CM.register(wnd.getContext(), 'txt_capacity_left', root.find('.capacity_left').textbox({ disabled: true, hidden_zero: false }));

			// drag
			registerDragging();

			// drop
			$('#trade_selected div.trade_town_wrapper').droppable({
				accept: '.trade_town_wrapper',
				drop: dropHandler,
				scope: 'trade'
			});

			$('#trade_overview_towns_wrapper').droppable({
				accept: '.trade_overview_chosen_town',
				drop: function(event, ui){
					var $el = ui.draggable.parent(),
						key = $el.attr('id').match(/from|to/).toString();

					delete selected[key];

					$el.empty().removeClass('active').append('<div class="trade_town">');
					$('#trade_duration').hide();
					that.refreshView();
					that.updateLeftCapacity(selected.from?false:0);

				},
				scope: 'trade'
			});

			for (i in resSliders) {
				if (resSliders.hasOwnProperty(i)) {
					resSliders[i].initialize('trade_overview_type_' + i);
					$('#trade_overview_type_' + i).on('change', function(){ that.updateLeftCapacity(); });
				}
			}
		}

		/**
		 * Drop event handler
		 */
		function dropHandler(event, ui) {
			var helper = ui.helper.children().first().append('<a href="#pin" class="pin">'),
				$el = $(this),
				key = $el[0].id.match(/from|to/).toString(),
				oldid = ($el[0].childNodes && $el[0].childNodes.length) ? $el[0].childNodes[0].id : null;

			ui.draggable.addClass('selected');

			$el.empty().append(helper.addClass('trade_overview_chosen_town')).addClass('active');
			//remove 'selected'-class from old element
			if (oldid) {
				$('#' + oldid).parent().removeClass('selected');
			}
			selected[key] = helper;

			getDuration();
			that.reInitializeSliders();
			$('#trade_selected .trade_town:not(.pinned)').draggable({
				appendTo: 'body',
				distance: 20,
				helper: function() {
					return $('<div class="trade_town_wrapper"></div>').css({
						width: $(this).width()
					}).append($(this).clone());
				},
				scope: 'trade'
			});
		}

		function registerDragging() {
			$('#trade_overview_towns li').draggable({
				appendTo: 'body',
				distance: 20,
				helper: function() {
					return $(this).clone().css({
						width: $(this).width()
					});
				},
				scope: 'trade'
			});
		}

		/**
		 * unbind etc.
		 */
		this.destroy = function() {
			$.Observer().unsubscribe(['trade_overview']);
		};

		/**
		 * Event handler for control buttons
		 * @param e Event
		 */
		this.clickControlHandler = function(e) {
			var target = e.target,
				href;

			if (!(href = target.href)) {
				return;
			}

			href = href.split(/#/).reverse()[0];
			switch (href) {
				case 'confirm':
					that.trade();
					break;
				case 'cancel':
					clearSelection();
					break;
				case 'swap':
					swap();
					break;
				/*case 'clear_fields':
				 $('#filter_towns').val('').keydown().keyup();
				 break;*/
				case 'show_sidebar':
					toggleSidebar();
					break;
				case 'pin':
					pinTown(e);
					break;
				case 'setMax':
					setSliderToMax.call(that, e);
					break;
			}

			e.preventDefault();
		};

		/**
		 * Toggle sidebar on/off, refreshes movement view.
		 * @param force Boolean true -> show, false -> hide
		 */
		function toggleSidebar(force) {
			if (typeof force === 'boolean') {
				sidebar_visible = !force;
			}
			$('#trade_overview_movements_wrapper').toggleClass('expanded', sidebar_visible = !sidebar_visible);
			if (sidebar_visible) {
				that.refreshMovementView();
			} else {
				// not sure if this is a good idea.
				//empty() would stop the timers.
				$('#trade_overview_movements_wrapper').empty();
			}
		}

		/**
		 * update sliders with new values. copied from old code.
		 */
		this.reInitializeSliders = function() {
			var max, i, id = getSelectedIDs().from;

			if (getSelectedIDs().from === false) {
				return;
			}
			max = ITowns.getTown(id).getAvailableTradeCapacity();

			for (i in resSliders) {
				if (resSliders.hasOwnProperty(i)) {
					resSliders[i].setMax(max);
				}
			}
			that.updateLeftCapacity(max);
		};

		/**
		 * Requests duration and time of arrival from server.
		 */
		function getDuration() {
			if (!(selected.from && selected.to)) {
				return;
			}

			gpAjax.ajaxGet('town_overviews', 'calculate_duration_between_towns', getSelectedIDs(), true, function(return_data) {
				$('#trade_duration span.way_duration').text(return_data.duration);
				$('#trade_duration span.arrival_time').text(return_data.arrival_at);
				$('#trade_duration').fadeIn('fast');
			});
		}

		this.focusHandler = function(e) {
			var cname = 'info_text',
				elem = $(this);

			if (elem.hasClass(cname)) {
				elem.removeClass(cname).val('');
			}
		};

		/**
		 * Event handler for 'change'-events on select-element
		 * @param e Event
		 */
		this.sortHandler = function(e) {
			// selected option
			var type = this.options[this.selectedIndex].value;

			if (type.match(/wood|stone|iron/)) {
				that.sortTownsByResource(type);
			} else if (type.match(/name/)) {
				that.sortTownsByName();
			} else {
				that.sortTownsByType(type);
			}

			that.refreshView();
		};

		/**
		 * Sort filtered town list by town name
		 */
		this.sortTownsByName = function() {
			var sorter = new StringSorter();
			filteredTownList = sorter.compareObjectsByAttribute(towns, ['name'], 'desc');
		};

		/**
		 * Sort filtered town list by resource type
		 * @param {String} type resource type wood, stone, iron
		 */
		this.sortTownsByResource = function(type) {
			var sorter = new NumberSorter();
			filteredTownList = sorter.compareObjectsByAttribute(towns, ['res', type]);
		};

		/**
		 * Sort filtered town list by given attribute
		 * @param {String} att object attribute
		 */
		this.sortTownsByType = function(att) {
			var sorter = new NumberSorter();
			filteredTownList = sorter.compareObjectsByAttribute(towns, [att]);
		};

		/**
		 * All towns from filteredList are rendered again and appended to the document.
		 * @param res_update Boolean resource update, no movement update
		 */
		this.refreshView = function(res_update) {
			if (!filteredTownList) {
				filteredTownList = towns;
			}
			var i = filteredTownList.length,
				html = '',
				town,
				ids = getSelectedIDs(),
				itowns = ITowns,
				ftown;

			while (i--) {
				ftown = filteredTownList[i];
				town = itowns.getTown(filteredTownList[i].id);
				html += town.render(town_tmpl, {
					'from': ids.from,
					'to': ids.to,
					'in': ftown['in'] || 0,
					'out': ftown.out || 0
				});
			}

			$('#trade_overview_towns').html(html);

			if (sidebar_visible && !res_update) {
				that.refreshMovementView();
			}
			registerDragging();
		};

		/**
		 * All movements from filteredMovList (and ETA in the future) are rendered again
		 */
		this.refreshMovementView = function() {
			var wrapper = $('#trade_overview_movements_wrapper');
			if (!filteredMovList) {
				filteredMovList = movements;
			}
			var i = filteredMovList.length,
				html = '',
				mov,
				now = parseInt(Date.now() / 1E3, 10),
				filteredMovListCopy = us.clone(filteredMovList).reverse();

			if (i) {
				while (i--) {
					mov = filteredMovListCopy[i];
					// don't render if  arrival is not in the future
					if (mov.arrival >= now) {
						html += us.template(mov_tmpl, mov);
					}
				}
			} else {
				html = '<div>' + _('No movements.') + '</div>';
			}
			wrapper.html(html);
			// start countdowns
			if (sidebar_visible) {
				wrapper.find('span.eta').each(function() {
					$(this).countdown().show();
				});
			}
		};

		/**
		 * Clears the currently selected towns
		 */
		function clearSelection() {
			var ids = getSelectedIDs();

			$('#trade_selected_from, #trade_selected_to').each(function() {
				var elem = $(this),
					key = this.id.match(/from|to/).toString(),
					id = ids[key],
					town, ftown;

				if (elem.children().hasClass('pinned')) {
					//re-render the town info to update resources state
					elem.empty();
					ftown = towns.filter(function (element, index, array) {
						return (element.id === id);
					})[0];
					town = ITowns.getTown(id).render(town_tmpl, {
						'from': ids.from,
						'to': ids.to,
						'in': ftown['in'] || 0,
						'out': ftown.out || 0
					});

					dropHandler.call(elem, null, {
						helper: $(town),
						draggable: $()
					});
					pinTown({target: elem.find('a.pin')});
				} else {
					elem.empty().removeClass('active').append('<div class="trade_town">');
					delete selected[key];
				}
			});
			$('#trade_duration').hide();
			that.refreshView();
			that.updateLeftCapacity(selected.from?false:0);
		}

		/**
		 * Swaps the two selected towns (needs two towns for that).
		 */
		function swap() {
			var tmp = selected.from;
			if (!(selected.from && selected.to)) {
				return;
			}
			selected.from = selected.to;
			selected.to = tmp;
			$('#trade_selected_from').append(selected.from);
			$('#trade_selected_to').append(selected.to);

			getDuration();
			that.reInitializeSliders();
		}

		/**
		 * Returns the IDs for selected towns
		 * @return Object {from: Number || Boolean, to: Number || Boolean}
		 */
		function getSelectedIDs() {
			return {
				from: selected.from ? ~~(selected.from.attr('id').match(/\d+/)) : false,
				to: selected.to ? ~~(selected.to.attr('id').match(/\d+/)) : false
			};
		}

		/**
		 * Pin/unpin a town
		 */
		function pinTown(e) {
			$(e.target).toggleClass('active').parent().toggleClass('pinned');
		}

		function setSliderToMax(e) {
			if (!getSelectedIDs().from) {
				return false;
			}

			var i = $(e.target).attr('class').split('_')[0],
				max = Math.min(resSliders[i].getMax(), ITowns.getTown(getSelectedIDs().from).getCurrentResources()[i]);
			if (capacity.left > 0) {
				max = Math.min(capacity.left + resSliders[i].getValue(), max);
			} else {
				max = 0;
			}

			resSliders[i].setValue(max);
			that.updateLeftCapacity();
		}

		this.updateLeftCapacity = function (val) {
			if(typeof val === 'number') {
				capacity.max = val;
			}
			var i, capacity_used = 0, capacity_container = root.find('.capacity_left');
			for (i in resSliders) {
				if(!isNaN(resSliders[i].getValue())){
					capacity_used += parseInt(resSliders[i].getValue(), 10);
				}
			}
			capacity.left = capacity.max - capacity_used;
			capacity.el.setValue(capacity.left);
			if (capacity.left < 0) {
				capacity_container.addClass('brimfull');
			} else {
				capacity_container.removeClass('brimfull');
			}
		};

		// trade functions
		this.trade = function() {
			//data-object to send via Ajax
			var data = getSelectedIDs();

			if (!(isNumber(data.from) && isNumber(data.to))) {
				HumanMessage.error(_('Draw the two cities into the fields provided for them.'));
				return;
			} else if (data.from === data.to) {
				HumanMessage.error(_('You can`t send any resources to the same city!'));
				return;
			}

			$.each(['wood', 'stone', 'iron'], function(i, res_name) {
				var elem = $('#trade_overview_type_' + res_name);
				data[res_name] = elem.val();
				elem.val('');
			});

			gpAjax.ajaxPost('town_overviews', 'trade_between_own_town', data, false, function(return_data) {
				if (!return_data.success) {
					return;
				}
				var i, newmove,
					town = ITowns.getTown(return_data.origin_town_id);

				// replace movements list
				filteredMovList = movements = return_data.movements;
				// find new movement:
				newmove = movements.filter(function (element, index, array) {
					return (element.id === return_data.new_trade_movement);
				})[0];

				// update icoming/outgoing
				i = towns.length;
				while (i--) {
					town = towns[i];
					if (town.id === newmove.from.id) {
						town.out = ++town.out || 1;
					} else if (town.id === newmove.to.id) {
						town['in'] = ++town['in'] || 1;
					}
				}

				clearSelection();
			});
		};

		init();
	};

	window.TradeOverview = TradeOverview;
}());
