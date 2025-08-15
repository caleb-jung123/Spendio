import { useState } from "react"
import api from "../api"

function SubscriptionForm({ isOpen, onClose, onSubscriptionAdded }) {
    const [title, setTitle] = useState("")
    const [amount, setAmount] = useState("")
    const [frequency, setFrequency] = useState("monthly")
    const [renewalDate, setRenewalDate] = useState("")
    const [category, setCategory] = useState("Other")
    
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const categories = [
        "Entertainment", "Software", "Streaming", "Gaming", "Fitness", 
        "Education", "Music", "News", "Shopping", "Other"
    ]

    const frequencies = [
        { value: "monthly", label: "Monthly" },
        { value: "yearly", label: "Yearly" }
    ]

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!title || !amount || !renewalDate) {
            setError("Please fill in all required fields")
            return
        }

        if (parseFloat(amount) <= 0) {
            setError("Amount must be greater than zero")
            return
        }

        // Check if renewal date is in the past
        const selectedDate = new Date(renewalDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Reset time to start of day for accurate comparison
        
        if (selectedDate < today) {
            setError("Renewal date cannot be in the past")
            return
        }

        setIsLoading(true)
        setError("")

        try {
            const response = await api.post("/api/subscriptions/", {
                title,
                amount: parseFloat(amount),
                frequency,
                renewal_date: renewalDate,
                category
            })

            setTitle("")
            setAmount("")
            setFrequency("monthly")
            setRenewalDate("")
            setCategory("Other")
            
            if (onSubscriptionAdded) {
                onSubscriptionAdded(response.data)
            }
            
            onClose()
        } catch (error) {
            setError("Failed to add subscription. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Add New Subscription</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700 font-bold text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center text-white text-xs font-bold">!</div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Subscription Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            placeholder="Enter subscription name"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 text-sm">$</span>
                            </div>
                            <input
                                type="number"
                                id="amount"
                                step="0.01"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                            Billing Frequency <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="frequency"
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                            required
                        >
                            {frequencies.map((freq) => (
                                <option key={freq.value} value={freq.value}>
                                    {freq.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="renewalDate" className="block text-sm font-medium text-gray-700 mb-2">
                            Next Renewal Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="renewalDate"
                            value={renewalDate}
                            onChange={(e) => setRenewalDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            id="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Adding...
                                </div>
                            ) : (
                                "Add Subscription"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default SubscriptionForm
