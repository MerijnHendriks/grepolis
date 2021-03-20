define('features/surveys/controllers/survey_icon', function() {
    'use strict';

    var GameControllers = require_legacy('GameControllers');
    var View = require('features/surveys/views/survey_icon');
    var WindowFactory = require('features/surveys/factories/survey');

    return GameControllers.BaseController.extend({

        initialize : function(options) {
            GameControllers.BaseController.prototype.initialize.apply(this, arguments);

            this.registerEventListeners();
            this.renderPage();
        },

        registerEventListeners : function() {
            this.stopListening();
            this.getBenefitsCollection().onBenefitAdd(this, this.renderPage.bind(this));
            this.getSurveyModel().onParticipatedChange(this, this.removeIcon.bind(this));
        },

        registerModelEventListeners : function() {
            this.stopListening(this.icon_model);
            this.icon_model.onRemove(this, this.removeIcon.bind(this));
            this.icon_model.onChange(this, this.view.reRender.bind(this.view));
            this.icon_model.onStarted(this, this.view.render.bind(this.view));
            this.icon_model.onEnded(this, this.removeIcon.bind(this));
        },

        renderPage: function() {
            this.removeIcon();
            this.icon_model = this.getBenefitsCollection().getFirstSurveyBenefit();

            if (this.icon_model && !this.getSurveyModel().hasParticipated()) {
                this.initializeView();
                if (this.icon_model.isRunning()) {
                    this.view.render();
                }
            }
        },

        getBenefitsCollection: function() {
            return this.getCollection('benefits');
        },

        getSurveyModel : function() {
            return this.getModel('survey');
        },

        initializeView : function() {
            this.view = new View({
                controller : this,
                el : this.$el
            });
            this.registerModelEventListeners();
        },

        getIconType : function() {
            return 'poll';
        },

        getModelId : function() {
            return this.icon_model.getId();
        },

        getTimerEndTime : function() {
            return this.icon_model.getEnd();
        },

        iconClicked : function() {
            WindowFactory.openWindow();
        },

        removeIcon : function() {
            if (this.view) {
                this.view.removeIcon();
            }
        }

    });
});

