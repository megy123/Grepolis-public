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
    if ($(".command_info_units").get(0) && $(".gp_player_link").text().includes("hitmen2012"))
    {
        // Get movement duration
        const attacks = MM.getOnlyCollectionByName("MovementsUnits").getIncomingAttacks(5595);
        const movement = attacks.find(obj => obj.attributes.command_id === commandId);
        let time = (movement.attributes.arrival_at - movement.attributes.cap_of_invisibility_effective_until) * (1 / 0.9);
        let home_town_id = movement.attributes.home_town_id;
        let target_town_id = movement.attributes.target_town_id;
        let same_island = movement.attributes.same_island;

        //console.log("Time: ", time);

        // Data
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
            method: "GET", // match Grepolis behavior
            success: function (res) {
                //console.log("✅ Success:", res);
                let units = res.json.json.units;
                for( let unitName in units)
                {
                    let unit = units[unitName];
                    
                    if(same_island === false && !naval.includes(unit.id))continue;
                    //console.log(unit, Math.abs(unit.duration - time), predict_dur );

                    if(Math.abs(unit.duration - time) < predict_dur)
                    {
                        predict_unit = unit.id;
                        predict_dur = Math.abs(unit.duration - time);
                    }
                }

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

        if (!true) {
            console.log("action=>", action);
        }

        switch (action) {
            case "/command_info/info":
                const json = JSON.parse(xhr.responseText);
                console.log("parsed response:", json.json.command_id);
                generateUI(json.json.command_id);
                break;
        }
    });
}

/**
 * javascript:( () => {     
 * let attacks = MM.getOnlyCollectionByName("MovementsUnits").getIncomingAttacks(MM.getOnlyCollectionByName("Town").getCurrentTown().id);     
 * attacks.forEach((movement) => {         
 * console.log(movement);          
 * if (movement && movement.attributes) {             
 * let attacker = movement.attributes.town_name_origin;             
 * let time = (movement.attributes.arrival_at - movement.attributes.cap_of_invisibility_effective_until) * (1 / 0.9);             
 * const date = new Date(movement.attributes.arrival_at * 1000);              
 * const a_hours = date.getHours();             
 * const a_minutes = date.getMinutes();             
 * const a_seconds = date.getSeconds();              
 * let arrival = a_hours * 3600 + a_minutes * 60 + a_seconds;             
 * time = time + arrival;              
 * const hours = Math.floor(time / 3600);             
 * const minutes = Math.floor((time % 3600) / 60);             
 *  remainingSeconds = Math.round(time % 60);              
 * alert(attacker + " : " + `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`);         }     }); } )();
*/