//úspešné odoslanie útoku

async function cancelAttack(commandId) {
    const data = {
        id: commandId,
        town_id: 883,
        nl_init: true,
    };
    
    const h = Game.csrfToken;
    const url = `game/town_overviews?town_id=883&action=cancel_command&h=${h}`;

    $.ajax({
        url: url,
        method: "POST",
        data: {json: JSON.stringify(data)},
        success: function(res) {
            //console.log("✅ Attack canceled successfully:", res);
        },
        error: function(xhr) {
            console.error("❌ Error canceling attack:", xhr.status, xhr.statusText, xhr.responseText);
        }
    });
}

async function timeAttack(time){
    const targetTime = time;
    //console.log(targetTime);

    const data = {
        rider: 132,
        id: 5178,       // 🏹 target town ID
        town_id: 883,   // 🏰 your town ID
        type: "attack",
        nl_init: true,
    };
    
    const h = Game.csrfToken;
    const url = `game/towninfo?town_id=883&action=send_units&h=${h}`;

    $.ajax({
        url: url,
        method: "POST",
        data: {json: JSON.stringify(data)},
        success: async function(res) {
            //console.log("✅ Attack sent successfully:", res);
            let arrivalTime;
            let commandId;
            if (res && res.json && Array.isArray(res.json.notifications)) {
                const movementNotification = res.json.notifications.find(n => n.subject === "MovementsUnits");

                if (movementNotification && movementNotification.param_str) {
                    const movementData = JSON.parse(movementNotification.param_str);

                    arrivalTime = movementData.MovementsUnits.arrival_at;
                    commandId = movementData.MovementsUnits.command_id;

                    //console.log("Arrival Time:", arrivalTime);
                    //console.log("Command ID:", commandId);
                } else {
                    console.error("❌ 'MovementsUnits' notification not found or invalid param_str.");
                }
            } else {
                console.error("❌ res.json.notifications is not an array or undefined.");
            }
            //console.log("ArrivalTime:", arrivalTime);

            if(targetTime === arrivalTime)
            {
                console.log("✅ Attack Timed successfully");
            }
            else
            {
                console.log(`Missed for about ${targetTime - arrivalTime} seconds. Retrying.`);

                // Cancel command
                cancelAttack(commandId);

                const nowTime = Math.floor(Date.now() / 1000);

                if(nowTime > targetTime + 10)
                {
                    console.log(`❌ Failed to time attack.`);
                    return;
                }

                await sleep(600);
                await timeAttack(targetTime);
            }
        },
        error: function(xhr) {
            console.error("❌ Error sending attack:", xhr.status, xhr.statusText, xhr.responseText);
        }
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

(function() {
    const targetTime = "2025-06-30T01:10:30";
    const date = new Date(targetTime); // ISO format
    const targetTimeUnix = Math.floor(date.getTime() / 1000);

    const offset = 10;
    const nowTime = Math.floor(Date.now() / 1000);

    // console.log("target time:", targetTimeUnix);
    // console.log("nowTime:", nowTime);

    if(nowTime + 501 < targetTimeUnix - offset)
    {
        console.log(`Attack will be executed in ${targetTimeUnix - nowTime - 10 - 501} seconds.`);
        setTimeout(() => {
            timeAttack(targetTimeUnix);
        }, (targetTimeUnix - nowTime - 10 - 501) * 1000);
    }
    else if(nowTime+501 >= targetTimeUnix - offset && nowTime+501 <= targetTimeUnix + offset)
    {
        console.log("right");
        timeAttack(targetTimeUnix);
    }
    else
    {
        console.log("Too late!");
    }
})();
