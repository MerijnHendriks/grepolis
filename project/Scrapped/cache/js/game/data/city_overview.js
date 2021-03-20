(function(window) {
	"use strict";

	/*
	 * TODO: move the JSON configuration for the positions
	 */
	var positions = {
		"academy" : {"x" : 984, "y" : 367},
		"barracks" : {"x" : 793, "y" : 465},
		"docks" : {"x" : 861, "y" : 661},
		"farm" : {"x" : 1192, "y" : 433},
		"hide" : {"x" : 1068, "y" : 666},
		"ironer" : {"x" : 736, "y" : 362},
		"library" : {"x" : 854, "y" : 345},
		"lighthouse" : {"x" : 641, "y" : 638},
		"lumber" : {"x" : 1092, "y" : 714},
		"main" : {"x" : 1018, "y" : 457},
		"market" : {"x" : 1192, "y" : 531},
		"oracle" : {"x" : 1151, "y" : 636},
		"ship" : {"x" : 947, "y" : 911},
		"statue" : {"x" : 1140, "y" : 624},
		"stoner" : {"x" : 696, "y" : 531},
		"storage" : {"x" : 949, "y" : 566},
		"temple" : {"x" : 669, "y" : 411},
		"theater" : {"x" : 855, "y" : 360},
		"thermal" : {"x" : 859, "y" : 340},
		"tower" : {"x" : 1141, "y" : 610},
		"trade_office" : {"x" : 1142, "y" : 618},
		"trader" : {"x" : 750, "y" : 673},
		"wall" : {"x" : 625, "y" : 398},
		"place" : {"x" : 1110, "y" : 560}
	};

	var map_points = {
		"academy" : "58,0,19,22,8,49,5,84,67,109,84,108,139,78,132,49,118,22,78,1",
		"barracks" : "82,3,70,23,17,59,23,81,86,105,120,104,178,68,175,41,115,15,111,1",
		"docks" : "81,0,26,18,20,52,0,65,2,88,68,114,120,112,194,89,206,34,144,2",
		"farm" : "0,0,1,47,93,99,125,99,204,75,205,57,138,31,139,17,85,0",
		"hide" : "0,0,0,27,24,27,24,0",
		"ironer" : "24,1,0,15,2,44,45,73,96,59,92,44,61,12",
		"library" : "83,1,9,38,9,72,47,92,99,69,138,63,139,37,123,12,110,0",
		"lighthouse" : "57,1,50,44,11,46,10,66,45,90,76,105,109,78,123,55,120,44,82,41,78,1",
		"lumber" : "13,0,16,52,64,64,80,32,76,0",
		"main" : "106,0,88,18,42,42,4,58,6,96,71,123,153,97,193,59,181,23,128,1",
		"market" : "38,1,8,28,0,57,35,88,94,89,115,75,111,33,78,1",
		"oracle" : "25,0,10,11,6,44,25,61,64,61,82,46,76,36,74,11,59,1",
		"statue" : "34,1,32,30,16,59,43,75,81,71,90,53,62,40,58,1",
		"stoner" : "0,0,2,30,24,31,26,65,27,117,80,140,130,132,155,131,208,106,208,78,149,63,95,51,73,1",
		"storage" : "47,1,20,22,23,52,101,83,141,66,135,23,97,7,82,5",
		"temple" : "50,1,34,28,32,71,62,91,101,84,118,73,113,52,97,21,92,0",
		"theater" : "44,0,14,12,13,26,0,30,1,54,72,87,102,82,139,61,144,38,127,17,99,0",
		"thermal" : "69,3,1,41,2,75,50,96,95,95,159,58,159,25,95,0",
		"tower" : "35,0,18,25,18,82,47,90,81,86,105,61,83,41,82,19,63,0",
		"trade_office" : "42,0,11,17,12,65,53,83,88,80,117,69,115,41,94,20,58,4",
		"trader" : "49,1,19,38,0,72,3,102,59,90,111,63,110,30,70,8",
		"wall" : "0,39,0,82,33,105,56,127,142,128,151,154,176,187,232,189,298,199,291,246,336,246,403,271,472,259,467,286,549,326,654,306,731,287,778,283,923,196,1103,121,1107,54,1057,1,1039,0,1076,71,1077,127,926,189,915,169,719,287,659,294,586,297,525,294,495,268,492,223,425,237,371,229,319,218,305,170,248,164,181,152,161,126,161,103,77,99,42,81",
		"place": "33,2,11,40,33,68,91,67,76,3"
	};

	window.GameData.city_overview = {
		click_map: {
			start_offsets : positions,
			map_points : map_points
		}
	};

	var GameDataCityOverview = {

	};

	window.GameDataCityOverview = GameDataCityOverview;
}(window));
