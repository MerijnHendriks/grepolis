define('events/missions/models/plot_interstitial', function() {
    'use strict';

    var BenefitWithPreconditions = window.GameModels.BenefitWithPreconditions;
    var InfopageMissionsPlotInterstitial = BenefitWithPreconditions.extend({
        _satisfiesPrerequisites : function() {
            return this._hasSenateOnLevelGreaterOrEqualThan(3);
        }
    });

    window.GameModels.InfopageMissionsPlotInterstitial = InfopageMissionsPlotInterstitial;
    return InfopageMissionsPlotInterstitial;
});