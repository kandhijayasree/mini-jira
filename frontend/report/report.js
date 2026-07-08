const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if(!token || !userId){
    alert("Please Login First");
    window.location.href = "../login.html";
}

async function loadReports(){

    try{
        const response = await fetch(
            `http://localhost:3000/dashboard/${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const data = await response.json();

        const totalProjects = data.totalProjects || 0;
        const totalTasks = data.totalTasks || 0;
        const openTasks = data.openTasks || 0;
        const progressTasks = data.progressTasks || data.inProgressTasks || 0;
        const completedTasks = data.completedTasks || 0;
        const overdueTasks = data.overdueTasks || 0;

        document.getElementById("totalProjects").innerText = totalProjects;
        document.getElementById("totalTasks").innerText = totalTasks;
        document.getElementById("openTasks").innerText = openTasks;
        document.getElementById("completedTasks").innerText = completedTasks;

        document.getElementById("summaryOpen").innerText = openTasks;
        document.getElementById("summaryProgress").innerText = progressTasks;
        document.getElementById("summaryCompleted").innerText = completedTasks;
        document.getElementById("summaryOverdue").innerText = overdueTasks;

        let percentage = 0;

        if(totalTasks > 0){
            percentage = Math.round((completedTasks / totalTasks) * 100);
        }

        document.getElementById("completionBar").style.width =
        percentage + "%";

        document.getElementById("completionText").innerText =
        percentage + "% Completed";

    }
    catch(error){
        console.log(error);
    }
}


loadReports();