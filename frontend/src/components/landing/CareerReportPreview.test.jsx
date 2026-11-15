import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import '../../i18n'
import en from '../../i18n/en.json'
import CareerReportPreview from './CareerReportPreview'

describe('CareerReportPreview roadmap', () => {
  it('renders a body line under each of the four horizons', () => {
    const { container } = render(<CareerReportPreview />)
    for (const k of ['now', 'next_12', '1_3', '3_5']) {
      const body = en[`career_preview_hz_${k}_body`]
      expect(body).toBeTruthy()
      expect(container.textContent).toContain(body)
    }
  })
})
