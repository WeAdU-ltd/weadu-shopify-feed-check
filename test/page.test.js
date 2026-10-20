"use strict";
// Loads index.html with feed.js in jsdom, clicks the buttons, and reads the table.
// Every resource request is recorded, so the test also proves nothing leaves the page.
// Needs `npm ci` first (jsdom is the only dev dependency).

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");

const root = path.join(__dirname, "..");
const pageUrl = "file://" + path.join(root, "index.html");

class RecordingLoader extends ResourceLoader {
  constructor() { super(); this.urls = []; }
  fetch(url, options) {
    this.urls.push(url);
    if (!url.startsWith("file://")) return null;
    return super.fetch(url, options);
  }
}

async function openPage(hash) {
  const loader = new RecordingLoader();
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", function (e) { errors.push(e.message); });
  virtualConsole.on("error", function (e) { errors.push(String(e)); });
  const dom = await JSDOM.fromFile(path.join(root, "index.html"), {
    url: pageUrl + (hash || ""),
    runScripts: "dangerously",
    resources: loader,
    virtualConsole: virtualConsole,
  });
  await new Promise(function (resolve) { dom.window.addEventListener("load", resolve); });
  const requests = [];
  dom.window.fetch = function (url) { requests.push(String(url)); return Promise.reject(new Error("blocked")); };
  return { dom: dom, doc: dom.window.document, loader: loader, errors: errors, requests: requests };
}

function rows(doc) {
  return Array.from(doc.querySelectorAll("#rows tr")).map(function (tr) {
    const cells = Array.from(tr.children);
    return { id: cells[0].textContent, title: cells[1].textContent, findings: cells[2].textContent, cls: cells[2].className, suggested: cells[3].textContent };
  });
}

function check(page, text) {
  page.doc.getElementById("feed").value = text;
  page.doc.getElementById("check").click();
}

test("page loads only local files", async function () {
  const page = await openPage();
  assert.deepEqual(page.errors, []);
  assert.deepEqual(page.loader.urls, ["file://" + path.join(root, "feed.js")]);
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  assert.equal(/(src|href)="https?:/i.test(html), false, "no remote script, style, or font");
  for (const word of ["fetch(", "XMLHttpRequest", "sendBeacon", "WebSocket"]) {
    assert.equal(html.includes(word), false, "index.html: " + word);
    assert.equal(fs.readFileSync(path.join(root, "feed.js"), "utf8").includes(word), false, "feed.js: " + word);
  }
});

test("'Load a valid row' shows one clean product", async function () {
  const page = await openPage();
  page.doc.getElementById("sample").click();
  assert.match(page.doc.getElementById("feed").value, /<rss/);
  assert.equal(page.doc.getElementById("summary").textContent.trim(), "1 products, 0 errors, 0 warnings.");
  assert.deepEqual(rows(page.doc), [{ id: "1", title: "Acme Cotton Shirt", findings: "No finding", cls: "", suggested: "" }]);
  assert.deepEqual(page.requests, []);
});

test("'Load a short title' shows a warning", async function () {
  const page = await openPage();
  page.doc.getElementById("short").click();
  const table = rows(page.doc);
  assert.equal(table.length, 1);
  assert.equal(table[0].findings, "warning: title is under 15 characters.");
  assert.equal(table[0].cls, "warn");
  assert.equal(table[0].suggested, "Acme Hat");
});

test("errors are highlighted and pasted HTML is shown as text", async function () {
  const page = await openPage();
  check(page, [
    "id,title,description,link,image_link,availability,price,brand,gtin,condition",
    '7,"<img src=x onerror=alert(1)> Cotton Shirt",Soft.,https://shop.example/p/7,,in_stock,0 EUR,Acme,4006381333932,new',
  ].join("\n"));
  const table = rows(page.doc);
  assert.equal(table[0].title, "<img src=x onerror=alert(1)> Cotton Shirt");
  assert.equal(page.doc.querySelectorAll("#rows img").length, 0, "no element injected");
  assert.equal(table[0].cls, "err");
  assert.match(table[0].findings, /error: image_link is empty\./);
  assert.match(table[0].findings, /error: price must be greater than zero\./);
  assert.match(table[0].findings, /error: gtin check digit or length is invalid\./);
  assert.equal(page.doc.getElementById("summary").textContent.trim(), "1 products, 3 errors, 0 warnings.");
});

test("unknown text shows a feed-level message", async function () {
  const page = await openPage();
  check(page, "hello");
  assert.equal(rows(page.doc).length, 0);
  assert.match(page.doc.getElementById("summary").textContent, /Paste a Google RSS or Atom feed, or a CSV with a header row\./);
  check(page, "");
  assert.match(page.doc.getElementById("summary").textContent, /No product was found in this text\./);
});

test("#sample and #short links prefill the page", async function () {
  const sample = await openPage("#sample");
  assert.equal(rows(sample.doc)[0].title, "Acme Cotton Shirt");
  const short = await openPage("#short");
  assert.equal(rows(short.doc)[0].title, "Hat");
});

test("a second check replaces the previous rows", async function () {
  const page = await openPage();
  page.doc.getElementById("sample").click();
  page.doc.getElementById("short").click();
  assert.equal(rows(page.doc).length, 1);
  assert.equal(rows(page.doc)[0].title, "Hat");
});

test("a Shopify product export is not mapped, a Merchant Center TSV is", function () {
  const feed = require("../feed.js");
  const shopify = feed.auditFeedText("Handle,Title,Body (HTML),Vendor,Variant Price,Variant Barcode,Image Src\nshirt,Acme Cotton Shirt,<p>Soft</p>,Acme,29.00,4006381333931,https://cdn.example/x.jpg");
  const codes = shopify.items[0].findings.map(function (f) { return f.code; });
  assert.ok(codes.includes("missing_id") && codes.includes("missing_price"), "README must keep saying Shopify export columns are not read");
  const tsv = feed.auditFeedText("id\ttitle\tdescription\tlink\timage link\tavailability\tprice\tbrand\tgtin\tcondition\n1\tAcme Cotton Shirt\tSoft.\thttps://a.example/1\thttps://a.example/1.jpg\tin stock\t29.00 EUR\tAcme\t4006381333931\tnew");
  assert.deepEqual(tsv.items[0].findings, []);
});
