/*globals ConfirmationWindowData */

define('features/market/dialog/delete_all_offers_dialog', function() {
    'use strict';

    /**
     * Class which represents data to create confirmation window as information for the player
     * that all offers of the current page will be deleted and if he wants to proceed
     *
     * @param props {Object}
     *       @param onConfirm {Function}	confirmation button callback
     *       @param onCancel {Function}		cancel button callback
     *
     * @see ConfirmationWindowData class for details about all methods
     */
    function ConfirmationData(props) {
        ConfirmationWindowData.prototype.constructor.apply(this, arguments);
    }

    ConfirmationData.inherits(ConfirmationWindowData);

    ConfirmationData.prototype.getTitle = function() {
        return this.l10n.window_title;
    };

    ConfirmationData.prototype.getType = function() {
        return 'delete_all_market_offers';
    };

    ConfirmationData.prototype.getQuestion = function() {
        return this.l10n.question;
    };

    ConfirmationData.prototype.hasCheckbox = function() {
        return true;
    };

    return ConfirmationData;
});
