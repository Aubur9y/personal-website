export default function SearchBar({ value, onChange, onClear }) {
  return (
    <div className="relative w-full md:w-96">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="搜索文章..."
        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
} 