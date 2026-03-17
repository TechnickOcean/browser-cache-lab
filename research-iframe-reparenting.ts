import { Hono } from "hono"

const app = new Hono()

// lab 说明：使用 bun --watch research-iframe-reparenting.ts 启动，route 后添加 ?d=1 query 以禁用 bfcache。

function buildBFCacheHTML(msg: string, context: any, suffix = "") {
  if (context.req.query('d')) context.header('Cache-Control', 'no-store')
  return /* html */`
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

// 1. same document 下 iframe src 的变化会添加到 history state, 可以通过 history.back() 回溯，且不会回溯 iframe parent 状态(此例中为 sandbox)

app.get('/1', c => c.html(buildBFCacheHTML('remove sandbox, src change added to history', c, /* html */`<body>
  <iframe sandbox id=f src="data:text/html,test1:<script>document.writeln(Math.random())</script>"></iframe>
  <button onclick="loadTest2()">load test2</button>
</body>
<script>
  function loadTest2() {
    f.removeAttribute('sandbox')
    f.src = 'data:text/html,test2:<script>document.writeln(Math.random())<\\/script>'
  }
</script>`)))

// 2. cross document 导航后单次回溯，不会影响 iframe src

app.get('/2', c => c.html(buildBFCacheHTML('remove sandbox, navigate cross document', c, /* html */`<body>
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

// 3. 利用 2. 在禁用 bfcache 的情况下，可以达到通过导航控制 iframe 的 sandbox 等属性。

app.get('/3', c => c.html(buildBFCacheHTML('add sandbox, navigate cross document', c, /* html */`<body>
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
