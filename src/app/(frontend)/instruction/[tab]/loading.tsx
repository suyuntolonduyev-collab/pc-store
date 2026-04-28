export default function LoadingSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen font-sans pb-24 animate-pulse">
      {/* Шапка Skeleton */}
      <div className="bg-white shadow-sm mb-10 pb-0">
        <div className="max-w-5xl mx-auto">
          <div className="h-48 md:h-72 w-full bg-gray-200 md:rounded-b-[40px]" />
          <div className="px-6 mt-8 flex gap-8 border-b border-gray-200">
            <div className="h-6 w-32 bg-gray-200 rounded mb-3" />
            <div className="h-6 w-48 bg-gray-200 rounded mb-3" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8">
        {/* Sidebar Skeleton */}
        <div className="w-full md:w-[320px] shrink-0 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 h-64" />
          <div className="bg-gray-200 rounded-3xl h-72" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-40" />
          ))}
        </div>
      </div>
    </div>
  )
}
