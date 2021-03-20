define('events/missions/models/extra_reward', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var MissionsExtraReward = GrepolisModel.extend({
        urlRoot: 'MissionsExtraReward',

        getRewardData: function () {
            return {
                level_id: this.getLevel(),
                power_id: this.getRewardId(),
                configuration: this.getRewardConfiguration()
            };
        }
    });

    GrepolisModel.addAttributeReader(MissionsExtraReward.prototype,
        'id',
        'happening_id',
        'index',
        'level',
        'player_id',
        'reward_configuration',
        'reward_id',
        'reward_level',
        'skin_id'
    );

    // this is needed for the model manager to discover this model
    window.GameModels.MissionsExtraReward = MissionsExtraReward;

    return MissionsExtraReward;
});
