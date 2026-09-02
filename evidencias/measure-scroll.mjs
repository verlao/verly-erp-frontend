import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const [label, size, url = 'http://127.0.0.1:5173/evidence-seed.html'] = process.argv.slice(2)
if (!label || !/^\d+x\d+$/.test(size ?? '')) {
  console.error('usage: node evidencias/measure-scroll.mjs <label> <width>x<height> [url]')
  process.exit(1)
}

const [width, height] = size.split('x').map(Number)
const profile = await mkdtemp(join(tmpdir(), 'verly-scroll-evidence-'))
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
  const result = response.result.value
  socket.close()
  return result
}

try {
  const port = await devtoolsPort()
  await new Promise(resolve => setTimeout(resolve, 3000))
  const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json())
  const page = targets.find(target => target.type === 'page')
  if (!page) throw new Error('No Chrome page target found')

  const result = await evaluate(page.webSocketDebuggerUrl, `(async () => {
    const selector = element => {
      if (element === document.documentElement) return 'html'
      if (element === document.body) return 'body'
      const classes = [...element.classList].slice(0, 3).join('.')
      return element.tagName.toLowerCase() + (element.id ? '#' + element.id : classes ? '.' + classes : '')
    }
    const elements = [...document.querySelectorAll('*')]
      .filter(element => {
        const style = getComputedStyle(element)
        return /(auto|scroll)/.test(style.overflowY) &&
          element.scrollHeight > element.clientHeight + 1
      })
      .map(element => ({
        element: selector(element),
        clientHeight: element.clientHeight,
        scrollHeight: element.scrollHeight,
      }))
    const pageScrollable = document.documentElement.scrollHeight > innerHeight + 1
    const hotTitle = [...document.querySelectorAll('*')]
      .find(element => /^🔥\\s*Quentes \\(\\d+\\)$/.test(element.textContent?.trim() ?? ''))
    const hotCard = hotTitle?.closest('.rounded-lg.border.bg-card')
    const hotRect = hotCard?.getBoundingClientRect()
    return {
      viewport: { width: innerWidth, height: innerHeight },
      page: {
        scrollable: pageScrollable,
        clientHeight: document.documentElement.clientHeight,
        scrollHeight: document.documentElement.scrollHeight,
      },
      scrollableElements: elements,
      totalScrollableContexts: elements.length + Number(pageScrollable),
      hotCard: hotRect ? {
        top: Math.round(hotRect.top),
        bottom: Math.round(hotRect.bottom),
        visibleWithoutPageScroll: scrollY === 0 && hotRect.top < innerHeight && hotRect.bottom > 0,
        fullyVisibleWithoutPageScroll: scrollY === 0 && hotRect.top >= 0 && hotRect.bottom <= innerHeight,
      } : null,
      route: location.pathname,
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
