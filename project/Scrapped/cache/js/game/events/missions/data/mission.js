define('events/missions/data/mission', function () {

    return {
        getAllRewards: function () {
            return window.Game.mission_event.box_rewards;
        },
        getRewardForLevel: function (level_id) {
            return us.findWhere(this.getAllRewards(), {level_id: level_id});
        },
        getMaxRewardLevel: function() {
            return window.Game.mission_event.box_rewards.length - 1;
        }
    };
});