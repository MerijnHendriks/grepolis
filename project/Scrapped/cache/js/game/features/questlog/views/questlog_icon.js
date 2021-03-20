define('features/questlog/views/questlog_icon', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');
	var QUESTS = require('enums/quests');
	var GameEvents = require('data/events');

	return Views.BaseView.extend({
		initialize: function (options) {
			Views.BaseView.prototype.initialize.apply(this, arguments);
			this.render();
		},

		showQuestFinishedAnimation : function() {
			var $questlog_icon = this.$el.find('.questlog_icon'),
				$questlog_glow = $questlog_icon.find('.glow_finished'),
				$questlog_normal_glow = $questlog_icon.find('.glow'),
				$exclamation_point = $questlog_icon.find('.exclamation_point'),
				$check_mark = $questlog_icon.find('.check_mark');

			$questlog_glow.show();
			$questlog_icon.addClass('finished');
			$questlog_icon.removeClass('new');
			$questlog_normal_glow.removeAttr('style');
			$exclamation_point.show();
			$check_mark.show();

			$questlog_glow.transition({
				opacity : 0
			});
			$questlog_glow.transition({
				opacity : 1
			}, 500, function() {
				$questlog_glow.transition({
					opacity : 0
				}, 500, function() {
					$questlog_glow.removeAttr('style');
				});
			});
			$exclamation_point.transition({
				opacity : 0
			}, 500, function() {
				$exclamation_point.hide();
			});
			$check_mark.transition({
				opacity : 1
			}, 500);
		},

		playQuestFinishedSound : function(model_id) {
			$.Observer(GameEvents.quest.change_state).publish({
				quest_id: model_id,
				new_state: QUESTS.CLOSED
			});
		},

		showNewQuestGlowAnimation : function() {
			var $questlog_icon = this.$el.find('.questlog_icon'),
				$questlog_glow = $questlog_icon.find('.glow');
			$questlog_icon.removeClass('finished');
			$questlog_icon.addClass('new');

			$questlog_glow.show();
			$questlog_glow.transition({
				opacity : 0
			});
			$questlog_glow.transition({
				opacity : 1
			}, 500, function() {
				$questlog_glow.transition({
					opacity : 0
				}, 500, function() {
					$questlog_glow.removeAttr('style');
				});
			});
		},

		removeFinishedIconState : function() {
			var $questlog_icon = this.$el.find('.questlog_icon'),
				$exclamation_point = $questlog_icon.find('.exclamation_point'),
				$check_mark = $questlog_icon.find('.check_mark');

			$questlog_icon.removeClass('finished');
			$questlog_icon.removeClass('new');
			$check_mark.removeAttr('style');
			$exclamation_point.removeAttr('style');
			$exclamation_point.show();
		},

		setTooltipText : function() {
			var $questlog_icon = this.$el.find('.questlog_icon'),
				l10n = this.controller.getl10n('questlog_icon_l10n'),
				tooltip_text = l10n.begin_text;

			$questlog_icon.find('.caption .text').text(tooltip_text);
		},

		changeCounter : function() {
			var counter = this.controller.getCounter(),
				$questlog_icon = this.$el.find('.questlog_icon'),
				$counter_bubble = $questlog_icon.find('.counter'),
				$counter_number = $counter_bubble.find('.counter_number');

			if(counter > 0) {
				if(counter < 100) {
					$counter_number.text(counter);
				} else {
					$counter_number.text(counter - 1 + '+');
					$counter_number.addClass('smaller');
				}
				$counter_bubble.show();
				if(!$questlog_icon.hasClass('new')) {
					$questlog_icon.addClass('new');
					this.showNewQuestGlowAnimation();
				}
			} else {
				$counter_bubble.hide();
				$questlog_icon.removeClass('new');
			}
		},

		render : function() {
			this.registerComponent('questlog_open', this.$el.button({
				template : 'questlog_icon'
			}).on('btn:click', function() {
				var $questlog_icon = this.$el.find('.questlog_icon');

				$questlog_icon.removeClass('finished');
				this.controller.openWindow();
			}.bind(this)));

			this.setTooltipText();
		}
	});
});
