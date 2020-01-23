//import { Sprite } from "pixi.js";
//#region set-app
const socket = io.connect("http://localhost:3000");
const app = new PIXI.Application({
    resizeTo: window
});
let width = window.innerWidth;
let board_loadout = [2, 0, 0, 0, 0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2, 5];
//let board_loadout= [5,0, 0,0,-3, 0, -5, 0, 0, 0, 0, 2, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2, 5];
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
let soldiers_alloct = 0;
let user_num;
let current = {};
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
board.width = app.screen.width * board_ratio;
board.height = app.screen.height;
board.x = (app.screen.width - board.width) / 2;
//#endregion

//#region comunication
socket.on("get_info", () => {
    socket.emit("Backgammon-userInfo", sessionStorage.getItem("index"), game_index);
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
    user_cubes.forEach(cube => {
        if (cube !== undefined) {
            Activate(cube[0]);
            Activate(cube[1])
        }
    });
    user_num = user_num1;
});
socket.on("update-turn-user", current => {
    current.soldier1.Side = -1;
    current.soldier2.Side = -1;
    console.log("update-turn");
    console.log(current);
    move_soldiers(other_soldiers, current.soldier1, current.soldier2);
    deleteSprite(other_cubes[current.Inex_ToCube2][0], other_cubes[current.Inex_ToCube2][1]);
    socket.emit("load-turns", game_index);
})

//#endregion

//#region functions

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
        current_sprite = array[org][array[org].length - 1];
        if (board_loadout[new_s] == undefined) {
            loc = boardPlacementToCords(new_s, 0);
            board_loadout[new_s] = 0;
            array[new_s][0] = current_sprite;
        } else
            loc = boardPlacementToCords(new_s, board_loadout[new_s].length);
        board_loadout[new_s] += arguments[i].Side;
        board_loadout[org] -= arguments[i].Side;
        print_sprite(loc, null, current_sprite);
        if (array[new_s] == undefined)
            array[new_s] = [current_sprite];
        else
            array[new_s][array[new_s].length] = current_sprite;
        array[org][array[org].length - 1] = undefined;
    }
}

function load_user_cubes(user /*user style object (defined at server) */ , _isUser, start_place /*a size two array, [0]=x, [1]=y */ ) {
    let print_place = start_place;
    const size = width / 35;
    const jmp = size + size / 10;
    let current_sprite;
    let next_sprite;
    for (let index = 0; index < user.cubes.length; index++) {
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
        if (current.cubesIndex !== undefined) {
            possible_move(Soldier, user_cubes[current.cubesIndex]);
        }

    }
}

function possible_move(Soldier, cubes) {
    let demo_place = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
    let demo_place1 = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
    let stand;
    let num_in_stand;
    let location;
    stand = Soldier.board_place[0] + cubes[0].value;
    if (cubes[0] === cubes[1] && cubes[0] != undefined) {
        if (board_loadout[stand] > -2 && stand < 24) {
            num_in_stand = board_loadout[stand];
            Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[0]);
        }
        Activate(Soldier);
    } else {
        if (cubes[0] !== undefined) {
            if (board_loadout[stand] > -2 && stand < 24) {
                num_in_stand = board_loadout[stand];
                console.log(`enters place 1, cube: ${cubes[0]} soldier in stand: ${stand}`);
                Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[0]);
                if (cubes[1] === undefined) {
                    un_activate(Soldier);
                }
            }
        }
        if (cubes[1] !== undefined) {
            num_in_stand = board_loadout[stand];
            stand = Soldier.board_place[0] + cubes[1].value;
            if (board_loadout[stand] <= -2 && stand >= 24) {
                un_activate(Soldier);
                return;
            }
            console.log(`enters place 2, cube: ${cubes[1]} soldier in stand: ${stand}`);
            Demo_Place(demo_place, Soldier, stand, num_in_stand, demo_place1, cubes[1]);
            if (cubes[0] === undefined) {
                un_activate(Soldier);
            }
        }
    }

}



//#endregion

// TODO(Ido): server-side "chosen-cube" -> (value1, value2, user: user object)
// TODO(Ido): organize code - seprate to files
//TODO(Ido): fix turn problem