#!/usr/bin/env node
// admin bot simulator

import puppeteer from 'puppeteer';

const browser = await puppeteer.launch({
    pipe: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--js-flags=--jitless',
        '--incognito'
    ],
    // nick: just for debug
    // headless: false
});
const FLAG = process.env.FLAG || "flag{H4h@_l0ca1_f4k3_f1a9_1i4514}"
const [url] = process.argv.slice(2);

if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('Invalid URL');
    process.exit(1);
}

try {
    await browser.setCookie({
        name: "flag",
        value: FLAG,
        domain: "localhost",
        httpOnly: false
    })
    const page = await browser.newPage();
    await page.goto(url);
    await new Promise(res => setTimeout(res, 70000));
    await page.close();
} catch (e) {
    console.error(e);
};

await browser.close();
