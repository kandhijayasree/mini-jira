const API = "http://localhost:3000";

/* ==========================
   REGISTER
========================== */

async function register(event){

    event.preventDefault();

    const name =
    document.getElementById("name").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value;

    const messageBox =
    document.getElementById("messageBox");

    messageBox.className = "";
    messageBox.style.display = "none";

    /* Validation */

    if(name === "" || email === "" || password === ""){

        showMessage(
            "Please fill all fields.",
            "error"
        );

        return;
    }

    if(password.length < 6){

        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );

        return;
    }

    try{

        const response =
        await fetch(`${API}/register`,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                name,
                email,
                password

            })

        });

        const data =
        await response.json();

        if(response.ok){

            showMessage(
                "Registration Successful",
                "success"
            );

            setTimeout(()=>{

                window.location.href =
                "login.html";

            },1200);

        }
        else{

            showMessage(

                data.message ||
                "Registration Failed",

                "error"

            );

        }

    }

    catch(error){

        console.log(error);

        showMessage(

            "Unable to connect to server.",

            "error"

        );

    }

}

/* ==========================
   PASSWORD SHOW / HIDE
========================== */

function togglePassword(){

    const password =
    document.getElementById("password");

    const eye =
    document.querySelector(".eye");

    if(password.type === "password"){

        password.type = "text";

        eye.classList.remove("fa-eye");

        eye.classList.add("fa-eye-slash");

    }
    else{

        password.type = "password";

        eye.classList.remove("fa-eye-slash");

        eye.classList.add("fa-eye");

    }

}

/* ==========================
   MESSAGE
========================== */

function showMessage(message,type){

    const box =
    document.getElementById("messageBox");

    box.innerText = message;

    box.className = type;

    box.style.display = "block";

    if(type === "success"){

        box.style.color = "#22c55e";

    }
    else{

        box.style.color = "#ef4444";

    }

}