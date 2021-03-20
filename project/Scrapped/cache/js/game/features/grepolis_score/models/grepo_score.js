define('grepolis_score/models/grepo_score', function() {
	'use strict';

	var GrepolisModel = window.GrepolisModel;

	var GrepoScore = GrepolisModel.extend({
		urlRoot: 'GrepoScore',

		onChange: function(obj, callback) {
			obj.listenTo(this, 'change', callback);
		},

		getWorldScores: function() {
			return this.get('world_scores').sort(function(a, b) {
				return a.order_index - b.order_index;
			});
		}
	});

	GrepolisModel.addAttributeReader(GrepoScore.prototype,
		'total_score'
	);

	window.GameModels.GrepoScore = GrepoScore;
	return GrepoScore;
});
