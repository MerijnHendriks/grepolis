define('features/crm_campaign/controllers/crm_screen', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers'),
        CrmScreenView = require('features/crm_campaign/views/crm_screen'),
        CrmScreenComponents = require('features/crm_campaign/enums/crm_screen_components');

    return GameControllers.CrmController.extend({
        initialize: function (options) {
            GameControllers.CrmController.prototype.initialize.apply(this, arguments);
        },

        renderPage: function () {
            this.setModelsFromWindowArguments();
            this.view = new CrmScreenView({
                el: this.$el,
                controller: this
            });
        },

        getComponentText: function (id) {
            var component = this.crm_campaign.getScreenComponentById(id);

            if (component && component.translation) {
                return component.translation;
            }

            return '';
        },

        getComponentEnumValue: function (id) {
            var component = this.crm_campaign.getScreenComponentById(id);

            if (component && component.value) {
                return component.value;
            }

            return null;
        },

        getTitleText: function () {
            return this.getComponentText(CrmScreenComponents.TITLE_TEXT);
        },

        getTagBannerText: function () {
            return this.getComponentText(CrmScreenComponents.TAG_BANNER_TEXT);
        },

        getTagBannerColor: function () {
            return this.getComponentEnumValue(CrmScreenComponents.TAG_BANNER);
        },

        getMainImageUrl: function () {
            var main_image = this.crm_campaign.getScreenComponentById(CrmScreenComponents.MAIN_IMAGE);

            if (main_image && main_image.url) {
                return main_image.url;
            }

            return '';
        },

        getHeadlineText: function () {
            return this.getComponentText(CrmScreenComponents.HEADLINE_TEXT);
        },

        getContentText: function () {
            return this.getComponentText(CrmScreenComponents.CONTENT_TEXT);
        },

        getPriceTagBackground: function () {
            return this.getComponentEnumValue(CrmScreenComponents.PRICE_TAG_BACKGROUND);
        },

        getPriceTagStrikethroughText: function () {
            return this.getComponentText(CrmScreenComponents.PRICE_TAG_STRIKE_TEXT);
        },

        getPriceTagText: function () {
            return this.getComponentText(CrmScreenComponents.PRICE_TAG_TEXT);
        },

        getConfirmButtonText: function () {
            var button = this.crm_campaign.getScreenComponentById(CrmScreenComponents.CONFIRM_BUTTON);

            if (button && button.title && button.title.translation) {
                return button.title.translation;
            }

            return '';
        },

        getCharacter: function () {
            return this.getComponentEnumValue(CrmScreenComponents.CHARACTER);
        },

        getBackgroundDecoration: function () {
            return this.getComponentEnumValue(CrmScreenComponents.BACKGROUND_DECORATION);
        },

        getCountdownValue: function () {
            return this.getComponentEnumValue(CrmScreenComponents.COUNTDOWN);
        },

        getBackground: function () {
            return this.getComponentEnumValue(CrmScreenComponents.BACKGROUND);
        }
    });
});