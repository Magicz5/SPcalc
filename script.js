/**
 * Trading Calculator – Kernlogik
 * Zentrale Item-Werte + zwei Angebotslisten + Live-Berechnung.
 */

// --- Zentrale Daten: Item-Name → Wert pro Stück (eine Zahl)
var ITEM_VALUES = {
    "Void Shard": 1200,
    "Raid Token": 150,
    "Mythic Chest": 4500,
    "Boss Ticket": 2000,
    "Cursed Finger": 1500,
    "Dark Grail": 800,
};

// Abweichung in %, die noch als „Fair“ gilt (einfacher Schwellenwert)
var FAIR_PERCENT = 2;

// Zwei Seiten: jeweils Liste von { itemKey: string, qty: number }
var yourLines = [];
var theirLines = [];

// --- Hilfen: Eingaben prüfen ---

// Nur positive ganze Zahlen; leer oder falsch → null (kein Absturz)
function parsePositiveInt(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (s === "") {
        return null;
    }
    // Keine Komma-/Punkt-Zahlen (nur Ganzzahlen)
    if (/[.,]/.test(s)) {
        return null;
    }
    var n = parseInt(s, 10);
    if (isNaN(n) || n < 1) {
        return null;
    }
    return n;
}

// Wert pro Item aus der zentralen Tabelle (unbekannt → 0)
function getUnitValue(itemKey) {
    var v = ITEM_VALUES[itemKey];
    return typeof v === "number" ? v : 0;
}

// --- Kernfunktionen (wie gewünscht benannt) ---

// Summe einer Seite: Summe aus (Menge × Stückpreis)
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

// Vergleich: Win / Fair / Loss + Differenz + Prozent (wo sinnvoll)
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

// Zahlen für die Anzeige (de-DE)
function formatNum(n) {
    return n.toLocaleString("de-DE");
}

// Ergebnis-Panel + Fußzeilen aktualisieren
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

// --- Listen zeichnen ---

function makeItemRowHtml(side, index, itemKey, qty) {
    var unit = getUnitValue(itemKey);
    var lineTotal = qty * unit;
    return (
        '<li class="item-row">' +
        '<div class="item-row__main">' +
        '<div><span class="item-row__name">' +
        escapeHtml(itemKey) +
        '</span> <span class="item-row__meta">×' +
        qty +
        "</span></div>" +
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

// Ganz einfaches Escapen für Text in HTML (nur unsere Item-Namen)
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

function renderOfferList(side) {
    var listId = side === "your" ? "yourOfferList" : "theirOfferList";
    var lines = side === "your" ? yourLines : theirLines;
    var ul = document.getElementById(listId);
    var html = "";
    var i;
    for (i = 0; i < lines.length; i++) {
        html += makeItemRowHtml(side, i, lines[i].itemKey, lines[i].qty);
    }
    ul.innerHTML = html;
}

// Nach jeder Änderung: neu rechnen und anzeigen
function refreshAll() {
    var yourTotal = calculateSideValue(yourLines);
    var theirTotal = calculateSideValue(theirLines);
    var trade = calculateTradeResult(yourTotal, theirTotal);
    renderOfferList("your");
    renderOfferList("their");
    updateResultUI(trade);
}

// --- Hinzufügen / Entfernen ---

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
    refreshAll();
}

function removeLine(side, index) {
    var lines = side === "your" ? yourLines : theirLines;
    if (index < 0 || index >= lines.length) {
        return;
    }
    lines.splice(index, 1);
    refreshAll();
}

// --- Dropdowns und Tabelle aus ITEM_VALUES füllen ---

function fillSelectOptions(selectId) {
    var sel = document.getElementById(selectId);
    sel.innerHTML = "";
    var opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "— Item wählen —";
    sel.appendChild(opt0);
    var names = Object.keys(ITEM_VALUES).sort();
    var i;
    for (i = 0; i < names.length; i++) {
        var opt = document.createElement("option");
        opt.value = names[i];
        opt.textContent = names[i];
        sel.appendChild(opt);
    }
}

function fillTable() {
    var body = document.getElementById("valueTableBody");
    body.innerHTML = "";
    var names = Object.keys(ITEM_VALUES).sort();
    var i;
    for (i = 0; i < names.length; i++) {
        var name = names[i];
        var tr = document.createElement("tr");
        var td1 = document.createElement("td");
        td1.textContent = name;
        var td2 = document.createElement("td");
        td2.textContent = formatNum(ITEM_VALUES[name]);
        var td3 = document.createElement("td");
        td3.textContent = "Referenz";
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        body.appendChild(tr);
    }
}

// Klicks: Hinzufügen, Enter in Menge, Zeilen entfernen
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
    fillSelectOptions("yourItemSelect");
    fillSelectOptions("theirItemSelect");
    fillTable();
    yourLines = [];
    theirLines = [];
    setupOfferControls();
    refreshAll();
}

document.addEventListener("DOMContentLoaded", init);
</think>


<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
Read