export default function TagFilter({ tags, selectedTags, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => {
            const newTags = selectedTags.includes(tag)
              ? selectedTags.filter(t => t !== tag)
              : [...selectedTags, tag];
            onChange(newTags);
          }}
          className={`px-3 py-1 rounded-full text-xs ${
            selectedTags.includes(tag)
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
} 