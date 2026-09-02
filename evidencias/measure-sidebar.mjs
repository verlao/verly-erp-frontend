import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const [label, size, url = 'http://127.0.0.1:5173/evidence-seed.html'] = process.argv.slice(2)
if (!label || !/^\d+x\d+$/.test(size ?? '')) {
  console.error('usage: node evidencias/measure-sidebar.mjs <label> <width>x<height> [url]')
  process.exit(1)
}

const [width, height] = size.split('x').map(Number)
const profile = await mkdtemp(join(tmpdir(), 'verly-sidebar-evidence-'))
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
  url,
], { stdio: 'ignore' })

async function devtoolsPort() {
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const [port] = (await readFile(join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')
      return Number(port)
    } catch {
      await new Promise(resolve => setTimeout(resolve, 50))
    }
  }
  throw new Error('Chrome DevTools port was not created')
}

async function evaluate(webSocketUrl, expression) {
  const socket = new WebSocket(webSocketUrl)
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true })
    socket.addEventListener('error', reject, { once: true })
  })

  let nextId = 0
  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId
    const onMessage = event => {
      const message = JSON.parse(event.data)
      if (message.id !== id) return
      socket.removeEventListener('message', onMessage)
      if (message.error) reject(new Error(message.error.message))
      else resolve(message.result)
    }
    socket.addEventListener('message', onMessage)
    socket.send(JSON.stringify({ id, method, params }))
  })

  await command('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  })
  await new Promise(resolve => setTimeout(resolve, 500))
  const response = await command('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  socket.close()
  return response.result.value
}

try {
  const port = await devtoolsPort()
  await new Promise(resolve => setTimeout(resolve, 3000))
  const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json())
  const page = targets.find(target => target.type === 'page')
  if (!page) throw new Error('No Chrome page target found')

  const result = await evaluate(page.webSocketDebuggerUrl, `(() => {
    const round = value => Math.round(value)
    const nav = document.querySelector('aside nav')
    const navRect = nav.getBoundingClientRect()
    const items = [...nav.querySelectorAll(':scope > button, [data-navigation-item]')]
      .filter((item, index, all) => all.indexOf(item) === index)
      .map(item => {
        const rect = item.getBoundingClientRect()
        return {
          label: item.getAttribute('aria-label') || item.getAttribute('title'),
          top: round(rect.top),
          bottom: round(rect.bottom),
          height: round(rect.height),
          visible: rect.top >= navRect.top && rect.bottom <= navRect.bottom,
        }
      })
    const logout = document.querySelector('aside [aria-label="Sair"]')
    const logoutRect = logout.getBoundingClientRect()
    const scrollUp = document.querySelector('aside [aria-label="Ver destinos anteriores"]')
    const scrollDown = document.querySelector('aside [aria-label="Ver mais destinos"]')
    const hitTarget = document.elementFromPoint(
      logoutRect.left + logoutRect.width / 2,
      logoutRect.top + logoutRect.height / 2,
    )

    return {
      viewport: { width: innerWidth, height: innerHeight },
      nav: {
        top: round(navRect.top),
        bottom: round(navRect.bottom),
        clientHeight: nav.clientHeight,
        scrollHeight: nav.scrollHeight,
      },
      count: items.length,
      visibleCount: items.filter(item => item.visible).length,
      hidden: items.filter(item => !item.visible).map(item => item.label),
      items,
      financeReachable: items.find(item => item.label === 'Financeiro')?.visible ?? false,
      overflowAffordance: {
        up: Boolean(scrollUp),
        down: Boolean(scrollDown),
      },
      logout: {
        top: round(logoutRect.top),
        bottom: round(logoutRect.bottom),
        visible: logoutRect.top >= 0 && logoutRect.bottom <= innerHeight,
        clickable: !logout.disabled && (hitTarget === logout || logout.contains(hitTarget)),
      },
    }
  })()`)

  console.log(JSON.stringify({ label, ...result }, null, 2))
} finally {
  chrome.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => chrome.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 2000)),
  ])
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
