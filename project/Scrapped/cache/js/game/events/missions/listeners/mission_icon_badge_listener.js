/* global us, Backbone, GameEvents */
(function() {
    'use strict';

    var MissionIconBadgeListener = {

        isMissionLevelUpdate: function() {
            if (this.status_model.getCooldownTime() === 0 &&
                this.status_model.getSubLevel() === this.status_model.getSubLevelsRequired()) {

               return true;
            }
            return false;
        },

        isReportAvailable: function() {
            return this.report_model.getMissionSuccess() !== null && typeof this.report_model.getMissionSuccess() !== 'undefined';
        },

        showHideBadge: function() {
            var $badge_amount = $('#happening_large_icon.missions .amount');

            $badge_amount.hide();
            if (this.isMissionLevelUpdate() || this.isReportAvailable()) {
                $badge_amount.text('!').show();
            }
        },

        initialize : function(models, collections) {
            this.status_model = models.mission_status;
            this.report_model = models.mission_report;

            $.Observer(GameEvents.happenings.icon.initialize).unsubscribe(['mission_badge_icon']);
            $.Observer(GameEvents.happenings.icon.initialize).subscribe(['mission_badge_icon'], this.showHideBadge.bind(this));

            this.stopListening();
            this.status_model.onChange(this, this.showHideBadge.bind(this));
            this.report_model.onChange(this, this.showHideBadge.bind(this));
        },

        destroy : function() {

        }
    };

    us.extend(MissionIconBadgeListener, Backbone.Events);

    window.GameListeners.MissionIconBadgeListener = MissionIconBadgeListener;
}());
