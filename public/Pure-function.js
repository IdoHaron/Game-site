function get_last(array) {
    let i = array.length - 1;
    while (array[i] === undefined) {
        i++;
    }
    return array[i];

}
function Check_CubeVal_ligality(value){
    let ligal = false;
    if(board_loadout[-1]>0){
        if(board_loadout[-1+value]<-1)
            return ligal;
        return !ligal;
    }
    user_soldiers.forEach(soldier_array=>{
        if(soldier_array===undefined)
            return;
        soldier_array.forEach(element=>{        
            if(element===undefined)
                return;
            if(((element.board_place[0]+value)>=24&&!In_House))
                return;
            if((element.board_place[0]+value)>=24)
                ligal = true;
            else if(board_loadout[element.board_place[0]+value]>=-1)
                ligal = true;
        })

    });
    return ligal;
}

function boardPlacementToCords(stand /* int: start-0 */ , num_in_stand /* int: start-0 */ , start_place) {
    const Sizer = 50;
    if (num_in_stand === undefined)
        num_in_stand = 0;
    if (boardPlacementToCords.start_const === undefined)
        boardPlacementToCords.start_const = [(app.screen.width - board.width) / 2 /*+board.width/Sizer*/ , board.height / Sizer]
    let location = [boardPlacementToCords.start_const[0], boardPlacementToCords.start_const[1]];
    if (start_place !== undefined)
        boardPlacementToCords.start_const = start_place;
    let jmp_x = (board.width - (2 * location[1]) - soldier.user.width) / 13;
    let jmp_y = soldier.user.height;
    if(stand===-1){
        location[0] = (app.screen.width - board.width) / 2 + board.width - jmp_x;
        location[0] -= jmp_x * 7;
        location[1] += jmp_y * (num_in_stand);
        return location;
    }
    if(stand===24){
        location[0] = (app.screen.width - board.width) / 2 + board.width - jmp_x;
        location[0] -= jmp_x * 7;
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

async function remove_stage(){
    for(let i =0; i<arguments.length; i++){
        if(arguments[i]===undefined)
            continue;
        app.stage.removeChild(arguments[i]);
    }
}

function wait(ms){
    var start = new Date().getTime();
    var end = start;
    while(end < start + ms) {
      end = new Date().getTime();
   }
 }
function defined(){
    for(let i =0; i<arguments.length; i++)
        if(arguments[i]===undefined)
            return false;
    return true;
}