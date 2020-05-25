const socket = io();
socket.on("get_info", () => {
    socket.emit("connect_loby_backgammon", parseInt(sessionStorage.getItem("index")))
});

socket.on("load-users", backgammon_users => {
    for (let index = 0; index < backgammon_users.length; index++)
        Print_user(backgammon_users[index], backgammon_users[index].id);
});
socket.on("load-user", (user, id) => {
    Print_user(user, id)
});
socket.on("aprove-backgammon-game", (user, id) => {
    approve_game(user, id)
});
socket.on("enter-backgammon-game", game_num => {
    sessionStorage.setItem("backgammon-game", `${game_num}`);
    window.location.replace(`/:backgammongame${game_num}`);
});
socket.on("users_left", (user1_id, user2_id)=>{
    document.getElementById(user1_id).remove();
    document.getElementById(user2_id).remove();
})
function Print_user(Player, id /*the socket.id*/ ) {
    if(Player ===undefined||Player.In_Loby ==false)
        return;
    let btn = document.createElement("button");
    btn.id = id;
    btn.innerHTML = Player.name;
    document.body.appendChild(btn);
    btn.addEventListener("click", () => {
        socket.emit("backgammon-game-request", btn.id);
    });
}

function approve_game(user, id /*other players id */ ) {
    swal.fire({
        title: `Do You Want To Play?`,
        text: `The user ${user.name} has invited you to play with him!`,
        type: "question",
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Play!',
        cancelButtonText: 'Reject'
    }).then(entr => {
        if (entr)
            socket.emit("create-backgammon-game", id);
    });
}