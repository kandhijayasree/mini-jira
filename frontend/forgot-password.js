const API = "http://localhost:3000";

async function resetPassword(event){

    event.preventDefault();

    const email =
    document.getElementById("email").value;

    const newPassword =
    document.getElementById("newPassword").value;

    const confirmPassword =
    document.getElementById("confirmPassword").value;

    if(newPassword !== confirmPassword){
        showMessage("Passwords do not match", "error");
        return;
    }

    try{

        const response =
        await fetch(`${API}/forgot-password`,{
            method:"PUT",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email,
                newPassword
            })
        });

        const data =
        await response.json();

        if(response.ok){
            showMessage("Password updated successfully", "success");

            setTimeout(()=>{
                window.location.href = "login.html";
            },1200);
        }
        else{
            showMessage(data.message || "Password update failed", "error");
        }

    }
    catch(error){
        showMessage("Server error. Please try again.", "error");
    }
}

function showMessage(message,type){

    const box =
    document.getElementById("messageBox");

    box.innerText = message;
    box.className = type;
}

function togglePassword(inputId, icon){

    const input =
    document.getElementById(inputId);

    if(input.type === "password"){
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    }
    else{
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
}