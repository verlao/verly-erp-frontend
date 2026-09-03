import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const [output, size, url, networkMode = 'online'] = process.argv.slice(2)
if (!output || !/^\d+x\d+$/.test(size ?? '') || !url) {
  console.error(
    'usage: node evidencias/capture-location.mjs <output.png> <width>x<height> <url> [offline-map]'
  )
  process.exit(1)
}

const [width, height] = size.split('x').map(Number)
const profile = await mkdtemp(join(tmpdir(), 'verly-location-evidence-'))
const chromeArgs = [
  '--headless',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  `--window-size=${width},${height}`,
]
if (networkMode === 'offline-map') {
  chromeArgs.push('--host-resolver-rules=MAP www.openstreetmap.org 127.0.0.1')
}
chromeArgs.push(url)

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', chromeArgs, {
  stdio: 'ignore',
})

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

async function capture(webSocketUrl) {
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
  await new Promise(resolve => setTimeout(resolve, 3000))
  await command('Runtime.evaluate', {
    expression: `(async () => {
      for (let attempt = 0; attempt < 100; attempt++) {
        const ready = [...document.querySelectorAll('h3, button')].some(element =>
          element.getBoundingClientRect().width > 0 &&
          ['Localização', 'Informações de Contato', 'Coordenadas'].includes(element.textContent?.trim())
        )
        if (ready) break
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      const headings = [...document.querySelectorAll('h3')]
      const coordinates = [...document.querySelectorAll('button')]
        .find(element =>
          element.getBoundingClientRect().width > 0 &&
          element.textContent?.trim() === 'Coordenadas'
        )
      coordinates?.click()
      const target = headings.find(element =>
        element.getBoundingClientRect().width > 0 &&
        element.textContent?.trim() === 'Localização'
      )
        ?? coordinates
        ?? headings.find(element =>
          element.getBoundingClientRect().width > 0 &&
          element.textContent?.trim() === 'Informações de Contato'
        )
      const preview = target?.closest('.flex.flex-col.h-full.bg-card')
      const footer = preview
        ? [...preview.querySelectorAll('div')].find(element =>
            element.classList.contains('border-t') && element.classList.contains('shrink-0')
          )
        : null
      if (footer) footer.style.display = 'none'
      if (innerWidth >= 768) {
        if (preview) {
          Object.assign(preview.style, {
            position: 'fixed',
            inset: '0',
            zIndex: '9999',
          })
        }
      }
      target?.scrollIntoView({ block: 'center' })
      if (coordinates) {
        let scroller = coordinates.parentElement
        while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
          scroller = scroller.parentElement
        }
        if (scroller) scroller.scrollTop += 200
      }
    })()`,
    awaitPromise: true,
  })
  await new Promise(resolve => setTimeout(resolve, 4000))
  const result = await command('Page.captureScreenshot', {
    format: 'png',
    fromSurface: true,
    captureBeyondViewport: false,
  })
  socket.close()
  return Buffer.from(result.data, 'base64')
}

try {
  const port = await devtoolsPort()
  const targets = await fetch(`http://127.0.0.1:${port}/json`).then(response => response.json())
  const page = targets.find(target => target.type === 'page')
  if (!page) throw new Error('No Chrome page target found')
  await writeFile(output, await capture(page.webSocketDebuggerUrl))
  console.log(`captured ${output} at ${size} (${networkMode})`)
} finally {
  chrome.kill('SIGTERM')
  await Promise.race([
    new Promise(resolve => chrome.once('exit', resolve)),
    new Promise(resolve => setTimeout(resolve, 2000)),
  ])
  await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 })
}
