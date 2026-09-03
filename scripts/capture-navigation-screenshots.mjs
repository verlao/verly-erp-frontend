import { spawn } from 'node:child_process'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import process from 'node:process'

const chromePath =
  process.env.CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const appUrl = process.env.APP_URL ?? 'http://127.0.0.1:5173/ledger'
const outputDirectory = process.argv[2]

if (!outputDirectory) {
  console.error(
    'Usage: node scripts/capture-navigation-screenshots.mjs <output-directory>',
  )
  process.exit(1)
}

const debugPort = 9222 + Math.floor(Math.random() * 500)
const profileDirectory = `/tmp/verly-navigation-proof-${process.pid}`
const tokenPayload = Buffer.from(
  JSON.stringify({ sub: 'navigation-proof', exp: 4_102_444_800 }),
).toString('base64url')
const proofToken = `proof.${tokenPayload}.signature`
const proofUser = JSON.stringify({
  id: 1,
  username: 'navigation-proof',
  roles: ['ROLE_ADMIN'],
})

const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDirectory}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

const sleep = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function waitForTarget() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`)
      const targets = await response.json()
      const page = targets.find((target) => target.type === 'page')
      if (page) return page
    } catch {
      // Chrome has not opened its debugging socket yet.
    }
    await sleep(100)
  }
  throw new Error('Headless Chrome did not expose a page target')
}

function connect(webSocketUrl) {
  const socket = new WebSocket(webSocketUrl)
  const pending = new Map()
  const events = new Map()
  let nextId = 1

  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data)
    if (message.id) {
      const request = pending.get(message.id)
      if (!request) return
      pending.delete(message.id)
      if (message.error) request.reject(new Error(message.error.message))
      else request.resolve(message.result)
      return
    }

    const listeners = events.get(message.method) ?? []
    events.delete(message.method)
    listeners.forEach((resolve) => resolve(message.params))
  })

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  return {
    async send(method, params = {}) {
      await opened
      const id = nextId
      nextId += 1
      socket.send(JSON.stringify({ id, method, params }))
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject })
      })
    },
    once(method) {
      return new Promise((resolve) => {
        events.set(method, [...(events.get(method) ?? []), resolve])
      })
    },
    close() {
      socket.close()
    },
  }
}

async function navigate(client, url) {
  const loaded = client.once('Page.loadEventFired')
  await client.send('Page.navigate', { url })
  await loaded
}

try {
  await mkdir(outputDirectory, { recursive: true })
  const target = await waitForTarget()
  const client = connect(target.webSocketDebuggerUrl)

  await client.send('Page.enable')
  await client.send('Runtime.enable')
  await navigate(client, appUrl)
  await client.send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('token', ${JSON.stringify(proofToken)});
      localStorage.setItem('user', ${JSON.stringify(proofUser)});
      localStorage.setItem('sidebar-collapsed', 'false');
    `,
  })
  await navigate(client, appUrl)

  const viewports = [
    { name: 'mobile-390x844.png', width: 390, height: 844, mobile: true },
    { name: 'sidebar-1000x600.png', width: 1000, height: 600, mobile: false },
  ]

  for (const viewport of viewports) {
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 1,
      mobile: viewport.mobile,
    })
    await navigate(client, appUrl)
    await sleep(750)
    const { data } = await client.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: false,
    })
    await writeFile(
      `${outputDirectory}/${viewport.name}`,
      Buffer.from(data, 'base64'),
    )
    console.log(
      `Captured ${outputDirectory}/${viewport.name} (${viewport.width}x${viewport.height})`,
    )
  }

  client.close()
} finally {
  chrome.kill('SIGTERM')
  if (chrome.exitCode === null) {
    await Promise.race([
      new Promise((resolve) => chrome.once('exit', resolve)),
      sleep(1_000),
    ])
  }
  await rm(profileDirectory, { recursive: true, force: true })
}
