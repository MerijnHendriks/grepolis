/* global window*/
define('market/models/create_offers', function(require) {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var CreateOffers = GrepolisModel.extend({
		urlRoot : 'CreateOffers',
		action : 'createOfferForm',

		onChange : function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},

		createOffer : function(params) {
			this.execute('createOffer', params);
		}
	});

	GrepolisModel.addAttributeReader(CreateOffers.prototype,
		'current_level',
		'has_alliance',
		'max_capacity',
		'max_trade_ratio',
		'visibility_options'
	);

	window.GameModels.CreateOffers = CreateOffers;
	return CreateOffers;

});
