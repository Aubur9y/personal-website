export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onChange(category)}
          className={`px-4 py-2 rounded-full text-sm ${
            selected === category
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
} 