import { useState } from 'react'
import api from '../api'
import SubscriptionReactivateForm from './SubscriptionReactivateForm'

function Subscription({ subscription, onDelete, onUpdate }) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showReactivateForm, setShowReactivateForm] = useState(false)
    const [loading, setLoading] = useState(false)

    const formatDate = (dateString) => {
        if (!dateString) return ''
        
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    const handleDelete = async () => {
        try {
            await onDelete(subscription)
            setShowDeleteConfirm(false)
        } catch (error) {
            // Silent Fail
        }
    }

    const handleToggleActive = async () => {
        try {
            setLoading(true)
            const response = await api.post(`/api/subscriptions/${subscription.id}/toggle/`)
            onUpdate(response.data.subscription)
        } catch (error) {
            // Silent Fail
        } finally {
            setLoading(false)
        }
    }

    const handleReactivated = (updatedSubscription) => {
        onUpdate(updatedSubscription)
    }

    return (
        <>
            <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow duration-200 ${
                !subscription.is_active ? 'opacity-60 bg-gray-50' : ''
            }`}>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900">{subscription.title}</h3>
                            {!subscription.is_active && (
                                <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-500">
                            Renews: {formatDate(subscription.renewal_date)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {subscription.is_active ? (
                            <button
                                onClick={handleToggleActive}
                                disabled={loading}
                                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 border border-gray-300 hover:border-orange-300 rounded-md transition-colors duration-200"
                                title="Deactivate subscription"
                            >
                                {loading ? '...' : 'Deactivate'}
                            </button>
                        ) : (
                            <button
                                onClick={() => setShowReactivateForm(true)}
                                className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-green-600 hover:bg-green-50 border border-gray-300 hover:border-green-300 rounded-md transition-colors duration-200"
                                title="Activate subscription"
                            >
                                Activate
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete subscription"
                        >
                            <span className="text-lg">🗑️</span>
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-black rounded-full">
                            {subscription.category}
                        </span>
                        <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-black rounded-full">
                            {subscription.frequency}
                        </span>
                    </div>
                    <div className="text-right">
                        <p className="text-xl font-bold text-gray-900">
                            ${parseFloat(subscription.amount).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>

            
            {showDeleteConfirm && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Subscription</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete "{subscription.title}"? This action cannot be undone.
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

            
            <SubscriptionReactivateForm
                subscription={subscription}
                isOpen={showReactivateForm}
                onClose={() => setShowReactivateForm(false)}
                onReactivated={handleReactivated}
            />
        </>
    )
}

export default Subscription