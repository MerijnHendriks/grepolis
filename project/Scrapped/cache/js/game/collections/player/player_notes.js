/*global GameModels */
(function() {
	'use strict';

	var GrepolisCollection = window.GrepolisCollection;
	var PlayerNote = window.GameModels.PlayerNote;

	var CollectionClass = function() {}; // never use this, because it will be overwritten

	CollectionClass.model = PlayerNote;
	CollectionClass.model_class = 'PlayerNote';

	CollectionClass.getNotes = function() {
		return this.models;
	};

	CollectionClass.getNotesCount = function() {
		return this.models.length;
	};

	CollectionClass.getNoteForTabIndex = function(tab_index) {
		return this.models[tab_index] || null;
	};

	CollectionClass.createNote = function(title, callbacks) {
		var note = new GameModels.PlayerNote({
			title : title,
			text : ''
		});

		note.create(callbacks);
	};

	CollectionClass.onNotesCountChange = function(obj, callback) {
		obj.listenTo(this, 'add remove', callback);
	};

	window.GameCollections.PlayerNotes = GrepolisCollection.extend(CollectionClass);
}());
