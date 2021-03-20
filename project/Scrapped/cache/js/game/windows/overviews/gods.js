/* globals GameData, TooltipFactory, InfoWindowFactory, gpAjax, Overviews */

(function() {
	'use strict';

	var GodsOverview = {
		current_town_id: 0,
		templates: null,
		data: null,
		town_gods: null,
		favor: null,
		prev_target: null,
		prev_castable_powers: null,
		active_filter: null,

		/**
		 * Initiates the Gods Overview tab
		 */
		init: function (templates, data) {
			var html = us.template(templates.tmpl, {
					towns: data.towns,
					mystic_units: data.mythological_unit_types,
					gods: data.data_gods,
					l10n: {
						temple : _('Temple'),
						statue : _('Statue'),
						no_myth_units : _('No myth. units available')

					}
				}),
				html_bottom = us.template(templates.tmpl_bottom, {
					god_favor_overview: data.god_favor_overview,
					max_favor: data.max_favor,
					max_fury: data.max_fury,
					fury: {
						current: data.fury,
						god: GameData.gods.ares ? GameData.gods.ares.id : null
					}
				}),
				that = this;

			this.templates = templates;
			this.data = data;
			this.town_gods = data.town_gods;
			this.favor = data.god_favor_overview;
			this.active_filter = [];

			$("#gods_overview_wrapper").append(html);
			$("#gods_overview_bottom").append(html_bottom);

			$('#gods_overview_towns').bind('click', function (e) {
				if (!$(e.target).is('a.gp_town_link')) {
					e.stopPropagation();
					that.selectTown(e);
				}
			});

			this.initializeProductionTooltips();
			this.initializePowerTooltips();
			this.initializeOverviewTooltips();
			this.registerGodPortraitsClick();
		},

		registerGodPortraitsClick: function () {
			var $god_portraits = $('.god_icons_container');
			$god_portraits.off().on('click', function (e) {
				var $target = $(e.target);

				if (!$target.data('god_id')) {
					return;
				}

				this.updateTownFilter($target.data('god_id'));
			}.bind(this));
		},

		initializeProductionTooltips: function() {
			$('#gods_overview_bottom .god_overview_god_favor .god_mini').each(function(i, el) {
				var $el = $(el);
				$el.tooltip($el.attr('title'));
				$el.removeAttr('title');
			});
		},

		initializePowerTooltips: function() {
			$('#gods_overview_towns .casted_powers .power_icon12x12').each(function(i, el){
				var $el = $(el),
					power_configuration = $el.data().powerConfiguration,
					tooltip = TooltipFactory.getPowerTooltipWithCountdown($el.data().powerId, power_configuration, $el.data().powerEndat);

				$el.tooltip(tooltip, {width: 370});
			});
		},

		initializeOverviewTooltips: function() {
			$('#gods_overview_towns').find('.town_temple, .town_statue').each(function(il, el) {
				var $el = $(el);
				$el.tooltip($el.attr('title'));
				$el.removeAttr('title');
			});
		},

		/**
		 * Looks for the LI.town_item
		 */
		getParentTownElement: function ($el) {
			var wanted_class = 'town_item',
				that = this;

			if (!$el.hasClass(wanted_class) && $el.parent().length > 0) {
				return that.getParentTownElement($el.parent());
			}

			if ($el.hasClass(wanted_class)) {
				return $el;
			}

			return false;
		},

		/**
		 * Opened when user clicks on the town
		 */
		selectTown: function (e) {
			var parent = $("#gods_overview_towns"),
				that = this;

			if (!e.target || e.target.tagName === 'A' || parent.find(e.target).length === 0) {
				return;
			}

			var target = this.getParentTownElement($(e.target)),
				town_id = target.attr("id").replace(/\D+/g, ''),
				$castable_powers = $('#town_center_' + town_id + ' .gods_overview_castable_powers');

			this.current_town_id = town_id;

			if (!target.hasClass("selected")) {
				this.updateCastablePowers($castable_powers, town_id, function () {
					target.addClass('selected');
					that.prev_target = target;
				});
			} else {
				target.removeClass('selected');
				$castable_powers.hide();
			}
		},

		updateCastablePowers: function (castable_powers, town_id, callback) {
			var data = this.data,
				templates = this.templates;

			if (this.prev_castable_powers) {
				this.prev_castable_powers.empty();
				this.prev_target.removeAttr('style').removeClass('selected');
			}

			this.prev_castable_powers = castable_powers;

			castable_powers.empty().html(
				us.template(templates.tmpl_powers, {
					available_powers_for_town: data.available_powers_for_town,
					god_favor_overview: data.god_favor_overview,
					data_gods: data.data_gods,
					available_gods: data.available_gods,
					town_id: town_id,
					towns: data.towns
				})).show();

			$('.gods_overview_castable_powers #castable_powers .power a').each(function(i, el){
				var $el = $(el),
					tooltip = TooltipFactory.createPowerTooltip($el.data().powerId, {show_costs : true});

				$el.tooltip(tooltip, {width: 370});
			});

			if (typeof callback === "function") {
				callback();
			}
		},

		askForChange: function (data) {
			InfoWindowFactory.openChangeGodInfoWindow(data.town_id, data.new_god_id,  data.new_god_name);
		},

		changeGod: function (town_id, new_god_id, old_god_id, callback) {
			var that = this;

			gpAjax.ajaxPost('town_overviews', 'change_god', {
				'town_id': town_id,
				'god_id': new_god_id
			}, false, function (data) {
				/* variable data should contain offsets 'success', 'god_id', 'bar' and 'god_name'.. */

				// update js_god_value
				GodsOverview.town_gods[town_id] = new_god_id;

				// hide confirm screen
				$('#player_hint_area').remove();

				// remove mythological units from town
				$('#ov_town_' + town_id + ' .current_myth_units.town_inner_field').html(_('No myth. units available'));

				// change god icon in town
				$('#ov_town_' + town_id).find('.god_micro').attr('class', 'god_micro town_god ' + new_god_id);

				// update js_favor value
				if (typeof GodsOverview.favor[old_god_id] !== "undefined") {
					GodsOverview.favor[old_god_id].current = 0;
				}

				that.data.available_powers_for_town = data.available_powers;
				that.updateCastablePowers($('#town_center_' + town_id + ' .gods_overview_castable_powers'), town_id);

				if (typeof callback === 'function') {
					callback();
				}
			});
		},

		updateTownsCastedPowers: function (town_id, power, finished_at) {
			$('#casted_powers_town_' + town_id).append('<span class="power_icon12x12 ' + power + '" data-power-id="' + power + '" data-power-configuration="null" data-power-endat="' + finished_at + '"></span>');

			Overviews.initializePowerPopupForTownOverview(power, town_id, finished_at);
		},

		updateFavorBar: function (e, data) {
			var htmlGod;

			$.each(data, function (index, value) {
				htmlGod = $("#god_" + index);

				if (value !== undefined) {
					htmlGod.removeClass("favor_no_god").addClass("favor");
				} else {
					htmlGod.removeClass("favor").addClass("favor_no_god");
				}

				htmlGod.find("span").each(function (index) {
					if (index === 1) {
						if (value > 0) {
							$(this).removeClass("god_favor_icon_disabled").addClass("god_favor_icon");
						} else {
							$(this).removeClass("god_favor_icon").addClass("god_favor_icon_disabled");
						}
					} else if (index === 2) {
						if (value > 0) {
							$(this).removeClass("god_favor_text_disabled").addClass("god_favor_text");
						} else {
							$(this).removeClass("god_favor_text").addClass("god_favor_text_disabled");
						}
						$(this).text(value);
					}
				});
			});
		},

		updateTownFilter: function (new_filter) {
			var filter_index = this.active_filter.indexOf(new_filter),
				$icon = $('.gods_overview_icon.' + new_filter),
				$towns_list = $('ul#gods_overview_towns'),
				is_filter_empty;

			if (filter_index < 0) {
				this.active_filter.push(new_filter);
				$icon.addClass('selected');
			} else {
				this.active_filter.splice(filter_index, 1);
				$icon.removeClass('selected');
			}

			is_filter_empty = this.active_filter.length === 0;

			$towns_list.detach();
			$towns_list.find('li.town_item').each(function (index, el) {
				var $el = $(el),
					show_town = is_filter_empty || this.active_filter.indexOf($el.data('god_id')) >= 0;

				$el.toggle(show_town);
			}.bind(this));
			$towns_list.appendTo('#gods_overview_wrapper');
		}
	};

	window.GodsOverview = GodsOverview;
}());
