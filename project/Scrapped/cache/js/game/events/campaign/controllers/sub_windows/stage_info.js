define('events/campaign/controllers/sub_windows/stage_info', function(require) {
	'use strict';

	var GameControllers = window.GameControllers;
	var SubWindowStageInfoView = require('events/campaign/views/sub_windows/stage_info');

	var SubWindowStageInfo = GameControllers.BaseController.extend({
		stage_id : null,
		fight_result_type : null,

		initialize : function(options) {
			//Don't remove it, it should call its parent
			GameControllers.BaseController.prototype.initialize.apply(this, arguments);

			this.window_controller = options.window_controller;
			this.stage_id = options.stage_id;
			this.stage_name = options.stage_name;

			this.getCollection('campaign_player_stages').getStage(this.getStageId()).onCooldownChange(this, function() {
				this.window_controller.switchToAttackWindow(this.getStageId());
			}.bind(this));
		},

		render : function($content_node) {
			this.$el = $content_node;

			this.view = new SubWindowStageInfoView({
				el : this.$el,
				controller : this
			});

			return this;
		},

		getStageId : function() {
			return this.stage_id;
		},

		getStageName : function() {
			return this.stage_name;
		},

		getReward : function() {
			return this.window_controller.getStageReward(this.stage_id)[0];
		},

		getStageTooltip: function() {
			return this.window_controller.getStageTooltip(this.stage_id, true);
		},

		getMercenaryTooltip : function(mercenary_type) {
			return this.window_controller.getMercenaryTooltip(mercenary_type, true);
		},

		destroy : function() {
			this.unregisterComponent('stage_cooldown_' + this.stage_id + '_window', 'stage_cooldowns');
		}
	});

	return SubWindowStageInfo;
});
