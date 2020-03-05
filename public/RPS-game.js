function RockPaerSiccorss(){
    let Size = app.screen.height/10;
    let Rock = new PIXI.Sprite.from("backgammon/rock_paper_scissors/Rock.png");
    let paper = new PIXI.Sprite.from("backgammon/rock_paper_scissors/paper.png");
    let scissors = new PIXI.Sprite.from("backgammon/rock_paper_scissors/scissors.jpg");
    let Rock_place = [app.screen.width/3-Size];
    Rock_place.push( app.screen.height/2- Size/2);
    let paper_place =  [(app.screen.width*2/3)-Size];
    paper_place.push(app.screen.height/2- paper.height/2);
    let scissors_place = [app.screen.width-Size];
    scissors_place.push(app.screen.height/2- Size/2);
    print_sprite(Rock_place, [Size, Size], Rock);
    print_sprite(paper_place, [Size, Size], paper);
    print_sprite(scissors_place, [Size, Size], scissors);
    let _RPSObjects = [Rock, paper, scissors];
    Rock.on('pointerdown', Select_RPS("rock", _RPSObjects));
    paper.on('pointerdown', Select_RPS("paper", _RPSObjects));
    scissors.on('pointerdown', Select_RPS("scissors", _RPSObjects));
    Activate(Rock);
    Activate(paper);
    Activate(scissors);
}

function Select_RPS(Selected /*String */, _RPSObjects){
    return ()=>{
        remove_stage(_RPSObjects[0], _RPSObjects[1], _RPSObjects[2]);
        socket.emit("RPS", Selected, sessionStorage.getItem("index"), game_index);
    }
}