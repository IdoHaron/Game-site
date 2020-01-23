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
    let location = boardPlacementToCords(stand, num_in_stand);
    demo_place.tint = 0xffff00;
    demo_place.original = Soldier;
    demo_place.location = location;
    demo_place.on("pointerdown", move_To_construct(location, demo_place, Soldier.board_place[0], stand, cube, unselected_demo));
    Activate(demo_place);
    print_sprite(location, null, demo_place);
    return demo_place;
}

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

function deleteSprite() {
    for (let i = 0; i < arguments.length; i++)
        app.stage.removeChild(arguments[i]);
}

function set_sprite_cubes(i, current_sprite, next_sprite, user) {
    current_sprite.user = user;
    next_sprite.user = user;
    current_sprite.value = user.cubes[i][0];
    current_sprite.index = [i, 0];
    //current_sprite.other_cube = next_sprite;
    //next_sprite.other_cube = current_sprite;
    next_sprite.index = [i, 1];
    next_sprite.value = user.cubes[i][1];
    current_sprite.on('pointerdown', (e) => {
        user_cubes.forEach(cubes => {
            un_activate(cubes[0]);
            un_activate(cubes[1])
        });
        user_cubes[e.target.index[0]][0].tint = 0xffff00;
        if (user_cubes[e.target.index[0]][1] !== undefined)
            user_cubes[e.target.index[0]][1].tint = 0xffff00;
        let j;
        for (let i = 0; i < 24; i++) {
            if (user_soldiers[i] === undefined)
                continue;
            Activate(user_soldiers[i][user_soldiers[i].length - 1]);
        }
        current.cubesIndex = e.target.index[0];
    });
    next_sprite.on('pointerdown', (e) => {
        user_cubes.forEach(cubes => {
            un_activate(cubes[0]);
            un_activate(cubes[1])
        });
        user_cubes[e.target.index[0]][0].tint = 0xffff00;
        user_cubes[e.target.index[0]][1].tint = 0xffff00;
        let j;
        for (let i = 0; i < 24; i++) {
            for (j = 0; j < board_loadout[i]; j++)
                Activate(user_soldiers[i][j]);
        }
        current.cubesIndex = e.target.index[0];
    });
}

function move_To_construct(location, demo_place, stand_org, stand_new, cube, unselected_demo) {
    return () => {
        if (unselected_demo !== undefined)
            remove_stage(unselected_demo);
        remove_stage(demo_place, demo_place.original, cube);
        Activate(user_cubes[cube.index[0]][cube.index[1] - 1]);
        demo_place.original.tint = 0xFFFFFF;
        user_cubes[cube.index[0]][cube.index[1]] = undefined;
        print_sprite(location, null, demo_place.original);
        board_loadout[stand_org]--;
        user_soldiers[stand_org][user_soldiers[stand_org].length - 1] = undefined;
        if (board_loadout[stand_new] < 0) {
            remove_stage(other_soldiers[stand_new][0]);
            other_soldiers[stand_new][0] = undefined;
            board_loadout[stand_new]++;
        }
        if (current.soldier1 == undefined)
            current.soldier1 = {
                org: stand_org,
                new: stand_new
            };
         else {
            current.soldier2 = {
                org: stand_org,
                new: stand_new
            };
            current.Inex_ToCube2 = current.cubesIndex;
            current.cubesIndex = undefined;
            for (let i = 0; i < 24; i++) {
                if (user_soldiers[i] !== undefined)
                    un_activate(user_soldiers[i][user_soldiers[i].length - 1]);
            }
            socket.emit(`turn-user-${user_num}`, current, parseInt(game_index));
        }
        board_loadout[stand_new]++;
        if (user_soldiers[stand_new] == undefined) 
            user_soldiers[stand_new][0] = demo_place.original;
        else
            user_soldiers[stand_new][user_soldiers[stand_new].length] = demo_place.original;

    }
}
function remove_stage(){
    for(let i =0; i<arguments.length; i++)
        app.stage.removeChild(arguments[i]);
}