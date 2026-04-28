export default function InfoLoading() {
  return (
    <div className="bg-gray-50 min-h-screen pb-24 animate-pulse">
      <div className="bg-gray-900 pt-32 pb-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="h-12 w-64 bg-gray-800 rounded-xl mb-4" />
          <div className="h-6 w-96 bg-gray-800/50 rounded-xl" />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6 -mt-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="h-14 w-full bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </aside>

          <main className="flex-1 bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12">
            <div className="h-10 w-1/3 bg-gray-100 rounded-xl mb-8" />
            <div className="space-y-4">
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="h-4 w-4/6 bg-gray-100 rounded" />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
