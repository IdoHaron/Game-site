

 function boardPlacementToCords(stand /* int: start-0 */ , num_in_stand /* int: start-0 */ , start_place) {
    const Sizer = 50;
    if (num_in_stand === undefined)
        num_in_stand = 0;
    if (boardPlacementToCords.start_const === undefined)
        boardPlacementToCords.start_const = [(app.screen.width - board.width) / 2 /*+board.width/Sizer*/ , board.height / Sizer]
    let location = [boardPlacementToCords.start_const[0], boardPlacementToCords.start_const[1]];
    if (start_place !== undefined)
        boardPlacementToCords.start_const = start_place
    let jmp_x = (board.width - (2 * location[1]) - soldier.user.width) / 13;
    let jmp_y = soldier.user.height;
    if(stand===-1){
        location[0] -= jmp_x * 6;
        location[1] += jmp_y * (num_in_stand);
        return location;
    }
    if(stand===24){
        location[0] -= jmp_x * 6;
        location[1] = board.height - soldier.user.height - board.height / Sizer;
        location[1] -= jmp_y * (num_in_stand);
        return location;
    }
    if (stand < 12) {
        location[0] = (app.screen.width - board.width) / 2 + board.width - jmp_x;
        location[0] -= jmp_x * (stand + 1);
        if (stand >= 6)
            location[0] -= jmp_x;
        location[1] += jmp_y * (num_in_stand);
        return location;
    } 
    location[0] += jmp_x * (stand % 12 + 0.5);
    if (stand >= 18)
        location[0] += jmp_x;
    location[1] = board.height - soldier.user.height - board.height / Sizer;
    location[1] -= jmp_y * (num_in_stand);
    return location;
}

function Demo_Place(demo_place, Soldier, stand, num_in_stand, unselected_demo, cube) {
    if (board_loadout[stand] <= -2 && stand >= 24) {
        Activate_soldiers();
         return;
    }
    let location = boardPlacementToCords(stand, num_in_stand);
    demo_place.tint = 0xffff00;
    demo_place.original = Soldier;
    demo_place.location = location;
    demo_place.on("pointerdown", Move_Soldier_controler(location, demo_place, Soldier.board_place[0], stand, cube, unselected_demo));
    Activate(demo_place);
    print_sprite(location, null, demo_place);
    return demo_place;
}
function Move_Soldier_controler(location, demo_place, board_place, stand, cube, unselected_demo){
    console.log(user_cubes[cube.index[0]]);
    if(user_cubes[cube.index[0]].double === undefined)
        return move_To_construct(location, demo_place, board_place, stand, cube, unselected_demo);
    if(cube===undefined)
        return double_constractur(location, demo_place, board_place, stand, cube.other, unselected_demo);
    return double_constractur(location, demo_place, board_place, stand, cube, unselected_demo);
}
function Activate_eatned_soldiers(){
    for(let i=0; i<user_soldiers[-1].length;i++){
        Activate(user_soldiers[-1][i]);
    }
}
//#region Activators
function un_activate(Sprite) {
    if (Sprite === undefined)
        return;
    Sprite.interactive = false;
    Sprite.tint = 0xFFFFFF;
    Sprite.buttonMode = false;
}

function Activate(Sprite) {
    if (Sprite === undefined)
        return;
    Sprite.interactive = true;
    Sprite.buttonMode = true;
}
function Deactivate_selection(location, Sprite){
    Sprite.tint = 0xffff;
    print_sprite(location, null, Sprite);
}
function print_sprite(location, size, im_Sprite) {
    if(im_Sprite==undefined)
        return;
    im_Sprite.x = location[0];
    im_Sprite.y = location[1];
    if (size != null) {
        im_Sprite.width = size[0];
        im_Sprite.height = size[1];
    }
    app.stage.addChild(im_Sprite);
}

function remove_stage(){
    for(let i =0; i<arguments.length; i++){
        if(arguments[i]===undefined)
            continue;
        app.stage.removeChild(arguments[i]);
    }
}
function defined(){
    for(let i =0; i<arguments.length; i++)
        if(arguments[i]===undefined)
            return false;
    return true;
}
function Activate_soldiers(){
    for (let i = 0; i < 24; i++) {
        if(user_soldiers[i] === undefined)
            continue;
        Activate(user_soldiers[i][user_soldiers[i].length - 1]);
    }
}
function un_activate_soldiers(){
    for (let i = 0; i < 24; i++) {
        if(user_soldiers[i] === undefined)
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
function eating(eatened){
    for(let i=0; i<current.eat.length; i++){
        move_eatened(eatened[i].new);
    }
    let soldier = user_soldiers[-1].pop();
    board_loadout[-1]++;
    if(check_double(soldier)==false){
        user_soldiers[-1].push(soldier);
        board_loadout[-1]++;
        socket.emit("load-new-cubes-eating", game_index);
    }
    socket.emit("load-turns", game_index);
}
function move_eatened(place){
    if(user_soldiers[-1]===undefined)
        user_soldiers[-1] = [];
    if(board_loadout[-1]===undefined)
        board_loadout[-1]=0;
    let soldier = user_soldiers[place].pop();
    board_loadout[place]--;
    remove_stage(soldier);
    print_sprite(boardPlacementToCords(-1, 0), null, soldier);
    user_soldiers[-1].push(soldier);
    board_loadout[-1]++;
}
function check_double(soldier){
    let double_bool= false;
    for(let i=0; i<user_cubes.length; i++){
        if(user_cubes[i][0].value === user_cubes[i][1].value){
            double_bool = true;
            Activate(user_cubes[i][0]);
            Activate(user_cubes[i][1]);

        }
    }
}
function Correct_board_loadout(){
    if(user_soldiers[-1]!==undefined){
        board_loadout[-1] = user_soldiers[-1].length;
    }
    for(let i=0; i<24; i++){
        board_loadout[i] = user_soldiers[i].length;
    }
    for(let i=0; i<24; i++){
        board_loadout[i] -= other_soldiers[i].length;
    }
}
function double_constractur(location, demo_place, stand_org, stand_new, cube, unselected_demo){
    return ()=>{
        console.log("gets here- double");
        let double = user_cubes[cube.index[0]].double;
        remove_stage(unselected_demo, demo_place, demo_place.original);
        Deactivate_selection(location, demo_place.original);
        if(double===1 || double === 3){
            remove_stage(cube);
            user_cubes[cube.index[0]][cube.index[1]] = undefined;
        }
        console.log(`double: ${double}  ${user_cubes[cube.index[0]].double}`);
        user_cubes[cube.index[0]].double--;
        console.log(`double: ${double}  ${user_cubes[cube.index[0]].double}`);
        board_loadout[stand_org]--;
        user_soldiers[stand_org].pop();
        if (board_loadout[stand_new] < 0) {
            remove_stage(other_soldiers[stand_new][0]);
            other_soldiers[stand_new].shift();
            board_loadout[stand_new]++;
        }
        board_loadout[stand_new]++;
        if (user_soldiers[stand_new] === undefined) 
            user_soldiers[stand_new] = [demo_place.original];
        else
            user_soldiers[stand_new][user_soldiers[stand_new].length] = demo_place.original;
        let i;
        update_current(stand_org, stand_new, 4);
    }
}
function update_current(original_place, new_place, number_of_cells){
    let i= 1;
    for(i=1; i<=number_of_cells; i++)
        if(current[`soldier${i}`]=== undefined){
            console.log(i);
            current[`soldier${i}`] = {
                org: original_place,
                new: new_place
            };
            break;
        }
    if(i=== number_of_cells){
        current.Inex_ToCube2 = current.cubesIndex;
        current.cubesIndex = undefined;
        un_activate_soldiers();
        socket.emit(`turn-user-${user_num}`, current, parseInt(game_index));
        return ;
    }
    Activate_soldiers();
}
function eat_enemy(place){
    let soldier = other_soldiers[place].pop();
    remove_stage(soldier);
    print_sprite(boardPlacementToCords(24, other_soldiers[place].length), null, soldier);
}
function move_To_construct(location, demo_place, stand_org, stand_new, cube, unselected_demo) {
    return () => {
        remove_stage(unselected_demo, demo_place, demo_place.original, cube);
        Deactivate_selection(location, demo_place.original);
        user_cubes[cube.index[0]][cube.index[1]] = undefined;
        board_loadout[stand_org]--;
        console.log(user_soldiers[stand_org].length - 1);
        user_soldiers[stand_org].pop();
        console.log(user_soldiers[stand_org] );
        console.log(user_soldiers[stand_org].length - 1);
        if (board_loadout[stand_new] < 0) {
            board_loadout[stand_new]++;
        }
        board_loadout[stand_new]++;
        if (user_soldiers[stand_new] === undefined) 
            user_soldiers[stand_new] = [demo_place.original];
        else
            user_soldiers[stand_new][user_soldiers[stand_new].length] = demo_place.original;
        update_current(stand_org, stand_new, 2);
    }
}
