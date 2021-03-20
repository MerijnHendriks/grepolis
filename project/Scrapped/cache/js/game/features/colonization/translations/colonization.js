/* global DM */
define("features/colonization/translations/colonization", function () {
    'use strict';

    DM.loadData({
        l10n: {
            colonization: {
                window_title: _("Found a new city on island"),
                tabs: [],
                colonizing_info: _("Colonizing information"),
                island_info: _("Island information"),
                colonizing_time: _("Colonizing time"),
                found_city: _("Found City"),
                no_requirements: _("You have not reached the requirements yet."),
                requirements : _("Requirements:"),
                academy: _("Academy"),
                research_colo : _("Research: Colony Ship"),
                docks: _("Harbour"),
                colo: _("Colony Ship"),
                foundation: _("Foundation"),
                city_slots: _("City slots: 1"),
                tooltips: {
                    travel_time: _("Travel times simulator"),
                    colonization: {
                        buildings_in_new_city: _("Buildings in the new city:"),
                        total_points: function (points) {
                            return s(_("Total points: %1"), points);
                        }
                    },
                    island_info: {
                        island: function (island_id) {
                            return s(_("Island %1"), island_id);
                        },
                        ocean : _("Ocean"),
                        free_spaces: _("Free spaces:"),
                        with_farms : {
                            title : _("Large Island:"),
                            summary: function (bpv_enabled) {
                                var number_of_farm_towns = 8;
                                if (bpv_enabled) {
                                    number_of_farm_towns = 6;
                                }
                                return s(_("%1 farming village spots"), number_of_farm_towns);
                            },
                            description : _("This island has the same characteristics as the one you started in, it is the ideal location for a new city.")
                        },
                        no_farms : {
                            title : _("Small Island:"),
                            summary: function(bpv_enabled) {
                                return _("No farming villages");
                            },
                            description : _("This island does not have farming villages, be aware that without supporting cities, this city's progression might be slower.")
                        }
                    }
                }
            }
        }
    });
});