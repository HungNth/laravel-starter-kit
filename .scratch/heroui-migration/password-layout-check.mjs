import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const origin = process.env.PASSWORD_LAYOUT_ORIGIN ?? 'https://laravel-react-starter-kit.test';
const pages = await fetch('http://127.0.0.1:9227/json').then(response => response.json());
const socket = new WebSocket(pages.find(page => page.type === 'page').webSocketDebuggerUrl);
await new Promise(resolve => { socket.onopen = resolve; });
let sequence = 0;
let onLoad;
const pending = new Map();
socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
        const request = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) { request.reject(new Error(message.error.message)); }
        else { request.resolve(message.result); }
    } else if (message.method === 'Page.loadEventFired') { onLoad?.(); }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++sequence, { resolve, reject });
    socket.send(JSON.stringify({ id: sequence, method, params }));
});
const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) { throw new Error(result.exceptionDetails.text); }
    return result.result.value;
};
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
const failures = [];
try {
    await send('Page.enable');
    for (const path of process.argv.slice(2).length ? process.argv.slice(2) : ['/login', '/register']) {
        const loaded = new Promise(resolve => { onLoad = resolve; });
        await send('Page.navigate', { url: origin + path });
        await loaded;
        for (let attempt = 0; attempt < 100; attempt++) {
            if (await evaluate(`Object.keys(document.querySelector('input[name=password]') ?? {}).some(key => key.startsWith('__reactProps'))`)) { break; }
            await pause(100);
        }
        assert.equal(await evaluate('location.pathname'), path);
        for (const mode of ['light', 'dark']) {
            await evaluate(`document.documentElement.classList.toggle('dark', '${mode}' === 'dark')`);
            for (const width of [375, 1280]) {
                await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
                await pause(100);
                const fields = await evaluate(`Array.from(document.querySelectorAll('input[name=password],input[name=password_confirmation]')).map(input => {
                    const wrapper = input.parentElement;
                    const toggle = wrapper.querySelector('button');
                    const field = input.getBoundingClientRect();
                    const container = wrapper.getBoundingClientRect();
                    const control = toggle.getBoundingClientRect();
                    return {
                        name: input.name,
                        inputWidth: field.width,
                        wrapperWidth: container.width,
                        fillsWidth: Math.abs(field.width - container.width) <= 2,
                        containsToggle: control.left >= field.left && control.right <= field.right && control.top >= field.top && control.bottom <= field.bottom,
                    };
                })`);
                assert.ok(fields.length > 0, 'Password fields must render');
                for (const field of fields) {
                    const passed = field.fillsWidth && field.containsToggle;
                    console.log(`${passed ? 'PASS' : 'FAIL'} ${path} ${mode} ${width}px ${JSON.stringify(field)}`);
                    if (!passed) { failures.push(`${path} ${mode} ${width}px ${field.name}`); }
                }
                await evaluate(`(() => {
                    const input = document.querySelector('input[name=password]');
                    input.parentElement.querySelector('button').click();
                })()`);
                assert.equal(await evaluate('document.querySelector("input[name=password]").type'), 'text');
                await evaluate('document.querySelector("input[name=password]").parentElement.querySelector("button").click()');
                assert.equal(await evaluate('document.querySelector("input[name=password]").type'), 'password');
                if (mode === 'dark') {
                    const shot = await send('Page.captureScreenshot', { format: 'png' });
                    await writeFile(`storage/framework/testing/password-${path.slice(1)}-${width}.png`, Buffer.from(shot.data, 'base64'));
                }
            }
        }
    }
    assert.deepEqual(failures, [], 'Password inputs must fill their container and contain the visibility toggle');
} finally { socket.close(); }
