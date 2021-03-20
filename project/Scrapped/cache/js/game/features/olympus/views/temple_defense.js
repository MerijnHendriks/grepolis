define('features/olympus/views/temple_defense', function () {
	'use strict';

	var GameViews = require_legacy('GameViews'),
		GameDataUnits = require_legacy('GameDataUnits'),
		TempleInfoHelper = require('features/olympus/helpers/temple_info');

	return GameViews.BaseView.extend({
		initialize: function () {
			GameViews.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el, 'temple_defense', {
				l10n: this.l10n
			});

			this.renderList();
			this.registerUnitListButtons();
			this.registerReturnAllUnitsButton();
			this.registerScrollbar();
		},

		renderListItem: function (fragment, units) {
			var is_summary = !units.hasOwnProperty('home_town_id'),
				units_list = units.hasOwnProperty('units') ? units.units : units,
				template = us.template(this.controller.getTemplate('defense_list_item'), {
					l10n: this.l10n,
					id: units.id,
					home_town_link: units.home_town_link,
					home_town_id: units.home_town_id,
					is_summary: is_summary
				}),
				$el = $(template);

			$el.find('.units_list').prepend(TempleInfoHelper.getUnitsFragment(units_list, true));
			$el.appendTo(fragment);
		},

		renderList: function () {
			var fragment = document.createDocumentFragment(),
				supporting_units = this.controller.getSupportingUnits();

			this.renderListItem(fragment, this.controller.getAllUnits());

			for (var id in supporting_units) {
				if (supporting_units.hasOwnProperty(id)) {
					this.renderListItem(fragment, supporting_units[id]);
				}
			}

			this.$el.find('.game_list .content').append(fragment);
		},

		renderUnitsInputList: function ($el) {
			var $units = $el.find('.unit'),
				$list = $el.find('.units_input_list'),
				fragment = document.createDocumentFragment(),
				town_id = $list.data('town_id');

			$units.off();
			this.unregisterComponents('units_input_list');

			$units.each(function (idx, unit) {
				var $unit = $(unit),
					max = parseInt($unit.children('.value').text(), 10),
					unit_id = $unit.data('unit_id'),
					$spinner = $list.find('.spinner[data-unit_id="' + unit_id + '"]');

				if ($spinner.length === 0) {
					var spinner = document.createElement('div');
					spinner.className = "spinner";
					spinner.setAttribute('data-unit_id', unit_id);

					$spinner = $(spinner);
					$spinner.appendTo(fragment);
				}

				this.registerComponent('spinner_' + unit_id, $spinner.spinner({
					value: 0,
					min : 0,
					step : 1,
					max: max,
					details : unit_id
				}).on('sp:change:value', function () {
					this.updateCapacityBar(town_id);
				}.bind(this)), 'units_input_list');

				$unit.on('click', this.handleUnitImageClick.bind(this, unit_id));
			}.bind(this));

			$list.prepend(fragment);
		},

		handleUnitImageClick: function (unit_id) {
			var	spinner = this.getComponent('spinner_' + unit_id, 'units_input_list');

			if (spinner.getValue()) {
				spinner.setValue(0);
			} else {
				spinner.setValue(spinner.getMax());
			}
		},

		registerCapacityBar: function ($el) {
			var $capacity_bar = $el.find('.capacity_bar');

			this.unregisterComponent('capacity_bar');
			this.registerComponent('capacity_bar', $capacity_bar.singleProgressbar({
				max : 0,
				caption: this.l10n.capacity
			}));
		},

		updateCapacityBar: function (town_id) {
			var units = this.getSelectedUnits(),
				capacity = GameDataUnits.calculateCapacity(town_id, units),
				capacity_bar = this.getComponent('capacity_bar');

			capacity_bar.setMax(capacity.total_capacity, {silent : true});
			capacity_bar.setValue(capacity.needed_capacity);
		},

		getSelectedUnits: function () {
			var spinners = this.controller.getComponents('units_input_list'),
				units = {};

			for (var spinner_id in spinners) {
				if (spinners.hasOwnProperty(spinner_id)) {
					var spinner = spinners[spinner_id];
					units[spinner.getDetails()] = spinner.getValue();
				}
			}

			return units;
		},

		registerUnitListButtons: function () {
			var $return_some_units = this.$el.find('.btn_return_some_units_by_town'),
				$return_all_units = this.$el.find('.btn_return_all_units_by_town');

			$return_some_units.off().on('click', function (event) {
				var $target = $(event.currentTarget),
					$list_item = $target.parents('li'),
					$wrapper = $list_item.find('.return_some_units_wrapper');

				if ($wrapper.is(':visible')) {
					$wrapper.hide();
				} else {
					this.$el.find('.return_some_units_wrapper').hide();

					this.renderUnitsInputList($list_item);
					this.registerCapacityBar($list_item);
					this.registerAcceptButton($list_item);
					$wrapper.show();
				}

				this.getComponent('defense_scrollbar').update();
			}.bind(this));
			$return_some_units.tooltip(this.l10n.return_some_units);

			$return_all_units.off().on('click', function (event) {
				var $target = $(event.currentTarget),
					units_id = $target.parent().data('id');

				this.controller.sendBack(units_id);
			}.bind(this));
			$return_all_units.tooltip(this.l10n.return_all_units);
		},

		registerReturnAllUnitsButton: function () {
			this.unregisterComponent('btn_return_all_units');
			var units = this.controller.getSupportingUnits();
			if (Object.entries(units).length > 0) {
				this.registerComponent('btn_return_all_units', this.$el.find('.btn_return_all_units').button({
					caption: this.l10n.return_all_units,
					tooltips: [{
						title: this.l10n.return_all_units_for_all_towns
					}]
				}).on('btn:click', this.controller.sendBackAllUnits.bind(this.controller)));
			}
		},

		registerScrollbar: function () {
			this.unregisterComponent('defense_scrollbar');
			this.registerComponent('defense_scrollbar', this.$el.find('.game_list').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'purple',
				disabled: false,
				elements_to_scroll: this.$el.find('.content'),
				elements_to_scroll_position: 'relative',
				element_viewport: this.$el.find('.game_list'),
				min_slider_size: 16,
				hide_when_nothing_to_scroll: true,
				prepend: true
			}), this.sub_context);
		},

		registerAcceptButton: function ($list_item) {
			var $btn = $list_item.find('.btn_confirm_return_some_units.accept');

			$btn.off().on('click', function () {
				this.controller.sendBackPart($btn.data('id'), this.getSelectedUnits());
			}.bind(this));
		}
	});
});
