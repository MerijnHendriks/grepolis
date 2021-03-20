define('features/colonization/models/colonization', function () {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var Colonization = GrepolisModel.extend({
        urlRoot: 'Colonization',

        sendColonizer: function (params, callbacks) {
            this.execute('sendColonizer', params, callbacks);
        },

        getTargetInfo: function () {
            return {
                target_x: this.get('target_x'),
                target_y: this.get('target_y'),
                target_number_on_island: this.get('target_number_on_island')
            };
        },

        forceUpdate: function(params, callback) {
            this.execute('forceUpdate', params, callback);
        }
    });

    GrepolisModel.addAttributeReader(Colonization.prototype,
        'id',
        'enough_culture_points',
        'needed_culture_points',
        'duration',
        'distance',
        'island_info',
        'colonization_duration'
    );

    // this is needed for the model manager to discover this model
    window.GameModels.Colonization = Colonization;

    return Colonization;
});
