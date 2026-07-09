const API = "http://localhost:3000";

const token = localStorage.getItem("token");
const userId = localStorage.getItem("userId");

if(!token || !userId){
    window.location.href = "../login.html";
}

/* LOAD PROFILE */

async function loadProfile(){

    try{
        const response = await fetch(`${API}/users/${userId}`,{
            headers:{
                Authorization:token
            }
        });

        const user = await response.json();

        if(!response.ok){
            showToast(user.message || "Unable to load profile","error");
            return;
        }

        document.getElementById("userName").innerText =
        user.name || "User";

        document.getElementById("userEmail").innerText =
        user.email || "";

        document.getElementById("name").value =
        user.name || "";

        document.getElementById("email").value =
        user.email || "";

        localStorage.setItem("userName", user.name || "User");
        localStorage.setItem("userEmail", user.email || "");
    }
    catch(error){
        console.log(error);
        showToast("Server error while loading profile","error");
    }
}

/* UPDATE PROFILE */

async function updateProfile(){

    const name =
    document.getElementById("name").value.trim();

    const email =
    document.getElementById("email").value.trim();

    if(name === ""){
        showToast("Please enter your name","warning");
        return;
    }

    try{
        const response = await fetch(`${API}/users/${userId}`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json",
                Authorization:token
            },
            body:JSON.stringify({
                name:name,
                email:email
            })
        });

        const data = await response.json();

        if(response.ok){

            localStorage.setItem("userName", name);
            localStorage.setItem("userEmail", email);

            document.getElementById("userName").innerText = name;
            document.getElementById("userEmail").innerText = email;

            showToast("✅ Profile Updated Successfully","success");
        }
        else{
            showToast(data.message || "Profile update failed","error");
        }
    }
    catch(error){
        console.log(error);
        showToast("Server error while updating profile","error");
    }
}

/* CHANGE PASSWORD */

async function changePassword(){

    const currentPassword =
    document.getElementById("currentPassword").value.trim();

    const newPassword =
    document.getElementById("newPassword").value.trim();

    const confirmPassword =
    document.getElementById("confirmPassword").value.trim();

    hidePasswordError();

    if(currentPassword === ""){
        showPasswordError("Please enter current password");
        return;
    }

    if(newPassword === ""){
        showPasswordError("Please enter new password");
        return;
    }

    if(newPassword.length < 4){
        showPasswordError("New password must be at least 4 characters");
        return;
    }

    if(confirmPassword === ""){
        showPasswordError("Please confirm new password");
        return;
    }

    if(newPassword !== confirmPassword){
        showPasswordError("New password and confirm password do not match");
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
                    currentPassword:currentPassword,
                    newPassword:newPassword
                })
            }
        );

        const data = await response.json();

        if(response.ok){

            document.getElementById("currentPassword").value = "";
            document.getElementById("newPassword").value = "";
            document.getElementById("confirmPassword").value = "";

            showToast("✅ Password Changed Successfully","success");
        }
        else{
            showPasswordError(data.message || "Password change failed");
        }
    }
    catch(error){
        console.log(error);
        showPasswordError("Server error");
    }
}

/* PASSWORD ERROR */

function showPasswordError(message){

    const errorBox =
    document.getElementById("passwordError");

    if(!errorBox) return;

    errorBox.innerText = message;
    errorBox.style.display = "block";
}

function hidePasswordError(){

    const errorBox =
    document.getElementById("passwordError");

    if(!errorBox) return;

    errorBox.innerText = "";
    errorBox.style.display = "none";
}

/* TOAST MESSAGE */

function showToast(message,type="success"){

    const toast =
    document.getElementById("toast");

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

/* LOGOUT */

function logout(){

    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    window.location.href = "../login.html";
}

/* LOAD PAGE */

loadProfile();
