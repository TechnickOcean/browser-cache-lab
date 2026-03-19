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

const [url] = process.argv.slice(2);

function sleep(time) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

if (!url.startsWith('http://') && !url.startsWith('https://')) {
  console.error('Invalid URL');
  process.exit(1);
}

try {
  const page = await ctx.newPage();
  await page.goto("http://localhost:1337", { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  await page.type("input[name=name]", "admin");
  await page.type("input[name=pass]", process.env.ADMIN_PASSWORD || "admin_password");
  await page.click("input[type=submit]");
  await sleep(2000);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await sleep(65000);
} catch (e) {
  console.error(e);
};

await browser.close();
