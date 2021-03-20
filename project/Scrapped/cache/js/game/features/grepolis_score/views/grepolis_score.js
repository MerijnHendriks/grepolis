// Main window for the Grepolis Score
define('features/grepolis_score/views/grepolis_score', function (require) {
	'use strict';

	var Views = require_legacy('GameViews');
	var TooltipFactory = require('factories/tooltip_factory');
	var GrepoScoreCategory = require('enums/grepo_score_category');
	var Features = require('data/features');

	return Views.BaseView.extend({

		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.l10n = this.controller.getl10n();
			this.recent_award_tooltip_text = this.l10n.tooltip_recent_award;
			this.render();
		},

		render: function (category) {
			this.renderTemplate(this.$el, 'index', {
				l10n: this.l10n,
				overall_score: this.controller.getTotalScore()
			});

			this.renderSummary();

			this.registerViewComponents(category);
		},

		renderSummary: function () {
			var $content = this.$el.find('.score_content'),
				event_category_theme = this.controller.getEventTheme(),
				event_category_name = this.controller.getTranslatedEventCategory();

			this.renderTemplate($content, 'summary', {
				categories: this.controller.getCategoriesWithPoints(),
				event_category_theme : event_category_theme,
				event_category_name : event_category_name,
				l10n: this.l10n
			});
		},

		registerViewComponents: function (category) {
			this.registerCategoriesDropdown();
			this.registerCategoryCardButtons();
			this.registerBBCodeButton();
			this.registerWorldPointButtons();
			this.registerCentralIconSummaryButton();
			this.registerMainContentScrollbar();
			this.registerTooltips();
			this.updateMostRecentAward(category);
		},

		registerCategoriesDropdown: function () {
			this.unregisterComponent('award_category_dropdown');
			this.$categoryDropDown = this.$el.find('#award_category_dropdown');

			var options = ['summary'].concat(this.controller.getFilteredCategories());

			this.registerComponent('award_category_dropdown', this.$categoryDropDown.dropdown({
				list_pos: 'center',
				value: 'summary',
				type: 'text',
				options: options.map(function (option){
					return {
						value: option,
						name: this.l10n.categories[option] || this.controller.getTranslatedEventCategory()
					};
				}.bind(this))
			}).on('dd:change:value', function (e, page) {
				this.openPage(page);
			}.bind(this)));
		},

		openPage: function (page) {
			this.$categoryDropDown.setValue(page);
			if (page === 'summary') {
				this.renderSummary();
				this.controller.updateSummaryTabHighlightFromDropdownSelect(true);
				this.recent_award_tooltip_text = this.l10n.tooltip_recent_award;
			} else {
				this.renderCategoryContent(page);
				this.controller.updateSummaryTabHighlightFromDropdownSelect(false);
				this.controller.markCategoryRead(page);
				this.recent_award_tooltip_text = this.l10n.tooltip_recent_category_award;
			}
			this.registerMainContentScrollbar();
		},

		renderCategoryContent: function (category) {
			var $content = this.$el.find('.score_content');

			this.renderTemplate($content, 'category_page', {
				l10n: this.l10n,
				title: category,
				awardGroups: this.controller.getAwardsForCategory(category).map(this.getViewObjectForAward)
			});

			// Apply tooltips for every rendered award
			$content.find('.award_box').each( function (idx, el) {
				var $award_box = $(el),
					id = $award_box.data('id'),
					event_id = $award_box.data('event_id'),
					award_box_level = $award_box.data('award_level');

                var award = this.collection.getByAwardIdAndEventId(id, event_id.toString());

                $award_box.tooltip (
					us.template(this.controller.getTemplate('award_tooltip'), {
						title: award.getName(),
						score: award.getPointsForLevel(award_box_level),
						description: award.getDescriptionForLevel(award_box_level),
						locked: !award.getOwned() || award.getLevel() < award_box_level,
						requirements: this.l10n.tooltip_requirements
					})
				);
			}.bind(this));

			$content.find('.score:not(.first_on_world)').tooltip(this.l10n.window_title);
			$content.find('.score.first_on_world').tooltip(this.l10n.tooltip_golden_award);

			this.updateMostRecentAward(category);
		},

		registerCentralIconSummaryButton: function () {
			this.$el.find('.grepolis_score_icon_tooltip_area').on('click', function () {
				var current_category = this.$categoryDropDown.getValue();
				if (current_category !== "summary") {
					this.openPage("summary");
				}
			}.bind(this));
		},

		registerCategoryCardButtons: function() {
			var openPage = this.openPage.bind(this);
			this.$el.on('click', '.event_category, .card_background', function () {
				var category = $(this).attr('data-category');
				openPage(category);
			});
		},

		registerWorldPointButtons: function () {
			this.unregisterComponent('btn_info_overlay');
			this.registerComponent('btn_info_overlay', this.$el.find('.btn_info_overlay').button({
					template: 'internal'
				}).on('btn:click', function () {
					this.controller.openWorldPoints();
				}.bind(this)))
				.tooltip(this.l10n.world_points_title);
		},

		registerBBCodeButton: function () {
			this.unregisterComponent('grepo_score_textbox');
			var $txt_bb = this.registerComponent('grepo_score_textbox', this.$el.find('.txt_grepolis_score_bb_code').textbox({
				value: this.controller.getBBCodeForPlayer(),
				visible: false,
				read_only: true
			}));

			this.unregisterComponent('btn_bb_code');
			this.registerComponent('btn_bb_code', this.$el.find('.btn_bb_code').button({
				template: 'tpl_simplebutton_borders',
				icon: true,
				icon_position: 'left',
				tooltips: [
					{title: this.l10n.tooltip_share_bb_code}
				]
			}).on('btn:click', function () {
				$txt_bb.toggleVisibility();
				$txt_bb.selectAll();
			}));
		},

		registerMostRecentAward: function (award) {
			var $wrapper = this.$el.find('.recent_award'),
				imageClass = award.getCssImageClass(),
				$award = $('<div>', {
					'class': ['award', 'award76x76', imageClass].join(' ')
				}),
				tooltip = TooltipFactory.getAwardTooltip(award.getAwardId(), award.getEventId()),
				combined_tooltip = this.recent_award_tooltip_text + '<br><b>' + tooltip + '</b>';

			if (award.isDaily()){
				$award
					.append($('<div>', { 'class': 'daily year', text: award.getDailyLastYear()}))
					.append($('<div>', { 'class': 'daily date', text: award.getDailyLastDate()}));
			}

			$wrapper
				.empty()
				.append($award)
				.off()
				.tooltip(combined_tooltip)
				.click(this.scrollToAward.bind(this, award));
		},

		removeMostRecentAward : function() {
			var $wrapper = this.$el.find('.recent_award');
			$wrapper.empty();
			this.$el.find('.recent_award').tooltip(this.recent_award_tooltip_text);
		},

		updateTotalScore: function (total_score) {
			var text = this.$el.find('.total_score_text');
			text.text(total_score);
		},

		updateAwards: function () {
			var current_category = this.$categoryDropDown.getValue();

			if (current_category === 'summary') {
				this.renderSummary();
			} else {
				this.renderCategoryContent(current_category);
			}

			this.updateMostRecentAward(current_category);
		},

		updateMostRecentAward : function(current_category) {
			var most_recent_award = this.controller.getMostRecentAward(current_category);

			if (most_recent_award) {
				this.registerMostRecentAward(most_recent_award);
			} else {
				this.removeMostRecentAward();
			}
		},

		registerMainContentScrollbar: function () {
			this.controller.unregisterComponent('category_scrollbar');
			this.controller.registerComponent('category_scrollbar', this.$el.find('.js-scrollbar-viewport').skinableScrollbar({
				orientation: 'vertical',
				template: 'tpl_skinable_scrollbar',
				skin: 'blue',
				disabled: false,
				elements_to_scroll: this.$el.find('.js-scrollbar-content'),
				element_viewport: this.$el.find('.js-scrollbar-viewport'),
				scroll_position: 0,
				min_slider_size: 16
			}));
		},

		registerTooltips: function () {
			this.$el.find('.score_title').tooltip(this.l10n.window_title);
			this.$el.find('.grepolis_score_icon_tooltip_area').tooltip(this.l10n.window_title);
			this.$el.find('.total_score_text').tooltip(
				'<b>' + this.l10n.tooltip_earned_score + '</b><br>' + this.l10n.world_points_explanation);
		},

		shouldAwardGoIntoTheUnobtainableCategory: function(category, award) {
			var active_end_game = Features.getEndGameType();
            return ((category === GrepoScoreCategory.EVENT && award.getSubcategory() !== this.controller.getEventTheme()) ||
				(category === GrepoScoreCategory.END_GAME && award.getSubcategory() !== active_end_game));
		},

		scrollToAward: function(award) {
			var category = award.getCategory();

			if (this.shouldAwardGoIntoTheUnobtainableCategory(category, award)) {
				// if the event is not running show it in 'unobtainable'
				category = GrepoScoreCategory.UNOBTAINABLE;
			}
			
			this.openPage(category);

			var last_unlocked_selector = '.award_box.unlocked[data-id="'+ award.getAwardId() +'"]:last .award',
				$last_unlocked = this.$el.find(last_unlocked_selector);

			// if last unlocked award wasn't found, make a fallback to the unobtainable category
			// (for edge-cases like Grepolympia, where disciplines are moved to unobtainable, while the event as a whole is still running)
			if ($last_unlocked.length === 0 &&
				(category === GrepoScoreCategory.EVENT || category === GrepoScoreCategory.END_GAME )) {
				category = GrepoScoreCategory.UNOBTAINABLE;
				this.openPage(category);
				$last_unlocked = this.$el.find(last_unlocked_selector);
			}

			var $award_group = $last_unlocked.parents('.award_group:first'),
				offset = $award_group.position().top;

			this.controller.getComponent('category_scrollbar').scrollTo(offset, true);

			// highlight
			$award_group
				.transition({opacity: 0.5})
				.transition({opacity: 1}, 'ease')
				.transition({opacity: 0.5}, 'ease')
				.transition({opacity: 1}, 'ease');
		},

		/**
		 * returns one result object for an award
		 *  - per level [awards]:
		 *    - imageClass, locked, level
		 *  - score.
		 *  - maxScore
		 *  - id
		 *  - maxed
		 *  - hasLevels
		 * @returns {AwardViewObject}
		 */
		getViewObjectForAward : function(award) {
			var level = award.getLevel(),
				maxLevel = award.getMaxLevel(),
				minLevel = award.getMinLevel(),
				result = {
					awards: [],
					score: award.getScore(),
					maxScore: award.getMaxScore(),
					id: award.getAwardId(),
					maxed: award.getIsMaxed(),
					hasLevels: award.hasLevels(),
					first_on_world: award.isAwardedFirst(),
					is_daily: award.isDaily(),
					daily_year: award.getDailyLastYear(),
					daily_date: award.getDailyLastDate(),
					event_id: award.getEventId()
				};

			for (var i = minLevel; i <= maxLevel; i++) {
				var imageClass = award.hasLevels() ? award.getAwardId() + '_' + i : award.getAwardId();

				result.awards.push({
					imageClass: imageClass,
					locked: !award.getOwned() || level < i,
					level: i
				});
			}

			return result;
		}
	});
});
