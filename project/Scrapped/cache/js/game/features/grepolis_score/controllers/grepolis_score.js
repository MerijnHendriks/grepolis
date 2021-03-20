/* global Game, DM */

// Controller for the Grepolis Score window
define('features/grepolis_score/controllers/grepolis_score', function () {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('features/grepolis_score/views/grepolis_score');
	var WorldPointsController = require('features/grepolis_score/controllers/world_points');
	var GameDataAwards = require('data/awards');
    var GrepoScoreCategory = require('enums/grepo_score_category');

	return GameControllers.TabController.extend({

		initialize: function (options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners: function () {
			this.grepo_score.onChange(this, function () {
				this.view.updateTotalScore(this.getTotalScore());
			});

			this.player_awards.onAwardObtained(this, function () {
				this.view.updateAwards();
			});

			this.player_awards.onDailyAwardScoreChange(this, function() {
				this.view.updateAwards();
			});
		},

		renderPage: function () {
			this.grepo_score = this.getModel('grepo_score');
			this.player_awards = this.getCollection('player_awards');
			this.category_hashes = this.getCollection('grepo_score_category_hashs');
			this.benefits_collection = this.getCollection('benefits');
			this.show_event_category = this.benefits_collection.isAwardCategoryBenefitEnabled();
			this.initializeView();

			var args = this.getWindowModel().getArguments(),
				award_id_to_scroll_to = args && args.award_id;

			if (award_id_to_scroll_to) {
				this.view.scrollToAward(this.player_awards.getByAwardId(award_id_to_scroll_to));
				this.getWindowModel().setArguments({});
			}
		},

		initializeView: function () {
			this.view = new View({
				controller: this,
				el: this.$el,
				collection: this.player_awards,
				model: this.grepo_score
			});
			this.registerEventListeners();
		},

		openWorldPoints: function () {
			var controller = this.registerController('grepolis_score_world_points_controller', new WorldPointsController({
				l10n: this.getl10n(),
				window_controller: this,
				templates: {
					world_points: this.getTemplate('world_points'),
					world_points_sizer: this.getTemplate('world_points_sizer')
				},
				models: {
					grepo_score: this.grepo_score
				},
				cm_context: {
					main: this.getMainContext(),
					sub: 'world_points'
				}
			}));

			this.openSubWindow({
				title: this.l10n.world_points_title,
				controller: controller,
				skin_class_names: 'classic_sub_window'
			});
		},

		getTotalScore: function () {
			return this.grepo_score.getTotalScore();
		},

		getMostRecentAward: function (category) {
			return this.player_awards._getMostRecentAward(this.getAwardsForCategory(category));
		},

		hasNewAwards: function (category) {
			return (['event', 'unobtainable'].indexOf(category) === -1) &&
				GameDataAwards.getCategoryHash(category) !== this.category_hashes.getHashForCategory(category);
		},

		/**
		 * sorted list of objects containing 'name' and 'points' of each category
		 * @returns {Array}
		 */
		getCategoriesWithPoints: function () {
			var sumPoints = function(category){
				return this.getAwardsForCategory(category).reduce(function(sum, award) {
					return sum + award.getScore();
				}, 0);
			}.bind(this);

			return this.getFilteredCategories().map(function (category) {
				return {
					name: category,
					points: sumPoints(category),
					event_category : GameDataAwards.isEventCategory(category),
					has_new_awards: this.hasNewAwards(category)
				};
			}.bind(this));
		},

		getEventTheme: function () {
			return this.show_event_category ?
				this.benefits_collection.getAwardCategoryBenefit().getTheme() :
				'';
		},

		getTranslatedEventCategory: function () {
			if (!this.show_event_category) {
				return '';
			}

			return DM.getl10n(this.getEventTheme()).title || DM.getl10n('default_event').title;
		},

		getFilteredCategories: function() {
            return this.getSortedCategories().filter(function(category) {
                return GameDataAwards.isEventCategory(category) ? this.show_event_category
                    : this.getAwardsForCategory(category).length > 0;
            }.bind(this));
		},

		getSortedCategories: function () {
			return GameDataAwards.getCategories();
		},

		getBBCodeForPlayer: function() {
			return '[score]' + Game.player_name + '[/score]';
		},

		/**
		 * 'select' or 'deselect' the summary tab based on the given boolean
		 *
		 * The window settings defines a hidden tab '1' without a controller and view
		 * which this method switches to and renders the tabarea
		 * therefore the user sees the 'summary' tab '0' becoming unselected
		 */
		updateSummaryTabHighlightFromDropdownSelect : function(enable) {
			var window_model = this.getWindowModel();

			if (enable) {
				// just enable the summary tab
				window_model.setActivePageNr(0);
			} else {
				// switch to hidden tab '1' - without controller initialization
				window_model.setActivePageNr(1, {silent: true});

				// toggleing the highlight on the tab model is harmless and just triggers the re-render
				var tab = window_model.getTabsCollection().getTabByNumber(0);
				tab.enableHighlight();
				tab.disableHighlight();
			}
		},

		markCategoryRead : function(category) {
			if (this.hasNewAwards(category)) {
				this.category_hashes.updateCategoryHash(category, GameDataAwards.getCategoryHash(category));
			}
		},

		/**
		 * Takes care of handling the running event and placing event awards into unobtainable if it's not running.
		 * @returns {[PlayerAward]}
		 */
		getAwardsForCategory : function(category) {
			var awards;

			switch (category) {
				case GrepoScoreCategory.UNOBTAINABLE:
					awards = this.getUnobtainableRewards(category);
					break;
				case GrepoScoreCategory.EVENT:
					awards = this.getEventRewards();
					break;
				case GrepoScoreCategory.END_GAME:
					awards = this.getEndGameAwards();
					break;
				case undefined:
					awards =  this.player_awards.models;
					break;
				default:
					awards = this.player_awards.getAllOfCategory(category);
			}

			return awards.sort(function(award_a, award_b) {
				if (award_a.hasLevels() === award_b.hasLevels()) {
					return award_b.getOrderIndex() - award_a.getOrderIndex();
				} else if (award_a.hasLevels()) {
					return 1;
				}

				return -1;
			});
		},

		getEventRewards : function() {
			var event_awards =  this.player_awards.getAllEventAwardsForTheme(this.getEventTheme()),
				awards = event_awards.filter(function(award) {
					return !this.isReoccurringAwardOfNotCurrentRunningBenefit(award);
				}.bind(this));
			return awards;
		},

		getEndGameAwards : function() {
            return this.player_awards.getAllAwardsForActiveEndGame();
		},

		getAwardsOfInactiveEvents : function() {
            var event_awards = this.player_awards.getAllOfCategory(GrepoScoreCategory.EVENT),
                current_event_awards = this.player_awards.getAllEventAwardsForTheme(this.getEventTheme());
                return event_awards.filter(function(award) {
                    if (this.isReoccurringAwardOfNotCurrentRunningBenefit(award)) {
                        return true;
                    }
                    return current_event_awards.indexOf(award) < 0;

                }.bind(this));
		},

        getAwardsOfInactiveEndgame : function() {
			var end_game_awards = this.player_awards.getAllOfCategory(GrepoScoreCategory.END_GAME),
				current_end_game_awards = this.player_awards.getAllAwardsForActiveEndGame();
			return end_game_awards.filter(function(award) {
				return current_end_game_awards.indexOf(award) < 0;
			}.bind(this));
		},

		getUnobtainableRewards : function(category) {
			var awards = this.player_awards.getAllOfCategory(category),
				awards_of_currently_inacative_events = this.getAwardsOfInactiveEvents(),
				awards_of_currently_inactive_endgame = this.getAwardsOfInactiveEndgame(),
				inactive_category_awards = awards_of_currently_inacative_events.concat(awards_of_currently_inactive_endgame);

			return awards.concat(inactive_category_awards);
		},

		isReoccurringAwardOfNotCurrentRunningBenefit : function(award) {
			return (award.getIsReoccurring() &&
					award.getEventId() &&
					!this.benefits_collection.isBenefitWithGivenEventIdRunning(award.getEventId()));
		}

	});
});
