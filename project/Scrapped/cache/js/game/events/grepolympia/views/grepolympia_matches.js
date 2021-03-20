/*globals Timestamp */
define('events/grepolympia/views/grepolympia_matches', function (require) {
    'use strict';

    var BaseView = window.GameViews.BaseView;
    var GrepolympiaHelper = require('events/grepolympia/helpers/grepolympia');

    var MatchesView = BaseView.extend({
        initialize: function (options) {
            BaseView.prototype.initialize.apply(this, arguments);

            this.l10n = this.controller.getl10n();
            this.selected_discipline = this.controller.getActiveOrLastDiscipline();

            this.render();
        },

        setNewLaurelAmountToLaurelBox: function () {
            var laurel_box = this.getComponent('laurel_amount_box');
            if (laurel_box) {
                laurel_box.setCaption(this.controller.getCurrency('laurels'));
            }
        },

        buildRankingTable: function () {
            var ranking_fragment = document.createDocumentFragment(),
                $ranking_list = this.$el.find('#ranking_list'),
                $table_header = document.createElement('thead'),
                $table_body = document.createElement('tbody'),
                body_template = this._getTemplate('table_row'),
                top_teams = this.controller.getTopTeams();

            $ranking_list.empty();

            $table_header.innerHTML = this._getTemplate('table_header')({
                l10n: this.l10n
            });
            $(ranking_fragment).append($table_header);

            for (var i = 0; i < top_teams.length; i++) {
                $table_body.innerHTML += body_template({
                    top_teams: top_teams[i],
                    score_unit: this.controller.getScoreUnit(this.selected_discipline),
                    row_class: i % 2 === 0 ? 'row_even' : ''
                });
            }

            $(ranking_fragment).append($table_body);

            $ranking_list.append(ranking_fragment);
        },

        buildRankingInfoTooltip: function () {
            var ranking_tooltip_text = this.l10n.page_matches.ranking_tooltip,
                current_award = this.controller.getCurrentAward();

            return this._getTemplate('ranking_tooltip')({
                ranking_tooltip_text: ranking_tooltip_text,
                award: current_award
            });
        },

        registerEventCountdown: function () {
            this.unregisterComponent('grepolympia_countdown');
            this.registerComponent('grepolympia_countdown', this.$el.find("#grepolympia_countdown").countdown2({
                value: this.controller.getDisciplineEndsAt() - Timestamp.now(),
                display: 'day_hr_min_sec',
                tooltip: {title : this.l10n.page_athlete.tooltip_countdown, style : {width: 400}}
            }));
        },

        registerLaurelAmountBox: function () {
            var laurel_box = this.$el.find('.laurel_box'),
                laurel_amount = this.controller.getCurrency('laurels');

            this.unregisterComponent('laurel_amount_box');
            this.registerComponent('laurel_amount_box', laurel_box.find('.amount').numberChangeIndicator({
                caption: laurel_amount
            }));
            laurel_box.tooltip(this.l10n.laurels_competition_screen);
        },

        registerInformationScrollbar: function () {
            var $information_text = this.$el.find('.match_information');
            this.unregisterComponent('information_scrollbar');
            this.registerComponent('information_scrollbar', $information_text.skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: $information_text.find('.js-scrollbar-content'),
                element_viewport: $information_text,
                scroll_position: 0,
                min_slider_size: 16,
                hide_when_nothing_to_scroll: true
            }));
        },

        registerCurrentReward: function () {
            this.unregisterComponent('current_reward');
            this.registerComponent('current_reward', this.$el.find('.reward_box .reward').reward({
                reward: this.controller.getCurrentReward(),
                disabled: false,
                size: 60
            }));
        },

        registerInfoTooltip: function () {
            var $ranking_info_btn = this.$el.find('.ranking_box .info_icon');
            $ranking_info_btn.tooltip(this.buildRankingInfoTooltip());

            var $match_icon = this.$el.find('#opponent_2 .icon'),
                tooltip_text = this.controller.getDisciplineDescription(this.selected_discipline);
            $match_icon.tooltip(tooltip_text);
        },

        registerDisciplineRadioButton: function () {
            var disciplines = GrepolympiaHelper.getDisciplinesDependingOnSkin(),
                cloned_disciplines = disciplines.slice(),
                l10n = this.l10n,
                active_discipline_index = us.indexOf(disciplines, this.controller.getActiveGrepolympiaDiscipline()),
                exclusions = active_discipline_index > -1 ? cloned_disciplines.splice(active_discipline_index + 1, cloned_disciplines.length - 1 - active_discipline_index) : [];

            this.unregisterComponent('rbtn_select_discipline');
            //Initialize Discipline radiobutton (future disciplines have to be disabled)
            this.registerComponent('rbtn_select_discipline', this.$el.find('.rbtn_select_discipline').radiobutton({
                value: this.selected_discipline,
                template: 'tpl_radiobutton_nocaption',
                options: [
                    {value: disciplines[0], tooltip: l10n.page_ranking.rbtn_filter.discipline_1},
                    {value: disciplines[1], tooltip: l10n.page_ranking.rbtn_filter.discipline_2},
                    {value: disciplines[2], tooltip: l10n.page_ranking.rbtn_filter.discipline_3},
                    {value: disciplines[3], tooltip: l10n.page_ranking.rbtn_filter.discipline_4}
                ],
                exclusions: exclusions
            }).on('rb:change:value', function(e, value) {
                this.controller.fetchMatch(this.getComponent('rbtn_select_discipline').getValue(), value);
            }.bind(this)));
        },

        registerComponents: function () {
            this.registerEventCountdown();
            this.registerLaurelAmountBox();
            this.registerInformationScrollbar();
            this.registerCurrentReward();
            this.registerInfoTooltip();
            this.registerDisciplineRadioButton();
        },

        render: function (selected_discipline) {
            if (selected_discipline && selected_discipline !== '') {
                this.selected_discipline = selected_discipline;
            }

            var opponent_team_town = this.l10n.page_matches.opponent_team_town[this.selected_discipline];
            var opponent_team_name = this.l10n.page_matches.opponent_team_names[this.selected_discipline];

            this.renderTemplate(this.$el, 'page_matches', {
                l10n: this.l10n,
                active_discipline: this.selected_discipline,
                opponent_team_name: opponent_team_town + "<br/>" + opponent_team_name,
                opponent_score: this.controller.getOpponentScore(),
                player_team_score: this.controller.getCommunityScore()
            });

            this.registerComponents();
            this.buildRankingTable();
        },

        reRender: function () {
            var $result = this.$el.find('.match_result .result');

            $result.find('.player_team_score').text(this.controller.getCommunityScore());
            $result.find('opponent_score').text(this.controller.getOpponentScore());

            this.buildRankingTable();
        }
    });

    window.GameViews.MatchesView = MatchesView;

    return MatchesView;
});
