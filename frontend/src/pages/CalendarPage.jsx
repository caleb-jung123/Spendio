import NavBar from "../components/NavBar"
import Calendar from "../components/Calendar"

function CalendarPage() {
    return (
        <div className="flex w-full h-screen overflow-hidden bg-gray-50">
            <NavBar />
            <div className="flex-1 overflow-auto bg-gray-50">
                <Calendar />
            </div>
        </div>
    )
}

export default CalendarPage