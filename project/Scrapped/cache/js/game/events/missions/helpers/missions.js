/*globals MM, DM*/

define('events/missions/helpers/missions', function () {
    var BenefitHelper = require('helpers/benefit');

    return {
        getl10nForMissionSkin: function () {
            var missions_skin = BenefitHelper.getBenefitSkin();
            return DM.getl10n(missions_skin);
        },

        getEventEndAt: function () {
            var benefits = MM.getOnlyCollectionByName('Benefit'),
                benefit = benefits.getFirstRunningBenefitOfType('largeicon');

            if (benefits.length > 0 && benefit) {
                return benefit.getEnd();
            }
            return 0;
        }
    };
});