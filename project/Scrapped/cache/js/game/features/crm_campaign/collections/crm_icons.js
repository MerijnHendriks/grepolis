define('features/crm_campaign/collections/crm_icons', function () {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var CrmIconModel = require('features/crm_campaign/models/crm_icon');

	var CrmIcons = GrepolisCollection.extend({
		model: CrmIconModel,
		model_class: 'CrmIcon',

		onAdd: function (obj, callback) {
			obj.listenTo(this, 'add', callback);
		},

		onDelete: function (obj, callback) {
			obj.listenTo(this, 'remove', callback);
		}
	});

	window.GameCollections.CrmIcons = CrmIcons;

	return CrmIcons;

});
