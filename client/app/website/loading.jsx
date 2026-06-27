export default function WebsiteLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-dark-main">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
