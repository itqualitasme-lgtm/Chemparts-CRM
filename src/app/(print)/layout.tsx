// Minimal shell for printable documents — no portal chrome, so the page prints
// (and saves to PDF) as a clean standalone document.
export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-200 print:bg-white">{children}</div>
}
