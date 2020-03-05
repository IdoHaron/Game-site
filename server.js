const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const io = require('socket.io')(server);
const users= []; //the users by the allocated num in the window session
const backgammon_users = [];
const backgammon_games = [];
const convert_SocketToUser = {}; //convert socket to user
let backgammon_games_num = 0;
let users_num = 0;
let backgammon_users_num = 0;

//#region file_manage
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
//#endregion

//#region page_manage
app.get('/', (req, res)=>{ res.render('index') });
app.get('/backgammon_Loby', (req, res)=>{ 
    users_num++;
    res.render('backgammon_Loby');
});
app.get("/:backgammongame",(req, res)=>{ 
    res.render("backgammon-game", {game_num: req.params.backgammongame}) });
//#endregion

//#region server_comunication
io.on('connection', (socket)=>{
    socket.emit("get_info");
    socket.on("create_user", Player=>{
        users[users_num] = Player;
        convert_SocketToUser[socket.id] = users_num;
        socket.emit("set-user", (users_num));
        users_num++;
    });
    socket.on("RPS", (Select_RPS, index, game)=>{
        if(parseInt(index)===backgammon_games[game].user1.index){
            backgammon_games[game].user1.Select_RPS = Select_RPS;
            backgammon_games[game].user1.id = socket.id;
        }
        else if(parseInt(index)===backgammon_games[game].user2.index){
            backgammon_games[game].user2.Select_RPS = Select_RPS;
            backgammon_games[game].user2.id = socket.id;
        }
        console.log(backgammon_games[game].user2.Select_RPS);
        console.log(backgammon_games[game].user1.Select_RPS);
        if( backgammon_games[game].user2.Select_RPS!==undefined &&  backgammon_games[game].user1.Select_RPS!=undefined){
            let Player1= backgammon_games[game].RPS_Win();
            if(Player1===null){
                delete backgammon_games[game].user1.Select_RPS;
                delete backgammon_games[game].user2.Select_RPS;
                io.to(`${backgammon_games[game].user1.id}`).emit("get_info");
                io.to(`${backgammon_games[game].user2.id}`).emit("get_info");
                return;
            }
            if(Player1===backgammon_games[game].user2){
                backgammon_games[game].swtich_users();
            }
            io.to(`${backgammon_games[game].user1.id}`).emit("backgammon-boardLoad", backgammon_games[game].user1, backgammon_games[game].user2);
            io.to(`${backgammon_games[game].user2.id}`).emit("backgammon-boardLoad", backgammon_games[game].user2, backgammon_games[game].user1);
            io.to(`${backgammon_games[game].user1.id}`).emit("turn", 1);
        }
    })
    socket.on("connect_loby_backgammon", (index)=>{
        convert_SocketToUser[socket.id] = index;
        users[index].game = "backgammon";
        socket.emit("load-users", backgammon_users);
        socket.join("loby_backgammon");
        socket.to("loby_backgammon").emit("load-user", users[index], socket.id);
        backgammon_users[backgammon_users_num] = users[index];
        backgammon_users[backgammon_users_num].index = index;
        backgammon_users[backgammon_users_num].id = socket.id; //saves the socket.id as a parameter
        backgammon_users_num++;
    });
    socket.on("backgammon-game-request", (id)=>{
        io.to(id).emit("aprove-backgammon-game", users[convert_SocketToUser[socket.id]], socket.id);
    })
    socket.on("create-backgammon-game", id=>{
        users[convert_SocketToUser[id]].opponent = convert_SocketToUser[socket.id];
        users[convert_SocketToUser[socket.id]].opponent = convert_SocketToUser[id];
        users[convert_SocketToUser[id]].index = convert_SocketToUser[id];
        users[convert_SocketToUser[socket.id]].index = convert_SocketToUser[socket.id];
        backgammon_games[backgammon_games_num] = new game(users[convert_SocketToUser[id]], users[convert_SocketToUser[socket.id]], backgammon_games_num) ;
        backgammon_games[backgammon_games_num].set_cubes();
        io.to(id).emit("enter-backgammon-game", backgammon_games_num);
        socket.emit("enter-backgammon-game", backgammon_games_num);
        backgammon_games_num++;
    })
    socket.on("disconnect", ()=>{
        delete convert_SocketToUser[socket.id];
    });

    //#region backgammon_socket
        /*socket.on("Backgammon-userInfo", (index, game)=>{
            if(parseInt(index)=== backgammon_games[game].user1.index){
                backgammon_games[game].user1.id = socket.id;
                socket.emit("backgammon-boardLoad", backgammon_games[game].user1, backgammon_games[game].user2);
                socket.emit("turn", 1);
            }
            else if(parseInt(index)=== backgammon_games[game].user2.index){
                backgammon_games[game].user2.id = socket.id;
                socket.emit("backgammon-boardLoad", backgammon_games[game].user2, backgammon_games[game].user1);
            }
            else
                socket.emit("close-page");
            io.to(`${backgammon_games[game].user1.id}`).emit("turn", 1);
        });*/
        socket.on("turn-user-1", (current, game_index)=>{
            current.side = 1;
            updtae_server_board(current, game_index, backgammon_games[game_index].user2);
            transform_user(current);
            backgammon_games[game_index].user_turn = 2;
            io.to(backgammon_games[game_index].user2.id).emit("update-turn-user", current);
        });
        socket.on("load-turns", (game_index)=>{
            console.log(""+backgammon_games[game_index].user_turn);
            io.to(backgammon_games[game_index].get_playing_id()).emit("turn",
             backgammon_games[game_index].user_turn);
        });
        socket.on("Re-role-cubes", (users_num, game_index)=>{
            backgammon_games[game_index].New_Cubes(users_num);
            let user = backgammon_games[game_index][`user${users_num}`];
            io.to(user.id).emit("load-new-cubes",user);
            io.to(user.get_other().id).emit("load-new-cubes-other", user);
            backgammon_games[game_index].user_turn = user.get_other().Player;
            io.to(user.get_other().id).emit("turn", user.get_other().Player);
        })
        socket.on("turn-user-2", (current, game_index)=>{
            game_index = parseInt(game_index);
            transform_user(current); //the board is on the coordinent system of user1;
            current.side = -1; 
            updtae_server_board(current, game_index, backgammon_games[game_index].user1);
            backgammon_games[game_index].user_turn = 1;
            console.log("turen user 2 ends");
            io.to(backgammon_games[game_index].user1.id).emit("update-turn-user", current);
        });
        socket.on("req-serverBoard", (game_index)=>{
            socket.emit("rec-ServerBoard", backgammon_games[game_index].board);
        })
    //#endregion
});

server.listen(3000);
//#endregion

//#region object-functions
    function transform_user(current){
        for(let i=1; current[`soldier${i}`]!==undefined; i++){
            current[`soldier${i}`].org = 23-current[`soldier${i}`].org;
            current[`soldier${i}`].new=23-current[`soldier${i}`].new;
        }
        if(current.eat === undefined)
            current.eat = [];
        else for(let i= 0; i<current.eat.length; i++){
            if(current.eat[i]!== undefined)
                current.eat[i].new = 23-current.eat[i].new;
        }
    }
    function updtae_server_board(current, game_index, user){
        current.eat = [];
        console.log("game-index: "+game_index);
        for(let i=1; current[`soldier${i}`]!==undefined; i++){
            console.log(`original placement: ${backgammon_games[game_index].board[current[`soldier${i}`].org]} 
            new placement: ${backgammon_games[game_index].board[current[`soldier${i}`].new]}
            side: ${current.side}`);
            backgammon_games[game_index].board[current[`soldier${i}`].org]-=current.side;
            backgammon_games[game_index].board[current[`soldier${i}`].new]+=current.side;
            console.log(`original placement: ${backgammon_games[game_index].board[current[`soldier${i}`].org]} 
            new placement: ${backgammon_games[game_index].board[current[`soldier${i}`].new]}`);
            if(backgammon_games[game_index].board[current[`soldier${i}`].new]===0){
                console.log("gets here: Side: "+ current.side);
                console.log(current);
                backgammon_games[game_index].board[current[`soldier${i}`].new]+=current.side;
                current.eat.push({org: current[`soldier${i}`].org, new: current[`soldier${i}`].new});
                if(backgammon_games[game_index].board[-1]===undefined)
                    backgammon_games[game_index].board[-1] =0;
                backgammon_games[game_index].board[-1]-=current.side;
            }
        }
        current.in_house =  user.in_house();
        let win = backgammon_games[game_index].Check_Win();
        if(win!==false){
            io.to(win.id).emit("win");
            io.to(win.get_other().id).emit("lose");
        }
    }
    function game(user1, user2, game){
        this.user1 = user1;
        this.user2 =user2;
        this.game = game;
        this.board = [2,0, 0,0,0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2];
        //setting new user propertys;
        this.user1.cubes =[]; //cube array
        this.user2.cubes =[]; 
        this.user1.Player = 1;
        this.user2.Player = 2;
        //
        user1.game = game;
        user2.game = game;
        let cube_set = 0;

        //new users functions
        this.user1.set_cubes = (num1, num2)=>{
            this.user1.cubes[cube_set] = [num1, num2];
        }
        this.user2.set_cubes=(num1, num2)=>{
            this.user2.cubes[cube_set] = [num1, num2];
        }
        this.user1.get_other = ()=>{
            return this.user2;
        }
        this.user2.get_other = ()=>{
            return this.user1;
        }
        //
        this.RPS_Win= ()=>{
            if(this.user2.Select_RPS===this.user1.Select_RPS)
                return null;
            switch(this.user1.Select_RPS){
                case "rock":
                    if(this.user2.Select_RPS==="scissors")
                        return this.user1;
                    else
                        return this.user2;
                    break;
                case "paper":
                    if(this.user2.Select_RPS==="rock")
                        return this.user1;
                    else
                        return this.user2;
                    break;
                case "scissors":
                    if(this.user2.Select_RPS==="paper")
                        return this.user1;
                    else
                        return this.user2;
                    break;
            };
        }
        this.swtich_users = ()=>{
            let Saver = this.user1;
            this.user1 = this.user2;
            this.user1.get_other=()=>{
                return Saver;
            }
            this.user2 = Saver;
            this.user2.get_other = ()=>{
                return this.user1;
            }
            this.get_playing_id = ()=>{
                return this[`user${this.user_turn}`].id;
            }
            this.get_playing = ()=>{
                return this[`user${this.user_turn}`];
            }
        }
        this.get_playing_id = ()=>{
            return this[`user${this.user_turn}`].id;
        }
        this.get_playing = ()=>{
            return this[`user${this.user_turn}`];
        }
        this.set_cubes = ()=>{
            let i=0;
            let num_couple=1;
            let num_saver = 0;
            while(num_couple==1){
                num_couple=Math.ceil(Math.random()*3)+2;
            }
            if(this.user2===undefined)
                throw (new Error("user2 undefineds"));
            this.user1.numD = num_couple;
            this.user2.numD = num_couple;
            for(;i<num_couple; i++){
                num_saver=0;
                while(num_saver==0){
                    num_saver = Math.ceil(Math.random()*6);
                }
                this.user1.set_cubes(num_saver, num_saver);
                num_saver = 0;
                while(num_saver==0){
                    num_saver = Math.ceil(Math.random()*6);
                }
                this.user2.set_cubes(num_saver, num_saver);
                cube_set++;
            }
            let current_set = cube_set;
            this.role_cubes(1);
            cube_set = current_set;
            this.role_cubes(2);
        }
        this.role_cubes = (user_num)=>{
            let num_cubes = 11-this[`user${user_num}`].numD;
            this[`user${user_num}`];
            let num_saver1 = 0;
            let num_saver2 = 0;
            for(let i = 0; i<num_cubes; i++){
                num_saver1=0;
                num_saver2=0;
                while(num_saver1==0){
                    num_saver1 = Math.ceil(Math.random()*6);
                }
                while(num_saver2==0){
                    num_saver2 = Math.ceil(Math.random()*6);
                }
                this[`user${user_num}`].set_cubes(num_saver1, num_saver2);
                cube_set++;
            }
        }
        this.Check_Win = ()=>{ //needs fixing to other user, on the first square and no the last
            let soldier_counter_side1 = 0;
            let soldier_counter_side2 = 0;
            for(let i= -1; i<=24; i++){
                if(this.board[i]<0)
                    soldier_counter_side2++;
                else
                    soldier_counter_side1++;
            }
            if(soldier_counter_side1===0)
                return user1;
            if(soldier_counter_side2 === 0)
                return user2;
            else
                return false;
        };
        this.New_Cubes = (user_num)=>{
            console.log("user-num: "+user_num);
            this[`user${user_num}`].numD = 0;
            this.role_cubes(user_num);
        }
        this.user1.in_house = ()=>{
            for(let i = -1; i<18;i++){
                if(this.board[i]>0)
                    return false;
            }
            return true;
        }
        this.user2.in_house = ()=>{
            for(let i = 6; i<=24;i++){
                if(this.board[i]<0)
                    return false;
            }
            return true;
        }
    }
//#endregion