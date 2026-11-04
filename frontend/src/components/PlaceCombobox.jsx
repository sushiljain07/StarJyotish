// frontend/src/components/PlaceCombobox.jsx
//
// The one place-autocomplete input. Replaces four hand-rolled
// <ul><li onMouseDown> lists (BirthForm, Onboarding x2, Profile x2) that
// could only be used with a mouse. Follows the WAI-ARIA combobox pattern:
// arrow keys move the active option, Enter picks it, Escape closes.
// Controlled: the parent owns the text (`value`) and the `items`.
import { useState } from 'react'

const listCls = 'absolute z-10 w-full bg-parchment-card border border-line rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto text-left'
const optionCls = 'px-4 py-2.5 text-sm text-ink cursor-pointer border-b border-line last:border-0'

export default function PlaceCombobox({
  id,
  value,
  onInputChange,
  onSelect,
  items,
  getLabel = x => x,
  placeholder,
  className,
  required = false,
  inputProps = {},
}) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = `${id}-listbox`
  const expanded = open && items.length > 0

  function choose(item) {
    onSelect(item)
    setOpen(false)
    setActive(-1)
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return
      e.preventDefault()
      setOpen(true)
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive(i => (i + step + items.length) % items.length)
    } else if (e.key === 'Enter' && expanded && active >= 0) {
      e.preventDefault()
      choose(items[active])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  return (
    <div className="relative">
      <input
        {...inputProps}
        id={id}
        type="text"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        required={required}
        value={value}
        placeholder={placeholder}
        className={className}
        onChange={e => { onInputChange(e.target.value); setOpen(true); setActive(-1) }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
      />
      {expanded && (
        <ul id={listId} role="listbox" className={listCls}>
          {items.map((item, i) => (
            <li
              key={`${getLabel(item)}-${i}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={() => choose(item)}
              className={`${optionCls} ${i === active ? 'bg-primary-light' : 'hover:bg-primary-light'}`}
            >
              {getLabel(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
