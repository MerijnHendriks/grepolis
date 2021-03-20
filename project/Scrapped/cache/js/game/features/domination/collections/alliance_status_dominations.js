define('features/domination/collections/alliance_status_dominations', function (require) {
    'use strict';

    var GrepolisCollection = require_legacy('GrepolisCollection'),
        AllianceStatusDomination = require('features/domination/models/alliance_status_domination');

    var AllianceStatusDominations = GrepolisCollection.extend({
        model: AllianceStatusDomination,
        model_class: 'AllianceStatusDomination',

        startLastStand: function (callback) {
            this.execute('startLastStandMode', {}, callback);
        },

        getLastStandStartedAtTimestamp: function () {
            if (this.length > 0) {
                return this.getFirstModel().getLastStandStartedAtTimestamp();
            }
        },

        getLastStandFinishedAtTimestamp: function () {
            if (this.length > 0) {
                return this.getFirstModel().getLastStandFinishedAtTimestamp();
            }
        },

        onStatusChange: function (obj, callback) {
            obj.listenTo(this, 'add change', callback);
        }
    });

    window.GameCollections.AllianceStatusDominations = AllianceStatusDominations;

    return AllianceStatusDominations;
});