async function login(event){

    event.preventDefault();

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value.trim();

    const messageBox =
    document.getElementById("messageBox");

    messageBox.innerText = "";

    try{

        const response =
        await fetch("http://localhost:3000/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                email,
                password
            })
        });

        const data =
        await response.json();

        if(response.ok){

            localStorage.setItem(
                "token",
                data.token || "mini-jira-token"
            );

            localStorage.setItem(
                "userId",
                data.user._id
            );

            localStorage.setItem(
                "userName",
                data.user.name
            );

            localStorage.setItem(
                "userEmail",
                data.user.email
            );

            messageBox.style.color = "#22c55e";
            messageBox.innerText = "Login successful";

            setTimeout(function(){
                window.location.href = "dashboard.html";
            },700);

        }
        else{

            messageBox.style.color = "#fb7185";
            messageBox.innerText =
            data.message || "Invalid email or password";

        }

    }
    catch(error){

        console.log(error);

        messageBox.style.color = "#fb7185";
        messageBox.innerText =
        "Unable to connect to server";

    }

}

function togglePassword(){

    const password =
    document.getElementById("password");

    const eye =
    document.querySelector(".eye");

    if(password.type === "password"){

        password.type = "text";

        

    }
    else{

        password.type = "password";

    }

}