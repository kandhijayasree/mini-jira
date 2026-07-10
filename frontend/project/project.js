const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const notificationStorageKey = `notifications_${userId}`;
const activityStorageKey = `activities_${userId}`;
if(!token || !userId){
    alert("Please Login First");
    window.location.href = "../login.html";
}

const API =
`http://localhost:3000/projects-with-task-count?userId=${userId}`;

/* NOTIFICATIONS */

function addNotification(message){

    let notifications =
        JSON.parse(
            localStorage.getItem(notificationStorageKey)
        ) || [];

    notifications.unshift({
        message: message,
        time: new Date().toLocaleString(),
        userId: userId
    });

    localStorage.setItem(
        notificationStorageKey,
        JSON.stringify(notifications)
    );
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
/* MODAL */

function openProjectModal(){

    clearForm();

    document.getElementById("modalTitle").innerText =
    "Create New Project";

    document.querySelector(".create-btn").innerText =
    "Save Project";

    document.getElementById("projectModal").style.display =
    "block";
}

function closeProjectModal(){

    document.getElementById("projectModal").style.display =
    "none";
}

/* LOAD PROJECTS */

async function loadProjects(){

    try{

        const response =
        await fetch(API,{
            headers:{
                Authorization:token
            }
        });

        const projects =
        await response.json();

        updateProjectStats(projects);

        const filter =
        document.getElementById("projectFilter").value;

        let filteredProjects = projects;

        if(filter !== "All"){
            filteredProjects =
            projects.filter(project =>
                project.status === filter
            );
        }

        const table =
        document.getElementById("projectTable");

        table.innerHTML = "";

        if(filteredProjects.length === 0){

            table.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No projects found
                    </td>
                </tr>
            `;

            return;
        }

        filteredProjects.forEach((project,index) => {

            let archiveButton = "";

            if(project.status === "Archived"){

                archiveButton = `
                    <button class="unarchive-btn"
                    onclick="unarchiveProject('${project._id}')">
                        Unarchive
                    </button>
                `;

            }
            else{

                archiveButton = `
                    <button class="archive-btn"
                    onclick="archiveProject('${project._id}')">
                        Archive
                    </button>
                `;

            }

            table.innerHTML += `
                <tr>
                    <td>${index + 1}</td>

                    <td>
                        <b>${project.projectName || "-"}</b>
                    </td>

                    <td>
                        ${project.description || "-"}
                    </td>

                    <td>
                        <span class="status-${project.status}">
                            ${project.status || "Active"}
                        </span>
                    </td>

                    <td>
                        ${project.startDate || "-"}
                    </td>

                    <td>
                        ${project.endDate || "-"}
                    </td>

                    <td>
                        ${project.taskCount || 0}
                    </td>

                    <td>
                        <button class="view-btn"
                        onclick="viewProjectTasks('${project._id}')">
                            View
                        </button>

                        <button class="edit-btn"
                        onclick="editProject('${project._id}')">
                            Edit
                        </button>

                        ${archiveButton}

                        <button class="delete-btn"
                        onclick="deleteProject('${project._id}')">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

    }
    catch(error){
        console.log(error);
    }
}

/* STATS */

function updateProjectStats(projects){

    document.getElementById("totalProjectsCount").innerText =
    projects.length;

    document.getElementById("activeProjectsCount").innerText =
    projects.filter(project =>
        project.status === "Active"
    ).length;

    document.getElementById("planningProjectsCount").innerText =
    projects.filter(project =>
        project.status === "Planning"
    ).length;

    document.getElementById("completedProjectsCount").innerText =
    projects.filter(project =>
        project.status === "Completed"
    ).length;
}

/* SAVE PROJECT */

async function saveProject(){

    const id =
    document.getElementById("projectId").value;

    const projectName =
    document.getElementById("projectName").value.trim();

    const description =
    document.getElementById("description").value.trim();

    const startDate =
    document.getElementById("startDate").value;

    const endDate =
    document.getElementById("endDate").value;

    const status =
    document.getElementById("status").value;
if(projectName === ""){
    showProjectError("Please fill the Project Name field");
    return;
}
function showProjectError(message){

    const error = document.getElementById("projectError");

    error.innerHTML = `
        <i class="fa-solid fa-circle-exclamation"></i>
        ${message}
    `;

    error.style.display = "block";
}

    const projectData = {
        userId,
        projectName,
        description,
        startDate,
        endDate,
        status
    };

    try{

        if(id){

            const response =
            await fetch(
                `http://localhost:3000/projects/${id}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:token
                    },
                    body:JSON.stringify(projectData)
                }
            );

            if(response.ok){

                addNotification(
                    "Project Updated : " + projectName,
                    endDate
                );
showToast("Project Updated Successfully");
            }

        }
        else{

            const response =
            await fetch(
                "http://localhost:3000/projects",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:token
                    },
                    body:JSON.stringify(projectData)
                }
            );

            if(response.ok){

                addNotification(
                    "New Project Created : " + projectName,
                    endDate
                );

               showToast("Project created Successfully");
            }

        }

        closeProjectModal();
        clearForm();
        loadProjects();

    }
    catch(error){
        console.log(error);
    }
}

/* EDIT PROJECT */

async function editProject(id){

    try{

        const response =
        await fetch(API,{
            headers:{
                Authorization:token
            }
        });

        const projects =
        await response.json();

        const project =
        projects.find(item => item._id === id);

        if(!project){
            alert("Project not found");
            return;
        }

        document.getElementById("projectId").value =
        project._id;

        document.getElementById("projectName").value =
        project.projectName || "";

        document.getElementById("description").value =
        project.description || "";

        document.getElementById("startDate").value =
        project.startDate || "";

        document.getElementById("endDate").value =
        project.endDate || "";

        document.getElementById("status").value =
        project.status || "Active";

        document.getElementById("modalTitle").innerText =
        "Update Project";

        document.querySelector(".create-btn").innerText =
        "Update Project";

        document.getElementById("projectModal").style.display =
        "block";

    }
    catch(error){
        console.log(error);
    }
}

/* DELETE PROJECT */

function deleteProject(id){

    openConfirmModal(

        "Delete this project?",

        "Delete",

        async function(){

            try{

                const response =
                await fetch(
                    `http://localhost:3000/projects/${id}`,
                    {
                        method:"DELETE",
                        headers:{
                            Authorization:token
                        }
                    }
                );

                if(response.ok){

                    showToast("Project Deleted Successfully");

                    addNotification(
                        "Project Deleted",
                        new Date().toLocaleDateString()
                    );

                    loadProjects();

                }

            }
            catch(error){

                console.log(error);

            }

        }

    );

}

/* ARCHIVE PROJECT */

function archiveProject(id){

    openConfirmModal(
        "Archive this project?",
        "Archive",
        async function(){

            const response = await fetch(
                `http://localhost:3000/projects/${id}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:token
                    },
                    body:JSON.stringify({
                        status:"Archived"
                    })
                }
            );

            if(response.ok){
                showToast("Project Archived Successfully");
                loadProjects();
            }
        }
    );
}
/* UNARCHIVE PROJECT */

function unarchiveProject(id){

    openConfirmModal(

        "Restore this project?",

        "Restore",

        async function(){

            try{

                const response =
                await fetch(
                    `http://localhost:3000/projects/${id}`,
                    {
                        method:"PUT",
                        headers:{
                            "Content-Type":"application/json",
                            Authorization:token
                        },
                        body:JSON.stringify({

                            status:"Active"

                        })
                    }
                );

                if(response.ok){

                    showToast("Project Restored Successfully");

                    addNotification(
                        "Project Restored",
                        new Date().toLocaleDateString()
                    );

                    loadProjects();

                }

            }
            catch(error){

                console.log(error);

            }

        }

    );

}

/* VIEW PROJECT TASKS */

function viewProjectTasks(projectId){

    localStorage.setItem("selectedProject", projectId);

    window.location.href = "../task/task.html";
}

/* SEARCH PROJECT */

function searchProject(){

    const search1 =
    document.getElementById("searchProject");

    const search2 =
    document.getElementById("searchProjectTable");

    const input =
    (search1 && search1.value
        ? search1.value
        : search2 && search2.value
        ? search2.value
        : ""
    ).toLowerCase();

    const rows =
    document.querySelectorAll("#projectTable tr");

    rows.forEach(row => {

        const text =
        row.innerText.toLowerCase();

        row.style.display =
        text.includes(input) ? "" : "none";

    });
}

/* CLEAR FORM */

function clearForm(){

    document.getElementById("projectId").value = "";
    document.getElementById("projectName").value = "";
    document.getElementById("description").value = "";
    document.getElementById("startDate").value = "";
    document.getElementById("endDate").value = "";
    document.getElementById("status").value = "Active";
}

/* CLOSE MODAL OUTSIDE */

window.onclick = function(event){

    const modal =
    document.getElementById("projectModal");

    if(event.target === modal){
        closeProjectModal();
    }
};

/* LOGOUT */

function logout(){

    localStorage.clear();

    window.location.href =
    "../login.html";
}
function showToast(message){

    const toast =
    document.getElementById("toast");

    if(!toast) return;

    toast.innerText = message;

    toast.classList.add("show");

    setTimeout(function(){

        toast.classList.remove("show");

    },2000);

}
let confirmCallback = null;

function openConfirmModal(message, buttonText, callback){

    const modal = document.getElementById("confirmModal");
    const title = document.getElementById("confirmTitle");
    const btn = document.getElementById("confirmActionBtn");

    title.innerText = message;
    btn.innerText = buttonText;

    btn.className = "confirm-btn";

    if(buttonText === "Delete"){
        btn.classList.add("delete-btn");
    }
    else if(buttonText === "Archive"){
        btn.classList.add("archive-btn");
    }
    else{
        btn.classList.add("restore-btn");
    }

    confirmCallback = callback;

    modal.style.display = "flex";
}

function closeConfirmModal(){

    document.getElementById("confirmModal").style.display = "none";
    confirmCallback = null;

}

const confirmBtn = document.getElementById("confirmActionBtn");

if(confirmBtn){

    confirmBtn.onclick = async function(){

        if(confirmCallback){
            await confirmCallback();
        }

        closeConfirmModal();
    };

}

/* LOAD PAGE */

loadProjects();
function closeConfirmModal(){

    document.getElementById("confirmModal").style.display = "none";

    confirmCallback = null;

}
