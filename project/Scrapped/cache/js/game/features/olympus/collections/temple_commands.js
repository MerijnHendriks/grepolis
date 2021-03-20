define('olympus/collections/temple_commands', function () {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection,
		TempleCommand = require('features/olympus/models/temple_command');

	var TempleCommands = GrepolisCollection.extend({
		model: TempleCommand,
		model_class: 'TempleCommand',

		getTempleCommands: function () {
			return this.models;
		},

		onAddRemove: function (obj, callback) {
			obj.listenTo(this, 'add remove', callback);
		},

		onCountAttacksChange: function (obj, callback) {
			obj.listenTo(this, 'change:count_attacks', callback);
		},

		onCountSupportsChange: function (obj, callback) {
			obj.listenTo(this, 'change:count_supports', callback);
		}
	});

	window.GameCollections.TempleCommands = TempleCommands;

	return TempleCommands;
});