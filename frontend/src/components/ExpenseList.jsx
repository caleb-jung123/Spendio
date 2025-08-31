import { useState, useEffect } from "react"
import api from "../api"
import ExpenseForm from "./ExpenseForm"
import Expense from "./Expense"
import Settings from "./Settings"

function ExpenseList() {
    const [expenses, setExpenses] = useState([])
    const [allExpenses, setAllExpenses] = useState([])                              
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(false)
    
    const [timeFilter, setTimeFilter] = useState(() => {
        const saved = localStorage.getItem('expenseTimeFilter')
        return saved || 'this-month' 
    })
    const [categoryFilter, setCategoryFilter] = useState(() => {
        const saved = localStorage.getItem('expenseCategoryFilter')
        return saved || 'all'
    })
    const [searchQuery, setSearchQuery] = useState(() => {
        const saved = localStorage.getItem('expenseSearchQuery')
        return saved || ''
    })
    
    const [categories, setCategories] = useState([])
    
    const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)

    async function getExpenseList() {
        try {
            setLoading(true)
            let response
            
            if (timeFilter === 'this-month') {
                response = await api.get('/api/expenses/monthly/')
                const data = response.data
                setExpenses(data.expenses)
                setTotal(data.total)
            } else if (timeFilter === 'this-year') {
                response = await api.get('/api/expenses/yearly/')
                const data = response.data
                setExpenses(data.expenses)
                setTotal(data.total)
            } else {
                response = await api.get('/api/expenses/all-time/')
                const data = response.data
                setExpenses(data.expenses)
                setTotal(data.total)
            }
            
            const allResponse = await api.get('/api/expenses/')
            const allData = allResponse.data
            setAllExpenses(allData)
            
            const uniqueCategories = [...new Set(allData.map(expense => expense.category))].sort()
            setCategories(uniqueCategories)
            
        } catch (error) {
            // Silent Fail
        } finally {
            setLoading(false)
        }
    }

    const getFilteredExpenses = () => {
        let filtered = expenses

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(expense => expense.category === categoryFilter)
        }

        if (searchQuery.trim()) {
            filtered = filtered.filter(expense => 
                expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                expense.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        return filtered
    }

    const getFilteredTotal = () => {
        const filtered = getFilteredExpenses()
        return filtered.reduce((sum, expense) => sum + parseFloat(expense.amount), 0)
    }

    async function deleteExpense(expense) {
        try {
            await api.delete(`/api/expenses/${expense.id}/`)
            getExpenseList()
        } catch (error) {
        }
    }

    useEffect(() => {
        localStorage.setItem('expenseTimeFilter', timeFilter)
    }, [timeFilter])

    useEffect(() => {
        localStorage.setItem('expenseCategoryFilter', categoryFilter)
    }, [categoryFilter])

    useEffect(() => {
        localStorage.setItem('expenseSearchQuery', searchQuery)
    }, [searchQuery])

    useEffect(() => {
        getExpenseList()
    }, [timeFilter]) 

    const filteredExpenses = getFilteredExpenses()
    const filteredTotal = getFilteredTotal()

    return (
        <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-br from-orange-50/30 via-white to-amber-50/30 p-4 md:p-6">
            <div className="w-full px-2 md:px-4 py-4 md:py-6 relative">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <span className="text-orange-600 text-lg">💰</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Expenses</h1>
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
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-sm border border-orange-100 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-orange-600 text-xl">💰</span>
                            </div>
                            <div>
                                <p className="text-orange-700 text-xs md:text-sm font-medium">Total Expenses</p>
                                <p className="text-3xl md:text-4xl font-bold text-orange-800">${parseFloat(filteredTotal || 0).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                        <div className="flex flex-col gap-4">
                            <div>
                                <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Time Period</p>
                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {[
                                        { key: 'this-month', label: 'This Month' },
                                        { key: 'this-year', label: 'This Year' },
                                        { key: 'all-time', label: 'All Time' }
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
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-xs md:text-sm font-medium mb-2">Search</p>
                                    <input
                                        type="text"
                                        placeholder="Search by name or description..."
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
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-500">
                                <span>
                                    Showing {filteredExpenses.length} of {expenses.length} expenses
                                </span>
                                {(categoryFilter !== 'all' || searchQuery.trim()) && (
                                    <button
                                        onClick={() => {
                                            setCategoryFilter('all')
                                            setSearchQuery('')
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
                        <h2 className="text-lg md:text-xl font-semibold text-gray-900">Your Expenses</h2>
                        <button 
                            onClick={() => setIsExpenseFormOpen(true)}
                            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs md:text-sm px-4 md:px-6 py-2 md:py-3 rounded-lg shadow-sm transition-all duration-200 font-medium transform hover:scale-105"
                        >
                            + Add Expense
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                        </div>
                    ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">
                                {expenses.length === 0 ? 'No expenses found' : 'No expenses match your filters'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredExpenses.map((expense) => (
                                <Expense 
                                    key={expense.id} 
                                    expense={expense} 
                                    onDelete={deleteExpense}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ExpenseForm 
                isOpen={isExpenseFormOpen}
                onClose={() => setIsExpenseFormOpen(false)}
                onExpenseAdded={(newExpense) => {       
                    getExpenseList()
                }}
            />

            <Settings 
                isOpen={isSettingsOpen}
                onClose={() => {
                    setIsSettingsOpen(false)
                    getExpenseList()
                }}
            />
        </div>
    )
}

export default ExpenseList