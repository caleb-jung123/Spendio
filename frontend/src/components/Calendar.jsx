import { useState, useEffect } from 'react'
import api from '../api'
import Settings from './Settings'

function Calendar() {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [calendarData, setCalendarData] = useState({
        expenses: [],
        subscriptions: [],
        summary: {}
    })
    const [loading, setLoading] = useState(false)
    
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState(null)
    const [showDateDetails, setShowDateDetails] = useState(false)

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

    const fetchCalendarData = async (month, year) => {
        try {
            setLoading(true)
            const response = await api.get(`/api/calendar/?month=${month}&year=${year}`)
            setCalendarData(response.data)
        } catch (error) {
            // Silent Fail
        } finally {
            setLoading(false)
        }
    }

    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
        setCurrentDate(newDate)
        fetchCalendarData(newDate.getMonth() + 1, newDate.getFullYear())
    }

    const goToNextMonth = () => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
        setCurrentDate(newDate)
        fetchCalendarData(newDate.getMonth() + 1, newDate.getFullYear())
    }

    const getCalendarDays = () => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const daysInMonth = lastDay.getDate()
        const startingDayOfWeek = firstDay.getDay()
        
        const days = []
        
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push({ day: '', isEmpty: true, expenses: [], subscriptions: [] })
        }
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayData = (calendarData.expenses || []).filter(expense => 
                expense.date === dateString
            ) || []
            const subscriptionData = (calendarData.subscriptions || []).filter(subscription => 
                subscription.renewal_date === dateString
            ) || []
            
            days.push({
                day,
                date: dateString,
                expenses: dayData,
                subscriptions: subscriptionData,
                isEmpty: false
            })
        }
        
        return days
    }

    const handleDateClick = (dayData) => {
        if (!dayData.isEmpty && (dayData.expenses.length > 0 || dayData.subscriptions.length > 0)) {
            setSelectedDate(dayData)
            setShowDateDetails(true)
        }
    }

    useEffect(() => {
        fetchCalendarData(currentDate.getMonth() + 1, currentDate.getFullYear())
    }, [currentDate])

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-blue-50/30 via-white to-cyan-50/30 p-4 md:p-6">
            <div className="w-full px-2 md:px-4 py-4 md:py-6 relative">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 text-lg">📅</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <div className="flex justify-between items-center mb-4">
                        <button
                            onClick={goToPreviousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <span className="text-lg">◀</span>
                        </button>
                        <h2 className="text-xl font-semibold text-gray-900">
                            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <button
                            onClick={goToNextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        >
                            <span className="text-lg">▶</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                                {day}
                            </div>
                        ))}
                        
                        {getCalendarDays().map((dayData, index) => (
                            <div
                                key={index}
                                onClick={() => handleDateClick(dayData)}
                                className={`p-2 min-h-[80px] border border-gray-100 ${
                                    dayData.isEmpty 
                                        ? 'bg-gray-50' 
                                        : 'bg-white hover:bg-gray-50 cursor-pointer'
                                } ${dayData.expenses.length > 0 || dayData.subscriptions.length > 0 ? 'ring-2 ring-blue-200' : ''}`}
                            >
                                {!dayData.isEmpty && (
                                    <>
                                        <div className="text-sm font-medium text-gray-900 mb-1">
                                            {dayData.day}
                                        </div>
                                        {dayData.expenses.map((expense, i) => (
                                            <div key={i} className="text-xs bg-gray-300 text-black px-1 py-0.5 rounded mb-1 truncate">
                                                💰 {expense.title}
                                            </div>
                                        ))}
                                        {dayData.subscriptions.map((subscription, i) => (
                                            <div key={i} className="text-xs bg-gray-400 text-black px-1 py-0.5 rounded mb-1 truncate">
                                                📱 {subscription.title}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500 font-medium">Total Expenses in {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-black text-xs">💰</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            ${parseFloat(calendarData.summary?.total_expenses || 0).toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500 font-medium">Subscriptions in {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-black text-xs">📱</span>
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                            ${parseFloat(calendarData.summary?.total_subscriptions || 0).toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-gray-500 font-medium">Remaining Budget for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <span className="text-black text-xs">🎯</span>
                            </div>
                        </div>
                        <p className={`text-2xl font-bold ${(calendarData.summary?.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${parseFloat(calendarData.summary?.remaining_budget || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">After expenses & subscriptions</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Legend</h3>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-300 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Expenses</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Subscriptions</span>
                        </div>
                        <div className="flex items-center">
                            <div className="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                            <span className="text-sm text-gray-600">Days with activity</span>
                        </div>
                    </div>
                </div>
            </div>

            {showDateDetails && selectedDate && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {formatDate(selectedDate.date)}
                            </h3>
                            <button
                                onClick={() => setShowDateDetails(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                <span className="text-lg">✕</span>
                            </button>
                        </div>
                        
                        {selectedDate.expenses.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 mb-3">Expenses</h4>
                                <div className="space-y-2">
                                    {selectedDate.expenses.map((expense, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                            <span className="text-sm font-medium text-gray-900">{expense.title}</span>
                                            <span className="text-sm font-bold text-black">-${parseFloat(expense.amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedDate.subscriptions.length > 0 && (
                            <div>
                                <h4 className="text-md font-medium text-gray-900 mb-3">Subscriptions</h4>
                                <div className="space-y-2">
                                    {selectedDate.subscriptions.map((subscription, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-100 rounded-lg">
                                            <span className="text-sm font-medium text-gray-900">{subscription.title}</span>
                                            <span className="text-sm font-bold text-black">-${parseFloat(subscription.amount).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {selectedDate.expenses.length === 0 && selectedDate.subscriptions.length === 0 && (
                            <p className="text-gray-500 text-center py-4">No financial activity on this date.</p>
                        )}
                    </div>
                </div>
            )}

            <Settings 
                isOpen={isSettingsOpen}
                onClose={() => {
                    setIsSettingsOpen(false)
                    fetchCalendarData(currentDate.getMonth() + 1, currentDate.getFullYear())
                }}
            />
        </div>
    )
}

export default Calendar