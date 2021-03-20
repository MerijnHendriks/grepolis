define('features/casual_worlds_blessed_town/models/casual_worlds_blessed_town', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var CasualWorldsBlessedTown = GrepolisModel.extend({
        urlRoot: 'CasualWorldsBlessedTown',

        setBlessedTown:  function(town_id, callback) {
            this.execute('setBlessedTown', {
                town_id: town_id
            }, callback);
        },

        onChange: function(obj, callback) {
            obj.listenTo(this, 'change', callback);
        }
    });

    GrepolisModel.addAttributeReader(CasualWorldsBlessedTown.prototype,
        'id',
        'cooldown_ends_at',
        'town_id',
        'town_name',
        'town_link'
    );

    window.GameModels.CasualWorldsBlessedTown = CasualWorldsBlessedTown;

    return CasualWorldsBlessedTown;
});
