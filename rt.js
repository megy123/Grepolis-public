(function () {
    const target = 2271; // or whatever ID you want to send
    const townId = 883;

    const data = {
        id: target,
        town_id: townId,
        nl_init: true
    };

    const h = Game.csrfToken;
    const json = encodeURIComponent(JSON.stringify(data));
    const timestamp = Date.now();

    const url = `https://sk102.grepolis.com/game/town_info?town_id=${townId}&action=attack&h=${h}&json=${json}&_=${timestamp}`;

    $.ajax({
        url: url,
        method: "GET", // match Grepolis behavior
        success: function (res) {
            console.log("✅ Success:", res);
        },
        error: function (xhr) {
            console.error("❌ Error:", xhr.status, xhr.statusText, xhr.responseText);
        }
    });
})();