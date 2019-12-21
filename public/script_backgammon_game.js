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
let user_num;
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
     socket.emit("Backgammon-userInfo", sessionStorage.getItem("index"), sessionStorage.getItem("backgammon-game"));
 });
 socket.on("backgammon-boardLoad", (user, other)=>{
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
 socket.on("turn", (user_num1)=>{
     console.log("turn "+user_num1);
     console.log(user_soldiers);
    user_cubes.forEach(cube=>{ if(cube!==undefined){ Activate(cube[0]); Activate(cube[1])} });
    user_num= user_num1;
 });

//#endregion

//#region functions
    function load_user_cubes(user /*user style object (defined at server) */,_isUser, start_place/*a size two array, [0]=x, [1]=y */){
        let print_place = start_place;
        const size = width/35;
        const jmp= size+size/10;
        let current_sprite;
        let next_sprite;
        for (let index = 0; index < user.cubes.length; index++) {
            current_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][0]}.png`);
            next_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][1]}.png`);
            set_sprite_cubes(index, current_sprite, next_sprite, user);
            if(_isUser)
                user_cubes[index]= [current_sprite, next_sprite];
            else
                other_cubes[index] = [current_sprite, next_sprite];
            print_sprite(start_place, [size, size],current_sprite);
            print_place[0]+=jmp;
            print_sprite(start_place, [size, size],next_sprite);
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
            user_cubes.forEach(cubes=>{un_activate(cubes[0]); 
                un_activate(cubes[1])});
            user_cubes[e.target.index[0]][0].tint = 0xffff00;
            user_cubes[e.target.index[0]][1].tint = 0xffff00;
            console.log(`here is the object: \n ${e.target}`);
            let j;
            for(let i =0; i<24; i++){
                if(user_soldiers[i]===undefined)
                    continue;
                Activate(user_soldiers[i][user_soldiers[i].length-1]);
            }
            current.cubesIndex = e.target.index[0];
        });
        next_sprite.on('pointerdown', (e)=>{
            // TODO(Ido): server-side "chosen-cube" -> (value1, value2, user: user object)
            let j;
            for(let i =0; i<24; i++){
                for(j=0; j<board_loadout[i]; j++)
                    Activate(user_soldiers[i][j]);
            }
            current.cubesIndex = e.target.index[0];
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
            sprite_array_saver = [];
            if(index1==6)
                location[0]+=jmp_x;
            for( i=0; i<board_loadout[index1]; i++){
                Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
                Sprite_Soldier.Side = "user"; //indetify Sprite side
                Sprite_Soldier.board_place = [index1, i]; //indetify sprite place
                
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

                soldiers_alloct++;

                //Sprite_Soldier.on('pointerdown', soldier_onclick("other", index1, Sprite_Soldier))
                print_sprite([location[0], location[1]+((-i)*jmp_y)], size_Soldier, Sprite_Other);
             }
             other_soldiers[index1] = sprite_array_saver;
            }
            else
                user_soldiers[index1] = sprite_array_saver;
            location[0]+=jmp_x;
        }
        location[1] = y_afterline-soldier.user.height-start_place[1];
        location[0] = start_place[0];
        for ( index1 = 0; index1 < 12; index1++) {
            sprite_array_saver = [];
            if(index1==6)
                location[0]+=jmp_x;
            for( i=0; i<board_loadout[index1+12]; i++){
                Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
                Sprite_Soldier.Side = "user"; //indetify Sprite side
                Sprite_Soldier.board_place = [index1+12, i]; //indetify sprite place
                //general soldiers array
                soldiers_alloct++;
                sprite_array_saver[i] = Sprite_Soldier; 
                Sprite_Soldier.on('pointerdown', soldier_onclick("user", index1+12, Sprite_Soldier))
                print_sprite([location[0], location[1]+((-i)*jmp_y)], size_Soldier, Sprite_Soldier);
            }
            if(board_loadout[index1+12]<0){
                for( i=0; i>board_loadout[index1+12]; i--){
                    Sprite_Other = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
                    Sprite_Other.Side = "other";
                    Sprite_Other.board_place = [index1+12, (-i)];

                    soldiers_alloct++;
                    sprite_array_saver[-i] = Sprite_Soldier; 
                    //Sprite_Soldier.on('pointerdown', soldier_onclick("other", index1+12, Sprite_Soldier))
                    print_sprite([location[0], location[1]+((i)*jmp_y)], size_Soldier, Sprite_Other);
                }
                other_soldiers[index1+12] = sprite_array_saver;
                user_soldiers[index1+12] = [];
            }
            else
                user_soldiers[index1+12] = sprite_array_saver;
            location[0]+=jmp_x;
        }

    }
    function Activate(Sprite){
        if(Sprite===undefined)
            return;
        Sprite.interactive = true;
        Sprite.buttonMode = true;
    }
    function soldier_onclick(kind, index1, Soldier){
        return ()=>{
            Soldier.tint = 0xffff00;
            if(current.cubesIndex!==undefined){
                console.log(user_cubes[current.cubesIndex]);
                possible_move(Soldier, user_cubes[current.cubesIndex]);
            }
            if(current.soldier1 ===undefined){
                current.soldier1 = Soldier;
            }
            else{
                current.soldier2= Soldier;
                socket.emit(`commit-turn-${user_num}`, current);
            }

        }
    }
    function possible_move(Soldier, cubes){
        let demo_place  = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
        let stand;
        let num_in_stand;
        let location;
        if(cubes[0]!==undefined){
            stand = Soldier.board_place[0]+cubes[0].value;
            console.log({stand, Soldier, cubes});
            if(board_loadout[stand]>-2){
                num_in_stand = Math.abs(board_loadout[stand])+1;
                location = boardPlacementToCords(stand, num_in_stand);
                demo_place.tint = 0xffff00;
                demo_place.original = Soldier;
                demo_place.on("poinerdown", move_To_construct(demo_place, location,Soldier.board_place[0] ,stand, cube));
                Activate(demo_place);
                print_sprite(location, null, demo_place);
            }
        }
        if(cubes[1]!==undefined){
            stand = Soldier.board_place[0]+cubes[1].value;
            if(board_loadout[stand]<=-2)
                return;
            num_in_stand = Math.abs(board_loadout[stand])+1;
            location = boardPlacementToCords(stand, num_in_stand);
            demo_place.tint = 0xffff00;
            demo_place.original = Soldier;
            demo_place.on("poinerdown", move_To_construct(demo_place, location,Soldier.board_place[0] ,stand, cube));
            Activate(demo_place);
            print_sprite(location, null, demo_place);
        }
    }
    function boardPlacementToCords(stand, num_in_stand, start_place){
        let location = [(app.screen.width-board.width)/2+board.height/40, board.height/40];;
        if(start_place!==undefined)
            location = start_place
        let jmp_x = (board.width-(2*location[1])-soldier.user.width)/12;
        let jmp_y = soldier.user.height;
        if(stand<=12){
            location[0]+=jmp_x*(stand-1);
            if(stand>=7)
                location[0]+=jmp_x;
            location[1]+=jmp_y*num_in_stand;
        }
        else{
            location[0]+=jmp_x*(stand%13);
            if(stand>=19)
                location[0]+=jmp_x;
            location[1]=board.height/40-soldier.user.height-board.height/40;
            location[1]-=jmp_y*num_in_stand;
        }
        return location;
    }
    function move_To_construct(location,demo_place, stand_org, stand_new, cube){
        return ()=>{
            app.stage.removeChild(demo_place);
            app.stage.removeChild(demo_place.original);
            app.stage.removeChild(cube);
            user_cubes[cube.index[0]][cube.index[1]] = undefined;
            print_sprite(location,null,demo_place.original);
            board_loadout[stand_org]--;
            user_soldiers[stand_org][user_soldiers[stand_org].length-1]=undefined;
            if(board_loadout[stand_new]<0){
                app.stage.removeChild(other_soldiers[stand_new][0]);
                other_soldiers[stand_new][0] = undefined;
                board_loadout[stand_new]++;
            }
            board_loadout[stand_new]++;
            user_soldiers[stand_new][user_soldiers[stand_new].length]=demo_place.original;
            if(cube[0]===undefined&&cube[1] === undefined){
                current.cubesIndex = undefined;
                for(let i =0; i<24; i++){
                    for(j=0; j<board_loadout[i]; j++)
                        un_activate(user_soldiers[i][j]);
                }
            }
        }
    }
    function un_activate(Sprite){
        if(Sprite===undefined)
            return;
        Sprite.interactive = false;
        Sprite.buttonMode = false;
    }
//#endregion
