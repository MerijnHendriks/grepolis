/*global GameViews, DM, us, GameControllers, gpAjax */

(function() {
	"use strict";

	var SurveyController = GameControllers.TabController.extend({
		renderPage : function(data) {
			this.setData(data);

			this.renderViews();

			return this;
		},

		setData: function(data) {
			this.models = data.models;
			this.survey_model = this.getModel('survey');
			this.collections = data.collections;
			this.templates = DM.getTemplate('survey');
			this.l10n = DM.getl10n('survey');

			this.registerEventListeners();
		},

		registerEventListeners : function() {
			this.stopListening();
			this.survey_model.onResultsChange(this, this.reRenderPage.bind(this));
			this.survey_model.onParticipatedChange(this, this.closeWindow.bind(this));
		},

		renderViews: function() {
			this.setWindowTitle(this.survey_model.getSubject());

			this.$el.html(us.template(this.getTemplate('survey_main'), {
				model: this.survey_model,
				l10n: this.l10n
			}));

			this.content = this.$('.content');

			if (this.survey_model.isPoll()) {
				this.subview = new GameViews.SurveyPoll({
					controller : this,
					model: this.survey_model,
					el : this.content,
					l10n: this.l10n
				});
			} else if (this.survey_model.isFeedback()){
				this.subview = new GameViews.SurveyFeedback({
					controller : this,
					model: this.survey_model,
					el : this.content,
					l10n: this.l10n
				});
			} else if (this.survey_model.isCouncilVoting()){
                this.subview = new GameViews.SurveyCouncilVoting({
                    controller : this,
                    model: this.survey_model,
                    el : this.content,
                    l10n: this.l10n
                });
            }
            this.registerMainComponents();
		},

		registerMainComponents: function() {
			var _self = this,
				description,
				content,
                submit_caption,
                ignore_caption;

			if (this.survey_model.isPoll()) {
                ignore_caption = this.l10n.btn_dont_send_vote;
                submit_caption = this.l10n.btn_send_vote;
			} else if (this.survey_model.isFeedback()) {
                ignore_caption = this.l10n.btn_dont_send_feedback;
                submit_caption = this.l10n.btn_send_feedback;
			} else {
                ignore_caption = this.l10n.btn_council_abstain;
                submit_caption = this.l10n.btn_council_vote;
			}

			if (!this.survey_model.hasParticipated()) {
				this.registerComponent('btn_ignore_survey', this.$('.btn_ignore_survey').button({
					caption: ignore_caption
				}).on('btn:click', function (e) {
					var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
					ConfirmationWindowFactory.openConfirmationCastVote(function() {
						_self.skipSurvey();
					});
				}));

				this.registerComponent('btn_submit_survey', this.$('.btn_submit_survey').button({
					caption: submit_caption
				}).on('btn:click', function (e) {
					var ConfirmationWindowFactory = require('factories/windows/dialog/confirmation_window_factory');
					ConfirmationWindowFactory.openConfirmationCastVote(function() {
						_self.submitSurvey(_self.getComponents('survey'));
					});
				}));
			}

			description = this.$('.survey_description');
			if (description.height() > 140){ // create wrapping boxes and make it all scrollable
				description.addClass('scrolled').wrapInner('<div class="scrollbox"><div class="scrollable"></div></div>');
				description = description.find('.scrollbox');
				this.registerComponent('survey_description_scrollbar', description.skinableScrollbar({
					orientation: 'vertical',
					template: 'tpl_skinable_scrollbar',
					skin: 'blue',
					disabled: false,
                    elements_to_scroll: this.$('.survey_description .scrollable'),
                    element_viewport: description,
					scroll_position: 0
				}));
			}

			content = this.$('.content');
			if (content.height() > 231){ // create wrapping boxes and make it all scrollable
				content.addClass('scrolled').wrapInner('<div class="scrollbox"><div class="scrollable"></div></div>');
				content = content.find('.scrollbox');

				this.registerComponent('survey_content_scrollbar', content.skinableScrollbar({
					orientation: 'vertical',
					template: 'tpl_skinable_scrollbar',
					skin: 'blue',
					disabled: false,
					elements_to_scroll: this.$('.content .scrollable'),
					element_viewport: content,
					scroll_position: 0
				}));
			}
		},

		skipSurvey: function() {
			gpAjax.ajaxPost('survey', 'close', {}, true, function() {
				this.survey_model.setParticipated();
			}.bind(this));
		},

		submitSurvey: function(fields) {
			var params = {
				answers: {},
				text: ''
			};

			us.each(fields, function (field, key) {
				if ((/feedback/g).test(key)) {
					params.text = field.getValue();
				} else if ((/answer\[([0-9]+)\]/g).exec(key)) {
					params.answers[RegExp.$1] = field.getValue();
				}
			});

			gpAjax.ajaxPost('survey', 'submit', params, true, function(data) {
				if (data.survey_data && data.survey_data.show_results) {
					this.survey_model.set('survey_votes', data.votes);
					this.survey_model.set('has_results', true);
				}
				this.survey_model.setParticipated();
			}.bind(this));
		},

		reRenderPage: function() {
			this.subview.remove();
			this.unregisterComponents();
			this.renderViews();
		},

		destroy : function() {

		}
	});

	window.GameControllers.SurveyController = SurveyController;
}());
