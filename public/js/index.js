const socket = new WebSocket("ws://localhost/");

socket.onopen = () => {
    socket.send(JSON.stringify({
        event: "login",
        username: "Yellowy"
    }))
}

setInterval(async () => {
    // if (socket.readyState === WebSocket.OPEN) {
    //     socket.send(Date.now().toString());
    // }

    fetch("http://localhost/sockets").then(async res => {
        if (res.status === 200) {
            document.getElementById("sockets").innerText = await res.text();
        }
    })
}, 5000);