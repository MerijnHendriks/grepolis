/* globals GameData, TooltipFactory */

define('events/grid_event/views/player_grid', function () {
	'use strict';

	var BaseView = window.GameViews.BaseView,
		COLOR_CHANGE_TRESHOLD = 300;

	return BaseView.extend({
		initialize: function (options) {
			BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();

			this.render();
		},

		render: function () {
			this.renderTemplate(this.$el.find('.player_grid_wrapper'), 'player_grid', {
				l10n: this.l10n,
				rows: this.controller.getGridHeight(),
				columns: this.controller.getGridWidth(),
				turn_cost: this.controller.getTurnCost(),
				skin: this.controller.getWindowSkin(),
				advanced_power_visible_class: this.controller.isAdvancedScoutsPowerCasted() ? 'visible' : '',
				can_take_turn: this.controller.canTakeTurn()
			});

			this.registerPlayerGridClick();
			this.renderPlayerGridTurns();
			this.renderCompletedFigures();
			this.registerResetGridCountdown();
			this.registerResetGridButton();
			this.registerRewardsListButton();
			this.updatePlayerGridState();
			this.setUnopenedPlayerGridSpotTooltips();
			this.registerAdvancedScoutPowerTooltip();
			this.updatePlayerGridGlow();
		},

		registerPlayerGridClick: function () {
			this.$el.find('.player_grid').on('click', function (event) {
				var $el = $(event.target),
					$grid_cell = $el.hasClass('grid_cell') ? $el : $el.parents('.grid_cell'),
					is_uncovered_grid_cell = $grid_cell.hasClass('uncovered');

				if ($grid_cell.length > 0 && this.controller.canTakeTurnOrScout(is_uncovered_grid_cell)) {
					this.controller.onPlayerGridClick($grid_cell);
				}
			}.bind(this));
		},

		renderPlayerGridTurns: function () {
			var	grid_indeces = this.controller.getUncoveredGridIndeces();
			grid_indeces.forEach(function(grid_index) {
				this.updatePlayerGridCell(grid_index, false);
			}.bind(this));
		},

		renderCompletedFigures: function () {
			var figure_placements = this.controller.getCompletedFigurePlacements();

			for (var figure in figure_placements) {
				if (figure_placements.hasOwnProperty(figure)) {
					this.updateCompletedFigure(figure_placements[figure], figure);
				}
			}
		},

		updateCompletedFigure: function (figure_placement, figure_type) {
			figure_placement.forEach(function (grid_index, index) {
				var $grid_cell = this.$el.find('.player_grid .grid_cell[data-grid_index="' + grid_index + '"]');
				this.updateCompletedFigureCell($grid_cell, index, figure_type);
			}.bind(this));
		},

		updateCompletedFigureCell: function ($grid_cell, index, figure_type, is_animation) {
			$grid_cell.attr('data-index', index);
			$grid_cell.tooltip(this.l10n.tooltips.player_grid_spot[figure_type]);
			$grid_cell.find('.result').addClass(this.controller.getFigureOrientation(figure_type));
			if (is_animation) {
				var $result = $grid_cell.find('.result');
				var $icon = $grid_cell.find('.icon');
				$icon.attr('style', 'opacity: 0');
				$result.attr('style', 'opacity: 0');
				$icon.transition({opacity: 1}, 500, 'ease');
				$result.transition({opacity: 1}, 500, 'ease');
			}
		},

		fadeOutResultAndShowCompletedFigure: function (figure_placement, figure_type) {
			figure_placement.forEach(function (grid_index, index) {
				var $grid_cell = this.$el.find('.player_grid .grid_cell[data-grid_index="' + grid_index + '"]');
				var $result = $grid_cell.find('.result');
				var $icon = $grid_cell.find('.icon');
				$icon.transition({opacity: 0, scale: 0, delay: 150}, 500, 'ease');
				$result.transition({opacity: 0, scale: 0, delay: 150}, 500, 'ease', function () {
					this.updateCompletedFigureCell($grid_cell, index, figure_type, true);
				}.bind(this));
			}.bind(this));
		},

		registerResetGridCountdown: function () {
			var $timer = this.$el.find('.reset_timer .timer'),
				condition = function (seconds_left) {
					return seconds_left <= COLOR_CHANGE_TRESHOLD;
				};

			this.unregisterComponent('reset_grid_countdown');
			this.registerComponent('reset_grid_countdown', $timer.countdown2({
				value: this.controller.getTimeLeftUntilReset(),
				display: 'readable_seconds',
				condition: condition,
				tooltip: {
					title: this.l10n.tooltips.reset_grid_timer
				}
			}).on('cd:condition', function () {
				if (!$timer.hasClass('red')) {
					$timer.addClass('red');
				}
			}).on('cd:finish', function () {
				this.controller.automaticallyReset();
			}.bind(this)));
		},

		registerResetGridButton: function () {
			var $btn = this.$el.find('.btn_reset_grid'),
				reset_costs = this.controller.getGridResetCosts(),
				disabled = this.isGridResetButtonDisabled(reset_costs);

			this.unregisterComponent('btn_reset_grid');
			this.registerComponent('btn_reset_grid', $btn.button({
				caption: this.l10n.btn_reset_grid(reset_costs),
				icon: reset_costs > 0,
				icon_type: 'shot_currency',
				toggle: true,
				disabled: disabled,
				state: disabled,
				tooltips: [
					{title: this.l10n.tooltips.btn_reset_grid},
					{title: this.getDisabledResetGridButtonTooltip.bind(this)}
				]
			}).on('btn:click', function () {
				this.controller.onButtonResetGridClick();
			}.bind(this)));
		},

		isGridResetButtonDisabled: function (reset_costs) {
			var grid_currency = this.controller.getGridCurrency();
			return (grid_currency < reset_costs) || this.controller.parent_controller.turn_animation_running;
		},

		getDisabledResetGridButtonTooltip: function () {
			var l10n = this.controller.getl10n();
			return this.controller.parent_controller.turn_animation_running ?
				l10n.tooltips.btn_reset_grid_disabled_no_progress : l10n.tooltips.btn_reset_grid_disabled_no_ammunition;
		},

		registerRewardsListButton: function () {
			var $btn = this.$el.find('.btn_info_overlay');

			this.unregisterComponent('btn_info_overlay');
			this.registerComponent('btn_info_overlay', $btn.button({
				template: 'internal',
				tooltips: [{ title: this.l10n.rewards_list.title }]
			}).on('btn:click', function () {
				this.controller.onRewardsListButtonClick();
			}.bind(this)));
		},

		updatePlayerGridCanTakeTurn: function () {
			var $player_grid = this.$el.find('.player_grid'),
				has_class = $player_grid.hasClass('can_take_turn'),
				can_take_turn = this.controller.canTakeTurn();

			if (has_class !== can_take_turn) {
				$player_grid.toggleClass('can_take_turn', can_take_turn);
				this.setUnopenedPlayerGridSpotTooltips();
			}
		},

		updateResetGridButton: function () {
			var button = this.getComponent('btn_reset_grid'),
				reset_costs = this.controller.getGridResetCosts(),
				disabled = this.isGridResetButtonDisabled(reset_costs);

			button.setState(disabled);
			button.disable(disabled);
			button.setCaption(this.l10n.btn_reset_grid(reset_costs));

			if (reset_costs > 0) {
				button.enableIcon();
			} else {
				button.disableIcon();
			}
		},

		isGridCellUncovered: function (grid_index) {
			var uncovered_type = this.controller.getUncoveredType(grid_index);
			return uncovered_type !== null && uncovered_type !== 'completed';
		},

		updatePlayerGridCell: function (grid_index, is_animated, resolve) {
			var interaction_result = this.controller.getInteractionResult(grid_index),
				template = this.getTemplate('player_grid_cell_content', {
					css_class: interaction_result + ' invisible'
				}),
				$grid_cell = this.$el.find('.player_grid .grid_cell[data-grid_index="' + grid_index + '"]'),
				$result = $grid_cell.html(template).find('.result');

			if (is_animated) {
				this.runHitMissAnimation(grid_index, interaction_result, $grid_cell, $result, resolve);
				return;
			}
			$result.removeClass('invisible');
			this.handleRewardsAndAddTooltips(grid_index, $result, $grid_cell, interaction_result);
		},

		handleRewardsAndAddTooltips: function (grid_index, $result, $grid_cell, interaction_result) {
			var is_uncovered = this.isGridCellUncovered(grid_index),
				l10n_tooltip = this.l10n.tooltips.player_grid_spot.uncovered_spot;

			if (is_uncovered) {
				var uncovered_type = this.controller.getUncoveredType(grid_index);
				$grid_cell.addClass('uncovered ' + uncovered_type);
				this.registerGridIndexReward($result, grid_index);
			} else {
				$grid_cell.removeClass('uncovered uncovered_scout uncovered_power').addClass('completed');
			}

			if (typeof $grid_cell.data('index') === 'undefined' && !is_uncovered) {
				if (l10n_tooltip.hasOwnProperty(interaction_result)) {
					$grid_cell.tooltip(l10n_tooltip.miss);
				} else {
					$grid_cell.tooltip(l10n_tooltip.hit);
				}
			}
		},

		runHitMissAnimation: function (grid_index, interaction_result, $grid_cell, $result, resolve) {
			$result.transition({opacity: 1, scale: 0}, 0);
			$result.transition({scale: 1}, 500, function () {
				resolve({resolved: true});
				this.controller.parent_controller.stopAnimation();
				this.controller.handleGridStateChange();
				$result.removeClass('invisible');
				this.handleRewardsAndAddTooltips(grid_index, $result, $grid_cell, interaction_result);
				if ($result.find('.reward_icon')) {
					$result.attr('style', '');
				}
				this.controller.parent_controller.openRewardWindowIfGridStateHasBlockedFigureType();
			}.bind(this));
		},

		updatePlayerGridState: function () {
			var $player_grid = this.$el.find('.player_grid'),
				grid_state = this.controller.getGridState();

			$player_grid.attr('data-grid_state', grid_state);
		},

		registerGridIndexReward: function ($el, grid_index) {
			var reward = this.controller.getRewardByGridIndex(grid_index),
				type = reward.type,
				tooltip;

			this.unregisterComponent('reward_' + grid_index);

			if (reward.hasOwnProperty('power_id') && GameData.powers.hasOwnProperty(reward.power_id)) {
				this.registerComponent('reward_' + grid_index, $el.reward({
					reward: reward,
					size: 30
				}));
			} else {
				tooltip = this.controller.getEventPowerTooltip(type);
				$el.append('<div class="' + type.toLowerCase() + '"></div>').tooltip(tooltip);
			}
		},

		setUnopenedPlayerGridSpotTooltips: function () {
			var $grid_cells = this.$el.find('.grid_cell:empty'),
				reward_quantity_multiplier = this.controller.getRewardQuantityMultiplier(),
				tooltip_index = this.controller.getCellToolipIndex(),
				l10n_tooltip = this.l10n.tooltips.player_grid[tooltip_index];

			if (typeof l10n_tooltip === 'function') {
				$grid_cells.tooltip(l10n_tooltip(reward_quantity_multiplier));
			} else {
				$grid_cells.tooltip(l10n_tooltip);
			}
		},

		registerAdvancedScoutPowerTooltip: function () {
			if (this.controller.isAdvancedScoutsPowerCasted()) {
				this.$el.find('.advanced_power').tooltip(
					TooltipFactory.createPowerTooltip('grid_event_advanced_scouts',
						{}, this.controller.getAdvancedScoutPowerConfiguration())
				);
			}
		},

		showAdvancedPowerIconAndRegisterTooltip: function () {
			var advanced_power_icon = this.$el.find('.advanced_power');
			if (this.controller.isAdvancedScoutsPowerCasted() && !advanced_power_icon.hasClass('visible')) {
				advanced_power_icon.addClass('visible');
				this.registerAdvancedScoutPowerTooltip();
			}
		},

		updatePlayerGridGlow: function () {
			var is_special_reward_active = this.controller.isSpecialRewardActive(),
				is_grid_blocked = this.controller.isGridBlocked(),
				$player_grid_glow = this.$el.find('.player_grid_glow');

			$player_grid_glow.toggleClass('yellow', is_special_reward_active);
			$player_grid_glow.toggleClass('red', is_grid_blocked);
		}
	});
});
