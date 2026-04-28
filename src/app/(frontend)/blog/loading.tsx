export default function BlogLoading() {
    return (
      <div className="bg-gray-50 min-h-screen pt-12 pb-24 animate-pulse">
        <div className="container mx-auto px-6">
          <div className="w-48 h-12 bg-gray-200 rounded-xl mb-4" />
          <div className="w-96 h-6 bg-gray-200 rounded-xl mb-16" />
          
          {/* Табы */}
          <div className="flex gap-3 mb-12">
            {[1, 2, 3].map(i => <div key={i} className="w-24 h-10 bg-gray-200 rounded-2xl" />)}
          </div>
  
          {/* Featured Post */}
          <div className="w-full h-[400px] md:h-[600px] bg-gray-200 rounded-[40px] mb-16" />
  
          {/* Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden">
                <div className="w-full h-64 bg-gray-200" />
                <div className="p-8 space-y-4">
                  <div className="w-full h-6 bg-gray-200 rounded" />
                  <div className="w-2/3 h-6 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }