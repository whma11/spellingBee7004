import { NavLink, Outlet } from 'react-router-dom'

const linkClass = ({ isActive }) =>
  [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    isActive
      ? 'bg-ink text-amber-50 shadow'
      : 'bg-white/70 text-ink hover:bg-white',
  ].join(' ')

export default function Layout() {
  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
            UIL A+ Spelling 2026–2027
          </p>
          <h1 className="text-3xl font-black tracking-tight text-ink">
            Spelling Bee Practice
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-700">
            Parent-run auditory drills. Keep the screen away from the child and
            let the browser speak the word and sentences.
          </p>
        </div>
        <nav className="flex gap-2">
          <NavLink to="/practice" className={linkClass}>
            Spell
          </NavLink>
          <NavLink to="/dashboard" className={linkClass}>
            Progress
          </NavLink>
        </nav>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="mt-8 text-center text-xs text-slate-600">
        Word list from the UIL A+ Spelling bulletin. Official contest details:{' '}
        <a
          className="underline decoration-amber-600 underline-offset-2"
          href="https://www.uiltexas.org/aplus/events/aplus-spelling"
          target="_blank"
          rel="noreferrer"
        >
          uiltexas.org/aplus/events/aplus-spelling
        </a>
      </footer>
    </div>
  )
}
