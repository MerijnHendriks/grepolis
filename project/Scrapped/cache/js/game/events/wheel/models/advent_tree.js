/* globals GrepolisModel */

(function() {
	'use strict';

	var AdventTree = function () {}; // never use this, because it will be overwritten
	AdventTree.urlRoot = 'AdventTree';

	GrepolisModel.addAttributeReader(AdventTree,
		'refill_base_costs',
		'shards_collected'
	);

	window.GameModels.AdventTree = GrepolisModel.extend(AdventTree);
}());
