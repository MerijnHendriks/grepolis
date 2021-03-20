/* globals Timestamp */

define('events/grepolympia/models/grepolympia_discipline', function(require) {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel');

	var GrepolympiaDiscipline = GrepolisModel.extend({
		urlRoot : 'GrepolympiaDiscipline',

		getSecondsToTheEndOfDiscipline: function() {
			var discipline_ends = this.getDisciplineStart() + this.getDisciplineDuration();
			return discipline_ends - Timestamp.now();
		},

		getDisciplineEndsAt: function() {
			return this.getDisciplineStart() + this.getDisciplineDuration();
		}
	});

	GrepolisModel.addAttributeReader(GrepolympiaDiscipline.prototype,
		'id',
		'discipline',
		'discipline_duration',
		'discipline_start'
	);

	// this is needed for the model manager to discover this model
	window.GameModels.GrepolympiaDiscipline = GrepolympiaDiscipline;

	return GrepolympiaDiscipline;
});