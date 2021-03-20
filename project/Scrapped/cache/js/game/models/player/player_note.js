(function() {

	var Model = function() {};

	Model.urlRoot = 'PlayerNote';

	GrepolisModel.addAttributeReader(Model,
		'html',
		'text'
	);

	Model.getId = function() {
		return this.get('id');
	};

	Model.getTitle = function() {
		return this.get('title') || DM.getl10n('notes', 'default_note_tab_name');
	};

	Model.isJustCreated = function() {
		return this.get('just_created') === true;
	};

	Model.create = function(callbacks) {
		this.execute('create', {
			title : this.getTitle(),
			text: this.getText()
		}, callbacks);
	};

	Model.save = function(text, callbacks) {
		this.execute('save', {
			id : this.getId(),
			text: text
		}, callbacks);
	};

	Model.rename = function(title, callbacks) {
		this.execute('rename', {
			id : this.getId(),
			title: title
		}, callbacks);
	};

	Model.remove = function(callbacks) {
		this.execute('remove', {
			id : this.getId()
		}, callbacks);
	};

	window.GameModels.PlayerNote = GrepolisModel.extend(Model);
}());
