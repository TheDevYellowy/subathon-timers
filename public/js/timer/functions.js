const addTime = async (s) => {
    ws.send(JSON.stringify({
        event: "addtime",
        time: s
    }))

    let addedTime = document.createElement("p");
    addedTime.classList = "addedTime";
    addedTime.innerText = s > 0 ? `+${s}s` : `${s}s`;
    document.body.appendChild(addedTime);
    addedTime.style.display = "block";
    await sleep(50);
    addedTime.style.left = `${randomInRange(35, 65)}%`;
    addedTime.style.top = `${randomInRange(15, 40)}%`;
    addedTime.style.opacity = "1";
    await sleep(2500);
    addedTime.style.opacity = "0";
    await sleep(500);
    addedTime.remove();
};

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

const randomInRange = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
};