import { useState } from 'react'
import api from '../api'

function SubscriptionReactivateForm({ subscription, isOpen, onClose, onReactivated }) {
    const [renewalDate, setRenewalDate] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!renewalDate) {
            setError('Please select a renewal date')
            return
        }

        const selectedDate = new Date(renewalDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        if (selectedDate < today) {
            setError('Renewal date cannot be in the past')
            return
        }

        try {
            setLoading(true)
            setError('')
            
            const response = await api.post(`/api/subscriptions/${subscription.id}/reactivate/`, {
                renewal_date: renewalDate
            })
            
            onReactivated(response.data.subscription)
            onClose()
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to reactivate subscription')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reactivate Subscription</h3>
                <p className="text-gray-600 mb-6">
                    Reactivate "{subscription.title}" by setting a new renewal date.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700 mb-2">
                            New Renewal Date
                        </label>
                        <input
                            type="date"
                            id="renewalDate"
                            value={renewalDate}
                            onChange={(e) => setRenewalDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm">{error}</p>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Reactivating...' : 'Reactivate'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubscriptionReactivateForm
