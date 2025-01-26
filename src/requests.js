let url = "https://script.google.com/macros/s/AKfycbx44BoWtW35013PtfBDmyb00pd7c1z1yewlXFcFxtcxgYo_Ch_7cUhEWrgJ-ak3k"; // Replace with your deployed script URL

//Grdrive requests
async function requestToDoGet() {
    let jsonfile;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Network response was not ok: ${response.statusText}`
            );
        }

        jsonfile = await response.json();
        return jsonfile;
    } catch (error) {
        console.error(
            "There has been a problem with your fetch operation:",
            error
        );
        return "error";
    }
}

async function requestToDoPost(json_data) {
    try {
        const response = await fetch(url, {
            method: "POST",
            body: JSON.stringify(json_data),
        });

        if (!response.ok) {
            throw new Error(
                `Network response was not ok: ${response.statusText}`
            );
        }

        const data = await response.json();
    } catch (error) {
        console.error(
            "There has been a problem with your fetch operation:",
            error
        );
    }
}

async function showPasswordPopup() {
    const password = prompt("Please enter the password:");
    url = url + password + "/exec";
    const response = await requestToDoGet();
    return response;
}



export { requestToDoGet, requestToDoPost, showPasswordPopup };