import { useState, useEffect } from 'react'
import api from '../api'

function Chat() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [dataLoading, setDataLoading] = useState(false)
    const [messageCount, setMessageCount] = useState(0)
    const [weeklyLimit, setWeeklyLimit] = useState(5)
    const [inputValue, setInputValue] = useState('')

    useEffect(() => {
        fetchMessageCount()
    }, [])

    const fetchMessageCount = async () => {
        try {
            const response = await api.get('/api/chat/usage/')
            setMessageCount(response.data.message_count || 0)
        } catch (error) {
            setMessageCount(0)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsOpen(false)
        }
    }

    const sendData = async (timeframe) => {
        setDataLoading(true)
        try {
            let data = {}
            
            let expensesResponse
            switch (timeframe) {
                case 'monthly':
                    expensesResponse = await api.get('/api/expenses/monthly/')
                    break
                case 'yearly':
                    expensesResponse = await api.get('/api/expenses/yearly/')
                    break
                case 'all-time':
                    expensesResponse = await api.get('/api/expenses/all-time/')
                    break
                default:
                    break
            }
            
            const budgetResponse = await api.get('/api/budgets/current/')
            
            const subscriptionsResponse = await api.get('/api/subscriptions/')
            
            data = {
                timeframe,
                expenses: expensesResponse?.data || {},
                budget: budgetResponse?.data || {},
                subscriptions: subscriptionsResponse?.data || []
            }
            
            const userMessage = {
                id: Date.now(),
                type: 'user',
                content: `Sent ${timeframe} financial data (${data.expenses?.expenses?.length || 0} expenses, ${data.subscriptions?.length || 0} subscriptions, ${data.budget?.amount ? '$' + data.budget.amount : 'no'} budget)`,
                timestamp: new Date().toLocaleTimeString(),
                data: data
            }
            
            setMessages(prev => [...prev, userMessage])
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: `I've received your ${timeframe} financial data. I can see your expenses, budget, and active subscriptions. How can I help you analyze this information?`,
                timestamp: new Date().toLocaleTimeString()
            }
            
            setTimeout(() => {
                setMessages(prev => [...prev, aiMessage])
            }, 1000)
            
        } catch (error) {
            const errorMessage = {
                id: Date.now(),
                type: 'ai',
                content: 'Sorry, I encountered an error while fetching your financial data. Please try again.',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setDataLoading(false)
        }
    }

    const sendMessage = async (content) => {
        if (!content.trim()) return
        
        if (content.length > 900) {
            const lengthMessage = {
                id: Date.now(),
                type: 'ai',
                content: 'Your message is too long. Please keep it under 900 characters.',
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            }
            setMessages(prev => [...prev, lengthMessage])
            return
        }
        
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: content,
            timestamp: new Date().toLocaleTimeString()
        }
        
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)
        
        try {
            const conversationHistory = messages
                .filter(msg => !msg.data)
                .map(msg => ({
                    type: msg.type,
                    content: msg.content
                }))
            
            const recentDataMessage = messages
                .filter(msg => msg.data)
                .pop()
            
            const response = await api.post('/api/chat/message/', {
                message: content,
                conversation_history: conversationHistory,
                financial_data: recentDataMessage?.data || null,
                weekly_limit: weeklyLimit
            })
            
            setMessageCount(response.data.current_count)
            
            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: response.data.message,
                timestamp: new Date().toLocaleTimeString()
            }
            
            setMessages(prev => [...prev, aiMessage])
            
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
            
            let errorContent = 'Sorry, I encountered an error while processing your request. Please try again later.'
                        
            if (error.response) {
                if (error.response.status === 429) {
                    errorContent = error.response.data.error || 'Weekly message limit reached. Please try again next week.'
                    setMessageCount(error.response.data.current_count || messageCount)
                } else if (error.response.status === 400) {
                    errorContent = error.response.data.error || 'Invalid message. Please check your input.'
                } else if (error.response.data && error.response.data.error) {
                    errorContent = error.response.data.error
                }
            }
            
            const errorMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: errorContent,
                timestamp: new Date().toLocaleTimeString(),
                isError: true
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const input = inputValue.trim()
        if (!input) return
        
        sendMessage(input)
        setInputValue('')
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        if (value.length <= 900) {
            setInputValue(value)
        }
    }

    const remainingMessages = weeklyLimit - messageCount
    const remainingChars = 900 - inputValue.length

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-white text-black rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200 z-40 flex items-center justify-center border border-gray-200"
                title="AI Financial Assistant"
            >
                <span className="text-lg">💬</span>
            </button>

            {isOpen && (
                <div 
                    className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
                    onClick={handleBackdropClick}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[95vh] sm:h-[90vh] flex flex-col transform transition-all duration-300 scale-100">
                        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-3 sm:py-4 rounded-t-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                        <span className="text-black">🤖</span>
                                    </div>
                                    <div>
                                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">AI Financial Assistant</h2>
                                        <p className="text-xs sm:text-sm text-gray-500">Ask me about your finances</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 text-gray-500 hover:text-gray-700 font-bold text-xl"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-gray-600">Send your financial data for analysis:</p>
                                <div className="text-xs text-gray-500">
                                    {remainingMessages} messages remaining this week
                                </div>
                            </div>
                            <div className="flex gap-1 sm:gap-2">
                                <button
                                    onClick={() => sendData('monthly')}
                                    disabled={dataLoading}
                                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {dataLoading ? 'Sending...' : 'Monthly'}
                                </button>
                                <button
                                    onClick={() => sendData('yearly')}
                                    disabled={dataLoading}
                                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {dataLoading ? 'Sending...' : 'Yearly'}
                                </button>
                                <button
                                    onClick={() => sendData('all-time')}
                                    disabled={dataLoading}
                                    className="flex-1 px-2 sm:px-3 py-1 sm:py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {dataLoading ? 'Sending...' : 'All Time'}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl">💬</span>
                                    </div>
                                    <p className="text-lg font-medium mb-2">Welcome to your AI Financial Assistant!</p>
                                    <p className="text-sm">Send your financial data above and start asking questions about your spending patterns, budget analysis, and financial insights.</p>
                                    <p className="text-xs text-gray-400 mt-2">Weekly limit: {weeklyLimit} messages • Max 900 characters per message</p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                             message.type === 'user'
                                                 ? 'bg-black text-white'
                                                 : message.isError
                                                 ? 'bg-red-50 text-red-800 border border-red-200'
                                                 : 'bg-gray-100 text-gray-900'
                                         }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                                                                         <p className={`text-xs mt-1 ${
                                                 message.type === 'user' ? 'text-gray-300' : 'text-gray-500'
                                             }`}>
                                                {message.timestamp}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 text-gray-900 rounded-2xl px-4 py-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent"></div>
                                            <span className="text-sm">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                                
                        <div className="border-t border-gray-100 p-4 sm:p-6">
                            <form onSubmit={handleSubmit} className="space-y-3">
                                <div className="relative">
                                    <textarea
                                        name="message"
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        placeholder="Ask me about your finances..."
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200 resize-none"
                                        rows="2"
                                        disabled={isLoading || messageCount >= weeklyLimit}
                                    />
                                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                                        {remainingChars}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="text-xs text-gray-500">
                                        {remainingMessages} messages remaining this week
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading || messageCount >= weeklyLimit || !inputValue.trim()}
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-sm sm:text-base"
                                    >
                                        Send
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Chat
