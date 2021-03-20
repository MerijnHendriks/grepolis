/*globals GrepolisModel */

(function() {
	'use strict';

	function AdventCostModifier() {}

	AdventCostModifier.urlRoot = 'AdventCostModifier';

	GrepolisModel.addAttributeReader(AdventCostModifier,
		'modifier',
		'subtype',
		'type'
	);

	window.GameModels.AdventCostModifier = GrepolisModel.extend(AdventCostModifier);
}());
