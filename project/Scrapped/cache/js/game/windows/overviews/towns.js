/* global MM, GPEndlessScroll, PopupFactory, GameData, GameDataPowers, TooltipFactory */
(function() {
	'use strict';

	var TownsOverview = {
		wnd_handle: null,
		toggle_mode: 0, // controls the visiblility of units types 0:ground units, 1:naval units, 2:mythological units
		options: null,

		init: function(wnd_handle,options) {
			var _self = this;

			TownsOverview.wnd_handle = wnd_handle;
			TownsOverview.options = options;

			PopupFactory.addTexts({
				header_town: _('City (points)'),
				header_island: _('Island coordinates (ocean)'),
				header_wood: _('Amount of wood'),
				header_stone: _('Amount of stone'),
				header_iron: _('Amount of silver coins'),
				header_free_pop: _('Free population'),
				header_storage: _('Warehouse capacity'),
				header_research_points: _('Research points'),
				header_main: _('Senate activity'),
				header_barracks: _('Barracks activity'),
				header_docks: _('Harbor activity'),
				header_trade: _('Available trade capacity'),
				header_culture: _('City festivals'),
				header_outbound_attacks: _('Attacks led by you'),
				header_inbound_attacks: _('Attacks on your city!'),
				header_casts: _('Active spells')
			});

			// Attach header popups
			$('.tag_header').each(function() {
				$(this).setPopup($(this).attr('id'));
			});

			// Attach unit popups
			$.each(GameData.units, function(unit) {
				$('.col.header.' + unit).each(function() {
					$(this).setPopup(unit);
				});
			});

			$('#units_show').click(function() {
				TownsOverview.toggle();
			});

			var handleESCallbackEvent = function(args, data, isScrollDown) {
				var view = $(data.view);

				$.each(view, function(key, elem) {
					if (elem.id !== undefined) {
						var town_id = elem.id.replace('ov_town_', '');
						$.each($('#town_' + town_id + '_casts').children(), function(jkey, jelem) {
							var power_id = jelem.id.replace(town_id + '_', '');
							$('#' + town_id + '_' + power_id).setPopup(power_id);
						});
					}
				});

				TownsOverview.toggle(true);

				_self.renderCastedPowers();
			};

			_self.renderCastedPowers();

			var es_data = {
				elem_id: 'table_scroll_content',
				controller: 'town_overviews',
				action: 'towns_overview',
				limit: options.es_limit,
				last_element: options.es_elem_total,
				first_element: options.es_elem_start,
				window_handle: wnd_handle,
				es_pagination_id: 'es_page_town_ov',
				callback: handleESCallbackEvent
			};

			//This fixes the problem with endless scrolling,
			//but the way how ES is implmented is odd
			if (!window.es_data) {window.es_data={}; }
			window.es_data[wnd_handle.getID()] = es_data;

			new GPEndlessScroll(es_data);
		},

		renderCastedPowers : function() {
			$('#townsoverview .town_casted_powers').each(function() {
				var $el = $(this),
					town_id = $el.data().townId,
					casted_powers_town_agnostic = MM.getFirstTownAgnosticCollectionByName('CastedPowers'),
					casted_powers_collection = casted_powers_town_agnostic.getFragment(town_id),
					casted_powers = casted_powers_collection.getCastedPowers(),
					casted_power,
					key;

				// make sure container is empty
				// otherwise there are problems with endless scroll and duplicate power icons
				$($el).html('');
				for (key in casted_powers) {
					if (casted_powers.hasOwnProperty(key)) {
						casted_power = casted_powers[key];

						var $div = $('<div class="w16 h16 casted_spell_town active"></div>').appendTo($el),
							power_id = casted_power.getCssPowerId(),
							level = casted_power.getConfiguration() ? casted_power.getConfiguration().level : 0;

						$div.attr('id', 'town_' + town_id + '_' + power_id);

						$div.addClass('power_icon16x16 ' + power_id + (level ? ' lvl lvl' + level : ''));
						$div.data({
							powerId: casted_power.getPowerId(),
							powerConfiguration: casted_power.getConfiguration(),
							powerEndat: casted_power.getEndAt()
						});
					}
				}

			});

			$('#townsoverview').on('mouseover', '.casted_spell_town', function(e) {
				var $el = $(e.currentTarget),
					power_configuration = $el.data().powerConfiguration,
					power_end_at = $el.data().powerEndat,
					tooltip = TooltipFactory.getPowerTooltipWithCountdown($el.data().powerId, power_configuration, power_end_at);

				$el.tooltip(tooltip, {width: 370}).showTooltip(e);
			});
		},

		toggle: function(reposition) {
			if (!reposition) {
				TownsOverview.toggle_mode++;
				TownsOverview.toggle_mode = TownsOverview.toggle_mode % TownsOverview.options.toggle_count;
			}

			var x_offset = -175 * TownsOverview.toggle_mode;

			$('#header_units_div').animate({
				left: x_offset + 'px'
			}, 'slow');

			$("div[id^='units_div_']").each(function() {
				$(this).animate({
					left: x_offset + 'px'
				}, 'slow');
			});
		}
	};

	window.TownsOverview = TownsOverview;
}());
