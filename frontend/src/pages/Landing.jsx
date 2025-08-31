import { Link } from "react-router-dom"

function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex justify-between items-center py-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">$</span>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">Spendio</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link 
                            to="/login"
                            className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                        <Link 
                            to="/register"
                            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 font-medium transition-colors duration-200"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>

                <div className="text-center py-20">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                            Take Control of Your Finances
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Track expenses, manage subscriptions, and stay within budget.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link 
                                to="/register"
                                className="bg-black text-white px-8 py-4 rounded-xl hover:bg-gray-800 font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                            >
                                Register
                            </Link>
                            <Link 
                                to="/login"
                                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:border-gray-400 hover:bg-gray-50 font-semibold text-lg transition-all duration-200"
                            >
                                Sign In
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8 py-16">
                    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">💰</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Expense Tracking</h3>
                                                 <p className="text-gray-600 leading-relaxed">
                             Log and categorize your expenses.
                         </p>
                    </div>
                    
                    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">📱</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Subscription Management</h3>
                                                 <p className="text-gray-600 leading-relaxed">
                             Track your recurring subscriptions.
                         </p>
                    </div>
                    
                    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">🎯</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Planning</h3>
                                                 <p className="text-gray-600 leading-relaxed">
                             Set budgets and track progress.
                         </p>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Landing
