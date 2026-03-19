import { Hono } from "hono"

const app = new Hono()

app.get('/', (c) => {
  return c.html(`
    <form>
      <input type="text" />
      <input type="password" />
    </form>
  `)
})

export default app
