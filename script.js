/**
 * Trading Calculator
 *
 * NEUE ITEMS / WERTE: ganz oben bei ITEM_CATALOG eintragen (ein Objekt pro Item).
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

var FAIR_PERCENT = 2;

var yourLines = [];
var theirLines = [];

var FILTER_ALL = "all";

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
    refreshAll();
}

document.addEventListener("DOMContentLoaded", init);
