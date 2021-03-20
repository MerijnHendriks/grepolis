define('events/missions/models/mission_status', function (require) {
    'use strict';

    var GrepolisModel = require_legacy('GrepolisModel');

    var MissionStatus = GrepolisModel.extend({
        urlRoot: 'MissionStatus',

        levelUp:  function(callback) {
            this.execute('levelUp', {}, callback);
        },

        skipLevelUpCooldown : function(callback) {
            this.execute('skipLevelUpCooldown', {
                estimated_cost: this.getRemoveLevelUpCooldownCost()
            }, callback);
        },

        trashReward: function(level_id, callbacks) {
            this.execute('trashReward', {
                level: level_id
            }, callbacks);
        },

        useReward: function(level_id, callbacks) {
            this.execute('useReward', {
                level: level_id
            }, callbacks);
        },

        stashReward: function(level_id, callbacks) {
            this.execute('stashReward', {
                level: level_id
            }, callbacks);
        },

        isRewardClaimed: function(level_id) {
            var claimed = this.getLevelRewardsClaimed();
            return claimed && claimed.length && claimed.indexOf(level_id) > -1;
        },

        onChange : function(obj, callback) {
            obj.listenTo(this, 'change', callback);
        }
    });

    GrepolisModel.addAttributeReader(MissionStatus.prototype,
        'id',
        'happening_id',
        'level',
        'maximum_level',
        'mission_boost_cooldown_time',
        'player_id',
        'sub_level',
        'sub_levels_required',
        'cooldown_time',
        'level_up_cooldown_minutes',
        'mission_boost_cooldown_minutes',
        'mission_boost_cooldown_time',
        'mission_boost_cost',
        'swap_mission_cost',
        'level_rewards_claimed',
        'remove_level_up_cooldown_cost'
    );

    // this is needed for the model manager to discover this model
    window.GameModels.MissionStatus = MissionStatus;

    return MissionStatus;
});
