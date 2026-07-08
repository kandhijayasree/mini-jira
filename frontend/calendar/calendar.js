const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if(!token || !userId){
    alert("Please Login First");
    window.location.href = "../login.html";
}

let currentDate = new Date();
let allTasks = [];

async function loadTasks(){

    try{
        const response = await fetch(
            `http://localhost:3000/tasks?userId=${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        allTasks = await response.json();

        renderCalendar(allTasks);
    }
    catch(error){
        console.log(error);
    }
}

function renderCalendar(tasks){

    const monthYear =
    document.getElementById("monthYear");

    const calendarDays =
    document.getElementById("calendarDays");

    const year =
    currentDate.getFullYear();

    const month =
    currentDate.getMonth();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    monthYear.innerText =
    `${monthNames[month]} ${year}`;

    calendarDays.innerHTML = "";

    const firstDay =
    new Date(year,month,1).getDay();

    const lastDate =
    new Date(year,month + 1,0).getDate();

    for(let i = 0; i < firstDay; i++){
        calendarDays.innerHTML += `
            <div class="day empty"></div>
        `;
    }

    const today = new Date();

    for(let day = 1; day <= lastDate; day++){

        const dateString =
        `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const dayTasks =
        tasks.filter(task => task.dueDate === dateString);

        const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

        let taskHtml = "";

        dayTasks.forEach(task => {

            const priority =
            (task.priority || "Low").toLowerCase();

            taskHtml += `
                <div class="task-badge ${priority}"
                title="${task.taskName}">
                    ${task.taskName}
                </div>
            `;

        });

        calendarDays.innerHTML += `
            <div class="day ${isToday ? "today" : ""}">
                <div class="day-number">${day}</div>
                ${taskHtml}
            </div>
        `;
    }
}

function prevMonth(){
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar(allTasks);
}

function nextMonth(){
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar(allTasks);
}

function searchCalendarTasks(){

    const value =
    document.getElementById("searchCalendar").value.toLowerCase();

    const filtered =
    allTasks.filter(task => {

        const text =
        `${task.taskName} ${task.description} ${task.assignedTo} ${task.priority} ${task.status}`
        .toLowerCase();

        return text.includes(value);

    });

    renderCalendar(filtered);
}



loadTasks();