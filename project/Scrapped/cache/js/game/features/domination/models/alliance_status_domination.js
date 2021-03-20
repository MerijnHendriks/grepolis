define('features/domination/models/alliance_status_domination', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var AllianceStatusDomination = GrepolisModel.extend({
        urlRoot: 'AllianceStatusDomination'
    });

    GrepolisModel.addAttributeReader(AllianceStatusDomination.prototype,
        'id',
        'alliance_id',
        'last_stand_started_at_timestamp',
        'last_stand_finished_at_timestamp'
    );

    window.GameModels.AllianceStatusDomination = AllianceStatusDomination;

    return AllianceStatusDomination;
});
