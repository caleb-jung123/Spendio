import api from "../api"
import { useState, useEffect } from "react"
import Settings from "./Settings"

function Dashboard() {
    const [budget, setBudget] = useState(0)
    const [totalExpenses, setTotalExpenses] = useState(0)
    const [totalSubscriptions, setTotalSubscriptions] = useState(0)
    const [yearlySubscriptionsOnly, setYearlySubscriptionsOnly] = useState(0)
    const [monthlyTimes12, setMonthlyTimes12] = useState(0)
    
    const [timeFilter, setTimeFilter] = useState(() => {
        const saved = localStorage.getItem('dashboardTimeFilter')
        return saved || 'this-month'
    })
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    async function getDashboardData() {
        try {
            const response = await api.get('/api/dashboard/summary/')
            const data = response.data
            setBudget(data.budget)
        } catch (error) {
            // Silent Fail
        }

        try {
            if (timeFilter === 'this-month') {
                const response = await api.get('/api/expenses/monthly/')
                const data = response.data
                setTotalExpenses(data.total)
            } else if (timeFilter === 'this-year') {
                const response = await api.get('/api/expenses/yearly/')
                const data = response.data
                setTotalExpenses(data.total)
            }
        } catch (error) {
            // Silent Fail
        }

        try {
            const response = await api.get('/api/subscriptions/')
            const data = response.data
            
            const yearlySubsOnly = data.reduce((sum, sub) => {
                if (!sub.is_active || sub.frequency !== 'yearly') return sum
                return sum + parseFloat(sub.amount)
            }, 0)
            setYearlySubscriptionsOnly(yearlySubsOnly)
            
            const monthlyTimes12Amount = data.reduce((sum, sub) => {
                if (!sub.is_active || sub.frequency !== 'monthly') return sum
                return sum + (parseFloat(sub.amount) * 12)
            }, 0)
            setMonthlyTimes12(monthlyTimes12Amount)
            
            if (timeFilter === 'this-month') {
                 const monthlyTotal = data.reduce((sum, sub) => {
                     if (!sub.is_active || sub.frequency !== 'monthly') return sum
                     return sum + parseFloat(sub.amount)
                 }, 0)
                 setTotalSubscriptions(monthlyTotal)
            } else if (timeFilter === 'this-year') {
                const yearlyTotal = data.reduce((sum, sub) => {
                    if (!sub.is_active) return sum
                    
                    if (sub.frequency === 'monthly') {
                        return sum + (parseFloat(sub.amount) * 12)
                    } else {
                        return sum + parseFloat(sub.amount)
                    }
                }, 0)
                setTotalSubscriptions(yearlyTotal)
            }
        } catch (error) {
            // Silent Fail
        }
    }

    useEffect(() => {
        localStorage.setItem('dashboardTimeFilter', timeFilter)
    }, [timeFilter])

    useEffect(() => {
        getDashboardData()
    }, [timeFilter])


    const getFilterLabel = () => {
        if (timeFilter === 'this-month') {
            return 'This Month'
        } else if (timeFilter === 'this-year') {
            return 'This Year'
        }
    }

    const getExpensesLabel = () => {
        if (timeFilter === 'this-month') {
            return 'Expenses This Month'
        } else if (timeFilter === 'this-year') {
            return 'Expenses This Year'
        }
    }

    const getSubscriptionsLabel = () => {
        if (timeFilter === 'this-month') {
            return 'Subscriptions This Month'
        } else if (timeFilter === 'this-year') {
            return 'Subscriptions This Year'
        }
    }

         const getSubscriptionsSubtitle = () => {
         if (timeFilter === 'this-month') {
             return 'Monthly subscriptions only'
         } else if (timeFilter === 'this-year') {
             return 'Monthly × 12 + Yearly'
         }
     }

    const getYearlySubscriptionsAmount = () => {
        return yearlySubscriptionsOnly
    }

    const getMonthlyTimes12Amount = () => {
        return monthlyTimes12
    }

    const getBudgetLabel = () => {
        if (timeFilter === 'this-month') {
            return 'Budget This Month'
        } else if (timeFilter === 'this-year') {
            return 'Budget This Year'
        }
    }

    const getBudgetAmount = () => {
        if (timeFilter === 'this-month') {
            return budget
        } else if (timeFilter === 'this-year') {
            return budget * 12
        }
    }

    const username = localStorage.getItem('username') || 'there'
    const currentHour = new Date().getHours()
    const getGreeting = () => {
        if (currentHour < 12) return 'Good morning'
        if (currentHour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 p-4 md:p-6 relative">
            <div className="w-full px-2 md:px-4 py-4 md:py-6 relative">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        {getGreeting()}, {username}! 👋
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base">
                        Here's your financial overview for today
                    </p>
                </div>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 hover:bg-white/80 rounded-lg transition-all duration-200 text-gray-500 hover:text-gray-700 hover:shadow-sm"
                    title="Settings"
                >
                    <span className="text-black text-lg">⚙️</span>
                </button>
            </div>
            
            <div className="border-b border-gray-100 w-full px-2 md:px-4"></div>  

            <div className="flex flex-col gap-6 mt-4">
                {(!budget || budget === 0) && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-800 p-4 md:p-5 rounded-xl shadow-sm">
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">💡</span>
                            <div>
                                <p className="font-medium text-sm md:text-base">Let's set up your first budget!</p>
                                <p className="text-xs md:text-sm mt-1">Click the settings icon to get started and take control of your finances.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p className="text-gray-500 text-xs md:text-sm font-medium">Time Period</p>
                            <p className="text-lg font-semibold text-gray-900">{getFilterLabel()}</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-1">
                                {[
                                    { key: 'this-month', label: 'This Month' },
                                    { key: 'this-year', label: 'This Year' }
                                ].map((filter) => (
                                    <button
                                        key={filter.key}
                                        onClick={() => setTimeFilter(filter.key)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                                            timeFilter === filter.key
                                                ? 'bg-white text-gray-900 shadow-sm'
                                                : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                                
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${timeFilter === 'this-year' ? 'lg:grid-cols-3 xl:grid-cols-5' : 'lg:grid-cols-4'} gap-4 md:gap-6`}>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-sm border border-green-100 p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs sm:text-sm md:text-base text-green-700 font-medium">{getBudgetLabel()}</p>
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-green-600 text-sm">💚</span>
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-green-800">${parseFloat(getBudgetAmount() || 0).toFixed(2)}</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm border border-orange-100 p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs sm:text-sm md:text-base text-orange-700 font-medium">{getExpensesLabel()}</p>
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-sm">💰</span>
                            </div>
                        </div>
                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-orange-800">${parseFloat(totalExpenses || 0).toFixed(2)}</p>
                    </div>
                    
                    {timeFilter === 'this-month' ? (   
                        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-sm border border-purple-100 p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-xs sm:text-sm md:text-base text-purple-700 font-medium">{getSubscriptionsLabel()}</p>
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="text-purple-600 text-sm">📱</span>
                                </div>
                            </div>
                            <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-800">${parseFloat(totalSubscriptions || 0).toFixed(2)}</p>
                            <p className="text-xs text-purple-600 mt-1">{getSubscriptionsSubtitle()}</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-sm border border-blue-100 p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs sm:text-sm md:text-base text-blue-700 font-medium">Yearly Subs</p>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-600 text-sm">📅</span>
                                    </div>
                                </div>
                                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-800">${parseFloat(getYearlySubscriptionsAmount() || 0).toFixed(2)}</p>
                                <p className="text-xs text-blue-600 mt-1">Yearly subscriptions only</p>
                            </div>
                                
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-sm border border-purple-100 p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs sm:text-sm md:text-base text-purple-700 font-medium">Monthly × 12</p>
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="text-purple-600 text-sm">📱</span>
                                    </div>
                                </div>
                                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-purple-800">${parseFloat(getMonthlyTimes12Amount() || 0).toFixed(2)}</p>
                                <p className="text-xs text-purple-600 mt-1">Monthly subscriptions × 12</p>
                            </div>
                        </>
                    )}
                    
                    <div className={`${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-100' : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-100'} rounded-2xl shadow-sm border p-6 md:p-8 hover:shadow-lg hover:scale-105 transition-all duration-200 min-h-[160px] md:min-h-[180px] flex flex-col justify-center`}>
                        <div className="flex items-center justify-between mb-4">
                            <p className={`text-xs sm:text-sm md:text-base font-medium ${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'text-green-700' : 'text-red-700'}`}>Remaining Budget</p>
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                                <span className={`text-sm ${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'text-green-600' : 'text-red-600'}`}>🎯</span>
                            </div>
                        </div>
                        <p className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                            ${parseFloat(getBudgetAmount() - totalExpenses - totalSubscriptions || 0).toFixed(2)}
                        </p>
                        <p className={`text-xs mt-1 ${(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(getBudgetAmount() - totalExpenses - totalSubscriptions) >= 0 ? 'Great job staying on track!' : 'Consider adjusting your budget'}
                        </p>
                    </div>
                </div>
            </div>

            <Settings 
                isOpen={isSettingsOpen}
                onClose={() => {
                    setIsSettingsOpen(false)
                    getDashboardData()
                }}
            />
        </div>
    )
}

export default Dashboard