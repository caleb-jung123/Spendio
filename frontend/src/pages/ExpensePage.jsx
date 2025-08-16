import NavBar from "../components/NavBar"
import ExpenseList from "../components/ExpenseList"

function ExpensePage() {
    return (
        <div className="flex w-full h-screen overflow-hidden">
            <NavBar />
            <div className="flex-1 overflow-auto">
                <ExpenseList />
            </div>
        </div>
    )
}

export default ExpensePage