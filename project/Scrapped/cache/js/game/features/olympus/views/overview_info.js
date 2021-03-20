/* globals Game */

define('features/olympus/views/overview_info', function () {
	'use strict';

	var OverviewTabsView = require('features/olympus/views/overview_tabs'),
		TooltipFactory = require_legacy('TooltipFactory'),
		OlympusStages = require('enums/olympus_stages'),
		GameFeatures = require('data/features'),
		DateHelper = require('helpers/date');

	return OverviewTabsView.extend({
		initialize: function (options) {
			OverviewTabsView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		registerPlayerRankReward: function () { //TODO replace with reward
			var tooltip = us.template(this.getTemplate('player_ranks_tooltip', {
				l10n: this.l10n.info.tooltips,
				winner_ranks: Game.olympus_winner_ranks
			}));

			this.$el.find('.player_rank_reward').tooltip(tooltip);
		},

		registerOlympusAward: function () { //TODO replace with award
			var award = this.controller.getOlympusAward(),
				$award = this.$el.find('.olympus_award');

			$award.addClass(award);
			$award.tooltip(TooltipFactory.getAwardTooltip(award));
		},

		registerOlympusReward: function () { //TODO replace with artifact reward
			var id = this.controller.getOlympusReward();
			var tooltip = TooltipFactory.getArtifactCard(id);

			this.$el.find('.olympus_reward').tooltip(tooltip, {}, false);
		},

		registerScrollbar: function () {
			this.unregisterComponent('info_scrollbar', this.sub_context);
			this.registerComponent('info_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'purple',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				elements_to_scroll_position: 'relative',
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				min_slider_size: 16,
				hide_when_nothing_to_scroll: true,
				prepend: true
			}), this.sub_context);
		},

		toggleOlympusRules: function () {
			var $main_rule_wrapper = this.$el.find('.olympus_rules');
			if ($main_rule_wrapper.hasClass('close')) {
				$main_rule_wrapper.removeClass('close');
				$main_rule_wrapper.addClass('open');
			} else {
				$main_rule_wrapper.removeClass('open');
				$main_rule_wrapper.addClass('close');
			}
			this.registerScrollbar();
		},

		registerRuleClick: function () {
			var $rules_header = this.$el.find('.olympus_rules .header');
			$rules_header.on('click', this.toggleOlympusRules.bind(this));
		},

		renderOlympusRules: function () {
			this.renderTemplate(this.$el.find('.rules_wrapper'), 'rules', {
				l10n: this.l10n.info,
				olympus_hold_days: this.controller.getOlympusHoldDays(),
				temple_shield_time: this.controller.getTempleShieldTime(),
				pre_temple_stage_days: this.controller.getPreTempleStageDays(),
				small_temples_spawn_amount: this.controller.getSmallTemplesSpawnAmount(),
				small_temples_alliance_limit: this.controller.getSmallTemplesAllianceLimit(),
				small_temple_stage_days: this.controller.getSmallTempleStageDays(),
				large_temples_alliance_limit: this.controller.getLargeTemplesAllianceLimit(),
				large_temple_stage_days: this.controller.getLargeTempleStageDays(),
				olympus_spawn_hours: this.controller.geOlympusSpawnHours(),
				olympus_jump_days: this.controller.getOlympusJumpDays(),
				portal_temple_amount: this.controller.getPortalTempleAmount(),
				portal_temple_travel_hours: this.controller.getPortalTempleTravelHours(),
				olympus_unit_kill_percentage: this.controller.getOlympusUnitKillPercentage(),
				olympus_date_time: this.controller.getOlympusStageDateAndTime(),
				wiki_page: this.controller.getOlympusWikiPage(),
				shield_cycle_enabled: GameFeatures.isOlympusShieldedCycleEnabled()
			});
		},
		
		render: function () {
			var pre_temple_stage_active = this.controller.isPreTempleStageActive(),
				start_timestamp = this.controller.getNextOlympusStageStartTime(OlympusStages.PRE_TEMPLE_STAGE),
				start_date = this.controller.getNextOlympusStageStartTime();

			start_date = DateHelper.timestampToDateTime(start_date);

			this.renderTemplate(this.$el, 'overview_info', {
				l10n: this.l10n
			});

			this.renderHeader({
				l10n: this.l10n,
				start_date: start_date,
				pre_temple_stage_active: pre_temple_stage_active
			});

			this.renderOverviewTabs();
			this.renderOlympusRules();

			if (pre_temple_stage_active) {
				this.registerStartCountdown(Game.world_start_timestamp, start_timestamp);
			}

			this.registerScrollbar();
			this.registerRuleClick();
			this.registerOlympusReward();
			this.registerPlayerRankReward();
			this.registerOlympusAward();
		}
	});
});
