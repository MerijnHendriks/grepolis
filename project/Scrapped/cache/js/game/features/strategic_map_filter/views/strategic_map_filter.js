define('features/strategic_map_filter/views/strategic_map_filter', function() {
	'use strict';

	var Views = require_legacy('GameViews');
	var ColorPickerFactory = require('features/color_picker/factories/color_picker');
	var FILTERS = require('enums/filters');
	var MapColorChangesHelper = require('helpers/map_color_changes');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		addNewHighlight : function() {
			var $filter_list = this.$el.find('.filter_highlight_list'),
            	autocomplete_type = this.controller.getAutocompleteType(),
            	placeholder = this.controller.getPlaceHolder(),
                highlight_input,
				textboxAutocomplete = function (row) {

					if (row.data[2]) {
						this.controller.setFilterOptions(row.data[1], row.data[0], row.data[2]);
					} else {
						this.controller.setFilterOptions(row.data[1], row.data[0]);
					}

					this.unregisterComponent('highlight_input');

					highlight_input.remove();
					this.createHighlightsList(row.data[1], row.data[0], this.controller.getFilterOptions().length, 'specific');
					if (this.controller.getFilterOptions().length === 10) {
						this.unregisterComponent('btn_add_highlight');
						this.$el.find('.btn_add_highlight').hide();
					}
					return row.data[0];
				};

			this.controller.publishCloseColorPickerEvent();

			if ($filter_list.find('.highlight_input').length === 0) {
				highlight_input = $('<div class="highlight_input textbox ac_input"></div>');
				$filter_list.append(highlight_input);

				this.registerComponent('highlight_input', this.$el.find('.highlight_input').textbox({
					focus: true,
					placeholder: placeholder,
					autocompletion : true,
					autocompletion_type : autocomplete_type,
					autocompletion_with_id : true,
					autocompletion_limit : 10,
					autocompletion_format_output : textboxAutocomplete.bind(this)
				}));
			}
		},

		updateColorOfColorBtn : function(color, type, id) {
			var $element = this.$el.find('.'+type+'_'+id);
			$element.find('.btn_color').css({background: '#'+color});
		},

		filterItemsOnMiniMap : function() {
			var $minimap = $($.find('#minimap_canvas'));

			var checked_filters = this.controller.getFilterOptions().filter(function(obj) {
				return obj.checked === true;
			});

			$minimap.find('.m_town.big_dots').removeClass('big_dots');

			if (checked_filters.length === 0) {
				return;
			}

			checked_filters.forEach(function(filter) {
				var css_cls = this.controller.getCssClassForItemsOnMiniMap(filter.value);
				if (css_cls.length === 0) {
					return;
				}
				css_cls.forEach(function(cls) {
					$minimap.find('.m_town.'+cls).addClass('big_dots');
				});
			}.bind(this));

		},

		createHighlightsList : function(highlight_value, highlight_name, index, specific_class) {
			var filter = this.controller.getFilterType();
			var highlight_elem =  this.getTemplate('highlight', {
				highlight_value: highlight_value,
				specific_class : specific_class,
				filter: filter
			});

			var disable_component = false;
			var disabled_class = false;
			if (this.controller.checkIfDefaultHighlightShouldBeDisabled(highlight_value, index)) {
				disable_component = true;
				disabled_class = 'disabled';
			}
			var $highlight_elem = $(highlight_elem);

			if (disabled_class) {
				$highlight_elem.addClass(disabled_class);
			}

			this.$el.find('.filter_highlight_list').append($highlight_elem);
			this.unregisterComponent('highlight_'+index);
			this.registerComponent('highlight_'+index, $highlight_elem.find('.filter_highlight').checkbox({
				caption: highlight_name,
				disabled: disable_component,
				checked: this.controller.getCheckedStateById(highlight_value),
				tooltips: this.getDisabledCheckboxTooltip(highlight_value)
			}).on("cbx:check", function() {
				this.controller.setCheckedStateOptions(highlight_value, this.getComponent('highlight_'+index).isChecked());
				this.filterItemsOnMiniMap();
			}.bind(this)));
			this.registerOpenColorPickerBtn($highlight_elem, highlight_value);
			if (specific_class) {
				this.registerRemoveBtn($highlight_elem);
			}
		},

		getDisabledCheckboxTooltip : function(value) {
			//first index of array has value null because the checkbox has no tooltip when not disabled
			var tooltip_data = [null];
			if(this.controller.getFilterType() === FILTERS.FILTER_TYPES.ALLIANCE) {
				var disabled_checkbox_tooltip_text = this.controller.getAllianceDisabledCheckboxTooltipText(value);
				tooltip_data.push({ title : disabled_checkbox_tooltip_text});
			}
			return tooltip_data;
		},

		registerAddHighlightBtn : function() {
			var btn = 'btn_add_highlight';

			if (this.controller.getFilterOptions().length < 10) {
				this.unregisterComponent(btn);
				this.registerComponent(btn,
					this.$el.find('.' + btn).button({
						tooltips : [
							{title : this.l10n.add_entry}
						]
					}).on('btn:click', this.addNewHighlight.bind(this)));
				this.$el.find('.' + btn).show();
			}
		},

		changeAllianceHighlightFilterState : function (filter_type, is_enabled) {
			if (this.controller.getFilterType() !== FILTERS.FILTER_TYPES.ALLIANCE) {
				return;
			}
			var position_lookup_table = [FILTERS.ALLIANCE_TYPES.OWN_ALLIANCE, FILTERS.ALLIANCE_TYPES.PACT, FILTERS.ALLIANCE_TYPES.ENEMY];

			var list_position = position_lookup_table.indexOf(filter_type);

			var checkbox = this.getComponent('highlight_' + list_position);
			this.$el.find('.alliance_' + filter_type).toggleClass('disabled', !is_enabled);

			if (!checkbox) {
				return;
			}

			if (is_enabled) {
				checkbox.enable();
			} else {
				checkbox.check(false);
				checkbox.disable();
			}
		},

		registerOpenColorPickerBtn : function($elem, value) {
			this.controller.setCustomColor(this.controller.getFilterType(), value);
			var tooltip_text = this.controller.getTooltipTextForHighlightOption(value, $elem.hasClass('disabled'));
			var filter_color = this.controller.getSpecificFilterOptionColorById(value);
			this.updateColorOfColorBtn(filter_color, this.controller.getFilterType(), value);
			var $color_btn = $elem.find('.highlight_color_btn');
			$color_btn.tooltip(tooltip_text);


			$color_btn.off('click').on('click', function() {
				var window_position = this.$el.parent().offset();
				var id = this.controller.getIdsForHighlights(value);
				var color_picker_setup = this.controller.constructColorPickerSetup(id, value);
				var current_color = this.controller.getSpecificFilterOptionColorById(value);

				ColorPickerFactory.openWindow(color_picker_setup.type, color_picker_setup.id, function(new_color, remove_custom_color) {
					if(remove_custom_color) {
						MapColorChangesHelper.removeColorAssignment(new_color, color_picker_setup.type, color_picker_setup.id, false, color_picker_setup.additional_id );
					} else {
						MapColorChangesHelper.assignColor(new_color, color_picker_setup.type, color_picker_setup.id);
					}
				}, window_position, current_color, color_picker_setup.additional_id, color_picker_setup.target_name);
			}.bind(this));
		},

		registerRemoveBtn : function($elem) {
			$elem.find('.highlight_remove_btn').off('click').on('click', function(event) {
				var show_add_highlight = false,
				    highlight_to_be_removed = $(event.currentTarget).parent(),
					highlight_id = highlight_to_be_removed.find('.filter_highlight').attr('data-highlight');

				this.controller.publishCloseColorPickerEvent();

				if (this.controller.getFilterOptions().length === 10) {
					show_add_highlight = true;
				}

				highlight_to_be_removed.remove();

				this.controller.removeFilterOptions(highlight_id);

				if (show_add_highlight) {
					this.registerAddHighlightBtn();
					this.$el.find('.btn_add_highlight').show();
				}
				this.filterItemsOnMiniMap();
			}.bind(this));
			$elem.find('.highlight_remove_btn').tooltip(this.l10n.delete_entry);
		},

		render : function() {
			this.renderTemplate(this.$el, 'index', {});

			this.registerViewComponents();
		},

		/**
		 * each filter type has some 'default' filters (like own cities, own alliance, pacts, enemies), which are always there
		 */
		registerFilterList : function() {
			var filter_options = this.controller.getFilterOptions();

			filter_options.forEach(function(highlight_value, index) {
				if (index > this.controller.getNumberOfDefaultFilter() - 1) {
					this.createHighlightsList(highlight_value.value, highlight_value.name, index, 'specific');
				} else {
					this.createHighlightsList(highlight_value.value, highlight_value.name, index, false);
				}
			}.bind(this));
		},

		registerViewComponents: function() {
			var main_filter_options = this.controller.getMainFilterOptions(),
				main_search_filter = this.controller.getMainSearchFilter();

			this.unregisterComponents();

			this.registerComponent('main_strategic_map_filter', this.$el.find('#main_strategic_map_filter').dropdown({
				value: main_search_filter,
				options: main_filter_options,
				list_pos: 'center'
			}).on('dd:change:value', function(e, new_val) {
				this.controller.publishCloseColorPickerEvent();
				this.controller.setMainSearchFilter(new_val);
				this.controller.reRender();
			}.bind(this)));

			this.registerFilterList();

			this.filterItemsOnMiniMap();

			this.registerAddHighlightBtn();
		}
	});
});
