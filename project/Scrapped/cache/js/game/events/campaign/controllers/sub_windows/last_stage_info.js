define('events/campaign/controllers/sub_windows/last_stage_info', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
    var GameDataHercules2014 = window.GameDataHercules2014;
	var SubWindowLastStageInfoView = require('events/campaign/views/sub_windows/last_stage_info');
	var GameFeatures = require('data/features');

	var SubWindowLastStageInfo = GameControllers.BaseController.extend({

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.stage_id = options.stage_id;
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowLastStageInfoView({
				el : this.$el,
				controller : this,
				has_hero : this.hasHero()
			});

			return this;
		},

		hasHero : function() {
			return GameFeatures.areHeroesEnabled() && this.window_controller.hasHeroReward();
		},

		getRewardHeroId : function() {
			if (!this.hero_id) {
				this.hero_id = GameDataHercules2014.getRewardHeroId();
			}

			return this.hero_id;
		},

		onOkayButtonPressed : function() {
			this.window_controller.openLastFightResult(this.stage_id, true);
		},

		destroy : function() {

		}
	});

	return SubWindowLastStageInfo;
});
