define('events/missions/models/welcome', function() {
    'use strict';

    var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
    var InfopageMissionsWelcome = BenefitWithPreconditions.extend({
        _satisfiesPrerequisites : function() {
            return this._hasSenateOnLevelGreaterOrEqualThan(3);
        }
    });

    window.GameModels.InfopageMissionsWelcome = InfopageMissionsWelcome;
    return InfopageMissionsWelcome;
});