import NavBar from "../components/NavBar"
import ExpenseList from "../components/ExpenseList"

function ExpensePage() {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <NavBar />
            <div className="flex-1 overflow-auto bg-gray-50">
                <ExpenseList />
            </div>
        </div>
    )
}

export default ExpensePage