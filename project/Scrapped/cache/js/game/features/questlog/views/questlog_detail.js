define('features/questlog/views/questlog_detail', function (require) {
    'use strict';

    var Views = require_legacy('GameViews');
    var ResourceRewardDataFactory = require('factories/resource_reward_data_factory');
    var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
    var TooltipFactory = require('factories/tooltip_factory');
    var QUESTS = require('enums/quests');

    return Views.BaseView.extend({
        sub_context: 'detail',
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.questlog_controller = options.questlog_controller;
            this.render();
        },

        render: function () {
            this.unregisterComponents(this.sub_context);

            var active_quest = this.controller.getActiveQuestModel();

            if (!active_quest) {
                this.emptyView();
            } else {
                this.renderTemplate(this.$el, 'quest_detail', {
                    l10n: this.l10n,
                    quest_id: this.controller.getActiveQuestId(),
                    quest: this.controller.getActiveQuestModel()
                });

                this.registerQuestComponents();
                this.registerScrollbar();
                this.registerProgressbars();
            }
        },

        reRender: function () {
            this.render();
        },

        // used to show a 'empty' detail view, when there is no active quest to render
        // could render a template here with more usefull stuff
        emptyView: function () {
            this.$el.empty();
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

        /**
         * register a progressbar for every task in the quest
         */
        registerProgressbars: function () {
            var quest = this.controller.getActiveQuestModel();
            var id = this.controller.getActiveQuestId();

            if (!quest.hasProgress()) {
                return;
            }

            quest.getTasks().forEach(function (task, task_id) {
                var pgbar_id = 'pb_progress_quest_detail_' + id + '_' + task_id,
                    selector = '.pb_progress[data-quest_id="' + id + '"][data-task_id="' + task_id + '"]',
                    progress = this.controller.getPercentProgressForQuest(id, task_id);

                this.unregisterComponent(pgbar_id);
                this.registerComponent(pgbar_id, this.$el.find(selector).singleProgressbar({
                    value: progress.curr < progress.max ? progress.curr : progress.max,
                    max: progress.max,
                    min: progress.min,
                    caption: '',
                    template: 'tpl_pb_single'
                }));
            }.bind(this));
        },

        registerQuestComponents: function () {
            var _self = this,
                root = this.$el,
                l10n = this.l10n,
                quest_model = this.controller.getActiveQuestModel(),
                //activate_helpers = this.controller.shouldHelpersActivate(quest_model),
                quest_id = quest_model.getId(),
                quest_static_data = quest_model.getStaticData(),
                collect_reward_callback = this.controller.collectReward.bind(this.controller);

            //add mouseovers for power_icons rewards
            if (quest_static_data.rewards) {
                $.each(quest_static_data.rewards, function (i, rewards_group) {
                    if (rewards_group.type.toLowerCase() === 'power') {
                        $.each(rewards_group.data, function (reward) {
                            var $str = TooltipFactory.createPowerTooltip(reward, {}, rewards_group.configuration);

                            root.find('.rewards .' + reward).tooltip($str);
                        });
                    } else if (rewards_group.type.toLowerCase() === 'culture') {
                        root.find('.rewards .resources.culture')
                            .tooltip(TooltipFactory.getCulturePointsTooltip());
                    }
                });
            }

            // register button 'change quest's state' button component
            if (!quest_model.isSatisfied() && quest_static_data.can_abort) {
                this.registerComponent('btn_skip:quest_' + quest_id, root.find('.btn_skip').button({
                    caption: l10n.cancel_quest
                }).on('btn:click', function () {
                    _self.controller.removeQuestHelpers(quest_model);
                    quest_model.progressTo(QUESTS.ABORTED);
                }), this.sub_context);
            }

            var $btn_action = root.find('.btn_action');

            // switch data-button_id to allow state determination by automated tests
            $btn_action.attr('data-button_id', quest_model.isRunning() ? 'continue' : 'collect');

            // register button as 'collect reward'
            if (quest_model.isSatisfied()) {
                var btn_text = (quest_static_data.auto_reward) ? l10n.close : l10n.take_reward;

                this.registerComponent('btn_action:quest_' + quest_id, $btn_action.button({
                    caption: btn_text
                }).on('btn:click', function () {
                    if (quest_model.hasRewardsWithResourcesOrFavor()) {
                        var rewards = quest_model.getRewardsWithResourcesOrFavor();
                        rewards.forEach(function (reward) {
                            var reward_data = ResourceRewardDataFactory.fromTutorialReward(reward);
                            ConfirmationWindowFactory.openConfirmationWastedResources(collect_reward_callback, null, reward_data);
                        });
                    } else {
                        collect_reward_callback();
                    }
                }), this.sub_context);
            } else if (quest_model.isRunning()) {
                this.registerComponent('btn_action:quest_' + quest_id, $btn_action.button({
                    caption: l10n.start_quest
                }).on('btn:click', function () {
                    var id = _self.questlog_controller.getActiveQuestId();

                    if (_self.controller.showArrows()) {
                        _self.controller.showQuestHelpers(quest_model);
                    }

                    _self.controller.markQuestAsRead(id);
                    _self.questlog_controller.clearView();
                }), this.sub_context);
            }
        }
    });
});
