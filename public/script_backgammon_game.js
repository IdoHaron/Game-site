

//#region set-app
const socket =  io.connect("http://localhost:3000");
const app = new PIXI.Application({resizeTo: window});
const container = new PIXI.Container();
let user_cube = [];
let other_cuber=[];
document.body.appendChild(app.view);
app.stage.addChild(container);
//#endregion

//#region image-setapp
const board_ratio = 3/4;
const board = new PIXI.Sprite.from("backgammon/board_Main.jpg");
const soldier = {user: new PIXI.Sprite.from("backgammon/soldiers/piece-user.png"),
 other: new PIXI.Sprite.from("backgammon/soldiers/piece-other.png")};
 board.width = app.screen.width*board_ratio;
 board.height = app.screen.height;
 //#endregion

 //#region comunication
 socket.on("get_info",()=>{
     console.log("get_info");
     socket.emit("Backgammon-userInfo", sessionStorage.getItem("index"), sessionStorage.getItem("backgammon-game"));
 });
 socket.on("backgammon-boardLoad", (user, other)=>{
     console.log("backgammon-boardLoad");
    let loc = [0,0];
     app.stage.addChild(board);
    load_user_cubes(user, loc);
    loc = [(app.stage.width*(14/15)), 0];
    load_user_cubes(other, loc);
 });
 socket.on("close-page", ()=>{
     window.close();
 })

//#endregion

//#region functions
    function load_user_cubes(user /*user style object (defined at server) */, start_place/*a size two array, [0]=x, [1]=y */){
        const size = app.stage.width/30;
        const jmp= size+size/10;
        let current_sprite;
        let next_sprite;
        let _isUser = false;
        if(user.Player = 1);
            _isUser = true;
        for (let index = 0; index < user.cubes.length; index++) {
            current_sprite = Sprite.from(`backgammon/dices/Alea_${user.cubes[index][0]}`);
            next_sprite = Sprite.from(`backgammon/dices/Alea_${user.cubes[index][1]}`);
            set_sprite_cubes(current_sprite, next_sprite, user);
            if(_isUser)
                user_cube[index]= [current_sprite, next_sprite];
            other_cube[index] = [current_sprite, next_sprite];
            print_sprite(start_place, current_sprite);
            print_sprite(start_place, next_sprite);
        }
    }
    function print_sprite(location, size, im_Sprite){
        im_Sprite.x = location[0];
        im_Sprite.y= location[1];
        if(size!=null){
            im_Sprite.width = size[0];
            im_Sprite.height = size[1];
        }
        app.stage.addChild(im_Sprite);
    }
    function set_sprite_cubes(current_sprite, next_sprite, user){
        current_sprite.user = user;
        next_sprite.user = user;
        current_sprite.value = user.cubes[i][0];
        current_sprite.index =  [i, 0];
        current_sprite.other_cube = next_sprite;
        next_sprite.other_cube = current_sprite;
        next_sprite.index = [i,1];
        next_sprite.value = user.cubes[i][1];
        current_sprite.on('pointerdown', (e)=>{
            socket.emit("chosen-cube", e.target.value, e.target.other_cube.value, e.target.user);
            app.stage.removeChild(e.target);
        });
        next_sprite.on('pointerdown', (e)=>{
            // TODO(Ido): server-side "chosen-cube" -> (value1, value2, user: user object)
            socket.emit("chosen-cube", e.target.value, e.target.other_cube.value, e.target.user);
            app.stage.removeChild(e.target);
        });
    }
//#endregion

// TODO(ido): Run to cube-load