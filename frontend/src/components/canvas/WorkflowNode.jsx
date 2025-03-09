return (
  <div
    className={`
      rounded-lg shadow-lg border-2 
      ${getBorderColor(data.type)}
      bg-white dark:bg-gray-800
      transition-all duration-300 ease-in-out
      hover:shadow-xl hover:scale-[1.02]
      ${isConnectable ? 'cursor-pointer' : ''}
    `}
    style={{ width: 220, ...style }}
  >
    <div className={`
      px-3 py-2 rounded-t-md font-medium flex items-center gap-2
      ${getHeaderBgColor(data.type)} text-white
    `}>
      {getNodeIcon(data.type)}
      <span className="truncate">{data.label}</span>
    </div>
    <div className="p-3 text-xs">
      {data.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-2">{data.description}</p>
      )}
      {data.subType && (
        <div className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs mb-2">
          {data.subType}
        </div>
      )}
      {data.connected && (
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Connected to:
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(data.connected).map(([key, value]) => (
              value && (
                <span key={key} className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full text-[10px]">
                  {key}
                </span>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

function getBorderColor(type) {
  switch (type) {
    case 'email':
      return 'border-blue-400';
    case 'product':
      return 'border-green-400';
    case 'exception':
      return 'border-amber-400';
    case 'invoice':
      return 'border-purple-400';
    case 'condition':
      return 'border-orange-400';
    case 'price':
      return 'border-pink-400';
    case 'notification':
      return 'border-cyan-400';
    case 'vip':
      return 'border-violet-400';
    default:
      return 'border-gray-300';
  }
}

function getHeaderBgColor(type) {
  switch (type) {
    case 'email':
      return 'bg-gradient-to-r from-blue-500 to-blue-600';
    case 'product':
      return 'bg-gradient-to-r from-green-500 to-green-600';
    case 'exception':
      return 'bg-gradient-to-r from-amber-500 to-amber-600';
    case 'invoice':
      return 'bg-gradient-to-r from-purple-500 to-purple-600';
    case 'condition':
      return 'bg-gradient-to-r from-orange-500 to-orange-600';
    case 'price':
      return 'bg-gradient-to-r from-pink-500 to-pink-600';
    case 'notification':
      return 'bg-gradient-to-r from-cyan-500 to-cyan-600';
    case 'vip':
      return 'bg-gradient-to-r from-violet-500 to-violet-600';
    default:
      return 'bg-gradient-to-r from-gray-500 to-gray-600';
  }
} 