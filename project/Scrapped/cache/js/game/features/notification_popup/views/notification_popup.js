/* global Layout */
// Notification popup view
define('features/notification_popup/views/notification_popup', function () {
    'use strict';

    var BaseView = window.GameViews.BaseView,
        Game = require_legacy('Game'),
        EndGameNotificationTypes = require('enums/end_game_notification_types'),

        NotificationPopupView = BaseView.extend({
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.l10n = this.controller.getl10n();
                this.render();
            },

            getDescriptionTextDependingOnType: function () {
                var type = this.controller.getNotificationType(),
                    own_alliance = this.controller.isOwnAlliance(),
                    linked_alliance_name = this.createAllianceLink(),
                    text = '';

                switch(type) {
                    case EndGameNotificationTypes.DOMINATION_LAST_STAND_STARTED:
                        var last_stand_duration = Game.last_stand_duration_days;
                        text = this.l10n[type].description(linked_alliance_name, last_stand_duration, own_alliance);
                        break;
                    case EndGameNotificationTypes.DOMINATION_WORLD_WON:
                        var domination_value = this.controller.getFinalDominationValue();
                        text = this.l10n[type].description(linked_alliance_name, domination_value, own_alliance);
                        break;
                    case EndGameNotificationTypes.DOMINATION_VALUE_REACHED:
                    case EndGameNotificationTypes.DOMINATION_LAST_STAND_FAILED:
                    case EndGameNotificationTypes.OLYMPUS_POST_TEMPLE_STAGE_STARTED:
                    case EndGameNotificationTypes.OLYMPUS_OLYMPUS_CONQUERED:
                        text = this.l10n[type].description(linked_alliance_name, own_alliance);
                        break;
                    case EndGameNotificationTypes.OLYMPUS_SMALL_TEMPLE_STAGE_STARTED:
                        text = this.controller.getAdditionalData().text;
                        break;
                    default:
                        text = this.l10n[type].description;
                }
                return text;
            },

            getBannerTitleDependingOnType: function (type) {
                return type === EndGameNotificationTypes.OLYMPUS_SMALL_TEMPLE_STAGE_STARTED ?
                    this.controller.getAdditionalData().subject :
                    this.l10n[type].banner_title;
            },

            render: function () {
                var notification_type = this.controller.getNotificationType();

                this.renderTemplate(this.$el, 'notification_popup', {
                    l10n: this.l10n,
                    notification_type: notification_type,
                    banner_title: this.getBannerTitleDependingOnType(notification_type),
                    description_text: this.getDescriptionTextDependingOnType()
                });

                this.registerButtonComponent();
                this.registerAllianceLink();
            },

            registerButtonComponent: function () {
                var $button = this.$el.find('.close_btn'),
                    notification_type = this.controller.getNotificationType(),
                    button_text = this.l10n.common.button;

                if (this.l10n[notification_type].button) {
                    button_text = this.l10n[notification_type].button;
                }

                this.unregisterComponent('notification_close_btn');
                this.registerComponent('notification_close_btn', $button.button({
                    caption: button_text
                }).on('btn:click', function () {
                    this.controller.window_model.close();
                }.bind(this)));
            },

            registerAllianceLink: function () {
                this.$el.find('.alliance_link').off().on('click', function () {
                    Layout.allianceProfile.open(this.controller.getAllianceName(), this.controller.getAllianceId());
                }.bind(this));
            },

            createAllianceLink: function () {
                if (this.controller.getAllianceId()) {
                    return '<span class="alliance_link">' + this.controller.getAllianceName() + '</span>';
                }
                return '';
            }
        });

    window.GameViews.NotificationPopupView = NotificationPopupView;

    return NotificationPopupView;

});
