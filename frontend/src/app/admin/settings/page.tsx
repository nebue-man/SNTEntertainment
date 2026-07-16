'use client'
import { useEffect, useState } from 'react'
import { getAdminSettings, updateSetting } from '@/lib/adminApi'

const KEYS = [
  { key: 'bank_name', label: 'Bank Name' },
  { key: 'account_name', label: 'Account Name' },
  { key: 'account_number', label: 'Account Number' },
  { key: 'branch', label: 'Branch' },
  { key: 'payment_instructions', label: 'Payment Instructions', multiline: true },
]

const inputCls = 'w-full bg-transparent border border-[#4d4d4d] px-4 py-2.5 text-sm focus:outline-none focus:border-white transition-colors'
const labelCls = 'block text-[11px] tracking-[0.2em] uppercase text-white/40 mb-2'

export default function SettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminSettings()
      .then(res => setValues(res.data))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await Promise.all(
        KEYS.map(({ key }) => updateSetting(key, values[key] ?? ''))
      )
      setMsg('Settings saved.')
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="px-8 py-6 border-b border-[#4d4d4d]">
        <h1 className="text-xl font-light tracking-wide">Settings</h1>
        <p className="text-white/30 text-sm mt-1">Bank &amp; payment details shown on the ticket request form.</p>
      </div>

      <div className="p-8 max-w-2xl">
        {loading && <div className="text-white/30 text-sm">Loading…</div>}
        {error && <div className="text-red-400 text-sm">{error}</div>}

        {!loading && !error && (
          <form onSubmit={handleSave} className="space-y-6">
            {KEYS.map(({ key, label, multiline }) => (
              <div key={key}>
                <label className={labelCls}>{label}</label>
                {multiline ? (
                  <textarea
                    value={values[key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                    rows={4}
                    className={`${inputCls} resize-none`}
                  />
                ) : (
                  <input
                    value={values[key] ?? ''}
                    onChange={e => setValues(prev => ({ ...prev, [key]: e.target.value }))}
                    className={inputCls}
                  />
                )}
              </div>
            ))}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#d3fd50] text-black text-[11px] tracking-[0.2em] uppercase hover:opacity-80 transition-opacity disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save Settings'}
              </button>
              {msg && (
                <span className={`text-sm ${msg === 'Settings saved.' ? 'text-[#d3fd50]' : 'text-red-400'}`}>
                  {msg}
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
