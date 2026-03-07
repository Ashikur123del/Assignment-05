document.getElementById("singin-btn").addEventListener("click", () => {
    const inputUsername = document.getElementById("input-username");
    const inputPin = document.getElementById("input-pin");
    
    const userName = inputUsername.value.trim();
    const pin = inputPin.value.trim();

    if (userName === "admin" && pin === "admin123") {
        alert("Login Successful!");
        window.location.assign("/home.html");
    } else {
        alert("Login failed! Please check your credentials.");
        inputUsername.value = '';
        inputPin.value = '';
    }
});