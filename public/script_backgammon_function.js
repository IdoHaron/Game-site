let In_Eatened_place = null;
let eatened = false;
let out_board = false;
let array_skip = [];
var user_cube;

function Demo_Place(demo_place, Soldier, stand, num_in_stand, unselected_demo, cube) {
    In_Eatened_place = null;
    out_board = false;
    console.log({stand: stand});
    if (In_House && stand >= 24) {
        out_board = true;
        stand = 25;
    } else if (board_loadout[stand] <= -2 || stand >= 24) {
        Activate_soldiers();
        return;
    }
    if (num_in_stand == -1) {
        num_in_stand++;
        In_Eatened_place = {
            stand: stand
        };
    }
    let location = boardPlacementToCords(stand, num_in_stand);
    demo_place.board_place = [stand, num_in_stand];
    console.log({
        original_pose: Soldier.board_place[0],
        new_pose: stand
    });
    demo_place.tint = 0xffff00;
    if (stand===25)
        demo_place.tint  = 0x0000ff;
    if (other_soldiers[stand] !== undefined && other_soldiers[stand].length !== 0)
        demo_place.tint = 0xff0000;
    demo_place.original = Soldier;
    demo_place.location = location;
    demo_place.on("pointerdown", Move_Soldier_controler(location, demo_place, Soldier.board_place[0], stand, cube, unselected_demo));
    Activate(demo_place);
    print_sprite(location, null, demo_place);
    return demo_place;
}

function disfine_current() {
    for (let i = 1; i <= 4; i++) {
        current[`soldier${i}`] = undefined;
    }
}

function Move_Soldier_controler(location, demo_place, board_place, stand, cube, unselected_demo) {
    if (user_cubes[cube.index[0]].double === undefined)
        return move_To_construct(location, demo_place, board_place, stand, cube, unselected_demo);
    if (cube === undefined)
        return double_constractur(location, demo_place, board_place, stand, cube.other, unselected_demo);
    return double_constractur(location, demo_place, board_place, stand, cube, unselected_demo);
}

function Activate_eatned_soldiers() {
    if (user_soldiers[-1] === undefined)
        return;
    for (let i = 0; i < user_soldiers[-1].length; i++) {
        console.log(user_soldiers[-1][i]);
        Activate(user_soldiers[-1][i]);
    }
}
//#region Activators
function Deactivate_selection(location, Sprite, eating) {
    if (eating === true)
        Sprite.tint = 0xff0000;
    else
        Sprite.tint = 0xffff;
    if (In_Eatened_place !== null) {
        console.log("Deactivate_selection");
        remove_stage(other_soldiers[In_Eatened_place.stand][other_soldiers[In_Eatened_place.stand].length - 1]);
        location = boardPlacementToCords(In_Eatened_place.stand, 0);
    }
    if ((!out_board)&&(Sprite.stand!==25))
        print_sprite(location, null, Sprite);
}

function Activate_soldiers() {
    if (user_soldiers[-1].length !== 0) {
        console.log("here---- Activate soldiers -- [-1]");
        Activate(user_soldiers[-1][user_soldiers[-1].length - 1]);
        return;
    }
    for (let i = 0; i < 24; i++) {
        if (user_soldiers[i] === undefined)
            continue;
        Activate(user_soldiers[i][user_soldiers[i].length - 1]);
    }
}

function un_activate_soldiers() {
    for (let i = 0; i < 24; i++) {
        if (user_soldiers[i] === undefined)
            continue;
        un_activate(user_soldiers[i][user_soldiers[i].length - 1]);
    }
}

//#endregion

function set_sprite_cubes(i, current_sprite, next_sprite, user) {
    current_sprite.user = user;
    next_sprite.user = user;
    current_sprite.value = user.cubes[i][0];
    current_sprite.index = [i, 0];
    next_sprite.index = [i, 1];
    next_sprite.value = user.cubes[i][1];
    current_sprite.on('pointerdown', cube_func_constractor(current_sprite));
    next_sprite.on('pointerdown', cube_func_constractor(next_sprite));
}

function eating(eatened) {
    console.log(current);
    for (let i = 0; i < current.eat.length; i++) {
        move_eatened(eatened[i].new);
    }
    turn_eatened();
}

function turn_eatened() {
    let soldier = user_soldiers[-1][user_soldiers[-1].length - 1];
    if (!Activate_ligal_cube()) {
        socket.emit("Re-role-cubes", user_num, game_index);
        return;
    }
}

function move_eatened(place) {
    console.log("move eatend - - - ");
    if (user_soldiers[-1] === undefined)
        user_soldiers[-1] = [];
    if (board_loadout[-1] === undefined)
        board_loadout[-1] = 0;
    let soldier = user_soldiers[place].pop();
    if (soldier === undefined)
        soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-user.png");
    console.log(soldier);
    soldier.board_place = [-1, board_loadout[-1]];
    console.log(`board place: ${board_loadout[-1]} and the soldier board-place: ${[-1, board_loadout[-1]]}`);
    board_loadout[place]--;
    remove_stage(soldier);
    console.log("board_boadout[-1]: "+board_loadout[-1]);
    print_sprite(boardPlacementToCords(-1, board_loadout[-1]), null, soldier);
    user_soldiers[-1].push(soldier);
    console.log(user_soldiers);
    board_loadout[-1]++;
    console.log(board_loadout);
}

function check_double(soldier, cube_index_skip) {
    let bool_s = false;
    for (let i = 0; i < user_cubes.length; i++) {
        if (cube_index_skip !== undefined && cube_index_skip.includes(i))
            continue;
        if (user_cubes[i][0] === undefined || user_cubes[i][1] === undefined)
            continue;
        if (user_cubes[i][0].value === user_cubes[i][1].value) {
            if (board_loadout[(user_cubes[i][0].value)] < -1)
                continue;
            console.log(user_cubes[i]);
            Activate(user_cubes[i][0]);
            Activate(user_cubes[i][1]);
            bool_s = true;
        }
    }
    return bool_s;
}
function Correct_board_loadout() {
    if (user_soldiers[-1] !== undefined) {
        board_loadout[-1] = user_soldiers[-1].length;
    }
    if(other_soldiers[-1]!==undefined)
        board_loadout[24] = other_soldiers[-1].length;
    for (let i = 0; i < 24; i++) {
        if (user_soldiers[i] === undefined)
            board_loadout[i] = 0;
        else
            board_loadout[i] = user_soldiers[i].length;
    }
    for (let i = 0; i < 24; i++) {
        board_loadout[i] -= other_soldiers[i].length;
    }
}

function double_constractur(location, demo_place, stand_org, stand_new, cube, unselected_demo) {
    return () => {
        demo_place.original.stand = stand_new;
        console.log({unselecteddemo: unselected_demo,demo_place: demo_place});
        let double = user_cubes[cube.index[0]].double;
        remove_stage(unselected_demo, demo_place, demo_place.original);
        /*seems this if is comletly useless- - becuase the unselected demo for a double is non exictent */
        console.log(other_soldiers[stand_new]);
        if (other_soldiers[stand_new] !== undefined && other_soldiers[stand_new].length !== 0)
            Deactivate_selection(location, demo_place.original, true);
        else
            Deactivate_selection(location, demo_place.original);
        user_cubes[cube.index[0]].double--;
        board_loadout[stand_org]--;
        let soldier = user_soldiers[stand_org].pop();
        soldier.board_place = demo_place.board_place;
        if (board_loadout[stand_new] < 0) {
            eat_enemy(stand_new);
        }
        board_loadout[stand_new]++;
        if (user_soldiers[stand_new] === undefined)
            user_soldiers[stand_new] = [demo_place.original];
        else
            user_soldiers[stand_new][user_soldiers[stand_new].length] = demo_place.original;
        let i;
        if (soldierInUnSelected(unselected_demo))
            RePrint_eatened_soldier(unselected_demo);
        update_current(stand_org, stand_new, 4);
        un_activate_soldiers();
        let emition = Other_Turn_Cube_ligal(cube, false);
        if (emition)
            return;
        if (double === 1 || double === 3) {
            remove_stage(cube);
            user_cubes[cube.index[0]][cube.index[1]] = undefined;
        }
        if (current.Num_defined >= 4)
            Emit_Current();
        else Activate_soldiers();
    }
}

function Other_Turn_Cube_ligal(cube, is_double) {
    let other = GET_OTHER_CUBE(cube);
    if (other !== undefined && !Check_CubeVal_ligality(other.value)) {
        remove_stage(other);
        if (is_double) {
            remove_stage(cube);
        }
        user_cubes[cube.index[0]][cube.index[1]] = undefined;
        user_cubes[other.index[0]][other.index[1]] = undefined;
        Emit_Current();
        return true;
    }
}

function remove_cubes(remove_user, remove_other) {
    if (remove_user === true) {
        for (let i = 0; i < user_cubes.length; i++) {
            remove_stage(user_cubes[i][0], user_cubes[i][1]);
            user_cubes[i].pop();
            user_cubes[i].pop();
        }
        remove_stage(seperator[0]);
    }
    if (remove_other === true) {
        for (let i = 0; i < other_cubes.length; i++) {
            remove_stage(other_cubes[i][1], other_cubes[i][0]);
            other_cubes[i].pop();
            other_cubes[i].pop();
        }
        remove_stage(seperator[1]);
    }
}

function update_current(original_place, new_place, number_of_cells) {
    let i = 1;
    for (i = 1; i <= number_of_cells; i++) {
        if (current[`soldier${i}`] === undefined) {
            console.log(i);
            current[`soldier${i}`] = {
                org: original_place,
                new: new_place
            };
            current.Num_defined = i;
            break;
        }
    }
}

function Emit_Current() {
    current.Inex_ToCube2 = current.cubesIndex;
    current.cubesIndex = undefined;
    un_activate_soldiers();
    console.log('Emit_current-emition');
    socket.emit(`turn-user-${user_num}`, current, parseInt(game_index));
    return;
}

function eat_enemy(place) {
    console.log(`place eatened ${place} -- eat_enemy`);
    let soldier = other_soldiers[place].pop();
    remove_stage(soldier);
    if (other_soldiers[-1] === undefined)
        other_soldiers[-1] = [];
    if (board_loadout[-1] === undefined)
        board_loadout[-1] = 0;
    soldier.board_place = [-1, other_soldiers[-1].length];
    other_soldiers[-1].push(soldier);
    board_loadout[place]++;
    console.log(`board at place ${board_loadout[place]}`);
    board_loadout[24]--;
    console.log(soldier);
    print_sprite(boardPlacementToCords(24, other_soldiers[-1].length - 1), null, soldier);
}

function GET_OTHER_CUBE(cube) {
    if (cube.index[1] === 0)
        return user_cubes[cube.index[0]][1];
    return user_cubes[cube.index[0]][0];
}

function RePrint_eatened_soldier(unselected_demo) {
    if(unselected_demo.board_place[0]===25)
        return;
    console.log("RePrint_eatened");
    let Soldier = new PIXI.Sprite.from("backgammon/soldiers/piece-other.png");
    Soldier.board_place = [unselected_demo.board_place[0], unselected_demo.board_place[1]];
    print_sprite(boardPlacementToCords(unselected_demo.board_place[0], unselected_demo.board_place[1]), null, Soldier);
    other_soldiers[unselected_demo.board_place[0]][unselected_demo.board_place[1]] = Soldier;
    un_activate(Soldier);
}

function move_To_construct(location, demo_place, stand_org, stand_new, cube, unselected_demo) {
    return () => {
        demo_place.original.stand = stand_new;
        console.log({unselecteddemo_board_place: unselected_demo.board_place, demo_place: demo_place});
        remove_stage(unselected_demo, demo_place, demo_place.original, cube);
        Deactivate_selection(location, demo_place.original);
        board_loadout[stand_org]--;
        console.log("stand org: " + stand_org);
        console.log(board_loadout);
        /*if(stand_org===-1) board_loadout[stand_org]--;*/
        let soldier = user_soldiers[stand_org].pop();
        soldier.board_place = demo_place.board_place;
        if (board_loadout[stand_new] < 0) {
            console.log("enters eating");
            eat_enemy(stand_new);
        }
        board_loadout[stand_new]++;
        if (user_soldiers[stand_new] === undefined)
            user_soldiers[stand_new] = [demo_place.original];
        else
            user_soldiers[stand_new][user_soldiers[stand_new].length] = demo_place.original;
        if (soldierInUnSelected(unselected_demo)) {
            RePrint_eatened_soldier(unselected_demo);
        }
        update_current(stand_org, stand_new, 2);
        un_activate_soldiers();
        let emition = Other_Turn_Cube_ligal(cube, false);
        console.log(emition);
        if (emition)
            return;
        user_cubes[cube.index[0]][cube.index[1]] = undefined;
        if (current.Num_defined >= 2)
            Emit_Current();
        else
            Activate_soldiers();
    }
}

function Activate_ligal_cube() {
    let cube_Activated = false;
    user_cubes.forEach(cube => {
        if (empty_cubeSet(cube))
            return;
        console.log(cube)
        let ligal = Check_CubeVal_ligality(cube[0].value);
        if (Check_CubeVal_ligality(cube[0].value) || Check_CubeVal_ligality(cube[1].value)) {
            cube_Activated = true;
            Activate(cube[0]);
            Activate(cube[1]);
        }
    });
    return cube_Activated;

}