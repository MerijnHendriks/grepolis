define('events/missions/views/sub_windows/tutorial', function(require) {
	'use strict';

	var Views = require_legacy('GameViews');
	var BenefitHelper = require('helpers/benefit');
	var FIRST_STEP = 1;
	var TEXT_IMAGE_STEP = 6;

	return Views.BaseView.extend({
		initialize: function (options) {
			//Don't remove it, it should call its parent
			Views.BaseView.prototype.initialize.apply(this, arguments);

			this.tutorial_step_class = options.tutorial_step_class;
			this.l10n = this.controller.getl10n();
			this.render();
		},

		render: function() {
			var current_step = this.controller.getCurrentTutorialStep(),
				step_count = this.controller.getStepCount(),
				is_tutorial_finished = this.controller.isTutorialMarkedAsFinished(),
				hidden_class = 'hidden';
			this.renderTemplate(this.$el, 'tutorial', {
				text: this.controller.getText(),
				tutorial_step: this.controller.getTutorialStepString(),
				prev_btn_cls: current_step === FIRST_STEP ? hidden_class : '',
				next_btn_cls: current_step === step_count ? hidden_class : '',
				close_btn_cls: current_step !== step_count ? hidden_class : '',
				x_button_cls: !is_tutorial_finished ? hidden_class : '',
				mission_skin: BenefitHelper.getBenefitSkin(),
				text_cls: current_step !== TEXT_IMAGE_STEP ? hidden_class : '',
				headline: this.l10n.mission_running.capturing_chance,
				inline_text_1: this.l10n.mission_running.base_chance,
				inline_text_2: this.l10n.mission_running.unit_bonus,
				inline_text_3: this.l10n.mission_running.total_chance
			});

			this.unregisterComponents();
			this.registerComponents();
		},

		registerComponents: function() {
			this.registerXButton();
			this.registerCloseButton();
			this.registerNextButton();
			this.registerPrevButton();
		},

		registerNextButton: function() {
			this.registerComponent('btn_next', this.$el.find('.btn_next').button({
				caption: this.l10n.tutorial.next_btn
			}).on('btn:click', function() {
				var current_step = this.controller.getCurrentTutorialStep(),
					step_count = this.controller.getStepCount();
				if (current_step < step_count) {
					this.showTutorialStep(1);
				}
			}.bind(this)));
		},

		registerPrevButton: function() {
			this.registerComponent('btn_prev', this.$el.find('.btn_prev').button({
				caption: this.l10n.tutorial.prev_btn
			}).on('btn:click', function() {
				var current_step = this.controller.getCurrentTutorialStep();
				if (current_step > FIRST_STEP) {
					this.showTutorialStep(-1);
				}
			}.bind(this)));
		},

		registerXButton: function() {
			this.registerComponent('btn_x_close', this.$el.find('.btn_wnd.close').button({
			}).on('btn:click', function() {
				this.controller.close();
			}.bind(this)));
		},

		registerCloseButton: function() {
			this.registerComponent('btn_close', this.$el.find('.btn_close').button({
				caption: this.l10n.tutorial.close_btn
			}).on('btn:click', function() {
				if (!this.controller.isTutorialMarkedAsFinished()) {
					this.controller.finishTutorial();
				}
				this.controller.close();
			}.bind(this)));
		},

		showTutorialStep: function(direction) {
			var current_step = this.controller.getCurrentTutorialStep();
			this.controller.setCurrentTutorialStep(current_step + direction);
			this.render();
		},

		destroy: function() {

		}
	});
});
