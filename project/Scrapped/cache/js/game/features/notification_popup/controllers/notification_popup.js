// Notification popup controller
define('features/notification_popup/controllers/notification_popup', function () {
    'use strict';

    var GameControllers = require_legacy('GameControllers'),
        GrepoNotificationStack = require_legacy('GrepoNotificationStack'),
        EndGameNotificationTypes = require('enums/end_game_notification_types'),
        NotificationPopupView = require('features/notification_popup/views/notification_popup'),
        eventTracking = window.eventTracking,
        POPUP = require('enums/json_tracking').WINDOW_POPUP;

    return GameControllers.TabController.extend({

        initialize: function (options) {
            GameControllers.TabController.prototype.initialize.apply(this, arguments);
            this.setOnBeforeClose(this.handleCloseView.bind(this));
        },

        getAdditionalData: function() {
            return this.getWindowModel().getArguments().additional_data;
        },

        getNotificationType: function () {
            return this.getWindowModel().getArguments().notification_type;
        },

        getAllianceName: function () {
            return this.getWindowModel().getArguments().additional_data.alliance_name;
        },

        getAllianceId: function () {
            return this.getWindowModel().getArguments().additional_data.alliance_id;
        },

        isOwnAlliance: function () {
            var alliance_id = this.getAllianceId(),
                own_alliance_id = this.getModel('player').getAllianceId();
            return own_alliance_id === alliance_id;
        },

        getFinalDominationValue: function () {
            return this.getWindowModel().getArguments().additional_data.final_domination_value;
        },

        getMainNotificationType: function () {
            return this.getWindowModel().getArguments().additional_data.main_notification_type;
        },

        getNotificationId: function () {
            return this.getWindowModel().getArguments().additional_data.notification_id;
        },

        getWindowTitle: function (type) {
            if (type === EndGameNotificationTypes.OLYMPUS_SMALL_TEMPLE_STAGE_STARTED &&
                this.getAdditionalData().title
            )  {
                return this.getAdditionalData().title;
            }

            if (this.l10n[type].window_title) {
                return this.l10n[type].window_title;
            }

            return this.l10n.common.window_title;
        },

        renderPage: function () {
            var notification_type = this.getNotificationType();

            this.initializeView();
            this.setWindowTitle(this.getWindowTitle(notification_type));

            if (notification_type === EndGameNotificationTypes.DOMINATION_ERA_STARTED) {
                this.window_model.bringToFront();
            }
        },

        initializeView: function () {
            this.view = new NotificationPopupView({
                controller: this,
                el: this.$el
            });
        },

        handleCloseView: function () {
            var notification_type = this.getNotificationType();

            GrepoNotificationStack.deleteNotificationDependingOnTypeAndId(this.getNotificationId(), this.getMainNotificationType());
            if (notification_type === EndGameNotificationTypes.DOMINATION_ERA_STARTED) {
                eventTracking.logJsonEvent(POPUP, {
                    'name': notification_type,
                    'action': 'close'
                });
            }
        }
    });
});
