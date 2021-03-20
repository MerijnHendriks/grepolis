/*global define */

define('grepolis_score/models/grepo_score_category_hash', function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;
	var GrepoScoreCategoryHash = function() {};

	GrepoScoreCategoryHash.urlRoot = 'GrepoScoreCategoryHash';

	GrepolisModel.addAttributeReader(GrepoScoreCategoryHash,
		'id',
		'category',
		'hash'
	);

	window.GameModels.GrepoScoreCategoryHash = GrepolisModel.extend(GrepoScoreCategoryHash);
	return window.GameModels.GrepoScoreCategoryHash;
});
