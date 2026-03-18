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

const [flag, url] = process.argv.slice(2);

if (!url.startsWith('http://') && !url.startsWith('https://')) {
    console.error('Invalid URL');
    process.exit(1);
}

try {
    const page = await browser.newPage();
    await page.goto('http://localhost:8080');
    await page.waitForSelector('input[name="note"]');
    await page.type('input[name="note"]', flag);
    await page.click('input[type="submit"]');
    await new Promise(res => setTimeout(res, 1000));
    await page.goto(url);
    // 原来是 10000，为了加速改为 6000
    await new Promise(res => setTimeout(res, 6000));
    await page.close();
} catch (e) {
    console.error(e);
};

await browser.close();
