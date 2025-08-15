import { useState } from 'react'

function Expense({ expense, onDelete }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const formatDate = (dateString) => {
        if (!dateString) return ''
        
        const datePart = dateString.split('T')[0]
        const [year, month, day] = datePart.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleDelete = async () => {
        try {
            await onDelete(expense)
            setShowDeleteConfirm(false)
        } catch (error) {
            // Silent fail for expense deletion
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{expense.title}</h3>
                    <p className="text-sm text-gray-500">{formatDate(expense.date)}</p>
                </div>
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="ml-4 p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-200"
                    title="Delete expense"
                >
                    <span className="text-lg">🗑️</span>
                </button>
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {expense.category}
                    </span>
                    {expense.description && (
                        <p className="text-sm text-gray-600 truncate max-w-xs">
                            {expense.description}
                        </p>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">
                        ${parseFloat(expense.amount).toFixed(2)}
                    </p>
                </div>
            </div>

            {showDeleteConfirm && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Expense</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{expense.title}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Expense