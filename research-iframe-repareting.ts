import { Hono } from "hono"

const app = new Hono()

function buildBFCacheHTML(msg: string, context: any, suffix = "") {
  if (context.req.query('d')) context.header('Cache-Control', 'no-store')
  return `
  <!Doctype html>
  <html>
    <body>
      <h1>${msg}</h1>
      <span id="rand"></span>
      <br />
      <span id="msg"></span>
      <br />  
      ${suffix}
    </body>
    <script>
      console.log("run")
      ${context.req.query('d') ? 'const _keep = new WebSocket("ws://example.com")' : ''}
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

app.get('/1', c => c.html(buildBFCacheHTML('remove sandbox, src change added to history', c, `<body>
  <iframe sandbox id=f src="data:text/html,test1:<script>document.writeln(Math.random())</script>"></iframe>
  <button onclick="loadTest2()">load test2</button>
</body>
<script>
  function loadTest2() {
    f.removeAttribute('sandbox')
    f.src = 'data:text/html,test2:<script>document.writeln(Math.random())<\\/script>'
  }
</script>`)))

app.get('/2', c => c.html(buildBFCacheHTML('remove sandbox, navigate cross document', c, `<body>
  <iframe sandbox id=f src="data:text/html,test1:<script>document.writeln(Math.random())</script>"></iframe>
  <button onclick="loadTest2()">load test2</button>
  <button onclick="location = 'a.html'">top level navigation</button>
</body>
<script>
  function loadTest2() {
    f.removeAttribute('sandbox')
    f.src = 'data:text/html,test2:<script>document.writeln(Math.random())<\\/script>'
  }
</script>`)))

app.get('/3', c => c.html(buildBFCacheHTML('add sandbox, navigate cross document', c, `<body>
  <iframe id=f src="data:text/html,test1:<script>document.writeln(Math.random())</script>"></iframe>
  <button onclick="loadTest2()">load test2</button>
  <button onclick="location = 'a.html'">top level navigation</button>
</body>
<script>
  function loadTest2() {
    f.setAttribute('sandbox', '')
    f.src = 'data:text/html,test2:<script>document.writeln(Math.random())<\\/script>'
  }
</script>`)))

export default app
