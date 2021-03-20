 /* global ellipsis, us, TM, DM, Game */
define('features/questlog/views/questlog_index', function (require) {
    'use strict';

    var Views = require_legacy('GameViews');
    var MAX_LENGTH_HEADLINE = 25;
    var MAX_LENGTH_DESCRIPTION = 32;
    var CATEGORIES = require('enums/questlog_categories');
    var QUESTS = require('enums/quests');
    var NotificationLoader = require('notifications/notification_loader');
    var DateHelper = require('helpers/date');
    var Timestamp = require('misc/timestamp');
    var BuyForGoldWindowFactory = require('no_gold_dialog/factories/buy_for_gold');

    return Views.BaseView.extend({
        sub_context: 'index',
        initialize: function (options) {
            Views.BaseView.prototype.initialize.apply(this, arguments);
            this.l10n = this.controller.getl10n();
            this.iq_l10n = DM.getl10n('island_quests');
            this.island_quest_controller = options.island_quest_controller;
            this.tutorial_quest_controller = options.tutorial_quest_controller;

            this.render();
        },

        render: function () {
            this.unregisterComponents(this.sub_context);

            this.renderFrame();
            this.renderAllCategories();
            this.registerQuestComponents();
            this.renderActiveQuestMarker();
        },

        registerQuestComponents: function () {
            this.registerScrollbar();
            this.registerCategoryClick();
        },

        getScrollPosition: function() {
            var args = this.controller.getWindowModel().getArguments(),
                progressable_id = args.quest_id,
                quest_type = args.quest_type,
                scroll_position = 0;
            if (progressable_id) {
                var $quest,
                    quest_id = progressable_id;
                if (quest_type === QUESTS.ISLAND_QUEST) {
                    quest_id = this.island_quest_controller.getQuestIdFromDecisionId(progressable_id);
                    $quest = $('div.island_quests').find('.quest.island_quest[data-quest_id=' + quest_id + ']');
                } else if (quest_type === QUESTS.QUEST) {
                    $quest = $('div.default_category').find('.quest[data-quest_id=' + quest_id + ']');
                }
                scroll_position = $quest.position() ? $quest.position().top : scroll_position;
            }

            return scroll_position;
        },

        registerScrollbar: function () {
            this.unregisterComponent('questlog_index_scrollbar', this.sub_context);
            this.registerComponent('questlog_index_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
                orientation: 'vertical',
                template: 'tpl_skinable_scrollbar',
                skin: 'blue',
                disabled: false,
                elements_to_scroll: this.$el.find('.js-scrollbar-content'),
                elements_to_scroll_position: 'relative',
                element_viewport: this.$el.find('.js-scrollbar-viewport'),
                scroll_position: this.getScrollPosition(),
                min_slider_size: 16,
                hide_when_nothing_to_scroll: true,
                prepend: true
            }), this.sub_context);
        },

        registerCategoryClick: function () {
            this.$el.find('.category_container .category .header').off().on('click', function (ev) {
                var category = $(ev.currentTarget).data('category'),
                    current_state = this.controller.getFoldingStateForCategory(category),
                    $header = this.$el.find('.category.' + category + ' .header'),
                    new_state;

                this.controller.toggleFoldingStateForCategory(category);
                this.renderQuestsForCategory(category);
                new_state = this.controller.getFoldingStateForCategory(category);

                $header.find('.text').removeClass(current_state).addClass(new_state);
                this.setCategoryIconStates(category);

                this.registerScrollbar();
            }.bind(this));
        },

        setCategoryIconStates: function (category) {
            var $header = this.$el.find('.category.' + category + ' .header'),
                state = this.controller.getFoldingStateForCategory(category),
                closed = state === 'close',
                running_quests = this.controller.getRunningQuestsCountForCategory(category);

            // show hide the correct icons when the category is closed
            if (closed) {
                if (this.controller.hasCategoryNewQuests(category)) {
                    $header.find('.new_quests_icon').show();
                } else {
                    $header.find('.new_quests_icon').hide();
                }

                if (this.controller.hasCategoryFinishedQuests(category)) {
                    $header.find('.finished_quests_icon').show();
                } else {
                    $header.find('.finished_quests_icon').hide();
                }

                $header.find('.count').show().text(' (' + running_quests + ')');
            } else {
                $header.find('.new_quests_icon').hide();
                $header.find('.finished_quests_icon').hide();
                $header.find('.count').hide();
            }
        },

        registerQuestClick: function (category) {
            this.$el.find('.category_container .category.' + category + ' .quest').on('click', function (ev) {
                var $el = $(ev.currentTarget),
                    id = $el.data('quest_id'),
                    prev_id = this.controller.getActiveQuestId();


                if (this.tutorial_quest_controller.hasQuest(prev_id)) {
                    this.tutorial_quest_controller.markQuestAsRead(prev_id);
                }
                else {
                    this.island_quest_controller.markQuestAsRead(prev_id);
                }

                switch (category) {
                    case CATEGORIES.DEFAULT_CATEGORY:
                        this.tutorial_quest_controller.openQuest(id, true);
                        break;
                    case CATEGORIES.ISLAND_QUESTS:
                        this.island_quest_controller.openQuest(id, true);
                        break;
                }
            }.bind(this));
        },

        renderQuestNewMarker: function (quest_id, category) {
            var $quest = this.$el.find('.quest[data-quest_id="' + quest_id + '"] .right .badge');
            $quest.removeClass('new');
            if (category === CATEGORIES.ISLAND_QUESTS) {
                if (this.island_quest_controller.isQuestTaggedAsNew(quest_id)) {
                    $quest.addClass('new');
                }
            } else {
                if (this.tutorial_quest_controller.isQuestTaggedAsNew(quest_id)) {
                    $quest.addClass('new');
                }
            }
        },

        renderActiveQuestMarker: function () {
            this.$el.find('.quest').removeClass('selected');
            this.$el.find('.quest[data-quest_id="' + this.controller.getActiveQuestId() + '"]').addClass('selected');
        },

        renderFrame: function () {
            this.renderTemplate(this.$el, 'quest_index', {
                l10n: this.l10n
            });
        },

        renderTutorialQuest: function (quest, category) {
            var id = quest.getId(),
                progressable_id = quest.getProgressableId(),
                static_data = quest.getStaticData(),
                task = static_data.tasks[this.tutorial_quest_controller.getFirstRunningTaskIdForQuest(id)],
                short_description = task.short_description || task.description,
                new_quest = this.tutorial_quest_controller.isQuestTaggedAsNew(id),
                finished_quest = this.tutorial_quest_controller.isQuestTaggedAsFinished(id);

            // 'finished' overrules new
            var badge_id = finished_quest ? 'finished' : new_quest ? 'new' : '';

            this.$el.find('.category_container .' + category + ' .quests').append(this.getTemplate('quest', {
                l10n: this.l10n,
                questtype: static_data.questtype,
                name: ellipsis(static_data.name, MAX_LENGTH_HEADLINE),
                description: ellipsis(short_description, MAX_LENGTH_DESCRIPTION),
                id: id,
                progressable_id: progressable_id,
                badge_id: badge_id
            }));

            // tooltip for headline and second_headline
            var $quest = this.$el.find('.category_container .' + category + ' .quest[data-quest_id="' + id + '"]');
            $quest.find('.headline').tooltip(static_data.name);
            $quest.find('.second_headline').tooltip(task.description);
        },

        renderIslandQuest: function (quest) {
            var id = quest.getId(),
                progressables_ids = quest.getProgressablesId(),
                running_decision = this.island_quest_controller.getNotAbortedDecisionsForIslandQuest(quest),
                static_data = {},
                decision_side = '',
                timer = 0,
                new_quest = this.island_quest_controller.isQuestTaggedAsNew(id),
                finished_quest = this.island_quest_controller.isQuestTaggedAsFinished(id),
                badge_id;

            var decisions = this.island_quest_controller.getDecisionsForIslandQuest(quest),
                state = this.island_quest_controller.getIslandQuestState(decisions);

            if (running_decision.length === 1) {
                static_data = running_decision[0].getStaticData();
                decision_side = static_data.side;
                if (static_data.challenge_type !== 'bear_effect' && static_data.challenge_type !== 'wait_time') {
                    timer = this.island_quest_controller.getTimerForIslandQuest(quest);
                }
            } else if (running_decision.length > 1) {
                static_data = decisions[0].getStaticData();
                timer = this.island_quest_controller.getTimerForIslandQuest(quest);
            }

            // 'finished' overrules new
            badge_id = finished_quest ? 'finished' : new_quest ? 'new' : '';

            this.$el.find('.category_container .' + CATEGORIES.ISLAND_QUESTS + ' .quests').append(this.getTemplate('iq_quest', {
                l10n: this.l10n,
                name: ellipsis(static_data.name, MAX_LENGTH_HEADLINE),
                icon_type: static_data.quest_icon_type,
                id: id,
                progressable_id: progressables_ids,
                progressable_name: static_data.quest_icon_type,
                badge_id: badge_id,
                timer: timer ? DateHelper.readableSeconds(timer) : timer,
                state: state,
                decision_side: decision_side
            }));

            this.registerIslandQuestProgressBar(state, decisions, quest);
            this.registerTimer(quest.id, timer);
        },

        registerTimer: function (id, timer, do_refresh) {
            this.unregisterComponent('tm_timer' + id, this.sub_context);
            this.registerComponent('tm_timer' + id, this.$el.find('.quest[data-quest_id="' + id + '"] .timer').countdown2({
                value: timer,
                display: 'event'
            }).on('cd:finish', function () {
                if (do_refresh) {
                    NotificationLoader.resetNotificationRequestTimeout(100);
                }
            }), this.sub_context);
        },

        registerIQSkipCooldownButton: function () {
            var tooltip = '<strong>' +
                this.iq_l10n.window.tooltip_skip(GameData.island_quests.skip_cooldown_cost) +
                '</strong><br /><br />' +
                this.island_quest_controller.getGoldTooltipHtml();

            this.unregisterComponent('btn_skip_cooldown', this.sub_context);
            this.registerComponent('btn_skip_cooldown', this.$el.find('.btn_skip_cooldown').button({
                template : 'tpl_simplebutton_borders',
                tooltips: [{
                    title: tooltip,
                    styles: {
                        width: 450
                    },
                    hide_when_disabled: true
                }],
                caption: 'New Quest ' + GameData.island_quests.skip_cooldown_cost,
                icon: true,
                icon_type: 'gold',
                icon_position: 'right'
            }).on('btn:click', function (e, _btn) {
                BuyForGoldWindowFactory.openSkipIslandQuestCooldownForGoldWindow(_btn, function (callbacks) {
                    this.island_quest_controller.skipQuestCooldown(callbacks);
                }.bind(this));
            }.bind(this)), this.sub_context);
        },

        renderQuestsForCategory: function (category) {
            this.$el.find('.category_container .' + category + ' .quests').empty();

            if (this.controller.getFoldingStateForCategory(category) === 'close') {
                return;
            }

            us.each(this.controller.getQuestsForCategoryInOrder(category), function (quest) {
                switch (category) {
                    case CATEGORIES.DEFAULT_CATEGORY:
                        this.renderTutorialQuest(quest, category);
                        this.registerQuestProgressbar(quest);
                        break;
                    case CATEGORIES.ISLAND_QUESTS:
                        if (!quest.getProgressablesId()) {
                            return;
                        }
                        this.renderIslandQuest(quest);
                        break;
                    default:
                        break;
                }
            }.bind(this));

            this.registerQuestClick(category);

            if (category === CATEGORIES.ISLAND_QUESTS) {
                this.renderEmptyIslandQuestDummy();
            }
        },

        registerNotTimeDependentProgressBar: function (id, progress) {
            this.unregisterComponent('pb_progress_quest' + id, this.sub_context);
            this.registerComponent('pb_progress_quest' + id, this.$el.find('.pb_progress[data-quest_id="' + id + '"]').singleProgressbar({
                caption: progress.caption,
                value: progress.value,
                max: progress.max,
                type: progress.type
            }), this.sub_context);
        },

        registerTimeProgressBar: function (id, progress) {
            this.unregisterComponent('pb_progress_quest' + id, this.sub_context);
            this.registerComponent('pb_progress_quest' + id, this.$el.find('.pb_progress[data-quest_id="' + id + '"]').singleProgressbar({
                value: progress.curr,
                max: progress.max,
                real_max: progress.real_max,
                type: 'time',
                reverse_progress: true,
                liveprogress: true,
                countdown: true,
                template: 'tpl_pb_single'
            }), this.sub_context);
        },

        registerProgressBar: function (id, progress) {
            this.unregisterComponent('pb_progress_quest' + id, this.sub_context);
            this.registerComponent('pb_progress_quest' + id, this.$el.find('.pb_progress[data-quest_id="' + id + '"]').singleProgressbar({
                value: progress.curr < progress.max ? progress.curr : progress.max,
                max: progress.max,
                min: progress.min,
                caption: '',
                template: 'tpl_pb_single'
            }), this.sub_context);
        },

        registerIslandQuestProgressBar: function (state, decisions, quest, show_time_pg) {
            if (state === 0) {
                return;
            }

            var running_decision,
                progress = {};

            if (decisions.length > 1) {
                running_decision = us.first(decisions.filter(function (decision) {
                    return decision.getState() === QUESTS.RUNNING || decision.getState() === QUESTS.SATISFIED;
                }));
            } else {
                running_decision = us.first(decisions);
            }

            var value = running_decision.getProgressPercentDone();

            if (!show_time_pg) {
                progress = {
                    caption: this.l10n.quest_progress_caption,
                    value: value > 100 ? 100 : value,
                    max: 100,
                    type: 'percentage'
                };
                this.registerNotTimeDependentProgressBar(quest.id, progress);
                if (this.island_quest_controller &&
                    this.island_quest_controller.isTimeBasedQuestChallengeRunning(running_decision)) {
                    TM.unregister('iq_timer_for_index_pb_' + quest.id);
                    TM.register('iq_timer_for_index_pb_' + quest.id, 10000, function() {
                        var progress_bar = this.getComponent('pb_progress_quest' + quest.id, this.sub_context);

                        if (progress_bar) {
                            var value = running_decision.getProgressPercentDone();
                            progress_bar.setValue(value > 100 ? 100 : value);
                        }
                    }.bind(this));
                }
            } else {
                var current = running_decision.getProgress().wait_till - Timestamp.now(),
                    total_time = running_decision.getConfiguration().time_to_wait;

                if (running_decision.isSatisfied()) {
                    current = 0;
                }

                progress = {
                    curr: current < 0 ? 0 : current,
                    max: total_time,
                    real_max: total_time
                };

                this.registerTimeProgressBar(quest.id, progress);
            }
        },

        registerQuestProgressbar: function (quest) {
            if (!quest.hasProgress()) {
                return;
            }

            var id = quest.getId(),
                task_id = this.tutorial_quest_controller.getFirstRunningTaskIdForQuest(id),
                progress = this.tutorial_quest_controller.getPercentProgressForQuest(id, task_id);

            this.registerProgressBar(id, progress);
        },

        renderAllCategories: function () {
            us.each(this.controller.getCategoriesInOrder(), function (category) {
                if (category === CATEGORIES.ISLAND_QUESTS) {
                    this.island_quest_controller.getIslandQuestsDecisionCollection().getTimeToNextQuest(function (data) {
                        this.time_to_next_quest = data.time;

                        if (this.time_to_next_quest !== null && this.time_to_next_quest >= 0) {
                            this.renderCategory(CATEGORIES.ISLAND_QUESTS);
                            this.registerQuestComponents();
                        }
                    }.bind(this));
                }
                else {
                    this.renderCategory(category);
                }
            }.bind(this));
        },

        renderCategory: function (category) {
            this.$el.find('.category_container .category.' + category).remove();
            this.$el.find('.category_container').append(this.getTemplate('category', {
                l10n: this.l10n,
                category: category,
                running_quests: this.controller.getRunningQuestsCountForCategory(category),
                folding_state: this.controller.getFoldingStateForCategory(category)
            }));

            this.setCategoryIconStates(category);
            this.renderQuestsForCategory(category);
        },

        renderEmptyIslandQuestDummy: function () {
            var $container = this.$el.find('.category_container .' + CATEGORIES.ISLAND_QUESTS + ' .quests');

            $container.find('[data-quest_id="dummy_quest"]').remove();

            if (this.controller.hasCategoryAnyQuests(CATEGORIES.ISLAND_QUESTS)) {
                return;
            }

            this.renderTemplate($container, 'iq_empty_quest', {
                l10n: this.l10n,
                timer: DateHelper.readableSeconds(this.time_to_next_quest)
            });

            this.$el.find('.quest.island_quest[data-quest_id="dummy_quest"]').off('click').on('click', function () {
                this.island_quest_controller.openDummyQuest();
            }.bind(this));
            this.registerTimer('dummy_quest', this.time_to_next_quest, true);

            if (!Game.features.skip_island_quest_cooldown){
                return;
            }

            this.registerIQSkipCooldownButton();
        }
    });
});
