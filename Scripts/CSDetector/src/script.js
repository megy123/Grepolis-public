// ==UserScript==
// @name         CSDetector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Detecting slowest unit in icoming attack
// @author       Megy
// @match        https://*.grepolis.com/game/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=grepolis.com
// @grant        none
// ==/UserScript==

const naval = ["attack_ship", "big_transporter", "bireme", "colonize_ship", "sea_monster", "small_transporter", "trireme", "manticore", "siren", "ladon", "harpy", "griffin", "pegasus"];


function generateUI(commandId) {
    const defenderDiv = document.querySelector('.defender');

    const townName = defenderDiv.querySelector('.gp_town_link')?.textContent.trim();
    const playerName = defenderDiv.querySelector('.gp_player_link')?.textContent.trim();
    const targetCity = Object.entries(MM.getModelsForClass("Town")).find(([key, value]) => value.attributes.name === townName)[1];

    if ($(".command_info_units").get(0) && Game.player_name === playerName)
    {
        // Get movement duration
        console.log(targetCity);
        const attacks = MM.getOnlyCollectionByName("MovementsUnits").getIncomingAttacks(targetCity.id);
        const movement = attacks.find(obj => obj.attributes.command_id === commandId);
        if(!movement)return;

        let time = (movement.attributes.arrival_at - movement.attributes.cap_of_invisibility_effective_until) * (1 / 0.9);
        let home_town_id = movement.attributes.home_town_id;
        let target_town_id = movement.attributes.target_town_id;
        let same_island = movement.attributes.same_island;

        //Ajax Data
        const data = {
            id: home_town_id,
            town_id: target_town_id,
            nl_init: true
        };
        const h = Game.csrfToken;
        const json = encodeURIComponent(JSON.stringify(data));
        const timestamp = Date.now();
        const url = `https://sk102.grepolis.com/game/town_info?town_id=${target_town_id}&action=attack&h=${h}&json=${json}&_=${timestamp}`;

        // Predicted unit
        let predict_unit = undefined;
        let predict_dur = Number.MAX_SAFE_INTEGER;

        $.ajax({
            url: url,
            method: "GET",
            success: function (res) {
                // Calculate unit
                let units = res.json.json.units;
                for( let unitName in units)
                {
                    let unit = units[unitName];
                    
                    if(same_island === false && !naval.includes(unit.id))continue;

                    if(Math.abs(unit.duration - time) < predict_dur)
                    {
                        predict_unit = unit.id;
                        predict_dur = Math.abs(unit.duration - time);
                    }
                }
                //style="border: 2px solid red;background-color: #fff8dc;border-radius: 4px;"
                // Print out slowest unit
                $(".command_info_units").append(
                    '<div class="unit_container">' +
                    '<div class="unit index_unit bold unit_icon40x40 ' + predict_unit + '  " data-unit_id="' + predict_unit + '" data-unit_count="0">' +
                    '<span></span>' +
                    '</div></div>'
                );
            },
            error: function (xhr) {
                console.error("❌ Error:", xhr.status, xhr.statusText, xhr.responseText);
            }
        });

        

    }
}

setTimeout(() => { ajaxObserver(); }, 0);
function ajaxObserver() {
    $(document).ajaxComplete(function (e, xhr, opt) {
        var url = opt.url.split("?"), action = "";

        if (typeof (url[1]) !== "undefined" && typeof (url[1].split(/&/)[1]) !== "undefined") {
            action = url[0].substr(5) + "/" + url[1].split(/&/)[1].substr(7);
        }

        switch (action) {
            case "/command_info/info":
                const json = JSON.parse(xhr.responseText);
                generateUI(json.json.command_id);
                break;
        }
    });
}