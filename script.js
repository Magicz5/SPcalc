/**
 * script.js – Startphase
 * Hier stehen nur Demo-Daten und einfache Helfer.
 * Später: echte Werte, Eingaben, Berechnung.
 */

// Demo-Items für "Your Offer"
var demoYourItems = [
    { name: "Void Shard", qty: 3, valueEach: 1200 },
    { name: "Raid Token", qty: 10, valueEach: 150 },
];

// Demo-Items für "Their Offer"
var demoTheirItems = [
    { name: "Mythic Chest", qty: 1, valueEach: 4500 },
    { name: "Boss Ticket", qty: 2, valueEach: 2000 },
];

// Referenz-Tabelle (später aus Datei oder Server)
var demoValueRows = [
    { item: "Void Shard", value: 1200, note: "Beispiel" },
    { item: "Raid Token", value: 150, note: "Beispiel" },
    { item: "Mythic Chest", value: 4500, note: "Beispiel" },
    { item: "Boss Ticket", value: 2000, note: "Beispiel" },
];

// Summe für eine Liste von Items (einfache Demo-Rechnung)
function sumItems(items) {
    var total = 0;
    var i;
    for (i = 0; i < items.length; i++) {
        total += items[i].qty * items[i].valueEach;
    }
    return total;
}

// Eine Zeile in der Angebots-Liste bauen
function makeItemRow(item) {
    var lineTotal = item.qty * item.valueEach;
    return (
        '<li class="item-row">' +
        '<div><span class="item-row__name">' +
        item.name +
        '</span> <span class="item-row__meta">×' +
        item.qty +
        "</span></div>" +
        '<span class="item-row__value">' +
        lineTotal.toLocaleString("de-DE") +
        "</span>" +
        "</li>"
    );
}

// Liste in HTML füllen
function fillList(elementId, items) {
    var el = document.getElementById(elementId);
    var html = "";
    var i;
    for (i = 0; i < items.length; i++) {
        html += makeItemRow(items[i]);
    }
    el.innerHTML = html;
}

// Demo-Ergebnis-Zahlen setzen (nur Anzeige, keine echte Trade-Logik)
function fillResult(yourSum, theirSum) {
    var diffEl = document.getElementById("resultDiff");
    var hintEl = document.getElementById("resultHint");
    var statYour = document.getElementById("statYour");
    var statTheir = document.getElementById("statTheir");

    statYour.textContent = yourSum.toLocaleString("de-DE");
    statTheir.textContent = theirSum.toLocaleString("de-DE");

    // Einfache Demo-Differenz in Prozent (nur wenn dein Wert > 0)
    var percent = 0;
    if (yourSum > 0) {
        percent = ((theirSum - yourSum) / yourSum) * 100;
    }

    var rounded = Math.round(percent * 10) / 10;
    var sign = rounded > 0 ? "+" : "";
    diffEl.textContent = sign + rounded + " %";
    hintEl.textContent =
        "Demo: positiv = du bekommst relativ mehr, negativ = weniger.";

    // Farbe nur leicht anpassen (kein harter Stilwechsel)
    if (rounded >= 0) {
        diffEl.style.color = "var(--accent)";
    } else {
        diffEl.style.color = "#e07070";
    }
}

// Tabelle füllen
function fillTable() {
    var body = document.getElementById("valueTableBody");
    var html = "";
    var i;
    for (i = 0; i < demoValueRows.length; i++) {
        var row = demoValueRows[i];
        html +=
            "<tr>" +
            "<td>" +
            row.item +
            "</td>" +
            "<td>" +
            row.value.toLocaleString("de-DE") +
            "</td>" +
            "<td>" +
            row.note +
            "</td>" +
            "</tr>";
    }
    body.innerHTML = html;
}

// Admin-Link: noch keine Zielseite – Klick blockieren (kein Sprung nach oben)
function setupAdminLink() {
    var link = document.getElementById("adminLink");
    link.addEventListener("click", function (event) {
        event.preventDefault();
        // Später: window.location.href = "admin.html";
    });
}

// Beim Laden: alles einmal aufbauen
function init() {
    var yourSum = sumItems(demoYourItems);
    var theirSum = sumItems(demoTheirItems);

    fillList("yourOfferList", demoYourItems);
    fillList("theirOfferList", demoTheirItems);

    document.getElementById("yourOfferTotal").textContent =
        yourSum.toLocaleString("de-DE");
    document.getElementById("theirOfferTotal").textContent =
        theirSum.toLocaleString("de-DE");

    fillResult(yourSum, theirSum);
    fillTable();
    setupAdminLink();
}

document.addEventListener("DOMContentLoaded", init);
