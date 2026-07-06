import './style.css'

// Mobile nav toggle
const toggle = document.querySelector('.nav-toggle')
const nav = document.getElementById('primary-nav')

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open')
    toggle.setAttribute('aria-expanded', String(open))
  })

  // Close menu after clicking a link on small screens
  nav.addEventListener('click', (e) => {
    if (e.target instanceof HTMLAnchorElement) {
      nav.classList.remove('is-open')
      toggle.setAttribute('aria-expanded', 'false')
    }
  })
}

// Contact form → LaunchCraft Advisor chat
const form = document.querySelector('.contact-form')
const status = form?.querySelector('.form-status') ?? null
const submitBtn = form?.querySelector('button[type="submit"]') ?? null
const chat = document.querySelector('.advisor-chat')
const replyEl = document.querySelector('.advisor-reply')
const resetBtn = document.querySelector('.advisor-reset')

const CHAT_ENDPOINT = '/api/chat'

function setStatus(message, tone) {
  if (!status) return
  status.textContent = message
  status.classList.remove('is-success', 'is-error')
  if (tone === 'success') status.classList.add('is-success')
  if (tone === 'error') status.classList.add('is-error')
}

function setSubmitting(isSubmitting) {
  if (!submitBtn) return
  submitBtn.disabled = isSubmitting
  submitBtn.dataset.label = submitBtn.dataset.label || submitBtn.textContent
  submitBtn.textContent = isSubmitting ? 'Sending…' : submitBtn.dataset.label
}

function renderReply(text) {
  if (!replyEl) return
  // Preserve simple paragraph breaks; backend returns plain text with \n\n.
  const html = String(text)
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, '<br>')}</p>`)
    .join('')
  replyEl.innerHTML = html
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function showAdvisor(reply) {
  if (!chat) return
  renderReply(reply)
  chat.hidden = false
  // Move focus for screen readers / keyboard users.
  chat.setAttribute('tabindex', '-1')
  chat.focus({ preventScroll: false })
}

function hideAdvisor() {
  if (!chat) return
  chat.hidden = true
}

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const project = String(data.get('project') || '').trim()

    if (!name || !email || !project) {
      setStatus('Please fill in every field before sending.', 'error')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('That email address looks off — mind checking it?', 'error')
      return
    }

    setSubmitting(true)
    setStatus('')

    try {
      const res = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, project })
      })

      const payload = await res.json().catch(() => ({}))

      if (!res.ok || !payload?.reply) {
        const friendly =
          payload?.error ||
          'Our advisor is taking a quick breather. Please try again in a moment.'
        throw new Error(friendly)
      }

      hideAdvisor() // clear any previous chat
      form.hidden = true
      showAdvisor(payload.reply)
    } catch (err) {
      // Friendly error — keep the form visible so the user can retry.
      setStatus(
        err?.message ||
          'We couldn\'t reach the advisor right now. Please try again.',
        'error'
      )
    } finally {
      setSubmitting(false)
    }
  })
}

if (resetBtn && form && chat) {
  resetBtn.addEventListener('click', () => {
    hideAdvisor()
    form.hidden = false
    setStatus('')
    form.reset()
    const firstField = form.querySelector('input, textarea')
    if (firstField instanceof HTMLElement) firstField.focus()
  })
}

// Footer year
const yearEl = document.getElementById('year')
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear())
}
