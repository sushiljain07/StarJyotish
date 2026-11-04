// /generate's birth form: labels must be linked to inputs, impossible
// dates must be rejected, and an unknown birth time must be allowed.
import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import i18n from '../i18n'
import en from '../i18n/en.json'

let suggestions = []
vi.mock('../hooks/usePlaceSuggestions', () => ({ usePlaceSuggestions: () => suggestions }))

import BirthForm from './BirthForm'

const select = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } })

function fillDate(d, m, y) { select('Day', d); select('Month', m); select('Year', y) }

let spy
beforeEach(async () => {
  await i18n.changeLanguage('en')
  suggestions = []
  spy = vi.fn()
  render(<BirthForm onSubmit={spy} />)
  fireEvent.change(screen.getByLabelText(en.form_name), { target: { value: 'Asha' } })
  fireEvent.change(screen.getByLabelText(en.form_place), { target: { value: 'Delhi, India' } })
})

const submit = () => fireEvent.click(screen.getByRole('button', { name: en.form_submit }))

describe('BirthForm', () => {
  it('links its labels to the name and place inputs', () => {
    expect(screen.getByLabelText(en.form_name).tagName).toBe('INPUT')
    expect(screen.getByLabelText(en.form_place).tagName).toBe('INPUT')
  })

  it('rejects a date that does not exist', () => {
    fillDate('31', '2', '1990')
    fireEvent.click(screen.getByRole('button', { name: en.onboarding_time_unknown }))
    submit()
    expect(screen.getByRole('alert')).toHaveTextContent(en.form_error_invalid_date)
    expect(spy).not.toHaveBeenCalled()
  })

  it('allows an unknown birth time and sends the default time', () => {
    fillDate('16', '8', '1990')
    fireEvent.click(screen.getByRole('button', { name: en.onboarding_time_unknown }))
    expect(screen.queryByLabelText('Hour')).toBeNull()
    submit()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ date: '1990-08-16', time: '12:00', timeAccuracy: 'unknown' }))
  })

  it('converts an exact 12-hour time to 24-hour', () => {
    fillDate('16', '8', '1990')
    select('Hour', '07'); select('Minute', '05'); select('AM/PM', 'PM')
    submit()
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ time: '19:05', timeAccuracy: 'exact' }))
  })
  it('asks to pick a place when suggestions are showing', () => {
    suggestions = ['Delhi, India']
    fireEvent.change(screen.getByLabelText(en.form_place), { target: { value: 'Delh' } })
    fillDate('16', '8', '1990')
    fireEvent.click(screen.getByRole('button', { name: en.onboarding_time_unknown }))
    submit()
    expect(screen.getByRole('alert')).toHaveTextContent(en.form_error_pick_place)
    expect(spy).not.toHaveBeenCalled()
  })
})
