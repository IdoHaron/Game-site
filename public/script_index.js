const socket =  io(); //connect("localhost:")
let Player={name: null}; //the object with the players propertys
async function get_name(Player){
    while(Player.name==null){
        Player.name =  await Swal.fire({
            title: "Enter Name",
            text: "Please enter your name",
            input: "text",
            confirmButtonText: "Enter"
        });
    }
}
socket.on("get_info", ()=>{
    get_name(Player);
    async function get_name(Player){
        while(typeof Player.name!==String){
          await Swal.fire({
                title: "Enter Name",
                text: "Please enter your name",
                input: "text",
                confirmButtonText: "Enter"
            }).then(input=>{
                Player.name = input.value;
            });
        }
        socket.emit("create_user", Player);
    }
});
socket.on("set-user", num=>{
    sessionStorage.setItem("index", `${num}`);
    console.log(num);
})
