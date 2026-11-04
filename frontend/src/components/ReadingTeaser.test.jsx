// The chart page shows the AI reading up top without ever starting one:
// a preview when this chart's reading is already cached, a teaser otherwise.
import { render, screen, fireEvent } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'
import { fetchReport, readingBody } from '../api/reportCache'
import ReadingTeaser from './ReadingTeaser'

const INPUT = { date: '1990-08-16', time: '19:05', place: 'Delhi, India' }

let fetchMock
beforeEach(async () => {
  await i18n.changeLanguage('en')
  fetchMock = vi.fn()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('ReadingTeaser', () => {
  it('shows a teaser and never calls the network when nothing is cached', () => {
    const onOpen = vi.fn()
    render(<ReadingTeaser input={INPUT} onOpen={onOpen} />)
    expect(screen.getByText(en.teaser_heading)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: en.teaser_reveal }))
    expect(onOpen).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('previews the cached reading for this chart and language', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({
      prediction_sections: { identity: '', strengths: 'You lead with steady discipline.' },
    }), { status: 200 }))
    await fetchReport('/api/kundli/reading', readingBody(INPUT, 'en'))
    render(<ReadingTeaser input={INPUT} onOpen={() => {}} />)
    expect(screen.getByText('You lead with steady discipline.')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: en.teaser_continue })).toBeInTheDocument()
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
