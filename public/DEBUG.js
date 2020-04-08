var SERVER_Board;
function DEBUG_RealoadCube() {
    socket.emit("Re-role-cubes", user_num, game_index);
}

function DEBUG_EnterWinMod() {
    In_House = true;
}

function DEBUG_ServerBoard() {
    socket.emit("req-serverBoard", game_index);
}
function DEBUG_ServerCubes(){
    socket.emit("ServerCubes", game_index, user_num);
}
socket.on("rec-ServerBoard", (board) => {
    SERVER_Board = board;
    console.log(board);
})
function DEBUG_GetUser(){
    socket.emit("GET-USER", game_index, user_num);

}
socket.on("REC-USER", (user)=>{
    console.log(user);
})