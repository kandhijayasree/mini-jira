const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if(!token || !userId){
    alert("Please Login First");
    window.location.href = "../login.html";
}

const API = `http://localhost:3000/tasks?userId=${userId}`;

let allTasks = [];

/* LOAD KANBAN */

async function loadKanban(){

    try{

        const response = await fetch(API,{
            headers:{
                Authorization:token
            }
        });

        const tasks = await response.json();

        allTasks = tasks;

        renderKanban(tasks);
        updateCounts(tasks);

    }
    catch(error){
        console.log(error);
    }
}

/* RENDER KANBAN */

function renderKanban(tasks){

    const openBox = document.getElementById("openTasks");
    const progressBox = document.getElementById("progressTasks");
    const completedBox = document.getElementById("completedTasks");

    openBox.innerHTML = "";
    progressBox.innerHTML = "";
    completedBox.innerHTML = "";

    const openTasks =
    tasks.filter(task => task.status === "Open");

    const progressTasks =
    tasks.filter(task => task.status === "In Progress");

    const completedTasks =
    tasks.filter(task => task.status === "Completed");

    openTasks.forEach(task => {
        openBox.innerHTML += createTaskCard(task,"open-task");
    });

    progressTasks.forEach(task => {
        progressBox.innerHTML += createTaskCard(task,"progress-task");
    });

    completedTasks.forEach(task => {
        completedBox.innerHTML += createTaskCard(task,"completed-task");
    });

    if(openTasks.length === 0){
        openBox.innerHTML = `<p class="empty-msg">No open tasks</p>`;
    }

    if(progressTasks.length === 0){
        progressBox.innerHTML = `<p class="empty-msg">No progress tasks</p>`;
    }

    if(completedTasks.length === 0){
        completedBox.innerHTML = `<p class="empty-msg">No completed tasks</p>`;
    }
}

/* CREATE CARD */

function createTaskCard(task,className){

    return `
        <div class="task-card ${className}">

            <h3>${task.taskName || "Untitled Task"}</h3>

            <p>${task.description || "No description"}</p>

            <small>
                <strong>Assigned:</strong>
                ${task.assignedTo || "-"}
            </small>

            <small>
                <strong>Due:</strong>
                ${task.dueDate || "-"}
            </small>

            <span class="priority ${task.priority || "Low"}">
                ${task.priority || "Low"}
            </span>

        </div>
    `;
}

/* COUNTS */

function updateCounts(tasks){

    const open =
    tasks.filter(task => task.status === "Open").length;

    const progress =
    tasks.filter(task => task.status === "In Progress").length;

    const completed =
    tasks.filter(task => task.status === "Completed").length;

    document.getElementById("openCount").innerText = open;
    document.getElementById("progressCount").innerText = progress;
    document.getElementById("completedCount").innerText = completed;
}

/* SEARCH */

function searchKanban(){

    const value =
    document.getElementById("searchKanban").value.toLowerCase();

    const filtered =
    allTasks.filter(task => {

        const text =
        `${task.taskName} ${task.description} ${task.assignedTo} ${task.priority} ${task.status}`
        .toLowerCase();

        return text.includes(value);

    });

    renderKanban(filtered);
    updateCounts(filtered);
}



/* INIT */

loadKanban();