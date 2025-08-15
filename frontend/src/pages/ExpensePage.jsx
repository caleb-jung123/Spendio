import NavBar from "../components/NavBar"
import ExpenseList from "../components/ExpenseList"

function ExpensePage() {
    return (
        <div className="flex w-full h-screen">
            <NavBar />
            <ExpenseList />
        </div>
    )
}

export default ExpensePage