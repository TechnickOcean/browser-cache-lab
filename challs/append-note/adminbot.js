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
    headless: false
});
const ADMIN_SECRET = process.env.ADMIN_SECRET || "password"
const [url] = process.argv.slice(2);

if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('Invalid URL');
    process.exit(1);
}

try {
    await browser.setCookie({
        name: "admin",
        value: ADMIN_SECRET,
        domain: "localhost",
    })
    const page = await browser.newPage();
    await page.goto(url);
    await new Promise(res => setTimeout(res, 30000));
    await page.close();
} catch (e) {
    console.error(e);
};

await browser.close();
