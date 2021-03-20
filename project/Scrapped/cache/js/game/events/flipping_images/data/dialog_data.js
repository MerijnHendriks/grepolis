define("events/flipping_images/data/dialog_data", function() {
	'use strict';

	/**
	 * actions meaning:
	 * 0 - character don't move
	 * 1 - character appears on screen
	 * 2 - character disappears from screen
	 */

	return [
		{
			left_class : "priestess",
			right_class : "",
			active_name : "Priestess",
			active_direction: "left",
			action : 1,
			emoticon : ''
		},
		{
			left_class : "priestess",
			right_class : "hera",
			active_name : "Hera",
			active_direction: "right",
			action : 1,
			emoticon : ''
		},
		{
			left_class : "priestess",
			right_class : "hera",
			active_name : "Priestess",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_aware2_right'
		},
		{
			left_class : "priestess",
			right_class : "hera",
			active_name : "Hera",
			active_direction: "right",
			action : 0,
			emoticon : 'emote_excited'
		},
		{
			left_class : "priestess",
			right_class : "hera",
			active_name : "Priestess",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_confused'
		},
		{
			left_class : "priestess",
			right_class : "hera",
			active_name : "Priestess",
			active_direction: "left",
			action : 2,
			emoticon : ''
		},
		{
			left_class : "zeus",
			right_class : "hera",
			active_name : "Zeus",
			active_direction: "left",
			action : 1,
			emoticon : 'emote_angry'
		},
		{
			left_class : "zeus",
			right_class : "hera",
			active_name : "Hera",
			active_direction: "right",
			action : 0,
			emoticon : 'emote_drop_right'
		},
		{
			left_class : "zeus",
			right_class : "hera",
			active_name : "Hera",
			active_direction: "right",
			action : 2,
			emoticon : ''
		},
		{
			left_class : "zeus",
			right_class : "poseidon",
			active_name : "Poseidon",
			active_direction: "right",
			action : 1,
			emoticon : 'emote_excited'
		},
		{
			left_class : "zeus",
			right_class : "poseidon",
			active_name : "Zeus",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_drop_left'
		},
		{
			left_class : "zeus",
			right_class : "poseidon",
			active_name : "Poseidon",
			active_direction: "right",
			action : 0,
			emoticon : ''
		},
		{
			left_class : "zeus",
			right_class : "poseidon",
			active_name : "Zeus",
			active_direction: "left",
			action : 2,
			emoticon : 'emote_angry'
		},
		{
			left_class : "athena",
			right_class : "poseidon",
			active_name : "Athena",
			active_direction: "left",
			action : 1,
			emoticon : ''
		},
		{
			left_class : "athena",
			right_class : "poseidon",
			active_name : "Poseidon",
			active_direction: "right",
			action : 0,
			emoticon : 'emote_aware2'
		},
		{
			left_class : "athena",
			right_class : "poseidon",
			active_name : "Athena",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_pegasus'
		},
		{
			left_class : "athena",
			right_class : "poseidon",
			active_name : "Poseidon",
			active_direction: "right",
			action : 0,
			emoticon : 'emote_excited'
		},
		{
			left_class : "athena",
			right_class : "poseidon",
			active_name : "Poseidon",
			active_direction: "right",
			action : 2,
			emoticon : ''
		},
		{
			left_class : "athena",
			right_class : "",
			active_name : "Athena",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_love'
		},
		{
			left_class : "athena",
			right_class : "hera",
			active_name : "Hera",
			active_direction: "right",
			action : 1,
			emoticon : 'emote_lightning'
		},
		{
			left_class : "athena",
			right_class : "hera",
			active_name : "Athena",
			active_direction: "left",
			action : 0,
			emoticon : 'emote_aware'
		}
	];
});