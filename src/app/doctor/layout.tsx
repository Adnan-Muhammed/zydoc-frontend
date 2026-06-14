// src/app/doctor/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <>
  <main className="min-h-screen bg-slate-600">

  {children}
  </main>
  </>;
}   