import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'

import AskPersonaPanel from './AskPersonaPanel'
import BottomChromeSpacer from '../layout/BottomChromeSpacer'
import ScrollToTop from '../ScrollToTop'

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1 }, authedRequest: vi.fn() }),
}))

Element.prototype.scrollIntoView = vi.fn() // jsdom lacks it

afterEach(async () => {
  cleanup()
  await i18n.changeLanguage('en')
})

const mount = (extra = null) => render(
  <MemoryRouter><AskPersonaPanel userId={1} input={{}} />{extra}</MemoryRouter>,
)

describe('Ask FAB on phones', () => {
  it('has an accessible name from ask_persona_button with the persona name', () => {
    mount()
    const name = i18n.t('ask_persona_button', { name: i18n.t('ask_persona_name') })
    expect(screen.getByRole('button', { name })).toBeTruthy()
  })

  it('collapses to a 48px avatar circle below sm and is a pill from sm up', () => {
    mount()
    const fab = screen.getByRole('button', { name: /Ask/ })
    expect(fab.className).toContain('w-12')
    expect(fab.className).toContain('h-12')
    expect(fab.className).toContain('sm:w-auto')
    expect(fab.className).toContain('sm:h-auto')
  })

  it('hides the label and the 10px status line below sm', () => {
    mount()
    const status = screen.getByText(i18n.t('ask_persona_status'))
    const label = status.parentElement
    expect(label.className).toContain('hidden')
    expect(label.className).toContain('sm:block')
  })

  it('sits at md:bottom-6 from md up', () => {
    mount()
    expect(screen.getByRole('button', { name: /Ask/ }).className).toContain('md:bottom-6')
  })

  it('stays above the bottom bars via --fab-bottom', () => {
    mount()
    const fab = screen.getByRole('button', { name: /Ask/ })
    expect(fab.className).toContain('bottom-[var(--fab-bottom)]')
    expect(fab.getAttribute('style')).toContain('--fab-bottom')
  })
})

describe('with the Ask FAB mounted', () => {
  it('ScrollToTop is not rendered at all', () => {
    mount(<ScrollToTop visible />)
    expect(screen.queryByLabelText(i18n.t('scroll_to_top_label'))).toBeNull()
  })

  it('the spacer reserves the FAB at md and keeps showing at xl', () => {
    const { container } = mount(<BottomChromeSpacer />)
    const cls = container.querySelector('div[aria-hidden="true"]').className
    expect(cls).toContain('md:h-[5.5rem]')
    expect(cls).not.toContain('xl:hidden')
  })

  it('ScrollToTop comes back after the FAB unmounts', () => {
    const { rerender } = render(
      <MemoryRouter><AskPersonaPanel userId={1} input={{}} /><ScrollToTop visible /></MemoryRouter>,
    )
    expect(screen.queryByLabelText(i18n.t('scroll_to_top_label'))).toBeNull()
    rerender(<MemoryRouter><ScrollToTop visible /></MemoryRouter>)
    expect(screen.getByLabelText(i18n.t('scroll_to_top_label'))).toBeTruthy()
  })

  it('the spacer reserves the FAB height plus 0.75rem', () => {
    const { container } = mount(<BottomChromeSpacer />)
    const style = container.querySelector('div[aria-hidden="true"]').getAttribute('style')
    expect(style).toContain('calc(3.25rem + 0.75rem)')
  })
})
