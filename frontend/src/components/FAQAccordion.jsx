// frontend/src/components/FAQAccordion.jsx
//
// Generic accordion — takes pre-translated {question, answer} pairs so it
// has no i18n knowledge of its own and can be reused anywhere (e.g. a
// pricing page FAQ later). Only one item open at a time, matching the
// single-focus pattern of the rest of the app's tab/accordion UI.
import { useState } from 'react'

export default function FAQAccordion({ items }) {
  const [openId, setOpenId] = useState(null)

  return (
    <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {items.map((item, i) => {
        const isOpen = openId === i
        return (
          <div key={i}>
            <button
              onClick={() => setOpenId(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between gap-3 text-left px-5 py-4 hover:bg-slate-50 transition"
            >
              <span className="text-sm font-semibold text-slate-800">{item.question}</span>
              <span
                className={`shrink-0 text-slate-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-45' : ''
                }`}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isOpen ? 'max-h-64' : 'max-h-0'
              }`}
            >
              <p className="px-5 pb-4 text-sm text-slate-500 leading-relaxed">{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
