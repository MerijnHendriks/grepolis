(function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var CrmCampaign = window.GameModels.CrmCampaign;

	function CrmCampaigns() {}

	CrmCampaigns.model = CrmCampaign;
	CrmCampaigns.model_class = 'CrmCampaign';

	CrmCampaigns.getCampaigns = function() {
		return this.models;
	};

	/**
	 * Listens on the event fired when new campaign is added
	 *
	 * @param {BaseController} obj
	 * @param {Function} callback
	 */
	CrmCampaigns.onAdd = function(obj, callback) {
		obj.listenTo(this, 'add', callback);
	};

	window.GameCollections.CrmCampaigns = GrepolisCollection.extend(CrmCampaigns);
}());
