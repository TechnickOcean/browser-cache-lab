Bun.serve({
  port: 3000,
  fetch(req) {
    console.log(`[${Date.now()}]`, req.url)
    return new Response("ok")
  }
})
