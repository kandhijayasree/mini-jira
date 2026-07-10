const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");
const notificationStorageKey = `notifications_${userId}`;
const activityStorageKey = `activities_${userId}`;
if(!token || !userId){
    window.location.href = "../login.html";
}

const selectedProject = localStorage.getItem("selectedProject");

let API = `http://localhost:3000/tasks?userId=${userId}`;

if(selectedProject){
    API = `http://localhost:3000/tasks?userId=${userId}&projectId=${selectedProject}`;
}

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

/* ACTIVITY */
function addActivity(message){

    if(!userId){
        console.log("User ID is missing");
        return;
    }

    let activities =
    JSON.parse(
        localStorage.getItem(activityStorageKey)
    ) || [];

    activities.unshift({
        message: message,
        time: new Date().toLocaleString()
    });

    localStorage.setItem(
        activityStorageKey,
        JSON.stringify(activities)
    );

    console.log(
        "Activity saved:",
        activityStorageKey,
        activities
    );
}

/* TOAST */

function showToast(message, type = "success"){

    const toast = document.getElementById("toast");

    if(!toast){
        console.log(message);
        return;
    }

    toast.innerText = message;
    toast.className = "toast show " + type;

    setTimeout(function(){
        toast.classList.remove("show");
    },3000);
}

/* MODAL */

function openTaskModal(){

    clearForm();

    document.getElementById("modalTitle").innerText = "Create New Task";
    document.querySelector(".save-btn").innerText = "Save Task";

    document.getElementById("taskModal").style.display = "block";
}

function closeTaskModal(){
    document.getElementById("taskModal").style.display = "none";
}

/* LOAD PROJECTS */

async function loadProjects(){

    try{
        const response = await fetch(
            `http://localhost:3000/projects?userId=${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const projects = await response.json();

        let options = `<option value="">Select Project</option>`;

        projects.forEach(project => {
            options += `
                <option value="${project._id}">
                    ${project.projectName}
                </option>
            `;
        });

        document.getElementById("projectId").innerHTML = options;
    }
    catch(error){
        console.log(error);
        showToast("Unable to load projects", "error");
    }
}

/* LOAD TASKS */

async function loadTasks(){

    try{
        const response = await fetch(API,{
            headers:{
                Authorization:token
            }
        });

        const tasks = await response.json();

        loadTaskStats(tasks);

        const filter =
        document.getElementById("taskFilter")
        ? document.getElementById("taskFilter").value
        : "All";

        let filteredTasks = tasks;

        if(filter !== "All"){
            filteredTasks = tasks.filter(task => task.status === filter);
        }

        const table = document.getElementById("taskTable");

        table.innerHTML = "";

        if(filteredTasks.length === 0){
            table.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No tasks found
                    </td>
                </tr>
            `;
            return;
        }

        filteredTasks.forEach((task,index) => {

            table.innerHTML += `
            <tr>
                <td>${index + 1}</td>

                <td><b>${task.taskName || "-"}</b></td>

                <td>${task.description || "-"}</td>

                <td>${task.assignedTo || "-"}</td>

                <td>${task.dueDate || "-"}</td>

                <td>
                    <span class="priority-badge priority-${task.priority || "Low"}">
                        ${task.priority || "Low"}
                    </span>
                </td>

                <td>
                    <span class="status-badge status-${task.status || "Open"}">
                        ${task.status || "Open"}
                    </span>
                </td>

                <td>
                    <button
                    class="view-btn"
                    onclick='viewAttachments(${JSON.stringify(task.attachments || [])})'>
                        View Files
                    </button>
                </td>

                <td>
                    <button
                    class="edit-btn"
                    onclick="editTask('${task._id}')">
                        Edit
                    </button>

                    <button
                    class="delete-btn"
                    onclick="deleteTask('${task._id}','${task.taskName || "Task"}')">
                        Delete
                    </button>

                    <button
                    class="comment-btn"
                    onclick="openCommentModal('${task._id}')">
                        💬 Comment
                    </button>

                    <button
                    class="attach-btn"
                    onclick="openAttachModal('${task._id}')">
                        📎 Attach
                    </button>
                </td>
            </tr>
            `;
        });

    }
    catch(error){
        console.log(error);
        showToast("Unable to load tasks", "error");
    }
}

/* TASK STATS */

function loadTaskStats(tasks){

    document.getElementById("totalTasksCount").innerText = tasks.length;

    document.getElementById("openTasksCount").innerText =
    tasks.filter(task => task.status === "Open").length;

    document.getElementById("progressTasksCount").innerText =
    tasks.filter(task => task.status === "In Progress").length;

    document.getElementById("completedTasksCount").innerText =
    tasks.filter(task => task.status === "Completed").length;
}

/* SAVE TASK */

async function saveTask(){

    const id = document.getElementById("taskId").value;
    const projectId = document.getElementById("projectId").value;
    const taskName = document.getElementById("taskName").value.trim();

    if(projectId === ""){
        showFormError("Please fill the project field");
        return;
    }

    if(taskName === ""){
        showFormError("Please fill the task name field");
        return;
    }

    const formError = document.getElementById("formError");

    if(formError){
        formError.style.display = "none";
    }

    const taskData = {
        projectId,
        userId,
        taskName,
        description:document.getElementById("description").value,
        assignedTo:document.getElementById("assignedTo").value,
        dueDate:document.getElementById("dueDate").value,
        priority:document.getElementById("priority").value,
        status:document.getElementById("status").value
    };

    try{

        if(id){

            const response = await fetch(
                `http://localhost:3000/tasks/${id}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:token
                    },
                    body:JSON.stringify(taskData)
                }
            );
if(response.ok){

    addActivity(`Task Updated: ${taskName}`);

    addNotification(`Task Updated: ${taskName}`);


                showToast("Task Updated Successfully", "success");

                closeTaskModal();
                clearForm();
                loadTasks();
            }
            else{
                showToast("Task update failed", "error");
            }

        }
        else{

            const response = await fetch(
                "http://localhost:3000/tasks",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        Authorization:token
                    },
                    body:JSON.stringify(taskData)
                }
            );

            if(response.ok){

                addActivity(`Task Created: ${taskName}`);

    addNotification(`Task Created: ${taskName}`);
                

              

                showToast("Task Added Successfully", "success");

                closeTaskModal();
                clearForm();
                loadTasks();
            }
            else{
                showToast("Task creation failed", "error");
            }
        }

    }
    catch(error){
        console.log(error);
        showToast("Server error while saving task", "error");
    }
}

/* EDIT TASK */

async function editTask(id){

    try{
        const response = await fetch(API,{
            headers:{
                Authorization:token
            }
        });

        const tasks = await response.json();

        const task = tasks.find(item => item._id === id);

        if(!task){
            showToast("Task not found", "error");
            return;
        }

        document.getElementById("taskId").value = task._id;
        document.getElementById("projectId").value = task.projectId || "";
        document.getElementById("taskName").value = task.taskName || "";
        document.getElementById("description").value = task.description || "";
        document.getElementById("assignedTo").value = task.assignedTo || "";
        document.getElementById("dueDate").value = task.dueDate || "";
        document.getElementById("priority").value = task.priority || "Low";
        document.getElementById("status").value = task.status || "Open";

        document.getElementById("modalTitle").innerText = "Update Task";
        document.querySelector(".save-btn").innerText = "Update Task";

        document.getElementById("taskModal").style.display = "block";
    }
    catch(error){
        console.log(error);
        showToast("Unable to edit task", "error");
    }
}

/* DELETE TASK */

function deleteTask(id, taskName){

    openTaskDeleteModal(async function(){

        try{
            const response = await fetch(
                `http://localhost:3000/tasks/${id}`,
                {
                    method:"DELETE",
                    headers:{
                        Authorization:token
                    }
                }
            );

           if(response.ok){

    addActivity(`Task Deleted: ${taskName}`);

    addNotification(`Task Deleted: ${taskName}`);



                

                showToast("Task Deleted Successfully", "success");

                loadTasks();
            }
            else{
                showToast("Task delete failed", "error");
            }
        }
        catch(error){
            console.log(error);
            showToast("Server error while deleting task", "error");
        }

    });
}

/* DELETE MODAL */

let taskDeleteCallback = null;

function openTaskDeleteModal(callback){

    taskDeleteCallback = callback;

    const modal = document.getElementById("taskDeleteModal");

    if(modal){
        modal.style.display = "flex";
    }
}

function closeTaskDeleteModal(){

    const modal = document.getElementById("taskDeleteModal");

    if(modal){
        modal.style.display = "none";
    }

    taskDeleteCallback = null;
}

const taskDeleteBtn = document.getElementById("taskDeleteBtn");

if(taskDeleteBtn){

    taskDeleteBtn.onclick = async function(){

        if(taskDeleteCallback){
            await taskDeleteCallback();
        }

        closeTaskDeleteModal();
    };
}

/* SEARCH TASK */

function searchTask(){

    const input =
    document.getElementById("searchTask")
    ? document.getElementById("searchTask").value.toLowerCase()
    : "";

    const rows = document.querySelectorAll("#taskTable tr");

    rows.forEach(row => {

        const text = row.innerText.toLowerCase();

        row.style.display =
        text.includes(input) ? "" : "none";
    });
}

/* CLEAR FORM */

function clearForm(){

    document.getElementById("taskId").value = "";
    document.getElementById("projectId").value = "";
    document.getElementById("taskName").value = "";
    document.getElementById("description").value = "";
    document.getElementById("assignedTo").value = "";
    document.getElementById("dueDate").value = "";
    document.getElementById("priority").value = "Low";
    document.getElementById("status").value = "Open";

    if(document.getElementById("taskFile")){
        document.getElementById("taskFile").value = "";
    }

    if(document.getElementById("commentText")){
        document.getElementById("commentText").value = "";
    }

    if(document.getElementById("formError")){
        document.getElementById("formError").style.display = "none";
    }
}

/* COMMENTS */

async function openCommentModal(taskId){

    document.getElementById("commentTaskId").value = taskId;
    document.getElementById("commentModal").style.display = "block";

    loadComments(taskId);
}

function closeCommentModal(){

    document.getElementById("commentModal").style.display = "none";
    document.getElementById("commentText").value = "";
}

async function loadComments(taskId){

    try{
        const response = await fetch(
            `http://localhost:3000/comments/${taskId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const comments = await response.json();

        let html = "";

        comments.forEach(item => {
            html += `
                <div class="comment-item">
                    <p>${item.comment}</p>
                    <small>${new Date(item.createdAt).toLocaleString()}</small>
                </div>
            `;
        });

        document.getElementById("commentsList").innerHTML =
        html || "<p>No comments yet</p>";
    }
    catch(error){
        console.log(error);
        showToast("Unable to load comments", "error");
    }
}

async function addComment(){

    const taskId = document.getElementById("commentTaskId").value;

    const comment = document.getElementById("commentText").value.trim();

    if(comment === ""){
        showToast("Please write comment", "warning");
        return;
    }

    try{
        const response = await fetch(
            "http://localhost:3000/comments",
            {
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:token
                },
                body:JSON.stringify({
                    taskId,
                    userId,
                    comment
                })
            }
        );

        if(response.ok){

            addNotification(
                "Comment Added to Task",
                new Date().toLocaleDateString()
            );

            addActivity("💬 Comment Added");

            document.getElementById("commentText").value = "";

            loadComments(taskId);

            showToast("Comment Added Successfully", "success");
        }
        else{
            showToast("Comment add failed", "error");
        }
    }
    catch(error){
        console.log(error);
        showToast("Server error while adding comment", "error");
    }
}

/* ATTACHMENTS */

function openAttachModal(taskId){

    document.getElementById("attachTaskId").value = taskId;
    document.getElementById("attachModal").style.display = "block";
}

function closeAttachModal(){

    document.getElementById("attachModal").style.display = "none";
    document.getElementById("taskFile").value = "";
}

async function uploadAttachment(){

    const taskId = document.getElementById("attachTaskId").value;

    const file = document.getElementById("taskFile").files[0];

    if(!file){
        showToast("Please select a file", "warning");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try{
        const response = await fetch(
            `http://localhost:3000/tasks/${taskId}/attachments`,
            {
                method:"POST",
                headers:{
                    Authorization:token
                },
                body:formData
            }
        );

        const data = await response.json();

        if(!response.ok){
            showToast(data.message || "File upload failed", "error");
            return;
        }

        addNotification(
            "File Attached : " + file.name,
            new Date().toLocaleDateString()
        );

        addActivity("📎 File Attached : " + file.name);

        showToast("File Uploaded Successfully", "success");

        closeAttachModal();
        loadTasks();
    }
    catch(error){
        console.log(error);
        showToast("File upload failed", "error");
    }
}

/* VIEW ATTACHMENTS */

function viewAttachments(files){

    const container = document.getElementById("attachmentList");

    container.innerHTML = "";

    if(!files || files.length === 0){
        container.innerHTML = "<p>No files uploaded.</p>";
    }
    else{
        files.forEach(file => {
            container.innerHTML += `
                <div class="attachment-item">
                    <span>📎 ${file.fileName}</span>
                    <a href="http://localhost:3000/uploads/${file.filePath}"
                    target="_blank">
                        Open
                    </a>
                </div>
            `;
        });
    }

    document.getElementById("attachmentViewer").style.display = "block";
}

function closeAttachmentViewer(){
    document.getElementById("attachmentViewer").style.display = "none";
}

/* FORM ERROR */

function showFormError(message){

    const errorBox = document.getElementById("formError");

    if(!errorBox) return;

    errorBox.innerHTML =
    `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

    errorBox.style.display = "block";
}

/* SHOW ALL TASKS */

function showAllTasks(){
    localStorage.removeItem("selectedProject");
    window.location.reload();
}

/* CLOSE MODALS OUTSIDE */

window.onclick = function(event){

    const taskModal = document.getElementById("taskModal");
    const commentModal = document.getElementById("commentModal");
    const attachModal = document.getElementById("attachModal");
    const attachmentViewer = document.getElementById("attachmentViewer");
    const deleteModal = document.getElementById("taskDeleteModal");

    if(event.target === taskModal){
        closeTaskModal();
    }

    if(event.target === commentModal){
        closeCommentModal();
    }

    if(event.target === attachModal){
        closeAttachModal();
    }

    if(event.target === attachmentViewer){
        closeAttachmentViewer();
    }

    if(event.target === deleteModal){
        closeTaskDeleteModal();
    }
};

/* LOGOUT */

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    window.location.href = "../login.html";
}
function showToast(message,type="success"){

    const toast=document.getElementById("toast");

    toast.innerHTML=message;

    toast.className="toast show "+type;

    setTimeout(()=>{
        toast.classList.remove("show");
    },3000);
}
/* LOAD PAGE */

loadProjects();
loadTasks();
