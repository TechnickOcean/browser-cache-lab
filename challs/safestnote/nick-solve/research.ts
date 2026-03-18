import { Hono } from "hono"

const app = new Hono()

app.get("/", (c) =>
  c.html(`
<script>
setTimeout(() => {
  const p = new URLSearchParams(location.search)
  let n = parseInt(p.get("n") || "0")
  if(n < 50)
    location.href = "/?n=" + (n + 1)
}, 200)
</script>`)
)

export default app
