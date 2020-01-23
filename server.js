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
        socket.on("Backgammon-userInfo", (index, game)=>{
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
        });
        socket.on("turn-user-1", (current, game_index)=>{
            backgammon_games[game_index].board[current.soldier1.org]--;
            backgammon_games[game_index].board[current.soldier1.new]++;
            backgammon_games[game_index].board[current.soldier2.org]--;
            backgammon_games[game_index].board[current.soldier2.new]--;
            backgammon_games[game_index].user_turn = 2;
            transform_user(current);
            io.to(backgammon_games[game_index].user2.id).emit("update-turn-user", current);
        });
        socket.on("load-turns", (game_index)=>{
            io.to(backgammon_games[game_index].get_playing_id()).emit("turn",
             backgammon_games[game_index].user_turn);

        })
        socket.on("turn-user-2", (current, game_index)=>{
            backgammon_games[game_index].board[current.soldier1.org]--;
            backgammon_games[game_index].board[current.soldier1.new]++;
            backgammon_games[game_index].board[current.soldier2.org]--;
            backgammon_games[game_index].board[current.soldier2.new]--;
            backgammon_games[game_index].user_turn = 1;
            transform_user(current);
            io.to(backgammon_games[game_index].user1.id).emit("update-turn-user", current);
        });
    //#endregion
});

server.listen(3000);
//#endregion

//#region object-functions
    function transform_user(current){
        current.soldier1.org =23-current.soldier1.org;
        current.soldier1.new =23-current.soldier1.new;
        current.soldier2.org =23-current.soldier2.org;
        current.soldier2.new =23-current.soldier2.new;
    }
    function game(user1, user2, game){
        this.user1 = user1;
        this.user2 =user2;
        this.game = game;
        this.board = [2,0, 0,0,0, -5, 0, -3, 0, 0, 0, 5, -5, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, -2, 5];
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
        //
        this.get_playing_id = ()=>{
            return this[`user${this.user_turn}`].id;
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
    }
//#endregion