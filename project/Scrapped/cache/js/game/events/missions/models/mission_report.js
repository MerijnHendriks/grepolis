define('events/missions/models/mission_report', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var MissionReport = GrepolisModel.extend({
        urlRoot: 'MissionReport',

        markAsRead: function(callback) {
            this.execute('markAsRead', {
                mission_id: this.getMissionId()
            }, callback);
        },

        onChange : function(obj, callback) {
            obj.listenTo(this, 'change', callback);
        }
    });

    GrepolisModel.addAttributeReader(MissionReport.prototype,
        'player_id',
        'mission_id',
        'title',
        'mission_success',
        'rewards'
    );

    // this is needed for the model manager to discover this model
    window.GameModels.MissionReport = MissionReport;

    return MissionReport;
});