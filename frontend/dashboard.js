const API = "http://localhost:3000";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const userName = localStorage.getItem("userName") || "User";

if(!token){
    alert("Please Login First");
    window.location.href = "login.html";
}

let taskChart = null;
let statusChart = null;
let currentDate = new Date();
let allTasks = [];
async function loadDashboard(){

    try{

        document.getElementById("welcome").innerText =
        `Welcome, ${userName}`;

document.getElementById("dropdownUserName").innerText =
userName;
        const response =
        await fetch(`${API}/dashboard/${userId}`,{
            headers:{
                Authorization: token
            }
        });

        const data =
        await response.json();
allTasks = await loadCalendarTasks();
renderCalendar();
        const totalProjects = data.totalProjects || 0;
        const totalTasks = data.totalTasks || 0;
        const openTasks = data.openTasks || 0;
        const progressTasks = data.progressTasks || data.inProgressTasks || 0;
        const completedTasks = data.completedTasks || 0;
        const overdueTasks = data.overdueTasks || 0;

        setText("totalProjects", totalProjects);
        setText("totalTasks", totalTasks);
        setText("openTasks", openTasks);
        setText("progressTasks", progressTasks);
        setText("completedTasks", completedTasks);
        setText("overdueTasks", overdueTasks);

        setText("legendOpen", openTasks);
        setText("legendProgress", progressTasks);
        setText("legendCompleted", completedTasks);
        setText("legendOverdue", overdueTasks);

        createCharts(openTasks, progressTasks, completedTasks, overdueTasks);
        loadNotifications();

    }
    catch(error){

        console.log(error);

        createCharts(6,1,1,1);
        loadNotifications();

    }

}

function setText(id,value){

    const el =
    document.getElementById(id);

    if(el){
        el.innerText = value;
    }

}

function createCharts(openTasks, progressTasks, completedTasks, overdueTasks){

    const taskCtx =
    document.getElementById("taskChart");

    const statusCtx =
    document.getElementById("statusChart");

    if(!taskCtx || !statusCtx){
        return;
    }

    if(taskChart){
        taskChart.destroy();
    }

    if(statusChart){
        statusChart.destroy();
    }

    taskChart = new Chart(taskCtx,{
        type:"bar",
        data:{
            labels:["Open","Progress","Completed","Overdue"],
            datasets:[{
                label:"Tasks",
                data:[openTasks,progressTasks,completedTasks,overdueTasks],
                backgroundColor:["#22c55e","#f97316","#8b5cf6","#ef4444"],
                borderRadius:10
            }]
        },
        options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{
                legend:{
                    labels:{
                        color:"#e5e7eb"
                    }
                }
            },
            scales:{
                x:{
                    ticks:{
                        color:"#cbd5e1"
                    },
                    grid:{
                        color:"rgba(255,255,255,.08)"
                    }
                },
                y:{
                    beginAtZero:true,
                    ticks:{
                        color:"#cbd5e1",
                        precision:0
                    },
                    grid:{
                        color:"rgba(255,255,255,.08)"
                    }
                }
            }
        }
    });

    statusChart = new Chart(statusCtx,{
        type:"doughnut",
        data:{
            labels:["Open","In Progress","Completed","Overdue"],
            datasets:[{
                data:[openTasks,progressTasks,completedTasks,overdueTasks],
                backgroundColor:["#22c55e","#f97316","#8b5cf6","#ef4444"],
                borderWidth:0
            }]
        },
        options:{
            responsive:false,
            maintainAspectRatio:false,
            cutout:"65%",
            plugins:{
                legend:{
                    display:false
                }
            }
        }
    });

}

async function loadRecentProjects(){

    const box =
    document.getElementById("recentProjectsList");

    if(!box){
        return;
    }

    try{

        const response =
        await fetch(`${API}/projects-with-task-count?userId=${userId}`,{
            headers:{
                Authorization: token
            }
        });

        const projects =
        await response.json();

        box.innerHTML = "";

        projects
        .slice(-2)
        .reverse()
        .forEach(project => {

            box.innerHTML += `
                <div class="project-item">
                    <div class="project-icon blue-folder">
                        <i class="fa-solid fa-folder"></i>
                    </div>

                    <div class="project-info">
                        <h4>${project.projectName || "Untitled Project"}</h4>
                        <p>${project.description || "No description"}</p>
                    </div>

                    <span class="badge active-badge">
                        ${project.status || "Active"}
                    </span>
                </div>
            `;

        });

        if(projects.length === 0){
            box.innerHTML = `<p class="empty-text">No projects yet</p>`;
        }

    }
    catch(error){
        console.log(error);
    }

}

async function loadUpcomingTasks(){

    const box =
    document.getElementById("upcomingTasksList");

    if(!box){
        return;
    }

    try{

        const response =
        await fetch(`${API}/tasks?userId=${userId}`,{
            headers:{
                Authorization: token
            }
        });

        const tasks =
        await response.json();

        const upcoming =
        tasks
        .filter(task => task.dueDate)
        .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0,2);

        box.innerHTML = "";

        upcoming.forEach(task => {

            box.innerHTML += `
                <div class="task-item">
                    <span class="task-ring"></span>

                    <div class="task-info">
                        <h4>${task.taskName || "Untitled Task"}</h4>
                        <p>${task.description || "No description"}</p>
                    </div>

                    <div class="task-date">
                        <i class="fa-regular fa-calendar"></i>
                        ${formatDueDate(task.dueDate)}
                    </div>
                </div>
            `;

        });

        if(upcoming.length === 0){
            box.innerHTML = `<p class="empty-text">No upcoming tasks</p>`;
        }

    }
    catch(error){
        console.log(error);
    }

}

function formatDueDate(date){

    const today =
    new Date();

    const due =
    new Date(date);

    today.setHours(0,0,0,0);
    due.setHours(0,0,0,0);

    const diff =
    (due - today) / (1000 * 60 * 60 * 24);

    if(diff === 0){
        return "Today";
    }

    if(diff === 1){
        return "Tomorrow";
    }

    return due.toLocaleDateString();

}

function renderCalendar(){

    const monthYear =
    document.getElementById("monthYear");

    const calendarDays =
    document.getElementById("calendarDays");

    if(!monthYear || !calendarDays){
        return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    const weekDays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    monthYear.innerText = `${monthNames[month]} ${year}`;

    calendarDays.innerHTML = "";

    weekDays.forEach(day => {
        calendarDays.innerHTML += `<span>${day}</span>`;
    });

    const firstDay = new Date(year,month,1).getDay();
    const lastDate = new Date(year,month + 1,0).getDate();

    for(let i = 0; i < firstDay; i++){
        calendarDays.innerHTML += `<b class="empty"></b>`;
    }

    const today = new Date();

    for(let day = 1; day <= lastDate; day++){

        const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

        const taskDate =
        `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const tasksOnDate =
        allTasks.filter(task => task.dueDate === taskDate);

        let dots = "";

        tasksOnDate.forEach(task => {

            let dotClass = "dot-open";

            if(task.status === "In Progress"){
                dotClass = "dot-progress";
            }
            else if(task.status === "Completed"){
                dotClass = "dot-completed";
            }
            else if(task.status === "Overdue"){
                dotClass = "dot-overdue";
            }

            dots += `<i class="calendar-dot ${dotClass}"></i>`;
        });

        calendarDays.innerHTML += `
    <div class="calendar-day ${isToday ? "today" : ""}">
        <div class="day-number">${day}</div>

        <div class="calendar-dots">
            ${dots}
        </div>
    </div>
`;
    }
}
function prevMonth(){

    currentDate.setMonth(currentDate.getMonth() - 1);

    renderCalendar();
}

function nextMonth(){

    currentDate.setMonth(currentDate.getMonth() + 1);

    renderCalendar();
}
function loadNotifications(){

    const list = document.getElementById("notificationList");
    const count = document.getElementById("notificationCount");

    const notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    list.innerHTML = "";

    if(notifications.length === 0){
        list.innerHTML = `
            <div class="notification-item">
                <h4>No notifications yet</h4>
                <p>Create a project or task to see updates here.</p>
            </div>
        `;
        count.innerText = "0";
        return;
    }

    notifications.forEach(item => {

        const title =
        item.message || item.title || "Notification";

        const time =
        item.time || item.createdAt || item.date || "";

        list.innerHTML += `
            <div class="notification-item">
                <h4>${title}</h4>
                <p>${time}</p>
            </div>
        `;
    });

    count.innerText = notifications.length;
}

function toggleNotifications(){

    document
    .getElementById("notificationPanel")
    .classList.toggle("show");

}

function toggleProfileMenu(){

    document
    .getElementById("profileDropdown")
    .classList.toggle("show");

}

document.addEventListener("click",function(e){

    const notification =
    document.querySelector(".notification-wrapper");

    const profile =
    document.querySelector(".profile-menu");

    if(notification && !notification.contains(e.target)){
        document
        .getElementById("notificationPanel")
        .classList.remove("show");
    }

    if(profile && !profile.contains(e.target)){
        document
        .getElementById("profileDropdown")
        .classList.remove("show");
    }

});

const searchInput =
document.querySelector(".search-box input");

if(searchInput){

    searchInput.addEventListener("input",function(){

        const value =
        this.value.toLowerCase();

        const items =
        document.querySelectorAll(".project-item,.task-item,.stat-card");

        items.forEach(item => {

            const text =
            item.innerText.toLowerCase();

            item.style.display =
            text.includes(value) ? "flex" : "none";

        });

    });

}
function addNotification(message){

    let notifications =
    JSON.parse(localStorage.getItem("notifications")) || [];

    notifications.unshift({
        message:message,
        time:new Date().toLocaleString()
    });

    // Keep only latest 20 notifications
    if(notifications.length > 20){
        notifications = notifications.slice(0,20);
    }

    localStorage.setItem(
        "notifications",
        JSON.stringify(notifications)
    );

}

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");

    // Don't remove notifications

    window.location.href="login.html";

}
async function loadCalendarTasks() {

    const response = await fetch(
        `http://localhost:3000/tasks?userId=${userId}`,
        {
            headers: {
                Authorization: token
            }
        }
    );

    return await response.json();
}
loadDashboard();
 loadNotifications();
loadRecentProjects();
loadUpcomingTasks();
