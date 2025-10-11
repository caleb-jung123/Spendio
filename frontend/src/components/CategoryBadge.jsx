function CategoryBadge({ category }) {
    const categoryStyles = {
        'Food': { emoji: '🍔', bg: 'bg-orange-100', text: 'text-orange-700' },
        'Transport': { emoji: '🚗', bg: 'bg-blue-100', text: 'text-blue-700' },
        'Shopping': { emoji: '🛍️', bg: 'bg-pink-100', text: 'text-pink-700' },
        'Entertainment': { emoji: '🎬', bg: 'bg-purple-100', text: 'text-purple-700' },
        'Bills': { emoji: '📄', bg: 'bg-gray-100', text: 'text-gray-700' },
        'Health': { emoji: '🏥', bg: 'bg-red-100', text: 'text-red-700' },
        'Groceries': { emoji: '🛒', bg: 'bg-green-100', text: 'text-green-700' },
        'Travel': { emoji: '✈️', bg: 'bg-indigo-100', text: 'text-indigo-700' },
        'Education': { emoji: '📚', bg: 'bg-yellow-100', text: 'text-yellow-700' },
        'Other': { emoji: '📦', bg: 'bg-gray-100', text: 'text-gray-700' },
    }

    const style = categoryStyles[category] || categoryStyles['Other']

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            <span>{style.emoji}</span>
            <span>{category}</span>
        </span>
    )
}

export default CategoryBadge

