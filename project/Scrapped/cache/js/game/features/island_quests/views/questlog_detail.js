/* globals us, DM, Game, debug, GameData, require_legacy, GameEvents */

define('features/island_quests/views/questlog_detail', function (require) {
    'use strict';

    var Views = require_legacy('GameViews');
    var STATES = require('enums/quests');
    var IndexView = require('features/questlog/views/questlog_index');
    var BuyForGoldWindowFactory = require('no_gold_dialog/factories/buy_for_gold');
    var GameDataPowers = require('data/powers');
    var ContextMenuHelper = require('helpers/context_menu');

    return Views.BaseView.extend({
        sub_context: 'detail',
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.iq_l10n = DM.getl10n('island_quests');
            this.questlog_controller = options.questlog_controller;
            this.town_selection_popup_shown = false;
        },

        render: function () {
            var decisions = this.controller.getDecisionsForIslandQuest(this.controller.getActiveQuestModel()),
                first_decision = us.first(decisions),
                state = first_decision.getState();

            this.unregisterComponents(this.sub_context);

            this.renderTemplate(this.$el, 'iq_quest_detail', {
                l10n: this.l10n,
                quest_name: first_decision.staticData.name,
                quest_icon_type: first_decision.staticData.quest_icon_type,
                iq_l10n: this.iq_l10n
            });

            switch (state) {
                case STATES.VIABLE :
                    this.renderStateViable(decisions);
                    break;

                case STATES.RUNNING:
                    this.renderStateRunning(first_decision);
                    break;

                case STATES.SATISFIED :
                    this.renderStateSatisfied(first_decision);
                    break;

                default:
                    this.emptyView();
                    break;
            }

            this.registerScrollbar();

        },

        reRender: function () {
            this.render();
        },

        // used to show a 'empty' detail view, when there is no active quest to render
        // could render a template here with more usefull stuff
        emptyView: function () {
            this.renderTemplate(this.$el, 'iq_empty_detail', {
                l10n: this.l10n,
                iq_l10n: this.iq_l10n
            });
        },

        renderStateViable: function (decisions) {
            var first_decision = us.first(decisions);
            this.renderTemplate(this.$el.find('.quest_details_container'), 'iq_quest_decision', {
                decisions: decisions,
                iq_l10n: this.iq_l10n
            });
            this.renderIQTownSelectButton(first_decision);
            this.registerIQRotateButton(first_decision);
            decisions.forEach(this.registerRewards.bind(this));
            decisions.forEach(this.registerInfoIcons.bind(this));
            decisions.forEach(this.registerDecisionButton.bind(this));

            if (!this.controller.isCurrentTownOnSameIsland(first_decision)) {
                this.showErrorMessage(this.iq_l10n.window.wrong_island);
            }
        },

        renderStateRunning: function (first_decision) {
            this.renderTemplate(this.$el.find('.quest_details_container'), 'iq_quest_challenge', {
                iq_l10n: this.iq_l10n,
                decision: first_decision,
                quest_id: this.controller.getActiveQuestId(),
                challenge_type: first_decision.staticData.challenge_type,
                button_action: 'challenge',
                color: first_decision.staticData.side === 'good' ? 'blue' : 'red',
                rewards: first_decision.staticData.rewards
            });
            this.renderIQTownSelectButton(first_decision);
            this.registerRewards(first_decision);
            this.registerTaskProgressbar(first_decision);
            this.registerChallengeButton(first_decision);
        },

        renderStateSatisfied: function (first_decision) {
            this.renderTemplate(this.$el.find('.quest_details_container'), 'iq_quest_challenge', {
                iq_l10n: this.iq_l10n,
                decision: first_decision,
                quest_id: this.controller.getActiveQuestId(),
                challenge_type: first_decision.staticData.challenge_type,
                button_action: 'reward',
                color: first_decision.staticData.side === 'good' ? 'blue' : 'red',
                rewards: first_decision.staticData.rewards
            });
            this.renderIQTownSelectButton(first_decision);
            this.registerRewards(first_decision);
            this.registerTaskProgressbar(first_decision);
            this.registerAcceptRewardButton(first_decision);
        },

        openChallengeSubview: function (decision) {
            var view = this._getContentViewObject(decision);

            this.questlog_controller.$el.addClass('island_quests');

            this.questlog_controller.openSubWindow({
                title: this.iq_l10n.details_window.title,
                controller: view,
                skin_class_names: 'details_window island_quest_details_window'
            });
        },

        _getContentViewObject: function (decision) {
            var CollectUnits = require('features/island_quests/views/details_windows/collect_units');
            var AttackNPC = require('features/island_quests/views/details_windows/attack_npc');
            var SpendResources = require('features/island_quests/views/details_windows/spend_resources');
            var BearEffect = require('features/island_quests/views/details_windows/bear_effect');
            var ProvokeAttack = require('features/island_quests/views/details_windows/provoke_attack');
            var WaitTime = require('features/island_quests/views/details_windows/wait_time');

            var challenge_type = decision.getChallengeType(),
                content_view,
                options = {
                    l10n: this.iq_l10n,
                    controller: this.controller,
                    questlog_controller: this.questlog_controller,
                    decision: decision,
                    current_town: this.controller.getCurrentTown(),
                    units_collection: this.controller.getUnitsCollection()
                };

            switch (challenge_type) {
                case 'collect_units':
                    content_view = new CollectUnits(options);
                    break;
                case 'attack_npc':
                    content_view = new AttackNPC(options);
                    break;
                case 'bear_effect':
                    content_view = new BearEffect(options);
                    break;
                case 'spend_resources':
                    content_view = new SpendResources(options);
                    break;
                case 'provoke_attack':
                    content_view = new ProvokeAttack(options);
                    break;
                case 'wait_time':
                    content_view = new WaitTime(options);
                    break;
                default:
                    if (Game.dev) {
                        debug('Not supported IslandQuest challenge type "' + challenge_type + '" in _getContentViewObject');
                    }
                    break;
            }

            return content_view;
        },

        registerScrollbar: function () {
            this.unregisterComponent('questlog_detail_scrollbar', this.sub_context);
            this.registerComponent('questlog_detail_scrollbar', this.$el.parent().skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: this.$el,
                element_viewport: this.$el.parent(),
                scroll_position: 0,
                min_slider_size: 16,
                hide_when_nothing_to_scroll: true
            }), this.sub_context);
        },

        renderIQTownSelectButton: function (decision) {
            this.registerComponent('btn_town_select', this.$el.find('.btn_town_select').button({
                caption: '',
                tooltips : [{
                    title: this.iq_l10n.window.tooltip_goto
                }],
                icon: true,
                disabled: this.controller.getTownIdsForIsland(decision.getIslandId()).length === 0,
                icon_type: 'center',
                icon_position: 'right'
            }).on('btn:click', function () {
                if (this.town_selection_popup_shown) {
                    this.hideTownSelectionPopup();
                    return;
                }

                var valid_towns = this.controller.getTownIdsForIsland(decision.getIslandId());

                // if there is only one town possible, switch directly
                if (valid_towns.length === 0) {
                    return;
                } else if (valid_towns.length === 1) {
                    this.controller.handleSelectingTownEvent(this.controller.getTownIdsForIsland(decision.getIslandId())[0]);
                } else {
                    this.showTownSelectionPopup(decision);
                }
            }.bind(this)), this.sub_context);
        },

        /**
         * Show the Town Selection: reuses the exiting template from the UI top without changes
         * @see views/layout/layout_town_name_area_town_groups_list.js
         * @param decision
         */
        showTownSelectionPopup : function(decision) {
            var $list = this.$el.find(".town_group_popup");

            $list.html(us.template(this.controller.getTemplate('town_groups_list'), {
                town_groups_collection : this.controller.getTownGroupsCollectionForIQTowns(decision),
                town_groups_towns_collection : this.controller.getTownGroupTownsForIQTowns(decision),
                island_quests_collection : this.controller.getIslandQuestsDecisionCollection(),

                // we do not need those to be real strings in our case, will never show
                l10n : {
                    no_results : "",
                    no_towns_in_group : ""
                }
            }));

            // Click events are handled 'manually'
            var click_event = (Game.isiOs() ? 'tap' : 'click') + '.town_list';
            $list.on(click_event, '.item', this._handleSelectingTownEvent.bind(this));

            $list.show();

            us.defer(function() {
                this.$el.on(click_event, function () {
                    this.hideTownSelectionPopup();
                    this.$el.off(click_event);
                }.bind(this));
            }.bind(this));

            this.town_selection_popup_shown = true;
        },

        hideTownSelectionPopup : function() {
            var $list = this.$el.find(".town_group_popup");

            $list.hide();
            this.town_selection_popup_shown = false;
        },

        _handleSelectingTownEvent : function(e) {
            var $item = $(e.currentTarget),
                town_id = $item.data('townid');

            this.controller.handleSelectingTownEvent(town_id);
        },

        registerIQRotateButton: function (first_decision) {
            var cost = GameData.island_quests.exchange_quest_cost;
            var tooltip = '<strong>' + this.iq_l10n.window.tooltip_rotate(cost) + '</strong><br /><br />' + this.controller.getGoldTooltipHtml();

            this.registerComponent('btn_rotate', this.$el.find('.btn_rotate').button({
                tooltips: [{
                    title: tooltip,
                    styles: {
                        width: 400
                    },
                    hide_when_disabled: true
                }],
                caption: '', //this.iq_l10n.window.btn_rotate,
                icon: true,
                icon_type: 'rotate_gold',
                icon_position: 'right'
            }).on('btn:click', function (e, _btn) {
                BuyForGoldWindowFactory.openChangeIslandQuestForGoldWindow(_btn, function (callbacks) {
                    this.controller.exchangeIslandQuest(first_decision, callbacks);
                }.bind(this));
            }.bind(this)), this.sub_context);
        },

        registerInfoIcons: function (decision) {
            var side = decision.staticData.side;
            var info_icon_tooltip = decision.staticData.description_tooltip;

            this.$el.find('.decision_container .decision.' + side + ' .info_icon').tooltip(info_icon_tooltip);
        },

        registerDecisionButton: function (decision) {
            var side = decision.staticData.side,
                $btn = this.$el.find('.decision_container .decision.' + side + ' .btn_take_accept'),
                $tooltip = this.getTooltip(decision.getChallengeType(), decision.getConfiguration(), this.iq_l10n.window),
                enabled = this.controller.isCurrentTownOnSameIsland(decision);

            this.registerComponent('btn_take_accept_' + side, $btn.button({
                caption: this.iq_l10n.window.pick_up_quest,
                template: 'tpl_button_buret',
                disabled : !enabled,
                type: 'accept',
                tooltips: [
                    {title: $tooltip}
                ]
            }).on('btn:click', function (/*e*/) {
                this.controller.chooseSide(decision);
            }.bind(this)), this.sub_context);
        },

        registerRewards: function (decision) {
            var adjusted_rewards = this.getAdjustedRewards(decision),
                rewards = decision.staticData.rewards,
                side = decision.staticData.side;

            rewards.forEach(function (reward, i) {
                var adjusted_reward = adjusted_rewards[i];

                var $el = this.$el.find('.decision.' + side + ' .reward.' + reward.power_id);

                var $reward = this.registerComponent('reward_' + side + '_' + reward.power_id, $el.reward({
                    reward: adjusted_reward
                }), this.sub_context);

                var template = DM.getTemplate('COMMON', 'casted_power_tooltip');
                var tooltip_data = GameDataPowers.getTooltipPowerData(
                    adjusted_reward,
                    adjusted_reward.configuration,
                    adjusted_reward.configuration.level
                );

                us.extend(tooltip_data, {
                    l10n: this.iq_l10n.window
                });

                $reward.tooltip(us.template(template, tooltip_data), {maxWidth: 400});
            }.bind(this));
        },

        getAdjustedRewards: function (decision) {
            var rewards = decision.getRewards();
            return rewards.map(function (reward) {
                reward.configuration.level = reward.configuration.level || (reward.configuration.cf_on && decision.getChallengeFactor());

                return reward;
            });
        },

        /**
         * @see features/questlog/views/questlog_index
         * @proxy
         */
        registerNotTimeDependentProgressBar: function () {
            IndexView.prototype.registerNotTimeDependentProgressBar.apply(this, arguments);
        },

        /**
         * @see features/questlog/views/questlog_index
         * @proxy
         */
        registerTimeProgressBar: function () {
            IndexView.prototype.registerTimeProgressBar.apply(this, arguments);
        },

        /**
         * @see features/questlog/views/questlog_index
         * @proxy
         */
        registerTaskProgressbar: function (decision) {
            var quest = us.first(this.controller.getQuestFromDecision(decision)),
                time_based = this.controller.isTimeBasedQuestChallengeRunning(decision);

            IndexView.prototype.registerIslandQuestProgressBar.call(this, decision.getState(), [decision], quest, time_based);
        },

        registerChallengeButton: function (decision) {
            this.registerComponent('btn_challenge', this.$el.find('.btn_challenge').button({
                caption: this.iq_l10n.window.take_challenge,
                template: 'tpl_button_buret',
                disabled: this.controller.isTimeBasedQuestChallengeRunning(decision),
                state: this.controller.isTimeBasedQuestChallengeRunning(decision),
                tooltips: this.getChallengeBtnTooltip(decision)
            }).on('btn:click', function () {
                // time based challenges should start automatically, but this may fail e.g. when the
                // same effect is already running on a town
                if (this.controller.isDecisionTimeBased(decision) && decision.getProgress().wait_till === null) {
                    this.controller.challengeActiveDecision();
                } else {
                    this.openChallengeSubview(decision);
                }
            }.bind(this)), this.sub_context);
        },

        registerAcceptRewardButton: function (decision) {
            this.registerComponent('btn_accept', this.$el.find('.btn_challenge').button({
                caption: this.iq_l10n.window.take_award,
                template: 'tpl_button_buret'
            }).on('click', function (event) {
                var reward = this.getAdjustedRewards(decision);
                ContextMenuHelper.showContextMenu(event, {}, {
                    data: {
                        event_group: GameEvents.window.island_quest.reward,
                        level_id: reward.level_id,
                        data: reward
                    }
                });
            }.bind(this)), this.sub_context);
        },

        getChallengeBtnTooltip: function(decision) {
            if (this.controller.isDecisionTimeBased(decision)) {
                var $tooltip = this.getTooltip(decision.getChallengeType(), decision.getConfiguration(), this.iq_l10n.window);
                return [
                    null,
                    {title : $tooltip}
                ];
            }
        },

        getTooltip: function (challenge_type, configuration, l10n) {
            var tooltip_data = {
                challenge_type: challenge_type,
                configuration: configuration,
                l10n: l10n
            };

            // additional tooltip data
            switch (challenge_type) {
                case 'attack_player':
                    break;
                case 'bear_effect':
                    $.extend(tooltip_data, {
                        power_data: GameDataPowers.getTooltipPowerData(
                            GameData.powers[configuration.effect.id],
                            configuration.effect.configuration,
                            configuration.cf
                        )
                    });
                    break;
                case 'spend_resources':
                    break;
                case 'attack_npc':
                    break;
                case 'collect_units':
                    break;
                case 'provoke_attack':
                    break;
                case 'wait_time':
                    break;
                default:
                    debug('unexpected challenge type for tooltip', challenge_type);
                    return '';
            }

            // render template
            return us.template(
                this.controller.getTemplate('iq_tooltips', '#' + challenge_type),
                tooltip_data
            );
        },

        showErrorMessage : function(text) {
            var $msg = this.$el.find('#quest_error_message');
            $msg.find('.text').text(text);
            $msg.show();
        }
    });
});
