//import { Sprite } from "pixi.js";
//#region set-app
const socket = io.connect("http://localhost:3000");
const app = new PIXI.Application({
    resizeTo: window
});
/*
    soldiers added properties:
        board_place: [stand, numInStand]

*/
let width = window.innerWidth;
let board_loadout = [2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2];
app.view.style.height = window.innerHeight + 'px';
app.view.style.width = window.innerWidth + 'px';
const container = new PIXI.Container();
container.height = window.innerHeight;
container.width = window.innerWidth;
let user_cubes = []; /*two dimantional array [cube1, cube2] holds sprites*/
let num_double; //the number of spacificly allocated cubes.
let other_cubes = [];
let user_soldiers = []; //Two dimantional array- placement and num in placment-> points to the fitting sprites.
let other_soldiers = [];
let other_current = {};
let soldiers_alloct = 0;
let user_num;
let seperator = []; //0 = user, 1 = other
let current = {};
let In_House = false;
document.body.appendChild(app.view);
app.stage.addChild(container);
//#endregion

//#region image-setapp
const board_ratio = 3 / 4;
const game_index = sessionStorage.getItem("backgammon-game");
const board = new PIXI.Sprite.from("backgammon/board_Main.jpg");
const soldier = {
    user: new PIXI.Sprite.from("backgammon/soldiers/piece-user.png"),
    other: new PIXI.Sprite.from("backgammon/soldiers/piece-other.png")
};
user_soldiers[-1] = [];
other_soldiers[-1] = [];
other_soldiers[-2] = []; // outed soldiers
user_soldiers[25] = [];
board_loadout[-1] = 0;
board_loadout[24] = 0;
board.width = app.screen.width * board_ratio;
board.height = app.screen.height;
board.x = (app.screen.width - board.width) / 2;
//#endregion

//#region comunication
socket.on("get_info", () => {
    RockPaerSiccorss();
    //socket.emit("Backgammon-userInfo", sessionStorage.getItem("index"), game_index);
});
socket.on("backgammon-boardLoad", (user, other) => {
    let loc = [0, 0];
    board.zIndex = 0;
    app.stage.addChild(board);
    load_user_cubes(user, true, loc);
    loc = [(app.screen.width + board.width) / 2, 0];
    load_user_cubes(other, false, loc);
    loc = [(app.screen.width - board.width) / 2 + board.height / 40, board.height / 40];
    soldier.user.zIndex = 1;
    soldier.other.zIndex = 1;
    load_soldier(loc);
});
socket.on("close-page", () => {
    window.close();
});
socket.on("turn", (user_num1) => {
    user_num = user_num1;
    Print_turn();
    if (user_soldiers[-1] !== undefined) {
        turn_eatened();
        return;
    }
    current = {};
    if (!Activate_ligal_cube()) {
        console.log("no ligal cubes");
        socket.emit("Re-role-cubes", user_num, game_index);
        return;
    }
});
socket.on("win", () => {

});
socket.on("lose", () => {

});
socket.on("rec-ServerCubes", cubes=>{ console.log(cubes); });
socket.on("load-new-cubes", user => {
    if (user_cubes !== undefined) {
        console.log("load-new-cubes-->> delete user_cubes");
        remove_cubes(true, false);
    }
    console.log(user_cubes);
    let loc = [0, 0];
    load_user_cubes(user, true, loc);
    return;
});

socket.on("load-new-cubes-other", other => {
    console.log("load-new-cubes-other");
    if (other_cubes !== undefined)
        remove_cubes(false, true);
    console.log(other_cubes);
    loc = [(app.screen.width + board.width) / 2, 0];
    load_user_cubes(other, false, loc);
    return;
});
socket.on("update-turn-user", current1 => {
    console.clear();
    other_current = current1;
    current = current1;
    In_House = current1.in_house;
    console.log(current1);
    Change_Side_users(current1);
    console.log(current1.eat);
    if (current1.eat !== [] && current1.eat !== undefined && current.eat.length !== 0)
        eating(current1.eat);
    console.log(current1);
    move_relevant_soldiers(current1);
    remove_stage(other_cubes[current1.Inex_ToCube2][0], other_cubes[current1.Inex_ToCube2][1]);
    socket.emit("load-turns", game_index);
});
//#endregion

//#region functions
function Change_Side_users(current) {
    console.log(current);
    for (let i = 1; current[`soldier${i}`] !== undefined; i++) {
        current[`soldier${i}`].Side = -1;
    }
}

function move_relevant_soldiers(current) {
    for (let i = 1; current[`soldier${i}`] !== undefined; i++) {
        move_soldiers(other_soldiers, current[`soldier${i}`]);
    }
}

function Print_turn() {
    let Turn = new PIXI.Text("Your Turn");
    Turn.y = board.height / 2;
    Turn.x = (board.width - Turn.width) / 2;
    app.stage.addChild(Turn);
    window.setTimeout(() => { app.stage.removeChild(Turn)   }, 2000);
}

function move_soldiers() {
    /* input: array, {org: , new: , side:}, {org, new}... */
    console.log(arguments);
    let array = arguments[0];
    let org;
    let new_s;
    let loc;
    let current_sprite;
    for (let i = 1; i < arguments.length; i++) {
        org = arguments[i].org;
        new_s = arguments[i].new;
        if(org===24)    
            current_sprite = array[-1].pop()
        else    
            current_sprite = array[org].pop();
        if (board_loadout[new_s] == undefined) {
            loc = boardPlacementToCords(new_s, 0);
            board_loadout[new_s] = 0;
            array[new_s][0] = current_sprite;
        } else
            loc = boardPlacementToCords(new_s, Math.abs(board_loadout[new_s]));
        if(arguments[i].Side===-1&&new_s===-1)
            board_loadout[24] += arguments[i].Side;
        else
            board_loadout[new_s] += arguments[i].Side;
        board_loadout[org] -= arguments[i].Side;
        if(new_s ===-2)
            remove_stage(current_sprite);
        else
            print_sprite(loc, null, current_sprite);
        if (org === 24)
            org = -1;
        if (array[new_s] == undefined)
            array[new_s] = [current_sprite];
        else
            array[new_s].push(current_sprite);
        //array[org][array[org].length - 1] = undefined;
    }
}


function load_user_cubes(user /*user style object (defined at server) */ , _isUser, start_place /*a size two array, [0]=x, [1]=y */ ) {
    let print_place = start_place;
    const size =  (app.stage.height/(user.cubes.length+1));
    const jmp = size + size / 10;
    let current_sprite;
    let next_sprite;
    for (let index = 0; index < user.cubes.length; index++) {
        if (index === user.numD && user.numD !== 0) {
            draw_line(print_place);
            print_place[1] += jmp / 8;
        }
        current_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][0]}.png`);
        next_sprite = new PIXI.Sprite.from(`backgammon/dices/Alea_${user.cubes[index][1]}.png`);
        set_sprite_cubes(index, current_sprite, next_sprite, user);
        if (_isUser)
            user_cubes[index] = [current_sprite, next_sprite];
        else
            other_cubes[index] = [current_sprite, next_sprite];
        print_sprite(start_place, [size, size], current_sprite);
        print_place[0] += jmp;
        print_sprite(start_place, [size, size], next_sprite);
        print_place[0] -= jmp;
        print_place[1] += jmp;
    }
}

function draw_line(place) {
    let seperator1;
    seperator1 = new PIXI.Sprite.from("backgammon/Line.png");
    seperator1.x = place[0];
    seperator1.y = place[1] - 5 * seperator1.height;
    app.stage.addChild(seperator1);
    seperator.push(seperator1);
}

function load_soldier(start_place) {
    let location = [start_place[0], start_place[1]];
    let Sprite_Soldier;
    let size_Soldier = null;
    let jmp_x = (board.width - (2 * start_place[1]) - soldier.user.width) / 12;
    let sprite_array_saver = [];
    let i;
    let index1;
    for (index1 = 0; index1 < 24; index1++) {
        sprite_array_saver = [];
        for (i = 0; i < board_loadout[index1]; i++) {
            Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
            Sprite_Soldier.Side = "user"; //indetify Sprite side
            Sprite_Soldier.board_place = [index1, i]; //indetify sprite place

            soldiers_alloct++;

            Sprite_Soldier.on('pointerdown', soldier_onclick("user", index1, Sprite_Soldier))
            sprite_array_saver[i] = Sprite_Soldier;
            location = boardPlacementToCords(index1, i);
            print_sprite(location, size_Soldier, Sprite_Soldier);
        }
        if (board_loadout[index1] < 0) {
            for (i = 0; i > board_loadout[index1]; i--) {
                Sprite_Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
                sprite_array_saver[(-i)] = Sprite_Soldier;
                Sprite_Soldier.Side = "other";
                Sprite_Soldier.board_place = [index1, (-i)];
                soldiers_alloct++;
                location = boardPlacementToCords(index1, (-i));
                print_sprite(location, size_Soldier, Sprite_Soldier);
                //Sprite_Soldier.on('pointerdown', soldier_onclick("other", index1, Sprite_Soldier))
            }
            other_soldiers[index1] = sprite_array_saver;
        } else
            user_soldiers[index1] = sprite_array_saver;
        //location[0]+=jmp_x;
    }

}


function soldier_onclick(kind, index1, Soldier) {
    return () => {
        Soldier.tint = 0xffff00;
        un_activate_soldiers();
        if (current.cubesIndex !== undefined) {
            possible_move(Soldier, user_cubes[current.cubesIndex]);
        }

    }
}

function cube_func_constractor(cube) {
    return () => {
        disfine_current();
        user_cubes.forEach(cubes => {
            un_activate(cubes[0]);
            un_activate(cubes[1]);
        });
        if (user_soldiers[-1].length !== 0) {
            console.log("cube_func_constractor - - [-1] !=== 0")
            if (other_soldiers[cube.value - 1] !== undefined && other_soldiers[cube.value - 1].length !== 0) {
                array_skip.push([cube.index[0]]);
                check_double(undefined, array_skip);
            }
            //user_cubes[cube.index[0]].double = 4;
            Activate_eatned_soldiers();
            current.cubesIndex = cube.index[0];
        } else
            Activate_soldiers();
        if (user_cubes[cube.index[0]][0].value === user_cubes[cube.index[0]][1].value)
            user_cubes[cube.index[0]].double = 4;
        if (user_cubes[cube.index[0]][0] !== undefined)
            user_cubes[cube.index[0]][0].tint = 0xffff00;
        if (user_cubes[cube.index[0]][1] !== undefined)
            user_cubes[cube.index[0]][1].tint = 0xffff00;
        let j;
        current.cubesIndex = cube.index[0];
    }
}

function possible_move(Soldier, cubes) {
    let demo_place = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
    let demo_place1 = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
    let stand;
    let num_in_stand;
    //let cube1_def = false let Both_defined = defined(cubes[0], cubes[1]);
    //if (Both_defined&& cubes[0].value === cubes[1].value) { stand = Soldier.board_place[0] + cubes[0].value; if (board_loadout[stand] > -2 && stand < 24) { num_in_stand = board_loadout[stand]; Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[0]); } Activate(Soldier);} 
    //if(cubes.counter!==undefined){ stand = Soldier.board_place[0] + cubes[0].value; num_in_stand = board_loadout[stand];            // stand = Soldier.board_place[0] + cubes[0].value;    Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[0]);}
    if (cubes[0] !== undefined) {
        stand = Soldier.board_place[0] + cubes[0].value;
        num_in_stand = board_loadout[stand]; // stand = Soldier.board_place[0] + cubes[0].value;
        demo_place.board_place = [stand, num_in_stand];

        Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[0]);
    }
    if (cubes[1] !== undefined) {
        //if(!Check_CubeVal_ligality(cubes[1].value)){ socket.emit("Re-role-cubes", user_num, game_index); return; }
        stand = Soldier.board_place[0] + cubes[1].value;
        num_in_stand = board_loadout[stand];
        Demo_Place(demo_place1, Soldier, stand, num_in_stand, demo_place, cubes[1]);
    }
}

//#endregion



//TODO(Ido): fix eating two problem - it works on entering double.
/*TODO(Ido): the cubes let you double eat, soldier deletened after eating*/