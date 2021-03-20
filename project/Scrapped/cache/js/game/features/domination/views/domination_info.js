/* global Layout */
// Domination info tab view
define('features/domination/views/domination_info', function () {
    'use strict';

    var BaseView = window.GameViews.BaseView,
        Timestamp = require('misc/timestamp'),
        DOMINATION_ERAS = require('enums/domination_eras'),
        TooltipFactory = require('factories/tooltip_factory'),
        GPWindowMgr = require_legacy('GPWindowMgr'),
        Game = require_legacy('Game'),
        getHumanReadableTimeDate = require_legacy('getHumanReadableTimeDate'),

        DominationInfoView = BaseView.extend({
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.l10n = this.controller.getl10n();
                this.render();
            },

            renderPreDominationProgress: function () {
                var timestamp = this.controller.getNextCalculationTimestamp();
                var $progress = this.$el.find('.progress_wrapper');
                var dateTime = Timestamp.toDate(timestamp - Timestamp.clientGMTOffset(timestamp));
                var human_readable_time = getHumanReadableTimeDate(dateTime);

                this.renderTemplate($progress, 'pre_domination_progress', {
                    l10n: this.l10n,
                    human_readable_time: human_readable_time
                });
            },

            renderDominationProgress: function () {
                this.renderTemplate(this.$el.find('.progress_wrapper'), 'domination_progress', {
                    l10n: this.l10n
                });
            },

            renderPostDominationProgress: function () {
                var alliance_data = this.controller.getWinningAllianceData();

                this.renderTemplate(this.$el.find('.progress_wrapper'), 'post_domination_progress' , {
                    l10n: this.l10n,
                    alliance_link: this.createAllianceLink(alliance_data.alliance_name),
                    valid_cities: alliance_data.domination_percentage
                });
            },

            renderPostDominationFooter: function () {
                var alliance_data = this.controller.getWinningAllianceData();

                this.renderTemplate(this.$el.find('.footer'), 'post_domination_footer', {
                    l10n: this.l10n,
                    alliance_link: this.createAllianceLink(alliance_data.alliance_name),
                    world_end_date: this.controller.getWorldEndDate()
                });
            },

            renderDominationRules: function () {
                var last_stand_planning = Game.last_stand_planning_days,
                    decrease_time = Game.domination_goal_reduction_recalculation_days,
                    end_peace_days = Game.end_peace_days,
                    current_goal = this.controller.getCurrentGoal(),
                    last_stand_duration = Game.last_stand_duration_days;

                this.renderTemplate(this.$el.find('.footer'), 'domination_rules', {
                    l10n: this.l10n,
                    domination_value: current_goal,
                    decrease_time: decrease_time,
                    last_stand_planning: last_stand_planning,
                    last_stand_duration: last_stand_duration,
                    end_peace: end_peace_days
                });
            },

            createAllianceLink: function (name) {
                return '<span class="alliance_link">' + name + '</span>';
            },

            showAndRegisterAllianceState: function () {
                this.unregisterComponent('join_alliance_button');
                var $title = this.$el.find('.progress_wrapper .progress_title');
                if (this.controller.isPlayerInAlliance()) {
                    $title.addClass('with_alliance');
                    this.$el.find('.alliance_wrapper').addClass('hidden');
                    return;
                }
                $title.addClass('without_alliance');
                this.$el.find('.alliance_wrapper').removeClass('hidden');
                this.registerComponent('join_alliance_button', this.$el.find('.join_alliance').button({
                    caption: this.l10n.join_alliance
                }).on('btn:click', function () {
                    GPWindowMgr.Create(GPWindowMgr.TYPE_ALLIANCE);
                }.bind(this)));
            },

            registerDominationStartProgressBar: function () {
                var $progressbar = this.$el.find('.pg_progress_era'),
                    value = Timestamp.now() - Game.world_start_timestamp,
                    max = this.controller.getNextCalculationTimestamp() - Game.world_start_timestamp;

                this.unregisterComponent('pg_progress_era');
                this.registerComponent('pg_progress_era', $progressbar.singleProgressbar({
                    value: value,
                    max: max,
                    show_value: false
                }));

                this.unregisterComponent('pg_progress_era_countdown');
                this.registerComponent('pg_progress_era_countdown', this.$el.find(".pg_progress_era_countdown").countdown2({
                    value : max - value,
                    display : 'seconds_in_last48_hours_with_left_word'
                }));
            },

            registerDominationCrown: function () {
                var tooltip = us.template(this.getTemplate('player_ranks_tooltip', {
                    l10n: this.l10n.tooltips,
                    winner_ranks: Game.domination_winner_ranks
                }));

                this.$el.find('.domination_crown').tooltip(tooltip);
            },

            registerDominationAward: function () {
                var award = this.controller.getDominationAward(),
                    $award = this.$el.find('.domination_award');
                $award.addClass(award);
                $award.tooltip(TooltipFactory.getAwardTooltip(award));
            },

            registerDominationReward: function () {
                var id = this.controller.getDominationReward();
                var tooltip = TooltipFactory.getArtifactCard(id);

                this.$el.find('.domination_reward').tooltip(tooltip, {}, false);
            },

            registerScrollbar: function () {
                this.unregisterComponent('domination_info_scrollbar', this.sub_context);
                this.registerComponent('domination_info_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
                    orientation: 'vertical',
                    template: 'tpl_skinable_scrollbar',
                    skin: 'red',
                    disabled: false,
                    elements_to_scroll: this.$el.find('.js-scrollbar-content'),
                    elements_to_scroll_position: 'relative',
                    element_viewport: this.$el.find('.js-scrollbar-viewport'),
                    min_slider_size: 16,
                    hide_when_nothing_to_scroll: true,
                    prepend: true
                }), this.sub_context);
            },

            toggleDominationRules: function () {
                var $main_rule_wrapper = this.$el.find('.domination_rule_wrapper');
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
                var $rules_header = this.$el.find('.domination_rule_wrapper .header');
                $rules_header.on('click', this.toggleDominationRules.bind(this));
            },

            registerAllianceLink: function () {
                var alliance_data = this.controller.getWinningAllianceData();
                this.$el.find('.alliance_link').off().on('click', function () {
                    Layout.allianceProfile.open(alliance_data.alliance_name, alliance_data.id);
                });
            },

            render: function () {
                var domination_era = this.controller.getDominationEra(),
                    current_goal = this.controller.getCurrentGoal(),
                    last_stand_duration = Game.last_stand_duration_days,
                    description = (domination_era === DOMINATION_ERAS.POST_DOMINATION) ?
                        this.l10n.post_domination_description :
                        this.l10n.domination_short_description(current_goal, last_stand_duration);

                this.renderTemplate(this.$el, 'domination_info', {
                    l10n: this.l10n,
                    era: domination_era,
                    description: description
                });

                switch (domination_era) {
                    case DOMINATION_ERAS.PRE_DOMINATION:
                        this.renderPreDominationProgress();
                        this.registerDominationStartProgressBar();
                        this.renderDominationRules();
                        break;
                    case DOMINATION_ERAS.DOMINATION:
                        this.renderDominationProgress();
                        this.showAndRegisterAllianceState();
                        this.renderDominationRules();
                        break;
                    case DOMINATION_ERAS.POST_DOMINATION:
                        this.renderPostDominationProgress();
                        this.renderPostDominationFooter();
                        this.registerAllianceLink();
                        break;
                    default:
                        break;
                }

                this.toggleDominationRules();
                this.registerDominationAward();
                this.registerDominationReward();
                this.registerDominationCrown();
                this.registerRuleClick();
            }
        });

    window.GameViews.DominationInfoView = DominationInfoView;

    return DominationInfoView;

});
