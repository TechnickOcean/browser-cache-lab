import { Hono } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'
const app = new Hono()

function buildBFCacheHTML(msg: string, suffix = "") {
  return /* html */`
  <!Doctype html>
  <html>
    <body>
      <h1>${msg}</h1>
      <span id="rand"></span>
      <br />
      <span id="msg"></span>
      ${suffix}
    </body>
    <script>
      console.log("run")
      rand.textContent = Math.random()
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
          msg.textContent = 'hit bfcache.'
          msg.style.color = 'blue'
          } else {
            msg.textContent = 'fetched from remote.'
            msg.style.color = 'red'
        }
      });
    </script>
  </html>`
}

app.get('/', (c) => c.html(buildBFCacheHTML("index")))

app.get('/no-store', (c) => {
  c.header('Cache-Control', 'no-store')
  return c.html(buildBFCacheHTML("Cache-Control: no-store"))
})

app.get('/no-cache', (c) => {
  c.header('Cache-Control', 'no-cache')
  return c.html(buildBFCacheHTML("Cache-Control: no-cache"))
})

app.get('/status/:statuscode', (c) => {
  const statuscode = parseInt(c.req.param('statuscode'), 10) as StatusCode
  c.status(statuscode)
  return c.html(buildBFCacheHTML(`${statuscode} example`))
})

app.get('/window-open', (c) => {
  return c.html(buildBFCacheHTML(
    `opener and opened window will not enter bfcache in chrome`,
    /* html */`<script>const keepit=window.open('/')</script>`
  ))
})


export default app
