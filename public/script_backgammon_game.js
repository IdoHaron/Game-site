//import { Sprite } from "pixi.js";


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
let user_cubes = [];/*two dimantional array [cube1, cube2] holds sprites*/
let other_cubes=[];
let user_soldiers = []; //Two dimantional array- placement and num in placment-> points to the fitting sprites.
let other_soldiers = []; 
let soldiers_alloct = 0;
let all_soldiers = []; // a noermal array with all the soldiers

let current = {};
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
    loc = [(app.screen.width-board.width)/2+board.height/40, board.height/40];
    soldier.user.zIndex = 1;
    soldier.other.zIndex = 1;
    load_soldier(loc);
 });
 socket.on("close-page", ()=>{
     window.close();
 });
 socket.on("turn", ()=>{
     user_cubes.forEach(cube=>Activate(cube[0], cube[1]));

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
            else
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
        //current_sprite.other_cube = next_sprite;
        //next_sprite.other_cube = current_sprite;
        next_sprite.index = [i,1];
        next_sprite.value = user.cubes[i][1];
        current_sprite.on('pointerdown', (e)=>{
            for(let i =0; i<soldiers_alloct; i++){
                if(soldiers_alloct[i].Side = "other")
                   continue;
               Activate(soldiers_alloct[i]);
            }
            current.cubesIndex = e.target.index[0];
        });
        next_sprite.on('pointerdown', (e)=>{
            // TODO(Ido): server-side "chosen-cube" -> (value1, value2, user: user object)
            current.cube1= e.target;
            current.cube2 = e.target.other_cube;
            socket.emit("chosen-cube", e.target.value, e.target.other_cube.value, e.target.user);
            app.stage.removeChild(e.target);
        });
    }
    function load_soldier(start_place){
        let location = [start_place[0], start_place[1]];
        let Sprite_Soldier;
        let Sprite_Other;
        let size_Soldier = null;
        let jmp_x = (board.width-(2*start_place[1])-soldier.user.width)/12;
        let jmp_y = soldier.user.height;
        let y_afterline = board.height;
        let sprite_array_saver =[];
        let i;
        let index1;
        for ( index1 = 0; index1 < 12; index1++) {
            if(index1==6)
                location[0]+=jmp_x;
            for( i=0; i<board_loadout[index1]; i++){
                Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
                Sprite_Soldier.Side = "user"; //indetify Sprite side
                Sprite_Soldier.board_place = [index1, i]; //indetify sprite place
                
                all_soldiers[soldiers_alloct] = Sprite_Soldier;
                soldiers_alloct++;
                
                Sprite_Soldier.on('pointerdown', soldier_onclick("user", index1, Sprite_Soldier))
                sprite_array_saver[i] = Sprite_Soldier; 
                print_sprite([location[0], location[1]+(i*jmp_y)], size_Soldier, Sprite_Soldier);
            }
            if(board_loadout[index1]<0){
             for( i=0; i>board_loadout[index1]; i--){
                Sprite_Other = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
                sprite_array_saver[(-i)] = Sprite_Soldier; 
                Sprite_Soldier.Side = "other";
                Sprite_Soldier.board_place = [index1, (-i)];

                all_soldiers[soldiers_alloct] = Sprite_Soldier;
                soldiers_alloct++;

                Sprite_Soldier.on('pointerdown', soldier_onclick("other", index1, Sprite_Soldier))
                print_sprite([location[0], location[1]+((-i)*jmp_y)], size_Soldier, Sprite_Other);
             }
             other_soldiers[index1] = sprite_array_saver;
            }
            user_soldiers[index1] = sprite_array_saver;
            location[0]+=jmp_x;
        }
        location[1] = y_afterline-soldier.user.height-start_place[1];
        location[0] = start_place[0];
        for ( index1 = 0; index1 < 12; index1++) {
            if(index1==6)
                location[0]+=jmp_x;
            for( i=0; i<board_loadout[index1+12]; i++){
                Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
                Sprite_Soldier.Side = "user"; //indetify Sprite side
                Sprite_Soldier.board_place = [index1+12, i]; //indetify sprite place
                //general soldiers array
                all_soldiers[soldiers_alloct] = Sprite_Soldier;
                soldiers_alloct++;

                Sprite_Soldier.on('pointerdown', soldier_onclick("user", index1+12, Sprite_Soldier))
                print_sprite([location[0], location[1]+((-i)*jmp_y)], size_Soldier, Sprite_Soldier);
            }
            if(board_loadout[index1+12]<0){
                for( i=0; i>board_loadout[index1+12]; i--){
                    Sprite_Other = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
                    Sprite_Soldier.Side = "other";
                    Sprite_Soldier.board_place = [index1+12, (-i)];

                    all_soldiers[soldiers_alloct] = Sprite_Soldier;
                    soldiers_alloct++;
                    
                    Sprite_Soldier.on('pointerdown', soldier_onclick("other", index1+12, Sprite_Soldier))
                    print_sprite([location[0], location[1]+((i)*jmp_y)], size_Soldier, Sprite_Other);
                }
                other_soldiers[index1+12] = sprite_array_saver;
            }
            user_soldiers[index1+12] = sprite_array_saver;
            location[0]+=jmp_x;
        }

    }
    function Activate(){

    }
    function soldier_onclick(kind, index1, Soldier){
        return ()=>{
            current.soldier = Soldier;
            let Sprite_move;
            if(current.cube1!==undefined){
                Sprite_move= moveSoldier();
                socket.emit("Commit-turn", Sprite_move);
            }
        }
    }
    function moveSoldier(){

    }
//#endregion
