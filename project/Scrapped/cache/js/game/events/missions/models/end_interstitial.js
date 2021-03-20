define('events/missions/models/end_interstitial', function() {
    'use strict';

    var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
    var InfopageMissionsEndInterstitial = BenefitWithPreconditions.extend({
        _satisfiesPrerequisites : function() {
            return this._hasSenateOnLevelGreaterOrEqualThan(3);
        }
    });

    window.GameModels.InfopageMissionsEndInterstitial = InfopageMissionsEndInterstitial;
    return InfopageMissionsEndInterstitial;
});