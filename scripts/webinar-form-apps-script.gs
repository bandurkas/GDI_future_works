/**
 * GDI Webinar funnel — Google Form → backend webhook.
 *
 * HOW TO INSTALL (one-time):
 *  1. Open the Google Form "Free Webinar Vibe Coding".
 *  2. ⋮ (top-right) → "Script editor"  (or open the bound Sheet → Extensions → Apps Script).
 *  3. Paste this whole file, replacing any default code.
 *  4. Set WEBHOOK_URL and SECRET below (SECRET must equal env WEBINAR_SECRET on the server).
 *  5. Run `installTrigger` once → authorize when prompted.
 *  6. Submit a test response → check it arrives (and a WhatsApp lands on the test number).
 *
 * It maps the form answers to the webhook payload {name, phone, email, gender, reason}.
 * Field titles must match the form questions (edit FIELD_* if you rename questions).
 */

const WEBHOOK_URL = 'https://gdifuture.works/api/webinar/registered';
const SECRET = 'REPLACE_WITH_WEBINAR_SECRET'; // must equal server env WEBINAR_SECRET

const FIELD_NAME = 'Full Name';
const FIELD_PHONE = 'Phone (Terkoneksi dengan WA)';
const FIELD_EMAIL = 'Email';
const FIELD_GENDER = 'Gender';
const FIELD_REASON = 'Kenapa Anda tertarik dengan webinar ini?';

/** Run once to (re)install the onFormSubmit trigger. */
function installTrigger() {
  const form = FormApp.getActiveForm();
  // Remove old triggers to avoid duplicates.
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onWebinarFormSubmit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onWebinarFormSubmit').forForm(form).onFormSubmit().create();
  Logger.log('Trigger installed.');
}

/** Fired on every form submission. */
function onWebinarFormSubmit(e) {
  const answers = {};
  e.response.getItemResponses().forEach(function (ir) {
    answers[ir.getItem().getTitle().trim()] = ir.getResponse();
  });

  const payload = {
    name: answers[FIELD_NAME] || '',
    phone: answers[FIELD_PHONE] || '',
    email: answers[FIELD_EMAIL] || '',
    gender: answers[FIELD_GENDER] || '',
    reason: answers[FIELD_REASON] || '',
  };

  const res = UrlFetchApp.fetch(WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-webinar-secret': SECRET },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });

  Logger.log('Webhook %s → %s %s', payload.phone, res.getResponseCode(), res.getContentText());
}
