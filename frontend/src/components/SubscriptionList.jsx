import { useState, useEffect } from 'react'
import api from '../api'
import Subscription from './Subscription'
import SubscriptionForm from './SubscriptionForm'
import Settings from './Settings'

function SubscriptionList() {
    const [subscriptions, setSubscriptions] = useState([])
    const [allSubscriptions, setAllSubscriptions] = useState([]) // Store all subscriptions for filtering
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    
    const [frequencyFilter, setFrequencyFilter] = useState(() => {
        const saved = localStorage.getItem('subscriptionFrequencyFilter')
        return saved || 'monthly'
    })
    const [categoryFilter, setCategoryFilter] = useState(() => {
        const saved = localStorage.getItem('subscriptionCategoryFilter')
        return saved || 'all'
    })
    const [searchQuery, setSearchQuery] = useState(() => {
        const saved = localStorage.getItem('subscriptionSearchQuery')
        return saved || ''
    })
    const [showActiveOnly, setShowActiveOnly] = useState(() => {
        const saved = localStorage.getItem('subscriptionShowActiveOnly')
        return saved !== null ? saved === 'true' : true
    })
    
    const [categories, setCategories] = useState([])
    
    const [isSubscriptionFormOpen, setIsSubscriptionFormOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    
    const [outdatedSubscriptions, setOutdatedSubscriptions] = useState([])
    const [showOutdatedModal, setShowOutdatedModal] = useState(false)

    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    async function getSubscriptionData() {
        try {
            setLoading(true)
            
            const allResponse = await api.get('/api/subscriptions/')
            const allData = allResponse.data
            setAllSubscriptions(allData)
            
            const uniqueCategories = [...new Set(allData.map(sub => sub.category))].sort()
            setCategories(uniqueCategories)
            
            let filteredSubscriptions = []
            let calculatedTotal = 0
            
            if (frequencyFilter === 'monthly') {
                filteredSubscriptions = allData.filter(sub => sub.frequency === 'monthly')
                calculatedTotal = filteredSubscriptions.reduce((sum, sub) => {
                    if (!sub.is_active) return sum
                    return sum + parseFloat(sub.amount)
                }, 0)
            } else if (frequencyFilter === 'yearly') {
                filteredSubscriptions = allData.filter(sub => sub.frequency === 'yearly')
                calculatedTotal = filteredSubscriptions.reduce((sum, sub) => {
                    if (!sub.is_active) return sum
                    return sum + parseFloat(sub.amount)
                }, 0)
            } else if (frequencyFilter === 'inactive') {
                filteredSubscriptions = allData.filter(sub => !sub.is_active)
                calculatedTotal = 0 
            }
            
            setSubscriptions(filteredSubscriptions)
            setTotal(calculatedTotal)
            
            checkOutdatedSubscriptions(allData)
            
        } catch (error) {
            // Silent Fail
        } finally {
            setLoading(false)
        }
    }

    const getFilteredSubscriptions = () => {
        let filtered = subscriptions

        if (showActiveOnly && frequencyFilter !== 'inactive') {
            filtered = filtered.filter(subscription => subscription.is_active)
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(subscription => subscription.category === categoryFilter)
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(subscription => 
                subscription.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                subscription.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }

    const getFilteredTotal = () => {
        const filtered = getFilteredSubscriptions()
        return filtered.reduce((sum, subscription) => {
            if (!subscription.is_active) return sum
            return sum + parseFloat(subscription.amount)
        }, 0)
    }

    const checkOutdatedSubscriptions = (subscriptionList) => {
        const today = new Date()
        const todayString = today.toISOString().split('T')[0]
        
        const outdated = subscriptionList.filter(subscription => {
            return subscription.is_active && subscription.renewal_date < todayString
        })

        if (outdated.length > 0) {
            setOutdatedSubscriptions(outdated)
            setShowOutdatedModal(true)
        }
    }

    async function deleteSubscription(subscription) {
        try {
            await api.delete(`/api/subscriptions/${subscription.id}/`)
            getSubscriptionData()
        } catch (error) {
            // Silent Fail
        }
    }

    async function updateSubscription() {
        getSubscriptionData()
    }

    async function renewSubscription(subscription) {
        try {
            const response = await api.post(`/api/subscriptions/${subscription.id}/renew/`)
            const updatedSubscription = response.data.subscription
            
            updateSubscription()

            setOutdatedSubscriptions(prev => 
                prev.filter(sub => sub.id !== subscription.id)
            )

            return updatedSubscription
        } catch (error) {
            throw error
        }
    }

    const handleRenewAll = async () => {
        try {
            const promises = outdatedSubscriptions.map(subscription => renewSubscription(subscription))
            await Promise.all(promises)
            setShowOutdatedModal(false)
            setOutdatedSubscriptions([])
        } catch (error) {
            // Silent Fail
        }
    }

    const handleRenewOne = async (subscription) => {
        try {
            await renewSubscription(subscription)
            if (outdatedSubscriptions.length === 1) {
                setShowOutdatedModal(false)
            }
        } catch (error) {
            // Silent Fail
        }
    }

    const handleDeactivateAll = async () => {
        try {
            const promises = outdatedSubscriptions.map(async (subscription) => {
                const response = await api.post(`/api/subscriptions/${subscription.id}/toggle/`)
                return response.data.subscription
            })
            const updatedSubscriptions = await Promise.all(promises)
            
            updatedSubscriptions.forEach(updatedSub => {
                updateSubscription(updatedSub)
            })
            
            setShowOutdatedModal(false)
            setOutdatedSubscriptions([])
        } catch (error) {
            // Silent Fail
        }
    }

    useEffect(() => {
        localStorage.setItem('subscriptionFrequencyFilter', frequencyFilter)
    }, [frequencyFilter])

    useEffect(() => {
        localStorage.setItem('subscriptionCategoryFilter', categoryFilter)
    }, [categoryFilter])

    useEffect(() => {
        localStorage.setItem('subscriptionSearchQuery', searchQuery)
    }, [searchQuery])

    useEffect(() => {
        localStorage.setItem('subscriptionShowActiveOnly', showActiveOnly.toString())
    }, [showActiveOnly])

    useEffect(() => {
        getSubscriptionData()
    }, [frequencyFilter]) 

    const filteredSubscriptions = getFilteredSubscriptions()
    const filteredTotal = getFilteredTotal()

    const handleSubscriptionAdded = (newSubscription) => {
        getSubscriptionData()
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-gray-50 p-4 md:p-6">
            <div className="w-full px-2 md:px-4 py-4 md:py-6 relative">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800">Subscriptions</h1>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700"
                    title="Settings"
                >
                    <span className="text-black text-lg">⚙️</span>
                </button>
            </div>
            
            <div className="border-b border-gray-100 w-full px-2 md:px-4"></div>  

            <div className="flex flex-col gap-6 mt-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-gray-500 text-xs md:text-sm font-medium">
                                {frequencyFilter === 'monthly' ? 'Monthly' : 
                                frequencyFilter === 'yearly' ? 'Yearly' : 'Inactive'} Subscription Cost
                            </p>
                            <p className="text-3xl md:text-4xl font-bold text-gray-900">
                                {frequencyFilter === 'inactive' ? 
                                 `${filteredSubscriptions.length} Inactive` : 
                                 `$${parseFloat(filteredTotal || 0).toFixed(2)}`}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex flex-col gap-4">                     
                        <div>
                            <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Subscription Frequency</p>
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'monthly', label: 'Monthly Subscriptions' },
                                    { key: 'yearly', label: 'Yearly Subscriptions' },
                                    { key: 'inactive', label: 'Inactive Subscriptions' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setFrequencyFilter(filter.key)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                                            frequencyFilter === filter.key
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Search</p>
                                <input
                                    type="text"
                                    placeholder="Search by name or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                                />
                            </div>
                            
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Category</p>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Status</p>
                                <select
                                    value={showActiveOnly ? 'active' : 'all'}
                                    onChange={(e) => setShowActiveOnly(e.target.value === 'active')}
                                    disabled={frequencyFilter === 'inactive'}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 ${
                                        frequencyFilter === 'inactive' ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <option value="active">Active Only</option>
                                    <option value="all">All Subscriptions</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>
                                {frequencyFilter === 'inactive' ? 
                                 `Showing ${filteredSubscriptions.length} inactive subscriptions` :
                                 `Showing ${filteredSubscriptions.length} of ${subscriptions.length} subscriptions`}
                            </span>
                            {(categoryFilter !== 'all' || searchQuery.trim() || (!showActiveOnly && frequencyFilter !== 'inactive')) && (
                                <button
                                    onClick={() => {
                                        setCategoryFilter('all')
                                        setSearchQuery('')
                                        setShowActiveOnly(true)
                                    }}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 max-h-[65vh] overflow-y-auto">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Your Subscriptions</h2>
                        <button 
                            onClick={() => setIsSubscriptionFormOpen(true)}
                            className="bg-black hover:bg-gray-800 text-white text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-colors duration-200 font-medium"
                        >
                            + Add Subscription
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : filteredSubscriptions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {frequencyFilter === 'inactive' ? 
                                 'No inactive subscriptions found' :
                                 subscriptions.length === 0 ? 'No subscriptions found' : 'No subscriptions match your filters'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredSubscriptions.map((subscription) => (
                                <Subscription 
                                    key={subscription.id} 
                                    subscription={subscription} 
                                    onDelete={deleteSubscription}
                                    onUpdate={updateSubscription}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SubscriptionForm 
                isOpen={isSubscriptionFormOpen}
                onClose={() => setIsSubscriptionFormOpen(false)}
                onSubscriptionAdded={handleSubscriptionAdded}
            />

            
            {showOutdatedModal && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Outdated Renewal Dates</h3>
                        <p className="text-gray-600 mb-6">
                            The following subscriptions have renewal dates that have passed. Would you like to update them to their next renewal date or deactivate them?
                        </p>
                        
                        <div className="space-y-3 mb-6">
                            {outdatedSubscriptions.map((subscription) => (
                                <div key={subscription.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-medium text-gray-900">{subscription.title}</p>
                                        <p className="text-sm text-gray-500">
                                            Current renewal date: {formatDate(subscription.renewal_date)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleRenewOne(subscription)}
                                        className="px-3 py-1 bg-black text-white text-sm rounded hover:bg-gray-800 transition-colors duration-200"
                                    >
                                        Update
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleRenewAll}
                                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                            >
                                Update All
                            </button>
                            <button
                                onClick={handleDeactivateAll}
                                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                            >
                                Deactivate All
                            </button>
                            <button
                                onClick={() => setShowOutdatedModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                Skip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Settings 
                isOpen={isSettingsOpen}
                onClose={() => {
                    setIsSettingsOpen(false)
                    getSubscriptionData()
                }}
            />
        </div>
    )
}

export default SubscriptionList