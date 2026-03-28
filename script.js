/**
 * Trading Calculator
 *
 * NEUE ITEMS / WERTE: ganz oben bei ITEM_CATALOG eintragen (ein Objekt pro Item).
 * Admin: Passwort weiter unten bei ADMIN_PASSWORD (nur statische Seite).
 */

// --- Zentrale Item-Liste: ein Eintrag = ein Item im Spiel ---
// Pflicht: name, category, value
// Optional: rarity, demand (kannst du weglassen oder leer lassen)
var ITEM_CATALOG = [
    {
        name: "Void Shard",
        category: "Materialien",
        value: 1200,
        rarity: "Rare",
        demand: "Hoch",
    },
    {
        name: "Raid Token",
        category: "Währung",
        value: 150,
        rarity: "Common",
        demand: "Mittel",
    },
    {
        name: "Mythic Chest",
        category: "Truhen",
        value: 4500,
        rarity: "Legendary",
        demand: "Sehr hoch",
    },
    {
        name: "Boss Ticket",
        category: "Tickets",
        value: 2000,
        rarity: "Epic",
    },
    {
        name: "Cursed Finger",
        category: "Artefakte",
        value: 1500,
        demand: "Mittel",
    },
    {
        name: "Dark Grail",
        category: "Artefakte",
        value: 800,
        rarity: "Rare",
        demand: "Niedrig",
    },
];

// Kopie der Startliste nur für „Auf Standard zurücksetzen“ (wird beim Laden erzeugt)
var DEFAULT_ITEM_CATALOG = JSON.parse(JSON.stringify(ITEM_CATALOG));

var FAIR_PERCENT = 2;

var yourLines = [];
var theirLines = [];

var FILTER_ALL = "all";

// --- Admin (Passwort im Klartext im Code — jeder kann es im Browser lesen) ---
var ADMIN_PASSWORD = "admin123";
var adminSessionActive = false;

// --- Katalog-Hilfen ---

// Item per Name finden (Name muss eindeutig sein)
function getItemByName(name) {
    var i;
    for (i = 0; i < ITEM_CATALOG.length; i++) {
        if (ITEM_CATALOG[i].name === name) {
            return ITEM_CATALOG[i];
        }
    }
    return null;
}

// Normale Kategorie für ein Item (fehlt sie, landet es unter „Sonstiges“)
function getItemCategory(item) {
    var c = item.category;
    if (!c || String(c).trim() === "") {
        return "Sonstiges";
    }
    return String(c).trim();
}

// Alle Kategorien sortiert (ohne Duplikate)
function getCategories() {
    var seen = {};
    var out = [];
    var i;
    for (i = 0; i < ITEM_CATALOG.length; i++) {
        var c = getItemCategory(ITEM_CATALOG[i]);
        if (!seen[c]) {
            seen[c] = true;
            out.push(c);
        }
    }
    out.sort();
    return out;
}

// Katalog nach einer Kategorie filtern ("all" = alles)
function filterItemsByCategory(items, category) {
    if (!category || category === FILTER_ALL) {
        return items.slice();
    }
    var out = [];
    var i;
    for (i = 0; i < items.length; i++) {
        if (getItemCategory(items[i]) === category) {
            out.push(items[i]);
        }
    }
    return out;
}

// Optionale Felder für die Tabelle: leer → Gedankenstrich
function displayOptional(val) {
    if (val === undefined || val === null || String(val).trim() === "") {
        return "—";
    }
    return String(val);
}

// Katalog-Tabelle neu aufbauen (mit Kategorie-Filter aus dem Dropdown)
function renderItems() {
    var body = document.getElementById("valueTableBody");
    var filterEl = document.getElementById("catalogCategoryFilter");
    var category = filterEl ? filterEl.value : FILTER_ALL;

    body.innerHTML = "";

    if (category === FILTER_ALL) {
        var cats = getCategories();
        var c;
        for (c = 0; c < cats.length; c++) {
            var catName = cats[c];
            var inCat = filterItemsByCategory(ITEM_CATALOG, catName);
            if (inCat.length === 0) {
                continue;
            }
            appendCategoryHeaderRow(body, catName);
            var j;
            for (j = 0; j < inCat.length; j++) {
                appendItemDataRow(body, inCat[j]);
            }
        }
    } else {
        var list = filterItemsByCategory(ITEM_CATALOG, category);
        var k;
        for (k = 0; k < list.length; k++) {
            appendItemDataRow(body, list[k]);
        }
    }
}

// Eine Tabellen-Zeile: Kategorie-Überschrift (nur bei „Alle“)
function appendCategoryHeaderRow(body, title) {
    var tr = document.createElement("tr");
    tr.className = "value-table__cat-row";
    var td = document.createElement("td");
    td.colSpan = 5;
    td.textContent = title;
    tr.appendChild(td);
    body.appendChild(tr);
}

// Normale Daten-Zeile im Katalog
function appendItemDataRow(body, item) {
    var tr = document.createElement("tr");
    var tdName = document.createElement("td");
    tdName.textContent = item.name;
    var tdCat = document.createElement("td");
    tdCat.className = "value-table__muted";
    tdCat.textContent = displayOptional(item.category);
    var tdVal = document.createElement("td");
    tdVal.className = "value-table__value";
    tdVal.textContent = formatNum(item.value);
    var tdRarity = document.createElement("td");
    tdRarity.className = "value-table__muted";
    tdRarity.textContent = displayOptional(item.rarity);
    var tdDemand = document.createElement("td");
    tdDemand.className = "value-table__muted";
    tdDemand.textContent = displayOptional(item.demand);
    tr.appendChild(tdName);
    tr.appendChild(tdCat);
    tr.appendChild(tdVal);
    tr.appendChild(tdRarity);
    tr.appendChild(tdDemand);
    body.appendChild(tr);
}

// Filter-Dropdown mit allen Kategorien füllen
function fillCatalogFilter() {
    var sel = document.getElementById("catalogCategoryFilter");
    if (!sel) {
        return;
    }
    var current = sel.value;
    sel.innerHTML = "";
    var optAll = document.createElement("option");
    optAll.value = FILTER_ALL;
    optAll.textContent = "Alle Kategorien";
    sel.appendChild(optAll);
    var cats = getCategories();
    var i;
    for (i = 0; i < cats.length; i++) {
        var o = document.createElement("option");
        o.value = cats[i];
        o.textContent = cats[i];
        sel.appendChild(o);
    }
    if (current && (current === FILTER_ALL || cats.indexOf(current) >= 0)) {
        sel.value = current;
    } else {
        sel.value = FILTER_ALL;
    }
}

// Trade-Dropdowns: Items in optgroup pro Kategorie
function fillSelectOptions(selectId) {
    var sel = document.getElementById(selectId);
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "— Item wählen —";
    sel.appendChild(opt0);
    var cats = getCategories();
    var c;
    for (c = 0; c < cats.length; c++) {
        var catName = cats[c];
        var inCat = filterItemsByCategory(ITEM_CATALOG, catName);
        if (inCat.length === 0) {
            continue;
        }
        var og = document.createElement("optgroup");
        og.label = catName;
        var j;
        for (j = 0; j < inCat.length; j++) {
            var it = inCat[j];
            var opt = document.createElement("option");
            opt.value = it.name;
            opt.textContent = it.name + " (" + formatNum(it.value) + ")";
            og.appendChild(opt);
        }
        sel.appendChild(og);
    }
}

// --- Eingaben ---

function parsePositiveInt(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (s === "") {
        return null;
    }
    if (/[.,]/.test(s)) {
        return null;
    }
    var n = parseInt(s, 10);
    if (isNaN(n) || n < 1) {
        return null;
    }
    return n;
}

function getUnitValue(itemKey) {
    var item = getItemByName(itemKey);
    if (item && typeof item.value === "number") {
        return item.value;
    }
    return 0;
}

function calculateSideValue(lines) {
    var total = 0;
    var i;
    for (i = 0; i < lines.length; i++) {
        var line = lines[i];
        var unit = getUnitValue(line.itemKey);
        var qty = line.qty;
        if (qty > 0 && unit >= 0) {
            total += qty * unit;
        }
    }
    return total;
}

function calculateTradeResult(yourTotal, theirTotal) {
    var diff = theirTotal - yourTotal;
    var percent = null;

    if (yourTotal > 0) {
        percent = (diff / yourTotal) * 100;
    }

    var outcome;
    if (yourTotal === 0 && theirTotal === 0) {
        outcome = "fair";
    } else if (yourTotal === 0 && theirTotal > 0) {
        outcome = "win";
        percent = null;
    } else if (theirTotal === 0 && yourTotal > 0) {
        outcome = "loss";
        percent = null;
    } else {
        if (Math.abs(percent) <= FAIR_PERCENT) {
            outcome = "fair";
        } else if (diff > 0) {
            outcome = "win";
        } else if (diff < 0) {
            outcome = "loss";
        } else {
            outcome = "fair";
        }
    }

    return {
        outcome: outcome,
        yourTotal: yourTotal,
        theirTotal: theirTotal,
        difference: diff,
        percent: percent,
    };
}

function formatNum(n) {
    return n.toLocaleString("de-DE");
}

function updateResultUI(result) {
    var outcomeEl = document.getElementById("resultOutcome");
    var percentEl = document.getElementById("resultPercent");
    var hintEl = document.getElementById("resultHint");
    var blockEl = document.getElementById("resultBlock");

    document.getElementById("statYour").textContent = formatNum(result.yourTotal);
    document.getElementById("statTheir").textContent = formatNum(result.theirTotal);
    document.getElementById("statDiff").textContent = formatNum(result.difference);

    document.getElementById("yourOfferTotal").textContent = formatNum(result.yourTotal);
    document.getElementById("theirOfferTotal").textContent = formatNum(result.theirTotal);

    outcomeEl.className = "result-block__outcome";
    blockEl.className = "result-block";

    if (result.outcome === "win") {
        outcomeEl.textContent = "Win";
        outcomeEl.classList.add("result-block__outcome--win");
        blockEl.classList.add("result-block--win");
        hintEl.textContent =
            "Du erhältst mehr Wert, als du abgibst (aus Sicht der Zahlen).";
    } else if (result.outcome === "loss") {
        outcomeEl.textContent = "Loss";
        outcomeEl.classList.add("result-block__outcome--loss");
        blockEl.classList.add("result-block--loss");
        hintEl.textContent =
            "Du gibst mehr ab, als du zurückerhältst (aus Sicht der Zahlen).";
    } else {
        outcomeEl.textContent = "Fair";
        outcomeEl.classList.add("result-block__outcome--fair");
        blockEl.classList.add("result-block--fair");
        if (result.yourTotal === 0 && result.theirTotal === 0) {
            hintEl.textContent =
                "Noch keine Items – füge links und rechts Einträge hinzu.";
        } else {
            hintEl.textContent =
                "Beide Seiten liegen in etwa im gleichen Wertbereich (± " +
                FAIR_PERCENT +
                " %).";
        }
    }

    if (result.percent === null) {
        percentEl.textContent = "—";
    } else {
        var rounded = Math.round(result.percent * 10) / 10;
        var sign = rounded > 0 ? "+" : "";
        percentEl.textContent = sign + rounded + " %";
    }
}

// Nur Summen + Ergebnis aktualisieren (beide Seiten nötig für den Vergleich)
function updateTotalsAndResult() {
    var yourTotal = calculateSideValue(yourLines);
    var theirTotal = calculateSideValue(theirLines);
    updateResultUI(calculateTradeResult(yourTotal, theirTotal));
}

// Eine Trade-Seite neu zeichnen + Gesamtwerte
function updateTradeSide(side) {
    renderOfferList(side);
    updateTotalsAndResult();
}

function escapeHtml(text) {
    var map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
    };
    return String(text).replace(/[&<>"']/g, function (ch) {
        return map[ch] || ch;
    });
}

// Eine Zeile im Angebot (Your / Their)
function createTradeRow(side, index, itemKey, qty) {
    var item = getItemByName(itemKey);
    var unit = item ? item.value : 0;
    var lineTotal = qty * unit;
    var meta = "";
    if (item) {
        meta = escapeHtml(getItemCategory(item));
    }
    return (
        '<li class="item-row">' +
        '<div class="item-row__main">' +
        "<div>" +
        '<span class="item-row__name">' +
        escapeHtml(itemKey) +
        "</span>" +
        (meta !== ""
            ? ' <span class="item-row__meta">' + meta + "</span>"
            : "") +
        ' <span class="item-row__meta">×' +
        qty +
        "</span>" +
        "</div>" +
        "</div>" +
        '<span class="item-row__value">' +
        formatNum(lineTotal) +
        "</span>" +
        '<button type="button" class="btn-icon btn-remove" data-side="' +
        side +
        '" data-index="' +
        index +
        '" aria-label="Zeile entfernen">×</button>' +
        "</li>"
    );
}

function renderOfferList(side) {
    var listId = side === "your" ? "yourOfferList" : "theirOfferList";
    var lines = side === "your" ? yourLines : theirLines;
    var ul = document.getElementById(listId);
    var html = "";
    var i;
    for (i = 0; i < lines.length; i++) {
        html += createTradeRow(side, i, lines[i].itemKey, lines[i].qty);
    }
    ul.innerHTML = html;
}

function refreshAll() {
    renderOfferList("your");
    renderOfferList("their");
    updateTotalsAndResult();
}

function showFormError(side, message) {
    var id = side === "your" ? "yourFormError" : "theirFormError";
    document.getElementById(id).textContent = message || "";
}

function addItem(side) {
    var selectId = side === "your" ? "yourItemSelect" : "theirItemSelect";
    var qtyId = side === "your" ? "yourQtyInput" : "theirQtyInput";
    var itemKey = document.getElementById(selectId).value;
    var qtyRaw = document.getElementById(qtyId).value;
    var qty = parsePositiveInt(qtyRaw);

    showFormError(side, "");

    if (!itemKey) {
        showFormError(side, "Bitte ein Item wählen.");
        return;
    }
    if (qty === null) {
        showFormError(side, "Menge: positive ganze Zahl (z. B. 1, 2, 10).");
        return;
    }

    var lines = side === "your" ? yourLines : theirLines;
    var found = -1;
    var j;
    for (j = 0; j < lines.length; j++) {
        if (lines[j].itemKey === itemKey) {
            found = j;
            break;
        }
    }
    if (found >= 0) {
        lines[found].qty += qty;
    } else {
        lines.push({ itemKey: itemKey, qty: qty });
    }

    document.getElementById(qtyId).value = "";
    updateTradeSide(side);
}

function removeLine(side, index) {
    var lines = side === "your" ? yourLines : theirLines;
    if (index < 0 || index >= lines.length) {
        return;
    }
    lines.splice(index, 1);
    updateTradeSide(side);
}

function setupCatalogFilter() {
    var sel = document.getElementById("catalogCategoryFilter");
    if (!sel) {
        return;
    }
    sel.addEventListener("change", function () {
        renderItems();
    });
}

// Katalog geändert: Hauptseite neu (Katalog-Tabelle, Dropdowns, Summen)
// Kein renderAdminItems hier — damit Eingaben im Admin-Formular nicht springen.
function refreshMainAfterCatalogChange() {
    fillCatalogFilter();
    renderItems();
    fillSelectOptions("yourItemSelect");
    fillSelectOptions("theirItemSelect");
    refreshAll();
}

// --- Import / Export / Standardliste (JSON) ---

// Kurzer Hinweistext unter den Import/Export-Buttons
function setAdminImportMessage(text, kind) {
    var el = document.getElementById("adminImportMessage");
    if (!el) {
        return;
    }
    el.textContent = text || "";
    el.classList.remove("is-error", "is-ok");
    if (kind === "error") {
        el.classList.add("is-error");
    } else if (kind === "ok") {
        el.classList.add("is-ok");
    }
}

// Rohdaten aus JSON prüfen und saubere Item-Objekte liefern
function validateImportedData(data) {
    var list = null;
    if (data === null || data === undefined) {
        return { ok: false, error: "Datei ist leer oder kein gültiges JSON." };
    }
    if (Array.isArray(data)) {
        list = data;
    } else if (typeof data === "object" && Array.isArray(data.items)) {
        list = data.items;
    } else {
        return {
            ok: false,
            error: 'Erwartet wird ein JSON-Array oder { "items": [ ... ] }.',
        };
    }
    if (list.length === 0) {
        return { ok: false, error: "Die Liste enthält keine Items." };
    }

    var seenNames = {};
    var out = [];
    var i;
    for (i = 0; i < list.length; i++) {
        var row = list[i];
        if (row === null || typeof row !== "object") {
            return { ok: false, error: "Eintrag " + (i + 1) + " ist kein Objekt." };
        }
        if (row.name === undefined || row.name === null || String(row.name).trim() === "") {
            return { ok: false, error: "Eintrag " + (i + 1) + " hat keinen Namen." };
        }
        var name = String(row.name).trim();
        if (seenNames[name]) {
            return { ok: false, error: 'Doppelter Name: "' + name + '".' };
        }
        seenNames[name] = true;

        var val = row.value;
        if (typeof val === "string") {
            val = parseFloat(String(val).replace(",", "."));
        }
        if (typeof val !== "number" || isNaN(val) || !isFinite(val)) {
            return {
                ok: false,
                error: 'Eintrag "' + name + '" hat keinen gültigen Zahlenwert bei "value".',
            };
        }
        if (val < 0) {
            return { ok: false, error: 'Eintrag "' + name + '" hat einen negativen Wert.' };
        }

        var cat = row.category;
        if (cat === undefined || cat === null || String(cat).trim() === "") {
            cat = "Sonstiges";
        } else {
            cat = String(cat).trim();
        }

        out.push({
            name: name,
            category: cat,
            value: val,
            rarity: row.rarity != null ? String(row.rarity) : "",
            demand: row.demand != null ? String(row.demand) : "",
        });
    }
    return { ok: true, items: out };
}

// Trade-Zeilen entfernen, wenn der Item-Name nach Import nicht mehr existiert
function pruneTradeLinesAfterImport() {
    var y = [];
    var i;
    for (i = 0; i < yourLines.length; i++) {
        if (getItemByName(yourLines[i].itemKey)) {
            y.push(yourLines[i]);
        }
    }
    yourLines = y;
    var t = [];
    for (i = 0; i < theirLines.length; i++) {
        if (getItemByName(theirLines[i].itemKey)) {
            t.push(theirLines[i]);
        }
    }
    theirLines = t;
}

// Aktuellen Katalog als JSON-Datei herunterladen
function exportItemsToJson() {
    var json = JSON.stringify(ITEM_CATALOG, null, 2);
    var blob = new Blob([json], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "spcalc-items.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAdminImportMessage("Export gespeichert (Download).", "ok");
}

// JSON-Text übernehmen (z. B. aus Datei)
function importItemsFromJson(jsonString) {
    var parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch (err) {
        setAdminImportMessage("Keine gültige JSON-Datei (Syntaxfehler).", "error");
        return false;
    }

    var result = validateImportedData(parsed);
    if (!result.ok) {
        setAdminImportMessage(result.error, "error");
        return false;
    }

    ITEM_CATALOG.length = 0;
    var i;
    for (i = 0; i < result.items.length; i++) {
        ITEM_CATALOG.push(result.items[i]);
    }
    pruneTradeLinesAfterImport();
    renderAdminItems();
    refreshMainAfterCatalogChange();
    setAdminImportMessage("Import erfolgreich. Liste wurde ersetzt.", "ok");
    return true;
}

// Eingebaute Standardliste wiederherstellen, Trades leeren
function resetToDefaultItems() {
    var ok = window.confirm(
        "Alle Items auf die eingebaute Standardliste zurücksetzen? Deine aktuelle Liste und die Trade-Einträge werden verworfen."
    );
    if (!ok) {
        return;
    }

    var fresh = JSON.parse(JSON.stringify(DEFAULT_ITEM_CATALOG));
    ITEM_CATALOG.length = 0;
    var i;
    for (i = 0; i < fresh.length; i++) {
        ITEM_CATALOG.push(fresh[i]);
    }
    yourLines = [];
    theirLines = [];
    renderAdminItems();
    refreshMainAfterCatalogChange();
    setAdminImportMessage("Standardliste wurde geladen.", "ok");
}

// Zahl aus Textfeld (Komma oder Punkt erlaubt)
function parseItemValue(raw) {
    var s = String(raw == null ? "" : raw).trim().replace(",", ".");
    var n = parseFloat(s);
    if (isNaN(n)) {
        return 0;
    }
    return n;
}

// Prüfen, ob ein anderer Eintrag schon denselben Namen hat
function nameExistsBesides(name, excludeIndex) {
    var i;
    for (i = 0; i < ITEM_CATALOG.length; i++) {
        if (i === excludeIndex) {
            continue;
        }
        if (ITEM_CATALOG[i].name === name) {
            return true;
        }
    }
    return false;
}

// Wenn der Item-Name im Katalog geändert wird: Trade-Zeilen mitziehen
function renameItemInTradeLines(oldName, newName) {
    if (oldName === newName) {
        return;
    }
    var i;
    for (i = 0; i < yourLines.length; i++) {
        if (yourLines[i].itemKey === oldName) {
            yourLines[i].itemKey = newName;
        }
    }
    for (i = 0; i < theirLines.length; i++) {
        if (theirLines[i].itemKey === oldName) {
            theirLines[i].itemKey = newName;
        }
    }
}

// Ein Feld eines Items ändern (wird von den Admin-Eingaben aufgerufen)
function updateItemValue(index, field, rawValue) {
    var item = ITEM_CATALOG[index];
    if (!item) {
        return;
    }

    if (field === "name") {
        var newName = String(rawValue).trim();
        if (newName === "") {
            return;
        }
        if (nameExistsBesides(newName, index)) {
            window.alert("Dieser Name wird schon von einem anderen Item verwendet.");
            renderAdminItems();
            return;
        }
        var oldName = item.name;
        item.name = newName;
        renameItemInTradeLines(oldName, newName);
    } else if (field === "category") {
        item.category = String(rawValue);
    } else if (field === "value") {
        item.value = parseItemValue(rawValue);
    } else if (field === "rarity") {
        item.rarity = String(rawValue);
    } else if (field === "demand") {
        item.demand = String(rawValue);
    }

    refreshMainAfterCatalogChange();
}

// Item löschen (Index in ITEM_CATALOG)
function deleteItem(index) {
    var item = ITEM_CATALOG[index];
    if (!item) {
        return;
    }
    var removedName = item.name;
    var ok = window.confirm('Item "' + removedName + '" wirklich löschen?');
    if (!ok) {
        return;
    }

    ITEM_CATALOG.splice(index, 1);

    var newYour = [];
    var a;
    for (a = 0; a < yourLines.length; a++) {
        if (yourLines[a].itemKey !== removedName) {
            newYour.push(yourLines[a]);
        }
    }
    yourLines = newYour;

    var newTheir = [];
    for (a = 0; a < theirLines.length; a++) {
        if (theirLines[a].itemKey !== removedName) {
            newTheir.push(theirLines[a]);
        }
    }
    theirLines = newTheir;

    renderAdminItems();
    refreshMainAfterCatalogChange();
}

// Leeres Item anhängen und Tabelle neu
function addNewItem() {
    ITEM_CATALOG.push({
        name: "Neues Item " + (ITEM_CATALOG.length + 1),
        category: "Sonstiges",
        value: 0,
        rarity: "",
        demand: "",
    });
    renderAdminItems();
    refreshMainAfterCatalogChange();
}

// Admin-Tabelle aus ITEM_CATALOG bauen
function renderAdminItems() {
    var body = document.getElementById("adminTableBody");
    if (!body) {
        return;
    }
    body.innerHTML = "";

    var i;
    for (i = 0; i < ITEM_CATALOG.length; i++) {
        (function (idx) {
            var item = ITEM_CATALOG[idx];
            var tr = document.createElement("tr");

            function addTextInput(field, extraClass) {
                var td = document.createElement("td");
                var inp = document.createElement("input");
                inp.type = "text";
                inp.className = "admin-table__input" + (extraClass ? " " + extraClass : "");
                inp.value =
                    item[field] === undefined || item[field] === null ? "" : item[field];
                // Name erst beim Verlassen des Felds speichern (sonst bricht die Zuordnung beim Tippen)
                if (field === "name") {
                    inp.addEventListener("change", function () {
                        updateItemValue(idx, "name", inp.value);
                    });
                } else {
                    inp.addEventListener("input", function () {
                        updateItemValue(idx, field, inp.value);
                    });
                }
                td.appendChild(inp);
                tr.appendChild(td);
            }

            addTextInput("name");
            addTextInput("category");
            var tdVal = document.createElement("td");
            var valInp = document.createElement("input");
            valInp.type = "text";
            valInp.className = "admin-table__input admin-table__input--narrow";
            valInp.value = String(item.value);
            valInp.addEventListener("input", function () {
                updateItemValue(idx, "value", valInp.value);
            });
            tdVal.appendChild(valInp);
            tr.appendChild(tdVal);

            addTextInput("rarity");
            addTextInput("demand");

            var tdDel = document.createElement("td");
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "btn btn--danger btn--small";
            btn.textContent = "Löschen";
            btn.addEventListener("click", function () {
                deleteItem(idx);
            });
            tdDel.appendChild(btn);
            tr.appendChild(tdDel);

            body.appendChild(tr);
        })(i);
    }
}

function checkAdminPassword() {
    var input = document.getElementById("adminPasswordInput");
    var err = document.getElementById("adminLoginError");
    var loginView = document.getElementById("adminLoginView");
    var editView = document.getElementById("adminEditView");
    if (!input || !err || !loginView || !editView) {
        return;
    }

    var pw = input.value;
    if (pw === ADMIN_PASSWORD) {
        adminSessionActive = true;
        err.textContent = "";
        loginView.hidden = true;
        editView.hidden = false;
        renderAdminItems();
    } else {
        adminSessionActive = false;
        err.textContent = "Falsches Passwort.";
    }
}

function openAdminPanel() {
    var modal = document.getElementById("adminModal");
    var loginView = document.getElementById("adminLoginView");
    var editView = document.getElementById("adminEditView");
    if (!modal || !loginView || !editView) {
        return;
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    if (adminSessionActive) {
        loginView.hidden = true;
        editView.hidden = false;
        renderAdminItems();
    } else {
        loginView.hidden = false;
        editView.hidden = true;
        var pwInput = document.getElementById("adminPasswordInput");
        if (pwInput) {
            pwInput.focus();
        }
    }
}

function closeAdminPanel() {
    var modal = document.getElementById("adminModal");
    if (!modal) {
        return;
    }
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    if (window.location.hash === "#admin") {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
}

function adminLogout() {
    adminSessionActive = false;
    var input = document.getElementById("adminPasswordInput");
    var loginView = document.getElementById("adminLoginView");
    var editView = document.getElementById("adminEditView");
    var err = document.getElementById("adminLoginError");
    if (input) {
        input.value = "";
    }
    if (err) {
        err.textContent = "";
    }
    if (loginView) {
        loginView.hidden = false;
    }
    if (editView) {
        editView.hidden = true;
    }
}

function setupAdmin() {
    var link = document.getElementById("adminLink");
    if (link) {
        link.addEventListener("click", function (e) {
            e.preventDefault();
            if (window.location.hash !== "#admin") {
                window.location.hash = "#admin";
            }
            openAdminPanel();
        });
    }

    var closeBtn = document.getElementById("adminCloseBtn");
    if (closeBtn) {
        closeBtn.addEventListener("click", function () {
            closeAdminPanel();
        });
    }

    var backdrop = document.getElementById("adminBackdrop");
    if (backdrop) {
        backdrop.addEventListener("click", function () {
            closeAdminPanel();
        });
    }

    var loginBtn = document.getElementById("adminLoginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", function () {
            checkAdminPassword();
        });
    }

    var pwInput = document.getElementById("adminPasswordInput");
    if (pwInput) {
        pwInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                checkAdminPassword();
            }
        });
    }

    var addBtn = document.getElementById("adminAddBtn");
    if (addBtn) {
        addBtn.addEventListener("click", function () {
            addNewItem();
        });
    }

    var logoutBtn = document.getElementById("adminLogoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
            adminLogout();
        });
    }

    var exportBtn = document.getElementById("adminExportBtn");
    if (exportBtn) {
        exportBtn.addEventListener("click", function () {
            exportItemsToJson();
        });
    }

    var importBtn = document.getElementById("adminImportBtn");
    var importFile = document.getElementById("adminImportFile");
    if (importBtn && importFile) {
        importBtn.addEventListener("click", function () {
            importFile.click();
        });
        importFile.addEventListener("change", function (e) {
            var target = e.target;
            var file = target.files && target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function () {
                importItemsFromJson(String(reader.result || ""));
            };
            reader.onerror = function () {
                setAdminImportMessage("Datei konnte nicht gelesen werden.", "error");
            };
            reader.readAsText(file);
            target.value = "";
        });
    }

    var resetBtn = document.getElementById("adminResetBtn");
    if (resetBtn) {
        resetBtn.addEventListener("click", function () {
            resetToDefaultItems();
        });
    }

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            var modal = document.getElementById("adminModal");
            if (modal && modal.classList.contains("is-open")) {
                closeAdminPanel();
            }
        }
    });
}

function setupOfferControls() {
    document.getElementById("btnAddYour").addEventListener("click", function () {
        addItem("your");
    });
    document.getElementById("btnAddTheir").addEventListener("click", function () {
        addItem("their");
    });

    function onEnterAdd(side) {
        return function (e) {
            if (e.key === "Enter") {
                addItem(side);
            }
        };
    }
    document.getElementById("yourQtyInput").addEventListener("keydown", onEnterAdd("your"));
    document.getElementById("theirQtyInput").addEventListener("keydown", onEnterAdd("their"));

    document.getElementById("yourOfferList").addEventListener("click", function (e) {
        if (e.target.classList.contains("btn-remove")) {
            var idx = parseInt(e.target.getAttribute("data-index"), 10);
            removeLine("your", idx);
        }
    });
    document.getElementById("theirOfferList").addEventListener("click", function (e) {
        if (e.target.classList.contains("btn-remove")) {
            var idx = parseInt(e.target.getAttribute("data-index"), 10);
            removeLine("their", idx);
        }
    });
}

function init() {
    fillCatalogFilter();
    renderItems();
    fillSelectOptions("yourItemSelect");
    fillSelectOptions("theirItemSelect");
    yourLines = [];
    theirLines = [];
    setupCatalogFilter();
    setupOfferControls();
    setupAdmin();
    refreshAll();

    if (window.location.hash === "#admin") {
        openAdminPanel();
    }
}

document.addEventListener("DOMContentLoaded", init);
