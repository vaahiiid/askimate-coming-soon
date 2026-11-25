// AskiMate waitlist: receives the form from askimate.com and saves it in this spreadsheet.
// Sheet "Waitlist" has two columns: email, created_at (UTC).
var SHEET_NAME = 'Waitlist';

function doPost(e) {
  var p = (e && e.parameter) || {};
  // A hidden field that people never fill in; bots often do.
  if (p.website) return reply('joined');

  var email = String(p.email || '').trim().toLowerCase();
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) return reply('invalid');

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    var last = sheet.getLastRow();
    if (last > 1) {
      var found = sheet.getRange(2, 1, last - 1, 1).createTextFinder(email).matchEntireCell(true).findNext();
      if (found) return reply('already_joined');
    }
    // The leading apostrophe stores both as plain text: no formula, no date conversion.
    sheet.appendRow(["'" + email, "'" + new Date().toISOString()]);
    return reply('joined');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return reply('ok');
}

function reply(status) {
  return ContentService.createTextOutput(JSON.stringify({ status: status })).setMimeType(ContentService.MimeType.JSON);
}
