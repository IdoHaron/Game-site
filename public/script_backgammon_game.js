

//#region set-app
const socket =  io.connect("http://localhost:3000");
const app = new PIXI.Application({
    resizeTo: window
});
let width = window.innerWidth;
let board_loadout= [5,0, 0,0,-3, 0, -5, 0, 0, 0, 0, 2, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2, 5];
app.view.style.height = window.innerHeight+ 'px';
app.view.style.width = window.innerWidth+ 'px';
const container = new PIXI.Container();
container.height = window.innerHeight;
container.width = window.innerWidth;
let user_cubes = [];
let other_cubes=[];
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
 board.x = (app.screen.width-board.width)/2;
 //#endregion

 //#region comunication
 socket.on("get_info",()=>{
     console.log("get_info");
     socket.emit("Backgammon-userInfo", sessionStorage.getItem("index"), sessionStorage.getItem("backgammon-game"));
 });
 socket.on("backgammon-boardLoad", (user, other)=>{
     console.log("backgammon-boardLoad");
    let loc = [0,0];
    board.zIndex = 0;
     app.stage.addChild(board);
    load_user_cubes(user, true, loc);
    loc = [(app.screen.width+board.width)/2, 0];
    load_user_cubes(other, false, loc);
    loc = [(app.screen.width-board.width)/2, board.height/50];
    soldier.user.zIndex = 1;
    soldier.other.zIndex = 1;
    load_soldier(soldier.user, soldier.other, loc);
 });
 socket.on("close-page", ()=>{
     window.close();
 });
 socket.on("turn", ()=>{

 })

//#endregion

//#region functions
    function load_user_cubes(user /*user style object (defined at server) */,_isUser, start_place/*a size two array, [0]=x, [1]=y */){
        let print_place = start_place;
        const size = width/35;
        console.log("stage size" + app.stage.width);
        const jmp= size+size/10;
        let current_sprite;
        let next_sprite;
        console.log(user);
        for (let index = 0; index < user.cubes.length; index++) {
            console.log(`backgammon/dices/Alea_${user.cubes[index][0]}.png`);
            current_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][0]}.png`);
            next_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][1]}.png`);
            set_sprite_cubes(index, current_sprite, next_sprite, user);
            if(_isUser)
                user_cubes[index]= [current_sprite, next_sprite];
            other_cubes[index] = [current_sprite, next_sprite];
            print_sprite(start_place, [size, size],current_sprite);
            console.log("the size "+ size);
            print_place[0]+=jmp;
            print_sprite(start_place, [size, size],next_sprite);
            console.log('the size '+ size);
            print_place[0]-=jmp;
            print_place[1]+=jmp;
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
    function set_sprite_cubes(i, current_sprite, next_sprite, user){
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
    function load_soldier(Sprite_Soldier, Sprite_Other, start_place){
        let location = [start_place[0], start_place[1]];
        let jmp_x = board.width/12;
        let jmp_y = Sprite_Soldier.height;
        let y_afterline = board.height;
        let i;
        let index1;
        for (let index = 0; index < 2; index++) {
            for ( index1 = 0; index1 < 12; index1++) {
                if(index1==6)
                    location[0]+=jmp_x;
                for( i=0; i<board_loadout[index1]; i++)
                    print_sprite([location[0], location[1]+(i*jmp_y)], null, Sprite_Soldier);
                if(board_loadout[index1]<0){
                 for( i=0; i>board_loadout[index1]; i--)
                    print_sprite([location[0], location[1]+(i*jmp_y)], null, Sprite_Other);
                }
                location[0]+=jmp_x;
            }
            location[1] = y_afterline-y_afterline/60;
            location[0] = start_place[0];
            for ( index1 = 0; index1 < 12; index1++) {
                if(index1==6)
                    location[0]+=jmp_x;
                for( i=0; i<board_loadout[index1+12]; i++)
                    print_sprite([location[0], location[1]+(i*jmp_y)], null, Sprite_Soldier);
                if(board_loadout[index1+12]<0){
                    for( i=0; i>board_loadout[index1+12]; i--)
                        print_sprite([location[0], location[1]+(i*jmp_y)], null, Sprite_Other);
                }
                location[0]+=jmp_x;
            }
        }

    }
//#endregion

// TODO(ido): Run to cube-load