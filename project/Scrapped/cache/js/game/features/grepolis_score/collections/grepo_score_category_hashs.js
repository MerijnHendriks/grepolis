define('grepolis_score/collections/grepo_score_category_hashes', function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var GrepoScoreCategoryHash = require('grepolis_score/models/grepo_score_category_hash');

	var GrepoScoreCategoryHashs = function() {};

	GrepoScoreCategoryHashs.model = GrepoScoreCategoryHash;
	GrepoScoreCategoryHashs.model_class = 'GrepoScoreCategoryHash';

	GrepoScoreCategoryHashs.getHashForCategory = function (category) {
		var categoryHash = this.findWhere({category : category});
		return categoryHash && categoryHash.getHash();
	};

	GrepoScoreCategoryHashs.updateCategoryHash = function (category, hash) {
		this.execute('updateCategoryHash', {category: category, hash: hash});
	};

	window.GameCollections.GrepoScoreCategoryHashs = GrepolisCollection.extend(GrepoScoreCategoryHashs);

	return window.GameCollections.GrepoScoreCategoryHashs;
});