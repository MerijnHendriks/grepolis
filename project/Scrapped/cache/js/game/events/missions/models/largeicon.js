define('events/missions/models/largeicon', function() {
    'use strict';

    var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
    var LargeiconMissions = BenefitWithPreconditions.extend({
        _satisfiesPrerequisites : function() {
            return this._hasSenateOnLevelGreaterOrEqualThan(3);
        }
    });

    window.GameModels.LargeiconMissions = BenefitWithPreconditions.extend(LargeiconMissions);
    return LargeiconMissions;
});