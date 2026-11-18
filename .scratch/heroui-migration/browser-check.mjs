import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { randomUUID, createHmac } from 'node:crypto';

// Run against the isolated PHP server and disposable Chrome profile used for this migration.
const origin = 'http://localhost:8017';
const pages = await fetch('http://127.0.0.1:9227/json').then(response => response.json());
const socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
const pending = new Map();
const exceptions = [];
const consoleErrors = [];
const pressResponderWarnings = [];
let sequence = 0;
let onLoad;
socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) { request.reject(new Error(JSON.stringify(message.error))); }
        else { request.resolve(message.result); }
    } else if (message.method === 'Runtime.exceptionThrown') {
        exceptions.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
    } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') {
        consoleErrors.push(message.params.args.map(argument => argument.value ?? argument.description).join(' '));
    } else if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'warning') {
        const warning = message.params.args[0]?.value;
        if (typeof warning === 'string' && warning.startsWith('A PressResponder was rendered without a pressable child.')) {
            pressResponderWarnings.push(warning);
        }
    } else if (message.method === 'Page.loadEventFired') {
        onLoad?.();
    }
};
await new Promise(resolve => { socket.onopen = resolve; });
const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++sequence, { resolve, reject });
    socket.send(JSON.stringify({ id: sequence, method, params }));
});
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) { throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text); }
    return result.result.value;
};
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const waitFor = async expression => {
    for (let attempt = 0; attempt < 100; attempt++) {
        if (await evaluate(`Boolean(${expression})`)) { return; }
        await pause(100);
    }
    throw new Error('Timed out: ' + expression + '\n' + await evaluate('document.body.innerText.slice(0, 1800)'));
};
const clickExpression = async expression => {
    const point = await evaluate(`(() => { const node = ${expression}; if (!node) { throw new Error('Missing click target'); } node.scrollIntoView({block: 'center'}); const r = node.getBoundingClientRect(); return {x: r.x+r.width/2, y: r.y+r.height/2}; })()`);
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', ...point });
    await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
};
const click = selector => clickExpression(`document.querySelector(${JSON.stringify(selector)})`);
const button = text => clickExpression(`[...document.querySelectorAll('button')].find(node => node.textContent.trim() === ${JSON.stringify(text)})`);
const fill = (name, value) => evaluate(`(() => { const input = document.querySelector('input[name="${name}"]'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, ${JSON.stringify(value)}); input.dispatchEvent(new Event('input', {bubbles: true})); })()`);
const key = async (value, modifiers = 0) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: value, modifiers });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: value, modifiers });
};
const navigate = async path => {
    const loaded = new Promise(resolve => { onLoad = resolve; });
    await send('Page.navigate', { url: origin + path });
    await loaded;
    await waitFor('document.readyState === "complete" && document.querySelector("#app")?.children.length > 0');
    await waitFor(hydrated);
    await pause(100);
};
const hydrated = `Object.keys(document.querySelector('button') ?? document.querySelector('a') ?? {}).some(key => key.startsWith('__reactProps'))`;
const check = name => console.log('PASS ' + name);
const totp = (secret, timestamp = Date.now()) => {
    const bits = [...secret].map(character => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(character).toString(2).padStart(5, '0')).join('');
    const bytes = Buffer.from(bits.match(/.{8}/g).map(byte => parseInt(byte, 2)));
    const counter = Buffer.alloc(8);
    counter.writeBigUInt64BE(BigInt(Math.floor(timestamp / 30000)));
    const hash = createHmac('sha1', bytes).update(counter).digest();
    return ((hash.readUInt32BE(hash[19] & 15) & 0x7fffffff) % 1000000).toString().padStart(6, '0');
};

try {
    await send('Network.clearBrowserCookies');
    await send('Page.enable');
    await send('Runtime.discardConsoleEntries');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await navigate('/register');
    consoleErrors.length = 0;
    await waitFor(hydrated);
    const email = `heroui-${randomUUID()}@example.com`;
    const password = 'HeroUI-test-7391!';
    await fill('name', 'HeroUI browser test');
    await fill('email', email);
    await fill('password', password);
    await fill('password_confirmation', 'mismatch');
    await button('Create account');
    await waitFor('document.querySelector("[role=alert]")?.textContent.includes("confirmation")');
    assert.equal(await evaluate('document.querySelector("input[name=password]").getAttribute("aria-invalid")'), 'true');
    await fill('password', password);
    await fill('password_confirmation', password);
    await button('Create account');
    await waitFor('location.pathname === "/email/verify"');
    check('registration, validation association, and password reset');

    const log = await readFile('storage/logs/laravel.log', 'utf8');
    const verification = [...log.matchAll(/http:\/\/localhost:8017\/email\/verify\/[^\s<>]+/g)].at(-1)?.[0];
    assert.ok(verification, 'Verification link must be captured by the isolated log mailer');
    await send('Page.navigate', { url: verification.replaceAll('&amp;', '&') });
    await waitFor('location.pathname === "/dashboard" && document.querySelector("#app-sidebar")');
    await waitFor(hydrated);
    await pause(300);
    assert.equal(await evaluate('JSON.parse(document.querySelector("script[data-page]").textContent).component'), 'dashboard');
    assert.deepEqual(pressResponderWarnings, [], 'No PressResponder warnings when opening the dashboard');
    check('email verification and dashboard rendering');

    await click('[aria-label="Toggle sidebar"]');
    await waitFor('document.cookie.includes("sidebar_state=false")');
    await key('b', 2);
    await waitFor('document.cookie.includes("sidebar_state=true")');
    await navigate('/dashboard');
    assert.equal(await evaluate('document.querySelector("#app-sidebar").getBoundingClientRect().width'), 256);
    check('sidebar collapse, keyboard shortcut, and cookie persistence');

    await click('[aria-label="Account menu"]');
    await waitFor('document.querySelector("[role=menu]")');
    await click('[role=menuitem]');
    await waitFor('location.pathname === "/settings/profile"');
    await fill('name', 'HeroUI updated');
    await click('[data-test="update-profile-button"]');
    await waitFor('document.querySelector("#app-sidebar").textContent.includes("HeroUI updated")');
    await waitFor('document.querySelector("[data-slot=toast]")?.textContent.includes("Profile updated.")');
    check('account dropdown, Inertia navigation, and profile submission');

    await click('[data-test="delete-user-button"]');
    await waitFor('document.querySelector("[role=dialog]")');
    await fill('password', 'temporary');
    await button('Cancel');
    await waitFor('!document.querySelector("[role=dialog]")');
    await click('[data-test="delete-user-button"]');
    await waitFor('document.querySelector("[role=dialog]")');
    assert.equal(await evaluate('document.querySelector("[role=dialog] input").value'), '');
    await key('Escape');
    await waitFor('!document.querySelector("[role=dialog]")');
    check('delete modal cancellation, sensitive input cleanup, and Escape');

    await navigate('/settings/appearance');
    for (const mode of ['Light', 'Dark']) {
        await button(mode);
        await waitFor(`localStorage.getItem('appearance') === '${mode.toLowerCase()}'`);
        for (const width of [375, 768, 1280]) {
            await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
            await pause(150);
            assert.ok(await evaluate('document.documentElement.scrollWidth <= innerWidth'), `${mode} overflow at ${width}px`);
        }
        const screenshot = await send('Page.captureScreenshot', { format: 'png' });
        await writeFile(`storage/framework/testing/heroui-${mode.toLowerCase()}.png`, Buffer.from(screenshot.data, 'base64'));
    }
    await button('System');
    await navigate('/settings/appearance');
    assert.equal(await evaluate('localStorage.getItem("appearance")'), 'system');
    check('light/dark/system persistence and responsive layout');

    await send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await pause(200);
    await click('[aria-label="Toggle sidebar"]');
    await waitFor('document.querySelector("[role=dialog]")');
    await pause(500);
    await click('[role=dialog] [aria-label="Dashboard"]');
    await waitFor('location.pathname === "/dashboard" && !document.querySelector("[role=dialog]")');
    check('mobile drawer and closing after navigation');

    await navigate('/settings/security');
    await waitFor('location.pathname === "/user/confirm-password" || location.pathname === "/confirm-password"');
    await fill('password', password);
    await click('button[type=submit]');
    await waitFor('location.pathname === "/settings/security"');
    await button('Enable 2FA');
    await waitFor('document.querySelector("[role=dialog] input[readonly]")');
    const secret = await evaluate('document.querySelector("[role=dialog] input[readonly]").value');
    await button('Continue');
    await waitFor('document.querySelector("input[name=code]")');
    await fill('code', '123');
    assert.equal(await evaluate('[...document.querySelectorAll("button")].find(node => node.textContent.trim() === "Confirm").disabled'), true);
    await fill('code', '000000');
    await button('Confirm');
    await waitFor('document.querySelector("#confirm-code-error")?.textContent');
    assert.equal(await evaluate('document.querySelector("input[name=code]").value'), '');
    await key('Escape');
    await waitFor('!document.querySelector("[role=dialog]")');
    check('password confirmation, 2FA setup, and OTP submission guard');
    await button('Continue setup');
    await button('Continue');
    await waitFor('document.querySelector("input[name=code]")');
    const confirmedAt = Date.now();
    await fill('code', totp(secret, confirmedAt));
    await button('Confirm');
    await waitFor('!document.querySelector("[role=dialog]") && document.body.textContent.includes("Disable 2FA")');

    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
    await pause(200);
    await click('[aria-label="Account menu"]');
    await waitFor('document.querySelector("[data-test=logout-button]")');
    await click('[data-test="logout-button"]');
    await waitFor('location.pathname === "/"');
    await navigate('/login');
    await click('input[name=remember]');
    assert.equal(await evaluate('new FormData(document.querySelector("form")).has("remember")'), true);
    await fill('email', email);
    await fill('password', password);
    await click('[aria-label="Show password"]');
    assert.equal(await evaluate('document.querySelector("input[name=password]").type'), 'text');
    await click('[aria-label="Hide password"]');
    await button('Log in');
    await waitFor('location.pathname === "/two-factor-challenge"');
    await button('login using a recovery code');
    await fill('recovery_code', 'invalid-recovery-code');
    await button('Continue');
    await waitFor('document.querySelector("#recovery_code-error")?.textContent');
    await button('login using an authentication code');
    const nextCodeAt = (Math.floor(confirmedAt / 30000) + 1) * 30000;
    if (Date.now() < nextCodeAt) {
        await pause(nextCodeAt - Date.now() + 100);
    }
    await fill('code', totp(secret));
    await button('Continue');
    await waitFor('location.pathname === "/dashboard"');
    check('logout, remember-me payload, password visibility, and login');
    check('2FA confirmation, recovery-code error, mode switching, and OTP login');
    await navigate('/settings/security');
    await fill('password', password);
    await button('Confirm password');
    await waitFor('location.pathname === "/settings/security"');
    await button('Disable 2FA');
    await waitFor('document.body.textContent.includes("Enable 2FA")');
    await click('[aria-label="Account menu"]');
    await waitFor('document.querySelector("[data-test=logout-button]")');
    await click('[data-test="logout-button"]');
    await waitFor('location.pathname === "/"');
    await navigate('/forgot-password');
    await fill('email', email);
    await button('Email password reset link');
    await waitFor('document.body.textContent.includes("We have emailed")');
    const resetLog = await readFile('storage/logs/laravel.log', 'utf8');
    const resetLink = [...resetLog.matchAll(/http:\/\/localhost:8017\/reset-password\/[^\s<>]+/g)].at(-1)?.[0];
    assert.ok(resetLink);
    await navigate(new URL(resetLink.replaceAll('&amp;', '&')).pathname + new URL(resetLink.replaceAll('&amp;', '&')).search);
    await fill('password', password + 'reset');
    await fill('password_confirmation', password + 'reset');
    await button('Reset password');
    await waitFor('location.pathname === "/login"');
    await fill('email', email);
    await fill('password', password + 'reset');
    await button('Log in');
    await waitFor('location.pathname === "/dashboard"');
    check('forgot password, reset submission, and login with the new password');
    await send('WebAuthn.enable');
    const { authenticatorId } = await send('WebAuthn.addVirtualAuthenticator', {
        options: {
            protocol: 'ctap2',
            transport: 'internal',
            hasResidentKey: true,
            hasUserVerification: true,
            isUserVerified: true,
            automaticPresenceSimulation: true,
        },
    });
    await navigate('/settings/security');
    await fill('password', password + 'reset');
    await button('Confirm password');
    await waitFor('location.pathname === "/settings/security"');
    await button('Add passkey');
    await evaluate(`(() => {
        const input = document.querySelector('#passkey-name');
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, 'HeroUI virtual authenticator');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);
    await button('Register passkey');
    await waitFor('document.body.textContent.includes("HeroUI virtual authenticator") && !document.querySelector("#passkey-name")');
    await button('Remove');
    await waitFor('document.querySelector("[role=dialog]")');
    await button('Cancel');
    await waitFor('!document.querySelector("[role=dialog]")');
    assert.ok(await evaluate('document.body.textContent.includes("HeroUI virtual authenticator")'));
    await button('Remove');
    await waitFor('document.querySelector("[role=dialog]")');
    await button('Remove passkey');
    await waitFor('document.body.textContent.includes("No passkeys yet")');
    await send('WebAuthn.removeVirtualAuthenticator', { authenticatorId });
    check('virtual passkey registration, delete cancellation, and confirmed deletion');
    assert.deepEqual(exceptions, [], 'No browser runtime exceptions');
    assert.deepEqual(consoleErrors, [], 'No browser console errors');
    assert.deepEqual(pressResponderWarnings, [], 'No PressResponder warnings during navigation and authentication');
    check('no browser runtime exceptions');
} finally {
    socket.close();
}

