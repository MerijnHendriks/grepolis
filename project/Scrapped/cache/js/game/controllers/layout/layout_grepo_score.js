define('controllers/layout/layout_grepo_score', function() {
	'use strict';

	var GameControllers = require_legacy('GameControllers');
	var View = require('views/layout/layout_grepo_score');
	var GrepoScoreWindowFactory = require('features/grepolis_score/factories/grepolis_score');
	var GameDataAwards = require('data/awards');

	return GameControllers.TabController.extend({

		initialize : function(options) {
			GameControllers.TabController.prototype.initialize.apply(this, arguments);
		},

		registerEventListeners : function() {
			this.getModel('grepo_score').onChange(this, this.view.renderScore.bind(this.view));
			this.getCollection('grepo_score_hashes').onChange(this, this.view.renderNewAwardsHint.bind(this.view));
		},

		renderPage: function() {
			this.initializeView();
		},

		initializeView : function() {
			this.view = new View({
				controller : this,
				el : this.$el
			});
			this.registerEventListeners();
		},

		hasNewAwardsInAnyCategory: function () {
			var categories = GameDataAwards.getCategories(),
				category_hashes = this.getCollection('grepo_score_hashes');

			return categories.filter(function(category) {
				return (['event', 'unobtainable'].indexOf(category) === -1) &&
					GameDataAwards.getCategoryHash(category) !== category_hashes.getHashForCategory(category);
			}).length > 0;
		},

		openGrepoScoreWindow : function() {
			GrepoScoreWindowFactory.openWindow();
		},

		getGrepoScore : function() {
			return this.getModel('grepo_score').getTotalScore();
		}

	});
});
