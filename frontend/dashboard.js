const API = "http://localhost:3000";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const notificationStorageKey = `notifications_${userId}`;
const activityStorageKey = `activities_${userId}`;
let userName =
    localStorage.getItem("userName") || "User";

let userEmail =
    localStorage.getItem("userEmail") || "";

if(!token || !userId){
    window.location.href = "login.html";
}

let taskChart = null;
let statusChart = null;
let currentDate = new Date();
let allTasks = [];

/* =========================================
   LOAD DASHBOARD
========================================= */

async function loadDashboard(){

    try{

        updateUserInformation();

        const response = await fetch(
            `${API}/dashboard/${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const data = await readResponse(response);

        if(!response.ok){
            showDashboardMessage(
                data.message || "Unable to load dashboard"
            );
            return;
        }

        const totalProjects =
            Number(data.totalProjects) || 0;

        const totalTasks =
            Number(data.totalTasks) || 0;

        const openTasks =
            Number(data.openTasks) || 0;

        const progressTasks =
            Number(
                data.progressTasks ??
                data.inProgressTasks
            ) || 0;

        const completedTasks =
            Number(data.completedTasks) || 0;

        const overdueTasks =
            Number(data.overdueTasks) || 0;

        setText("totalProjects",totalProjects);
        setText("totalTasks",totalTasks);
        setText("openTasks",openTasks);
        setText("progressTasks",progressTasks);
        setText("completedTasks",completedTasks);
        setText("overdueTasks",overdueTasks);

        setText("legendOpen",openTasks);
        setText("legendProgress",progressTasks);
        setText("legendCompleted",completedTasks);
        setText("legendOverdue",overdueTasks);

        updateCardDescriptions(
            totalProjects,
            totalTasks,
            openTasks,
            progressTasks,
            completedTasks,
            overdueTasks
        );

        updateWelcomeSummary(
            totalProjects,
            openTasks,
            progressTasks
        );

        createCharts(
            openTasks,
            progressTasks,
            completedTasks,
            overdueTasks
        );

        allTasks = await loadCalendarTasks();

        renderCalendar();
        loadNotifications();
        loadActivities();

    }
    catch(error){

        console.error("Dashboard error:",error);

        showDashboardMessage(
            "Unable to connect to the backend server"
        );

        showToast(
            "Unable to load dashboard",
            "error"
        );
    }
}

/* =========================================
   USER INFORMATION
========================================= */

function updateUserInformation(){

    userName =
        localStorage.getItem("userName") || "User";

    userEmail =
        localStorage.getItem("userEmail") || "";

    setText(
        "welcome",
        `Welcome, ${userName}`
    );

    setText(
        "dropdownUserName",
        userName
    );

    setText(
        "dropdownUserEmail",
        userEmail || "Project Management User"
    );

    setText(
        "profileInitial",
        userName.charAt(0).toUpperCase()
    );
}

/* =========================================
   CARD DESCRIPTIONS
========================================= */

function updateCardDescriptions(
    totalProjects,
    totalTasks,
    openTasks,
    progressTasks,
    completedTasks,
    overdueTasks
){

    const completionRate =
        totalTasks === 0
            ? 0
            : Math.round(
                (completedTasks / totalTasks) * 100
            );

    setText(
        "projectsDescription",
        totalProjects === 1
            ? "1 project created"
            : `${totalProjects} projects created`
    );

    setText(
        "completionRate",
        `${completionRate}% completed`
    );

    setText(
        "openDescription",
        openTasks === 0
            ? "No open tasks"
            : openTasks === 1
                ? "1 task currently open"
                : `${openTasks} tasks currently open`
    );

    setText(
        "progressDescription",
        progressTasks === 0
            ? "No tasks in progress"
            : progressTasks === 1
                ? "1 task being worked on"
                : `${progressTasks} tasks being worked on`
    );

    setText(
        "completedDescription",
        completedTasks === 0
            ? "No completed tasks"
            : completedTasks === 1
                ? "1 task completed"
                : `${completedTasks} tasks completed`
    );

    setText(
        "overdueDescription",
        overdueTasks === 0
            ? "No overdue tasks"
            : overdueTasks === 1
                ? "1 task needs attention"
                : `${overdueTasks} tasks need attention`
    );
}

function updateWelcomeSummary(
    totalProjects,
    openTasks,
    progressTasks
){

    const summary =
        document.getElementById("welcomeSummary");

    if(!summary) return;

    if(
        totalProjects === 0 &&
        openTasks === 0 &&
        progressTasks === 0
    ){
        summary.innerText =
            "Create your first project and start organizing your work.";
        return;
    }

    summary.innerText =
        `You have ${openTasks} open task(s), ` +
        `${progressTasks} task(s) in progress and ` +
        `${totalProjects} project(s).`;
}

function showDashboardMessage(message){

    const summary =
        document.getElementById("welcomeSummary");

    if(summary){
        summary.innerText = message;
    }
}

/* =========================================
   HELPER
========================================= */

function setText(id,value){

    const element =
        document.getElementById(id);

    if(element){
        element.innerText = value;
    }
}

async function readResponse(response){

    const contentType =
        response.headers.get("content-type") || "";

    if(contentType.includes("application/json")){
        return await response.json();
    }

    return {
        message:await response.text()
    };
}

function escapeHtml(value){

    return String(value ?? "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}

/* =========================================
   CHARTS
========================================= */

function createCharts(
    openTasks,
    progressTasks,
    completedTasks,
    overdueTasks
){

    const taskCanvas =
        document.getElementById("taskChart");

    const statusCanvas =
        document.getElementById("statusChart");

    if(
        !taskCanvas ||
        !statusCanvas ||
        typeof Chart === "undefined"
    ){
        return;
    }

    if(taskChart){
        taskChart.destroy();
    }

    if(statusChart){
        statusChart.destroy();
    }

    taskChart = new Chart(
        taskCanvas,
        {
            type:"bar",

            data:{
                labels:[
                    "Open",
                    "Progress",
                    "Completed",
                    "Overdue"
                ],

                datasets:[{
                    label:"Tasks",

                    data:[
                        openTasks,
                        progressTasks,
                        completedTasks,
                        overdueTasks
                    ],

                    backgroundColor:[
                        "#22c55e",
                        "#f97316",
                        "#8b5cf6",
                        "#ef4444"
                    ],

                    borderRadius:9,

                    maxBarThickness:115
                }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    legend:{
                        labels:{
                            color:"#dbe3ee",
                            boxWidth:30
                        }
                    }
                },

                scales:{
                    x:{
                        ticks:{
                            color:"#cbd5e1"
                        },

                        grid:{
                            color:"rgba(255,255,255,.07)"
                        }
                    },

                    y:{
                        beginAtZero:true,

                        ticks:{
                            color:"#cbd5e1",
                            precision:0,
                            stepSize:1
                        },

                        grid:{
                            color:"rgba(255,255,255,.07)"
                        }
                    }
                }
            }
        }
    );

    statusChart = new Chart(
        statusCanvas,
        {
            type:"doughnut",

            data:{
                labels:[
                    "Open",
                    "In Progress",
                    "Completed",
                    "Overdue"
                ],

                datasets:[{
                    data:[
                        openTasks,
                        progressTasks,
                        completedTasks,
                        overdueTasks
                    ],

                    backgroundColor:[
                        "#22c55e",
                        "#f97316",
                        "#8b5cf6",
                        "#ef4444"
                    ],

                    borderWidth:0
                }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,
                cutout:"66%",

                plugins:{
                    legend:{
                        display:false
                    }
                }
            }
        }
    );
}

/* =========================================
   RECENT PROJECTS
========================================= */

async function loadRecentProjects(){

    const container =
        document.getElementById(
            "recentProjectsList"
        );

    if(!container) return;

    try{

        let response = await fetch(
            `${API}/projects-with-task-count?userId=${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        if(!response.ok){

            response = await fetch(
                `${API}/projects?userId=${userId}`,
                {
                    headers:{
                        Authorization:token
                    }
                }
            );
        }

        const data = await readResponse(response);

        if(!response.ok){
            throw new Error(
                data.message || "Unable to load projects"
            );
        }

        const projects =
            Array.isArray(data)
                ? data
                : data.projects || [];

        container.innerHTML = "";

        const recentProjects =
            [...projects]
                .filter(
                    project =>
                    project.status !== "Archived"
                )
                .slice(-3)
                .reverse();

        if(recentProjects.length === 0){

            container.innerHTML = `
                <p class="empty-text">
                    No projects created yet
                </p>
            `;

            return;
        }

        recentProjects.forEach(project => {

            container.innerHTML += `
                <div class="project-item">

                    <div class="project-icon">
                        <i class="fa-solid fa-folder"></i>
                    </div>

                    <div class="project-info">

                        <h4>
                            ${escapeHtml(
                                project.projectName ||
                                "Untitled Project"
                            )}
                        </h4>

                        <p>
                            ${escapeHtml(
                                project.description ||
                                "No description"
                            )}
                        </p>

                    </div>

                    <span class="active-badge">
                        ${escapeHtml(
                            project.status || "Active"
                        )}
                    </span>

                </div>
            `;
        });

    }
    catch(error){

        console.error(error);

        container.innerHTML = `
            <p class="empty-text">
                Unable to load recent projects
            </p>
        `;
    }
}

/* =========================================
   UPCOMING TASKS
========================================= */

async function loadUpcomingTasks(){

    const container =
        document.getElementById(
            "upcomingTasksList"
        );

    if(!container) return;

    try{

        const response = await fetch(
            `${API}/tasks?userId=${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const data = await readResponse(response);

        if(!response.ok){
            throw new Error(
                data.message || "Unable to load tasks"
            );
        }

        const tasks =
            Array.isArray(data)
                ? data
                : data.tasks || [];

        const upcomingTasks =
            [...tasks]
                .filter(task => task.dueDate)
                .sort(
                    (first,second) =>
                    parseDate(first.dueDate) -
                    parseDate(second.dueDate)
                )
                .slice(0,4);

        container.innerHTML = "";

        if(upcomingTasks.length === 0){

            container.innerHTML = `
                <p class="empty-text">
                    No upcoming tasks
                </p>
            `;

            return;
        }

        upcomingTasks.forEach(task => {

            container.innerHTML += `
                <div class="task-item">

                    <span class="task-ring"></span>

                    <div class="task-info">

                        <h4>
                            ${escapeHtml(
                                task.taskName ||
                                "Untitled Task"
                            )}
                        </h4>

                        <p>
                            ${escapeHtml(
                                task.description ||
                                "No description"
                            )}
                        </p>

                    </div>

                    <div class="task-date">

                        <i class="fa-regular fa-calendar"></i>

                        ${escapeHtml(
                            formatDueDate(task.dueDate)
                        )}

                    </div>

                </div>
            `;
        });

    }
    catch(error){

        console.error(error);

        container.innerHTML = `
            <p class="empty-text">
                Unable to load upcoming tasks
            </p>
        `;
    }
}

function parseDate(dateValue){

    if(!dateValue){
        return new Date(0);
    }

    const dateText =
        String(dateValue).split("T")[0];

    const parts = dateText.split("-");

    if(parts.length === 3){

        return new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );
    }

    return new Date(dateValue);
}

function formatDueDate(dateValue){

    const dueDate =
        parseDate(dateValue);

    if(Number.isNaN(dueDate.getTime())){
        return "No date";
    }

    return dueDate.toLocaleDateString(
        "en-GB",
        {
            day:"2-digit",
            month:"2-digit",
            year:"numeric"
        }
    );
}

/* =========================================
   ACTIVITY
========================================= */

function loadActivities(){

    const container =
        document.getElementById("activityList");

    if(!container){
        return;
    }

    const activities =
        JSON.parse(
            localStorage.getItem(activityStorageKey)
        ) || [];

    container.innerHTML = "";

    if(activities.length === 0){

        container.innerHTML = `
            <p class="empty-text">
                No recent activity
            </p>
        `;

        return;
    }

    activities.forEach(activity => {

        container.innerHTML += `
            <div class="activity-item">

                <div class="activity-icon">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                </div>

                <div class="activity-content">

                    <h4>
                        ${escapeHtml(
                            activity.message ||
                            "Activity recorded"
                        )}
                    </h4>

                    <p>
                        ${escapeHtml(
                            activity.time || ""
                        )}
                    </p>

                </div>

            </div>
        `;
    });
}
function addActivity(message){

    let activities =
        JSON.parse(
            localStorage.getItem(activityStorageKey)
        ) || [];

    activities.unshift({
        message: message,
        time: new Date().toLocaleString(),
        userId: userId
    });

    localStorage.setItem(
        activityStorageKey,
        JSON.stringify(activities)
    );
}

/* =========================================
   NOTIFICATIONS
========================================= */

function loadNotifications(){

    const list =
        document.getElementById("notificationList");

    const count =
        document.getElementById("notificationCount");

    if(!list || !count){
        return;
    }

    const notifications =
        JSON.parse(
            localStorage.getItem(notificationStorageKey)
        ) || [];

    count.innerText =
        notifications.length > 99
            ? "99+"
            : notifications.length;

    list.innerHTML = "";

    if(notifications.length === 0){

        list.innerHTML = `
            <div class="notification-empty">
                <i class="fa-regular fa-bell-slash"></i>
                <h4>No notifications yet</h4>
                <p>Your updates will appear here.</p>
            </div>
        `;

        return;
    }

    notifications.forEach(notification => {

        list.innerHTML += `
            <div class="notification-item">

                <div class="notification-icon">
                    <i class="fa-solid fa-bell"></i>
                </div>

                <div class="notification-content">
                    <h4>
                        ${escapeHtml(
                            notification.message ||
                            "Notification"
                        )}
                    </h4>

                    <p>
                        ${escapeHtml(
                            notification.time || ""
                        )}
                    </p>
                </div>

            </div>
        `;
    });
}

function clearNotifications(){

    localStorage.removeItem(notificationStorageKey);

    loadNotifications();

    showToast(
        "Notifications cleared",
        "success"
    );
}

function toggleNotifications(){

    const notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );

    if(profileDropdown){
        profileDropdown.classList.remove("show");
    }

    if(notificationPanel){
        notificationPanel.classList.toggle("show");
    }
}

/* =========================================
   PROFILE DROPDOWN
========================================= */

function toggleProfileMenu(){

    const profileDropdown =
        document.getElementById(
            "profileDropdown"
        );

    const notificationPanel =
        document.getElementById(
            "notificationPanel"
        );

    if(notificationPanel){
        notificationPanel.classList.remove("show");
    }

    if(profileDropdown){
        profileDropdown.classList.toggle("show");
    }
}

/* =========================================
   CALENDAR
========================================= */

async function loadCalendarTasks(){

    try{

        const response = await fetch(
            `${API}/tasks?userId=${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const data = await readResponse(response);

        if(!response.ok){
            return [];
        }

        return Array.isArray(data)
            ? data
            : data.tasks || [];

    }
    catch(error){

        console.error("Calendar tasks error:",error);

        return [];
    }
}

function renderCalendar(){

    const monthYear =
        document.getElementById("monthYear");

    const calendarDays =
        document.getElementById(
            "calendarDays"
        );

    if(!monthYear || !calendarDays){
        return;
    }

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const weekDays = [
        "Sun",
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat"
    ];

    monthYear.innerText =
        `${monthNames[month]} ${year}`;

    calendarDays.innerHTML = "";

    weekDays.forEach(day => {

        calendarDays.innerHTML += `
            <span>${day}</span>
        `;
    });

    const firstDay =
        new Date(year,month,1).getDay();

    const lastDate =
        new Date(
            year,
            month + 1,
            0
        ).getDate();

    for(let index = 0; index < firstDay; index++){

        calendarDays.innerHTML += `
            <b class="empty"></b>
        `;
    }

    const today = new Date();

    for(let day = 1; day <= lastDate; day++){

        const isToday =
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear();

        const taskDate =
            `${year}-` +
            `${String(month + 1).padStart(2,"0")}-` +
            `${String(day).padStart(2,"0")}`;

        const tasksOnDate =
            allTasks.filter(task => {

                if(!task.dueDate){
                    return false;
                }

                const dueDate =
                    String(task.dueDate)
                        .split("T")[0];

                return dueDate === taskDate;
            });

        let dots = "";

        tasksOnDate
            .slice(0,4)
            .forEach(task => {

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

                dots += `
                    <i
                        class="calendar-dot ${dotClass}"
                        title="${escapeHtml(
                            task.taskName || "Task"
                        )}"
                    ></i>
                `;
            });

        calendarDays.innerHTML += `
            <div class="calendar-day ${
                isToday ? "today" : ""
            }">

                <div class="day-number">
                    ${day}
                </div>

                <div class="calendar-dots">
                    ${dots}
                </div>

            </div>
        `;
    }
}

function prevMonth(){

    currentDate =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - 1,
            1
        );

    renderCalendar();
}

function nextMonth(){

    currentDate =
        new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
        );

    renderCalendar();
}

/* =========================================
   DASHBOARD SEARCH
========================================= */

const searchInput =
    document.getElementById(
        "dashboardSearch"
    );

if(searchInput){

    searchInput.addEventListener(
        "input",
        function(){

            const searchValue =
                this.value
                    .trim()
                    .toLowerCase();

            const searchableItems =
                document.querySelectorAll(
                    ".project-item, .task-item, .activity-item"
                );

            searchableItems.forEach(item => {

                const itemText =
                    item.innerText.toLowerCase();

                item.style.display =
                    itemText.includes(searchValue)
                        ? "flex"
                        : "none";
            });
        }
    );
}

/* =========================================
   CLOSE DROPDOWNS
========================================= */

document.addEventListener(
    "click",
    function(event){

        const notificationWrapper =
            document.querySelector(
                ".notification-wrapper"
            );

        const profileMenu =
            document.querySelector(
                ".profile-menu"
            );

        const notificationPanel =
            document.getElementById(
                "notificationPanel"
            );

        const profileDropdown =
            document.getElementById(
                "profileDropdown"
            );

        if(
            notificationWrapper &&
            !notificationWrapper.contains(event.target)
        ){
            notificationPanel?.classList.remove("show");
        }

        if(
            profileMenu &&
            !profileMenu.contains(event.target)
        ){
            profileDropdown?.classList.remove("show");
        }
    }
);

/* =========================================
   TOAST
========================================= */

function showToast(
    message,
    type = "success"
){

    const toast =
        document.getElementById("toast");

    if(!toast){
        console.log(message);
        return;
    }

    toast.innerText = message;

    toast.className =
        `toast show ${type}`;

    window.clearTimeout(
        showToast.timeoutId
    );

    showToast.timeoutId =
        window.setTimeout(
            function(){
                toast.className = "toast";
            },
            3000
        );
}

/* =========================================
   LOGOUT
========================================= */

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    /*
       Notifications and activities are not
       removed, so they remain after login again.
    */

    window.location.href = "login.html";
}

/* =========================================
   START DASHBOARD
========================================= */

async function initializeDashboard(){

    loadNotifications();
    loadActivities();

    await Promise.all([
        loadDashboard(),
        loadRecentProjects(),
        loadUpcomingTasks()
    ]);
}

initializeDashboard();
