define('events/grepolympia/models/ranking', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var GrepolympiaDisciplineRanking = GrepolisModel.extend({
		urlRoot : 'GrepolympiaDisciplineRanking',

		getRows : function() {
			return this.get('data');
		},

		getPerPage : function() {
			return this.get('limit');
		},

		getActivePage : function() {
			return (this.getOffset() / this.getPerPage());
		},

		fetchPage : function(source, filter, offset, name, callback) {
			var _self = this;

			this.execute('getGrepolympiaRanking', {source : source, filter : filter, offset : offset, name : name}, function(data) {
				_self.set(data);
				if (callback) {
					callback();
				}
			});
		},

		searchRankings : function(source, filter, name) {
			var _self = this;

			this.execute('searchGrepolympiaRankings', {name : name, source : source, filter : filter}, function(data) {
				_self.set(data);
			});
		},

		onDataChange : function(obj, callback) {
			obj.listenTo(this, 'change:data', callback);
		},

		onTotalRowsChange : function(obj, callback) {
			obj.listenTo(this, 'change:total_rows', callback);
		},

		onSourceChange : function(obj, callback) {
			obj.listenTo(this, 'change:source', callback);
		},

		onFilterChange : function(obj, callback) {
			obj.listenTo(this, 'change:filter', callback);
		}
	});

	GrepolisModel.addAttributeReader(GrepolympiaDisciplineRanking.prototype,
		'id',
		'filter',
		'source',
		'total_rows',
		'offset'

	);

	// this is needed for the model manager to discover this model
	window.GameModels.GrepolympiaDisciplineRanking = GrepolympiaDisciplineRanking;

	return GrepolympiaDisciplineRanking;
});
