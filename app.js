// AskiMate coming-soon page: countdown and waitlist form.
// The waitlist is saved by a Google Apps Script web app into a Google Sheet in AskiMate's own account.
(function () {
  'use strict';

  var WAITLIST_URL = 'https://script.google.com/macros/s/AKfycbwc36PwftIVM5h81S-PwHnN0aV0TyZ00diLLTo9q-9kAACViVviHa3s1mac2LqYXNv9/exec';
  var LAUNCH = Date.parse('2027-03-01T00:00:00Z');

  // Countdown
  var cells = { d: document.getElementById('d'), h: document.getElementById('h'), m: document.getElementById('m'), s: document.getElementById('s') };
  function pad(n) { return String(n).padStart(2, '0'); }
  function tick() {
    var t = Math.max(0, Math.floor((LAUNCH - Date.now()) / 1000));
    cells.d.textContent = pad(Math.floor(t / 86400));
    cells.h.textContent = pad(Math.floor((t % 86400) / 3600));
    cells.m.textContent = pad(Math.floor((t % 3600) / 60));
    cells.s.textContent = pad(t % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Waitlist
  var form = document.getElementById('signup');
  var input = document.getElementById('email');
  var trap = document.getElementById('website');
  var button = form.querySelector('button');
  var msg = document.getElementById('email-msg');
  var EMAIL = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

  function showError(text) {
    msg.textContent = text;
    msg.className = 'msg err';
    msg.setAttribute('role', 'alert');
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError() {
    msg.textContent = '';
    msg.className = 'msg';
    msg.removeAttribute('role');
    input.removeAttribute('aria-invalid');
  }
  function busy(on) {
    input.disabled = on;
    button.disabled = on;
    button.textContent = on ? 'Joining…' : 'Join waitlist';
  }
  function done(text) {
    var p = document.createElement('p');
    p.className = 'done';
    p.setAttribute('role', 'status');
    p.setAttribute('data-testid', 'status-waitlist');
    p.textContent = text;
    form.replaceWith(p);
  }

  input.addEventListener('input', clearError);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = input.value.trim().toLowerCase();
    if (!email || email.length > 254 || !EMAIL.test(email)) {
      showError('Please enter a valid email address.');
      return;
    }
    clearError();
    busy(true);
    var body = new URLSearchParams({ email: email, website: trap.value });
    fetch(WAITLIST_URL, { method: 'POST', body: body, redirect: 'follow' })
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (res) {
        if (res && (res.status === 'joined' || res.status === 'already_joined')) {
          done(res.status === 'joined'
            ? "You're on the list. We'll email you when AskiMate launches."
            : "You're already on the list. We'll email you when AskiMate launches.");
        } else if (res && res.status === 'invalid') {
          busy(false);
          showError('Please enter a valid email address.');
        } else {
          throw new Error('unexpected reply');
        }
      })
      .catch(function (err) {
        busy(false);
        button.textContent = 'Try again';
        // fetch rejects with a TypeError only when the request never got an answer.
        showError(err instanceof TypeError
          ? "We couldn't connect. Please check your connection and try again."
          : "We couldn't save your email just now. Please try again.");
      });
  });
})();
