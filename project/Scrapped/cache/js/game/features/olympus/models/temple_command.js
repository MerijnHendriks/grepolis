define('olympus/models/temple_command', function () {
	'use strict';

	var GrepolisModel = require_legacy('GrepolisModel'),
		TempleCommand = GrepolisModel.extend({
			urlRoot: 'TempleCommand'
		});

	GrepolisModel.addAttributeReader(TempleCommand.prototype,
		'id',
		'temple_id',
		'count_attacks',
		'count_supports'
	);

	window.GameModels.TempleCommand = TempleCommand;

	return TempleCommand;
});