/*global window */

define('events/grepolympia/models/grepolympia_match', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');
	var GrepolympiaMatch = GrepolisModel.extend({
		urlRoot : 'GrepolympiaMatch',

        fetchMatch: function (discipline_id, callback) {
            this.execute('getMatch', {discipline_id: discipline_id}, function(data) {
                this.set(data);

                if (callback) {
                    callback();
                }
            }.bind(this));
        },

		onChange: function (obj, callback) {
			obj.listenTo(this, 'change', callback);
		}
	});

	GrepolisModel.addAttributeReader(GrepolympiaMatch.prototype,
		'reward',
		'award',
		'community_score',
		'opponent_score',
		'top_teams'
	);

	window.GameModels.GrepolympiaMatch = GrepolympiaMatch;
	return GrepolympiaMatch;
});
