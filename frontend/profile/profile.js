const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if(!token || !userId){
    alert("Please Login First");
    window.location.href = "../login.html";
}

const API = "http://localhost:3000";

async function loadProfile(){

    try{
        const userResponse = await fetch(
            `${API}/users/${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const user = await userResponse.json();

        document.getElementById("userName").innerText =
        user.name || "User";

        document.getElementById("userEmail").innerText =
        user.email || "";

        document.getElementById("name").value =
        user.name || "";

        document.getElementById("email").value =
        user.email || "";

        document.getElementById("infoUserId").innerText =
        userId;

        document.getElementById("infoEmail").innerText =
        user.email || "";

        localStorage.setItem("userName", user.name || "User");
        localStorage.setItem("userEmail", user.email || "");

        loadProfileStats();

    }
    catch(error){
        console.log(error);
    }
}

async function loadProfileStats(){

    try{
        const response = await fetch(
            `${API}/dashboard/${userId}`,
            {
                headers:{
                    Authorization:token
                }
            }
        );

        const data = await response.json();

        document.getElementById("totalProjects").innerText =
        data.totalProjects || 0;

        document.getElementById("totalTasks").innerText =
        data.totalTasks || 0;

    }
    catch(error){
        console.log(error);
    }
}

async function updateProfile(){

    const name =
    document.getElementById("name").value.trim();

    if(name === ""){
        alert("Name required");
        return;
    }

    try{
        const response = await fetch(
            `${API}/users/${userId}`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:token
                },
                body:JSON.stringify({
                    name:name
                })
            }
        );

        const data = await response.json();

        if(response.ok){
            alert("Profile Updated");
            localStorage.setItem("userName", name);
            loadProfile();
        }
        else{
            alert(data.message || "Profile update failed");
        }

    }
    catch(error){
        console.log(error);
    }
}

async function changePassword(){

    const currentPassword =
    document.getElementById("currentPassword").value.trim();

    const newPassword =
    document.getElementById("newPassword").value.trim();

    const confirmPassword =
    document.getElementById("confirmPassword").value.trim();

    const error =
    document.getElementById("passwordError");

    error.style.display = "none";

    if(currentPassword === ""){
        showPasswordError("Please enter current password");
        return;
    }

    if(newPassword === ""){
        showPasswordError("Please enter new password");
        return;
    }

    if(newPassword !== confirmPassword){
        showPasswordError("Passwords do not match");
        return;
    }

    try{
        const response = await fetch(
            `${API}/users/${userId}/change-password`,
            {
                method:"PUT",
                headers:{
                    "Content-Type":"application/json",
                    Authorization:token
                },
                body:JSON.stringify({
                    currentPassword,
                    newPassword
                })
            }
        );

        const data = await response.json();

        if(response.ok){
            showToast("Password changed successfully");

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";
        }
        else{
            showPasswordError(data.message);
        }
    }
    catch(error){
        console.log(error);
        showPasswordError("Server error");
    }
}

function showPasswordError(message){

    const error =
    document.getElementById("passwordError");

    error.innerText = message;
    error.style.display = "block";
}



loadProfile();