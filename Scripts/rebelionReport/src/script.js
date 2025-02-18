
//getReport()
(function () {
    const Config = {
        //Report format
        defUnits: true, // Display only defensive units
        roundUnits: false, // Round number of units to decimal
        unitDisplayType: "name+image", // "name", "image", "name+image"
        simpleUnits: true, // Show just simple units counts
        spellDisplayType: "name", // "name", "image", "name+image" #only "name" working currently
        //Report output
        outputType: "forum", // "forum", "clipboard", "note"
        forumId: 122, // Forum id
    }
    const unitsMapper = {
        "sword": { name: "Meče", url: "https://wiki.en.grepolis.com/images/9/9c/Sword_40x40.png" },
        "slinger": { name: "Praky", url: "https://wiki.en.grepolis.com/images/d/dc/Slinger_40x40.png" },
        "archer": { name: "Luky", url: "https://wiki.en.grepolis.com/images/1/1a/Archer_40x40.png" },
        "hoplite": { name: "Hopliti", url: "https://wiki.en.grepolis.com/images/b/bd/Hoplite_40x40.png" },
        "rider": { name: "Jazdci", url: "https://wiki.en.grepolis.com/images/e/e9/Rider_40x40.png" },
        "chariot": { name: "Vozy", url: "https://wiki.en.grepolis.com/images/b/b8/Chariot_40x40.png" },
        "catapult": { name: "Katy", url: "https://wiki.en.grepolis.com/images/f/f0/Catapult_40x40.png" },
        "minotaur": { name: "Minotauri", url: "https://wiki.en.grepolis.com/images/thumb/f/fc/Uz1.png/60px-Uz1.png" },
        "manticore": { name: "Mačky", url: "https://wiki.en.grepolis.com/images/thumb/d/d0/Uz2.png/60px-Uz2.png" },
        "zyklop": { name: "Kyklopy", url: "https://wiki.en.grepolis.com/images/thumb/a/aa/Up1.png/60px-Up1.png" },
        "harpy": { name: "Harpie", url: "https://wiki.en.grepolis.com/images/thumb/e/e5/Uh1.png/60px-Uh1.png" },
        "medusa": { name: "Medúzy", url: "https://wiki.en.grepolis.com/images/thumb/1/15/Uh2.png/60px-Uh2.png" },
        "centaur": { name: "Koňoľudia", url: "https://wiki.en.grepolis.com/images/thumb/3/3d/Ua1.png/60px-Ua1.png" },
        "pegasus": { name: "Pegasi", url: "https://wiki.en.grepolis.com/images/thumb/d/d0/Ua2.png/60px-Ua2.png" },
        "cerberus": { name: "Psy", url: "https://wiki.en.grepolis.com/images/thumb/b/b2/Uhades1.png/60px-Uhades1.png" },
        "fury": { name: "Fúrie", url: "https://wiki.en.grepolis.com/images/thumb/f/fe/Uhades2.png/60px-Uhades2.png" },
        "griffin": { name: "Vtaky", url: "https://wiki.en.grepolis.com/images/thumb/f/f1/Griffin.jpg/60px-Griffin.jpg" },
        "calydonian_boar": { name: "Svine", url: "https://wiki.en.grepolis.com/images/thumb/5/55/CalydonianBoar.jpg/60px-CalydonianBoar.jpg" },
        "satyr": { name: "Satyr", url: "https://wiki.en.grepolis.com/images/thumb/d/d8/Satyr.png/60px-Satyr.png" },
        "spartoi": { name: "Spartoi", url: "https://wiki.en.grepolis.com/images/thumb/a/a8/Spartoi.png/60px-Spartoi.png" },
        "ladon": { name: "Ladoni", url: "https://wiki.en.grepolis.com/images/thumb/4/4c/Ladon.png/60px-Ladon.png" },
        "godsent": { name: "Vyslanci boha", url: "https://wiki.en.grepolis.com/images/thumb/0/03/Divineenvoy.png/60px-Divineenvoy.png" },
        "big_transporter": { name: "Prepravky", url: "https://wiki.en.grepolis.com/images/0/04/Big_transporter_40x40.png" },
        "bireme": { name: "Biremy", url: "https://wiki.en.grepolis.com/images/4/44/Bireme_40x40.png" },
        "attack_ship": { name: "Zápalky", url: "https://wiki.en.grepolis.com/images/e/e6/Attack_ship_40x40.png" },
        "demolition_ship": { name: "Výbušné lode", url: "https://wiki.en.grepolis.com/images/e/ec/Demolition_ship_40x40.png" },
        "small_transporter": { name: "Malé prepravky", url: "https://wiki.en.grepolis.com/images/8/85/Small_transporter_40x40.png" },
        "trireme": { name: "Trirémy", url: "https://wiki.en.grepolis.com/images/a/ad/Trireme_40x40.png" },
        "colonize_ship": { name: "Osídľovacie lode", url: "https://wiki.en.grepolis.com/images/d/d1/Colonize_ship_40x40.png" },
        "sea_monster": { name: "Hydry", url: "https://wiki.en.grepolis.com/images/thumb/c/c7/Up2.png/60px-Up2.png" },
        "siren": { name: "Sirény", url: "https://wiki.en.grepolis.com/images/thumb/0/0a/Siren.png/60px-Siren.png" },
        "militia": { name: "Domobrana", url: "https://wiki.en.grepolis.com/images/9/9b/Militia_40x40.png" }
    };

    const unitsWL = ["sword", "archer", "hoplite", "chariot", "minotaur", "medusa", "pegasus", "cerberus", "calydonian_boar", "godsent", "bireme", "demolition_ship", "trireme", "sea_monster", "militia"];
    let townData = window.MM.getOnlyCollectionByName("Town").getCurrentTown();
    let units = window.MM.getOnlyCollectionByName("Units").getUnitsInTown();
    const revolt = MM.getOnlyCollectionByName("Takeover").models.find(model => model.attributes.destination_town.id === townData.attributes.id);
    if (!revolt) {
        HumanMessage.error("V tomto meste nemáš žiadne povstanie 👉👈.");
    }
    let report = [];

    // Attacker
    report.push("Útočník: [player]" + revolt.attributes.origin_town.player_name + "[/player]\n");

    // Attacked City
    report.push("Napadnuté mesto: [town]" + townData.id + "[/town]\n");

    // Walls
    report.push("Hradby: [b]" + townData.buildings().getBuildingLevel("wall") + "[/b]\n");

    // god
    report.push("Boh: [b]" + townData.getGod() + "[/b]\n");

    // Spells
    report.push("Kúzla: [b]");
    let powers = townData.getCastedPowers();
    let powerNames = powers.map(item => {
        let powerData = window.GameData.powers[item.attributes.power_id];

        return (powerData && typeof powerData.name === "string")
            ? powerData.name
            : item.attributes.power_id;
    });
    report.push(powerNames.join(", "));
    report.push("[/b]\n");

    // Hero
    //report.push("Hrdina: [b]" + (townData.getHeroes().length > 0 ? townData.getHeroes()[0].staticData.name : "Žiadny") + "[/b]\n"); TODO

    // Tower
    report.push("Veža: [b]" + (townData.buildings().getBuildingLevel("tower") > 0 ? 'ANO' : 'NIE') + "[/b]\n");

    // Army
    report.push("Stav armády: \n");
    let table = "[table]\n";
    if (Config.simpleUnits) {
        const landUnits = units.getLandUnits();
        const navalUnits = units.getNavalUnits();

        let totalLandUnits = 0;
        let totalNavalUnits = 0;

        if (Config.defUnits) {
            totalLandUnits = Object.entries(landUnits)
                .filter(([key]) => unitsWL.includes(key))
                .reduce((sum, [, count]) => sum + count, 0);

            totalNavalUnits = Object.entries(navalUnits)
                .filter(([key]) => unitsWL.includes(key))
                .reduce((sum, [, count]) => sum + count, 0);
        } else {
            totalLandUnits = Object.values(landUnits).reduce((sum, count) => sum + count, 0);
            totalNavalUnits = Object.values(navalUnits).reduce((sum, count) => sum + count, 0);
        }

        if (Config.unitDisplayType === "name+image") {
            table += `[*][img]https://wiki.en.grepolis.com/images/9/9a/Def_hack.png[/img][|]pech[|]${Config.roundUnits ? Math.round(totalLandUnits / 10) * 10 : totalLandUnits}[/*]\n`;
            table += `[*][img]https://wiki.en.grepolis.com/images/5/53/Def.png[/img][|]lode[|]${Config.roundUnits ? Math.round(totalNavalUnits / 10) * 10 : totalNavalUnits}[/*]\n`;
        } else if (Config.unitDisplayType === "image") {
            table += `[*][img]https://wiki.en.grepolis.com/images/9/9a/Def_hack.png[/img][|]${Config.roundUnits ? Math.round(totalLandUnits / 10) * 10 : totalLandUnits}[/*]\n`;
            table += `[*][img]https://wiki.en.grepolis.com/images/5/53/Def.png[/img][|]${Config.roundUnits ? Math.round(totalNavalUnits / 10) * 10 : totalNavalUnits}[/*]\n`;
        } else {
            table += `[*]pech[|]${Config.roundUnits ? Math.round(totalLandUnits / 10) * 10 : totalLandUnits}[/*]\n`;
            table += `[*]lode[|]${Config.roundUnits ? Math.round(totalNavalUnits / 10) * 10 : totalNavalUnits}[/*]\n`;
        }
    }
    else {
        for (const [key, value] of Object.entries(units.getUnits())) {
            if (Config.defUnits && !unitsWL.includes(key)) continue;
            const mappedName = unitsMapper[key] || key;
            if (Config.unitDisplayType === "name+image") {
                table += `[*][img]${mappedName.url}[/img][|]${mappedName.name}[|]${Config.roundUnits ? Math.round(value / 10) * 10 : value}[/*]\n`;
            }
            else if (Config.unitDisplayType === "image") {
                table += `[*][img]${mappedName.url}[/img][|]${Config.roundUnits ? Math.round(value / 10) * 10 : value}[/*]\n`;
            }
            else {
                table += `[*]${mappedName.name}[|]${Config.roundUnits ? Math.round(value / 10) * 10 : value}[/*]\n`;
            }

        }
    }
    table += "[/table]\n\n";
    report.push(table);

    // Report spoiler
    report.push("[spoiler=Report][img]https://www.icegif.com/wp-content/uploads/2023/01/icegif-162.gif[/img][/spoiler]");

    // Get report
    let reportText = report.join("");

    // Get report title
    const date = new Date(revolt.attributes.command.started_at * 1000); // Convert to milliseconds
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;
    let reportTitle = townData.attributes.name + "/M" + townData.attributes.sea_id + "/" + timeString;

    // Print report to console
    console.log(reportText);

    switch (Config.outputType) {
        case "forum": // Create forum thread
            Layout.allianceForum.open()
            if (Config.forumId === -1) {

            }

            Forum.newThread(Config.forumId);
            const observer = new MutationObserver(() => {
                const input = document.getElementById("forum_thread_name");
                if (input) {
                    input.value = reportTitle;
                    document.getElementById("forum_post_textarea").value = reportText;
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            HumanMessage.success("Príspevok fóra pre report bol vytvorený.");
            break;
        case "clipboard": // Copy report to clipboard
            // Copy to clipboard
            function copyToClipboard() {
                navigator.clipboard.writeText(reportText).then(() => {
                    console.log("Text copied to clipboard!");
                }).catch(err => {
                    console.error("Failed to copy:", err);
                });
            }
            copyToClipboard();

            // Bind copy function to a keyboard shortcut (Ctrl + Shift + C)
            document.addEventListener("keydown", function (event) {
                if (event.ctrlKey && event.shiftKey && event.code === "KeyC") {
                    copyToClipboard();
                }
            });
            console.log("Press **Ctrl + Shift + C** to copy the report to clipboard!");
            HumanMessage.success("Report povstania bol skopírovaný do schránky.");
            break;
        case "note": // Copy report to notes
            window.NotesWindowFactory.openNotesWindow();
            const notes = MM.getOnlyCollectionByName("PlayerNote").getNotes();
            const index = notes.findIndex(note => note.attributes.title === "REPORT");

            if (index === -1) {
                MM.getOnlyCollectionByName("PlayerNote").createNote("REPORT");
                notes = MM.getOnlyCollectionByName("PlayerNote").getNotes();
                index = notes.findIndex(note => note.attributes.title === "REPORT");
            }
            MM.getOnlyCollectionByName("PlayerNote").getNoteForTabIndex(index).save(reportText);
            HumanMessage.success("Report povstania bol pridaný do poznámok.");
            break;
        default:
            HumanMessage.error("Zle nastavený 'Config.outputType'.");
    }
})();