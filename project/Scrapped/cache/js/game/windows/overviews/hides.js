/* globals HumanMessage, gpAjax, Game, TownOverviewWindowFactory, _, $ */
(function() {
	'use strict';

	var HidesOverview = {
		help: false, //hidden
		popup: $('<div id="overview_help" class="small"><div class="top"></div><div class="middle"></div><div class="bottom"></div></div>'),
		spinners : [],
		hidesInfo : null,

		init: function() {
			$('#buttons .cancel').tooltip(_('Reset'));
			$('#buttons .confirm').tooltip(_('Store silver coins'));
			$('.help').tooltip(_('Show help'));

			$('#hides_overview_wrapper').unbind('click').bind('click', function(e) {
				var el = $(e.target), spinner;

				if (el.hasClass('iron_img')) {
					spinner = HidesOverview.spinners[el.attr('name')];

					if (spinner) {
						spinner.setValue(spinner.getValue() == spinner.getMax() ? 0 : spinner.getMax()); // jshint ignore:line
					}
				}
			});
		},

		clearSelection: function(town_id) {
			var spinner;
			spinner = HidesOverview.spinners[town_id];
			spinner.setValue(0);
		},

		storeIronInTown: function(town_id) {
			var spinner = HidesOverview.spinners[town_id];
			var iron_to_store = spinner.getValue();
			var value = $('#ov_town_' + town_id + ' span.eta').html();
			var current_iron_stored = value.substr(1, (value.indexOf('/') - 1));
			var max_storage = value.substr(value.indexOf('/') + 1, (value.lastIndexOf(')') - 1 - value.indexOf('/')));
			var new_iron_stored;

			if (iron_to_store == 0) { // jshint ignore:line
				HumanMessage.error(_('You must store at least 1 silver coin.'));
				return;
			} else {
				gpAjax.ajaxPost('town_overviews', 'store_iron', {
					'town_id': town_id,
					'active_town_id': Game.townId,
					'iron_to_store': iron_to_store
				}, false, function(data) {
					var elem = $('#town_' + town_id + '_res .iron .count');
					elem.removeClass('town_storage_full');
					elem.html(data.iron);

					new_iron_stored = data.iron_stored + parseInt(current_iron_stored, 10);

					$('#ov_town_' + town_id + ' span.eta').html('(' + new_iron_stored + '/' + max_storage + ')');
					$('#ov_town_' + town_id + ' div#bar').css('width', (new_iron_stored / parseInt(max_storage, 10) * 100) + '%');
					HidesOverview.clearSelection(town_id);

					//Update spinner limit
					spinner.setValue(0).setMax(Math.min(data.iron, max_storage == '∞' ? Infinity : parseInt(max_storage, 10) - new_iron_stored)); // jshint ignore:line
					//Update 'hides data'

					HidesOverview.hidesInfo[town_id] = {max_storage: max_storage == '∞' ? -1 : parseInt(max_storage, 10), iron_stored : new_iron_stored}; // jshint ignore:line
				});
			}
		},

		storeIronInAllTowns: function() {
			var iron_to_store = parseInt($('#hides_overview_all_towns_iron').val(), 10);

			if (isNaN(iron_to_store) || iron_to_store < 1) {
				HumanMessage.error(_('You must store at least 1 silver coin.'));
				return;
			} else {
				gpAjax.ajaxPost('town_overviews', 'store_iron_in_all_towns', {
					'iron_to_store': iron_to_store
				}, false, function(data) {
					TownOverviewWindowFactory.openHidesOverview();
				});
			}
		},

		showHelp: function(town_id, window, step) {
			if (typeof(step) == 'undefined') {
				if (HidesOverview.help) {
					HidesOverview.hideHelp();
					return;
				} else {
					step = 0;
				}
			}
			var wnd = window.getJQElement().find('.gpwindow_content');
			HidesOverview.popup.appendTo(wnd);
			switch (step) {
				case 0:
					HidesOverview.help = true;
					var anchor = $('#town_hide_' + town_id);
					if (anchor.length == 0) { // jshint ignore:line
						anchor = $('#no_hide_' + town_id);
						HidesOverview.popup.children('.middle').text(_('You still have to build a cave in this city.'));
					} else {
						HidesOverview.popup.children('.middle').text(_('Enter the number of silver coins and confirm the entry with the green arrow.'));
					}
					HidesOverview.popup.addClass('top_align').css({
						top: (anchor.offset().top - wnd.offset().top + 15) + 'px',
						left: (anchor.offset().left - wnd.offset().left) + 'px'
					}).show();
					break;
				default:
					HidesOverview.hideHelp();
					break;
			}
		},

		hideHelp: function() {
			HidesOverview.help = false;
			HidesOverview.popup.hide().remove();
		}
	};

	window.HidesOverview = HidesOverview;
}());