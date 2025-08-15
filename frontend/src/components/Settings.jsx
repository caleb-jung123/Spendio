import { useState, useEffect } from 'react'
import api from '../api'

function Settings({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('budget')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [budgetAmount, setBudgetAmount] = useState('')
    const [currentBudget, setCurrentBudget] = useState(null)

    const [currentUsername, setCurrentUsername] = useState('')
    const [newUsername, setNewUsername] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchCurrentBudget()
            fetchUserInfo()
        }
    }, [isOpen])

    const fetchCurrentBudget = async () => {
        try {
            const response = await api.get('/api/budgets/current/')
            if (response.data && response.data.id) {
                setCurrentBudget(response.data)
                setBudgetAmount(response.data.amount.toString())
            }
        } catch (error) {
            // Silent Fail
        }
    }

    const fetchUserInfo = async () => {
        try {
            const username = localStorage.getItem('username') || 'User'
            setCurrentUsername(username)
        } catch (error) {
            // Silent Fail
        }
    }

    const handleBudgetSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
                setError('Budget amount must be greater than zero.')
                setLoading(false)
                return
            }

            const budgetData = {
                amount: parseFloat(budgetAmount),
                is_active: true
            }

            if (currentBudget) {
                await api.put(`/api/budgets/${currentBudget.id}/`, budgetData)
                setSuccess('Budget updated successfully!')
            } else {
                await api.post('/api/budgets/', budgetData)
                setSuccess('Budget created successfully!')
            }

            await fetchCurrentBudget()
        } catch (error) {
            setError('Failed to save budget. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleAccountSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            if (newPassword && newPassword !== confirmPassword) {
                setError('New passwords do not match.')
                setLoading(false)
                return
            }

            const accountData = {}
            if (newUsername) accountData.username = newUsername
            if (newPassword) accountData.new_password = newPassword
            if (currentPassword) accountData.current_password = currentPassword

            const response = await api.post('/api/user/update/', accountData)
            
            setSuccess(response.data.message || 'Account settings updated successfully!')
            
            if (newUsername) {
                setCurrentUsername(newUsername)
                localStorage.setItem('username', newUsername)
            }
            
            setNewUsername('')
            setNewPassword('')
            setConfirmPassword('')
            setCurrentPassword('')
        } catch (error) {
            setError(error.response?.data?.error || 'Failed to update account settings. Please try again.')
        } finally {
            setLoading(false)
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
                <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700 font-bold text-xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-b border-gray-100">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('budget')}
                            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'budget'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Budget Management
                        </button>
                        <button
                            onClick={() => setActiveTab('account')}
                            className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                                activeTab === 'account'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Account Settings
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center text-white text-xs font-bold">✓</div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-green-800">{success}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'budget' && (
                        <form onSubmit={handleBudgetSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget Settings</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Set your monthly budget amount. Your yearly budget will be automatically calculated (monthly amount × 12).
                                </p>
                            </div>

                            <div>
                                <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Monthly Budget Amount <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        id="budgetAmount"
                                        step="0.01"
                                        min="0"
                                        value={budgetAmount}
                                        onChange={(e) => setBudgetAmount(e.target.value)}
                                        className="w-full pl-8 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                                {budgetAmount && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        Yearly budget: ${(parseFloat(budgetAmount) * 12).toFixed(2)}
                                    </p>
                                )}
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
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Saving...
                                        </div>
                                    ) : (
                                        currentBudget ? 'Update Budget' : 'Create Budget'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {activeTab === 'account' && (
                        <form onSubmit={handleAccountSubmit} className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    Update your username and password to keep your account secure.
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Username
                                </label>
                                <input
                                    type="text"
                                    value={currentUsername}
                                    disabled
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Username
                                </label>
                                <input
                                    type="text"
                                    id="newUsername"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Enter new username"
                                />
                            </div>

                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    id="currentPassword"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Enter current password"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="newPassword"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                    placeholder="Enter new password"
                                />
                            </div>

                            {newPassword && (
                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm New Password <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            )}

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
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Updating...
                                        </div>
                                    ) : (
                                        'Update Account'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Settings
