export default function PlaceholderCards({
  items,
}: {
  items: { title: string; note: string }[]
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-dashed border-slate-300 bg-white p-5 opacity-80"
        >
          <h2 className="mb-1 font-medium text-slate-800">{item.title}</h2>
          <p className="text-sm text-slate-500">{item.note}</p>
        </div>
      ))}
    </div>
  )
}
