/* globals GameData */

define('events/grid_event/views/figure_rewards', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		HIT_CLASS = "hit";

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function () {
			var figure_rewards = this.controller.getFigureTypes(),
				fragment = document.createDocumentFragment();

			figure_rewards.forEach(function (figure_type) {
				this.renderFigureToFragment(fragment, figure_type);
			}.bind(this));

			this.$el.find('.figure_rewards_wrapper .figure_rewards').html(fragment);
			this.renderInfoIconTooltip();
		},

		renderFigureToFragment: function (fragment, figure_type) {
			var template = this.getTemplate('figure_reward', {
					figure_type: figure_type,
					is_complete: this.controller.isComplete(figure_type)
				}),
				$template = $(template),
				$table = $template.find('table'),
				$reward = $template.find('.reward'),
				table_fragment;

			table_fragment = this.getFigureTableFragment(figure_type);

			$table.html(table_fragment);
			$table.tooltip(GameData.units[figure_type].name);

			this.registerReward($reward, figure_type);

			$template.appendTo(fragment);
		},

		getFigureTableFragment: function (figure_type) {
			var table_fragment = document.createDocumentFragment(),
				rows = this.controller.getFigureWidth(figure_type),
				columns = this.controller.getFigureHeight(figure_type),
				hits = this.controller.getNumberOfHits(figure_type);

			for (var row_index = 0; row_index < rows; row_index++) {
				var row = document.createElement('tr');

				for (var column_index = 0; column_index < columns; column_index++) {
					var column = document.createElement('td'),
						cell = document.createElement('div');

					if (hits > 0) {
						cell.className = HIT_CLASS;
						hits--;
					}

					column.appendChild(cell);
					row.appendChild(column);
				}

				table_fragment.appendChild(row);
			}

			return table_fragment;
		},

		registerReward: function ($reward, figure_type) {
			var reward = this.controller.getRewardData(figure_type);

			this.unregisterComponent('reward_' + figure_type);
			this.registerComponent('reward_' + figure_type, $reward.reward({
				reward: reward,
				size: 30
			}));
		},

		renderInfoIconTooltip: function () {
			var l10n = this.l10n.tooltips.sink_rewards.info_icon,
				tooltip = this.getTemplate('info_icon_tooltip', {
					l10n: l10n
				});

			this.$el.find('.figure_rewards_wrapper .info_icon').tooltip(tooltip);
		},

		updateFigure: function (figure_type) {
			var fragment = this.getFigureTableFragment(figure_type),
				is_complete = this.controller.isComplete(figure_type),
				$figure_reward = this.$el.find('.figure_reward[data-figure_type="' + figure_type + '"]'),
				$table =  $figure_reward.find('table');

			if (is_complete) {
				$figure_reward.addClass('complete');
			}

			$table.html(fragment);
		}
	});
});