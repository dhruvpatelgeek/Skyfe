
// global varibale object
var added_ids=[];
var profile={username:"alice"};
var Service = 
{
    origin: window.location.origin,
    getAllRooms:function(){
            
                var xhr = new XMLHttpRequest();
                var action=new Promise((resolve,reject)=>{
                    // doing some async stuff
                    xhr.open("GET", Service.origin+"/chat");

                    xhr.onload = function() {
                        if (xhr.status==200) {
                            //console.log(name + " : Received " + xhr.responseText);
                            resolve(xhr.response);
                        } else {	
                            reject((new Error(xhr.responseText)));
                        }
                    };
                    xhr.ontimeout = function() {
                        reject((new Error(xhr.status)));
                    }
                    xhr.onerror = function() {
                        reject((new Error(xhr.status)));
                    };  
                    xhr.onabort = function() {
                        reject((new Error(xhr.status)));
                    };
                    xhr.timeout = 500;
                    xhr.send();
                })
                
                return action;
    },
    addRoom:function(data)
    {
        var action=new Promise((resolve,reject)=>{
            // doing some async stuff
            var xhr = new XMLHttpRequest();
            xhr.open("POST", Service.origin+"/chat",true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status==200) {
                    var data_reply = JSON.parse(xhr.responseText);
                    console.log(data_reply);
                    resolve(data_reply);
                } else {	
                    reject((new Error(xhr.responseText)));
                }    
            };

            xhr.ontimeout = function() {
                reject((new Error(xhr.status)));
            }
            xhr.onerror = function() {
                reject((new Error(xhr.status)));
            };  
            xhr.onabort = function() {
                reject((new Error(xhr.status)));
            };
            xhr.timeout = 500;
            
            xhr.send(JSON.stringify(data));
        })
        return action;
    },
    getLastConversation:function(roomId,before)
    {
        var xhr = new XMLHttpRequest();
        var action=new Promise((resolve,reject)=>{
            // doing some async stuff
            console.log("Sending "+Service.origin+"/chat/"+roomId+"/messages?before="+before);
            xhr.open("GET", Service.origin+"/chat/"+roomId+"/messages?before="+before);
            xhr.onload = function() {
                if (xhr.status==200) {
                    var parse_xhr_res=JSON.parse(xhr.response);
                    resolve(parse_xhr_res);
                } else {	
                    reject((new Error(xhr.responseText)));
                }
            };
            xhr.ontimeout = function() {
                reject((new Error(xhr.status)));
            }
            xhr.onerror = function() {
                reject((new Error(xhr.status)));
            };  
            xhr.onabort = function() {
                reject((new Error(xhr.status)));
            };
            xhr.timeout = 1000;
            xhr.send();
        })
        return action;
    },
    getProfile:function(){
        var xhr = new XMLHttpRequest();
        var action=new Promise((resolve,reject)=>{
            // doing some async stuff
            console.log("GET REQ TO /profile");
            xhr.open("GET", "/profile");
            xhr.onload = function() {
                if (xhr.status==200) {
                    var parse_xhr_res=JSON.parse(xhr.response);
                    resolve(parse_xhr_res);
                } else {	
                    reject((new Error(xhr.responseText)));
                }
            };
            xhr.ontimeout = function() {
                reject((new Error(xhr.status)));
            }
            xhr.onerror = function() {
                reject((new Error(xhr.status)));
            };  
            xhr.onabort = function() {
                reject((new Error(xhr.status)));
            };
            xhr.timeout = 1000;
            xhr.send();
        })
        return action;

    }
}


//ASN 4 taks 5B


function* makeConversationLoader(room) {
    var last_time_stamp=-1;
    var flag =false;
    yield(
        new Promise((resolve, reject)=>{
            room.canLoadConversation=false;
            var promise_redux=Service.getLastConversation(room.id,Date.now()+Date.now())
            promise_redux.then(
                (result)=>{
                    if(result==null)
                    {   
                        flag=false;
                        resolve(result);
                    }
                    else
                    {   
                        last_time_stamp=result.timestamp;
                        room.canLoadConversation=true;
                        room.addConversation(result);
                        flag=true;
                        resolve(result);
                    }
                },
                (error)=>{
                    console.log("no more CONVO 2286"+error);
                    flag=false;
                    resolve("null");
                        }
            )
                }       
            )
    )

    while(flag)
    {
        yield(
            new Promise((resolve, reject)=>{
                room.canLoadConversation=false;
                var promise_redux=Service.getLastConversation(room.id,last_time_stamp)
                promise_redux.then(
                    (result)=>{
                        if(result==null)
                        {   
                            flag=false;
                            resolve(result);
                        }
                        else
                        {   
                            last_time_stamp=result.timestamp;
                            room.canLoadConversation=true;
                            room.addConversation(result);
                            resolve(result);
                        }
                    },
                    (error)=>{
                        console.log("no more CONVO 2286"+error);
                        flag=false;
                        resolve("null")
                            }
                )
                    }       
                )
        ) 
    }
    
    
    
};
 
//--------------------------------

console.log(window.location.origin);
// Removes the contents of the given DOM element (equivalent to elem.innerHTML = '' but faster)
function emptyDOM (elem){
	while (elem.firstChild) elem.removeChild(elem.firstChild);
}

// Creates a DOM element from the given HTML string
function createDOM (htmlString){
	let template = document.createElement('template');
	template.innerHTML = htmlString.trim();
	return template.content.firstChild;
}

// example usage
var messageBox = createDOM(
    `<div>
        <span>Alice</span>
        <span>Hello World</span>
    </div>`
    );


    //-------HELPER FUNCTIONS PROVIDED


var seed_length=5;

//-------task 3 classes

 class LobbyView {

    constructor(lobby) {
        this.rooms={};

        this.lobby=lobby;
        var self=this;
        this.redrawList();
        this.inputElem=this.elem.querySelector("#room_name");
        this.listElem=this.elem.querySelector("ul.room-list");
        this.buttonElem=this.elem.querySelector("button");

        this.buttonElem.addEventListener("click", (event)=>{
          console.log(this.inputElem.value);
          console.log(seed_length)

          //asn 3
            var room_data_onclick={name:this.inputElem.value,image:"/assets/null.jpg"};
            var promise_obj=Service.addRoom(room_data_onclick);
            promise_obj.then(
                (result)=>{
                            this.lobby.addRoom(result.id,result.name,result.image,[]);
                          },
                (error)=>{
                    console.log("ERROR IN PROMISE");
                }
            )
          //
          
          this.inputElem.value="";
          var x=this.lobby.rooms;
          console.log(x);
          });

      this.lobby.onNewRoom=function(room) {
         
            var room_list=self.elem.querySelector("ul.room-list");
            var node = document.createElement("LI");                 // Create a <li> node
            var textnode = document.createTextNode(room.name);         // Create a text node
            var list_node=createDOM(
            `
            <a href="#/chat/${room.id}"><img src="${room.image}" height="20px">${room.name}</a>`
           
        );
        node.appendChild(list_node);                              // Append the text to <li>
        room_list.appendChild(node);     // Append <li> to <ul> with id="myList"
        added_ids.push(room.id);
        }
    }
};
//task 6------------
LobbyView.prototype.redrawList=function(){

if(this.listElem!=undefined){
    while(this.listElem.childElementCount>0){
        var ul_elem=this.elem.querySelector("ul > li");
        console.log("removing elemts form the list");
        this.listElem.removeChild(ul_elem);
        //console.log("the numbe rof elements left are "+ this.listElem.childElementCount);
    }
}
    

this.elem=createDOM(
    `<div class="content">
    <ul class="room-list">
    </ul>
    <div class="page-control">
      <input id="room_name" type='text'>
      <button>
      Create Room
      </button>
    </div>
  </div>`
);
    
    var printer=0;
    var to_be_printed=0;
    for(var room_iter in this.lobby.rooms)
    {   
       
        
        var room_list=this.elem.querySelector("ul.room-list");
        var node = document.createElement("LI");                 // Create a <li> node
        var textnode = document.createTextNode(this.lobby.rooms[room_iter].name);         // Create a text node
        var list_node=createDOM(
            `
            <a href="#/chat/${this.lobby.rooms[room_iter].id}"><img src="${this.lobby.rooms[room_iter].image}" height="20px">${this.lobby.rooms[room_iter].name}</a>`
           
        );
        node.appendChild(list_node);                              // Append the text to <li>
        room_list.appendChild(node);     // Append <li> to <ul> with id="myList"
       
    }
}

LobbyView.prototype.tester=function(){

    while(this.listElem.childElementCount>0){
        var ul_elem=this.elem.querySelector("ul > li");
        console.log("removing elemts form the list");
        this.listElem.removeChild(ul_elem);
        console.log("the numbe rof elements left are "+ this.listElem.childElementCount);
    }
}

//------------------

class ChatView {

    constructor(socket) {
        this.room=null;
        this.elem = createDOM(
            `<div class="content">
            <h4 class=room-name>
                room-name
            </h4>

            <div id="scroll_wheel_selector" class="message-list" style="max-height: 50vh; overflow-y: scroll;">
                <div class="message">
                </div>


                <div class="message my-message">
                </div>
                
            </div>

            <div class="page-control">
                <textarea name="write message" id="textarea" cols="30" rows="1"></textarea>
                <button>
                  send message
                </button>
        </div>
        </div>`
            );
        var self =this;
        this.titleElem=this.elem.querySelector("div.content h4");
        this.chatElem=this.elem.querySelector("div.message-list");
        this.inputElem=this.elem.querySelector("textarea");
        this.buttonElem=this.elem.querySelector("button");

        this.scroll_bar=this.elem.querySelector('#scroll_wheel_selector');
        // adding hander to button

        this.buttonElem.addEventListener("click", (event)=>{
            console.log(this.inputElem.value);
            this.sendMessage();
            this.inputElem.value="";
        });

        this.inputElem.addEventListener("keyup", (event) => {
            if (event.keyCode === 13)
            {  if (!event.shiftKey)
                {
                    console.log(this.inputElem.value);
                    this.sendMessage();
                    this.inputElem.value="";
                }
            }
        });

        this.chatElem.addEventListener('wheel',(event)=>{
            if(this.room.canLoadConversation==true)
            {
                if((event.deltaY>=0)==false)
                {
                    if(this.scroll_bar.scrollTop<=0)
                        this.room.getLastConversation.next();
                }
            
            }
            
        });

        //asn 3
        this.socket=socket;
    }
};

/// task 8

ChatView.prototype.sendMessage= function(){
    this.room.addMessage(profile.username,this.inputElem.value);
    this.inputElem.value="";
    var _message_to_be_pushed;
    for(let i in this.room.messages)
    {
        if(this.room.messages[i].username=="alice"){
            _message_to_be_pushed=this.room.messages[i].text;
        }
          
    }
    
    var _message={
        roomId:this.room.id,
        username:profile.username,
        text:_message_to_be_pushed,
    }
    var JSON_message=JSON.stringify(_message);
    this.socket.send(JSON_message);
}

ChatView.prototype.setRoom= function(room){
    this.room=room;
    this.titleElem;
    var self =this;
    this.room.onFetchConversation=(conversation)=>{
        var hb=this.scroll_bar.scrollHeight;
        for(let i=0;i<10;i++)
        {   
            if(conversation.messages[i].username!="alice")
            {
                var alice_div=self.chatElem.querySelector("div.message");
                let theFirstChild = alice_div.firstChild;
                var span_object_user_name = createDOM(`<span class="message-user" style="display: block; color: blue;  padding-inline: 10px 20px;">${room.messages[i].username}</span> `);
                var span_object_message = createDOM(`<span class="message-text" style="display: block">${room.messages[i].text}</span> `); 
                alice_div.insertBefore(span_object_user_name, theFirstChild);
                alice_div.insertBefore(span_object_message, theFirstChild);
            }
            else
            {
                var alice_div=self.chatElem.querySelector("div.my-message");
                let theFirstChild = alice_div.firstChild;
                var span_object_user_name = createDOM(`<span class="message-user" style="display: block; color: blue;padding-inline: 10px 20px;">${room.messages[i].username}</span> `);
                var span_object_message = createDOM(`<span class="message-text" style="display: block">${room.messages[i].text}</span> `);
                alice_div.insertBefore(span_object_user_name, theFirstChild)
                alice_div.insertBefore(span_object_message, theFirstChild)
            }
            
        }
        var ha=this.scroll_bar.scrollHeight;
        this.scroll_bar.scrollTo(0,ha-hb);
    }
    if(room!=undefined){
        var textnode = document.createTextNode(room.name);
    }
    else
    {
        var textnode=document.createTextNode(" no room name specified");
    }

    emptyDOM(this.titleElem);
    this.titleElem.appendChild(textnode);
    var temporal=createDOM(`<div class="message">
    </div>`);
    emptyDOM(this.chatElem);
    this.chatElem.appendChild(temporal);
    var temporal=createDOM(`<div class="message my-message">
    </div>`);
    this.chatElem.appendChild(temporal);
    
    for(var i in room.messages)
    {   
        if(room.messages[i].username!="alice")
        {
            var alice_div=self.chatElem.querySelector("div.message");
            var span_object_user_name = createDOM(`<span class="message-user" style="display: block; color: blue;  padding-inline: 10px 20px;">${room.messages[i].username}</span> `);
            var span_object_message = createDOM(`<span class="message-text" style="display: block">${room.messages[i].text}</span> `);
            alice_div.appendChild(span_object_user_name);
            alice_div=self.chatElem.querySelector("div.message");
            alice_div.appendChild(span_object_message);
        }
        else
        {
            var alice_div=self.chatElem.querySelector("div.my-message");
            var span_object_user_name = createDOM(`<span class="message-user" style="display: block; color: blue;padding-inline: 10px 20px;">alice</span> `);
            var span_object_message = createDOM(`<span class="message-text" style="display: block">${room.messages[i].text}</span> `);
            alice_div.appendChild(span_object_user_name);
            alice_div=self.chatElem.querySelector("div.my-message");
            alice_div.appendChild(span_object_message);
        }
        
    }

    
    this.room.onNewMessage= function(message){
        //copied form https://stackoverflow.com/questions/41074052/how-to-terminate-a-websocket-connection
        function encodeHTML(s) {
            return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
        }

        
        console.log("BEFORE");
        console.log(self.chatElem);
        console.log("BEFORE");

        if(message.username=="alice")
        {
            var alice_div=self.chatElem.querySelector("div.my-message");
            var span_object = createDOM(`<span class="message-user" style="display: block; color: blue; padding-inline: 10px 20px;">alice</span> `);
            alice_div.appendChild(span_object);
            var alice_div=self.chatElem.querySelector("div.my-message");
            var span_object = createDOM(`<span class="message-text" style="display: block">${encodeHTML(message.text)}</span> `);
            alice_div.appendChild(span_object);
        }
        else
        {
            var alice_div=self.chatElem.querySelector("div.message");
            var span_object = createDOM(`<span class="message-user" style="display: block; color: blue; padding-inline: 10px 20px;">${message.username}</span> `);
            alice_div.appendChild(span_object);
            var alice_div=self.chatElem.querySelector("div.message");
            var span_object = createDOM(`<span class="message-text" style="display: block">${encodeHTML(message.text)}</span> `);
            alice_div.appendChild(span_object);
        }

    }
}
///---------------------
class ProfileView {
    constructor() {
        this.elem = createDOM(`<div class="content">
        <div class ="profile-form">
            <div class="form-field">
             <label>username</label>
             <input type='text'>
            </div>

            <div class="form-field">
             <label>password</label>
             <input type="password">
            </div>

            <div class="form-field">
             <label>avatar image</label>
             <input type="file">
            </div>


        </div>

        <div class="page-control">
             <button>save</button>
         </div>
    </div>`
    );
    
        
    }

};

//---------------------

//----- task 5 classes
class Room{
    
    constructor(id,name,image,messages){
        this.id=id;
        this.name=name;
        this.image=image;
        this.messages=messages;
        if(image==undefined)
        {   
            this.image="assets/everyone-icon.png";
        }
        if(messages==undefined)
        {   
            var m=[];
            this.messages=m;
        }
        this.getLastConversation=makeConversationLoader(this);
        this.canLoadConversation=true;

    }

    addConversation(conversation){
        console.log(this.messages.concat(conversation.messages))
        var new_message_arr_top=conversation.messages;
        var new_message_arr_last=this.messages;
        this.messages=new_message_arr_top.concat(new_message_arr_last.reverse());
       

        if (this.onFetchConversation !== undefined) { 
             this. onFetchConversation(conversation);
         }
        
    }

    onFetchConversation(conversation){
        console.log("fetch called");
    }
    

   
}


Room.prototype.addMessage=function(username, text){ // methord for add message
    var true_text=true;
    
    if(text.trim().length == 0) // so happy for this 
    {
       // console.log(text);
        //console.log("is a white space ^");
        true_text=false;
    }
    if(text.length==0)
    {
        true_text=false;
    }

    if(true_text==true)
    {
        var push_into_message={"username":username,"text":text};
        this.messages.push(push_into_message); 
    }
    
    /// task 8 B

    if (this.onNewMessage !== undefined) { 
       // console.log("calling on new message");
        this.onNewMessage(push_into_message);
    }
    
   
}




class Lobby{
    constructor(){
        this.rooms=[];
    }
}

Lobby.prototype.getRoom=function(roomId) {
  return(this.rooms[roomId]);// fast hook up
}

Lobby.prototype.addRoom=function(id, name, image, messages) {
    var room_NEW= new Room(id, name, image, messages);
    this.rooms[id]=room_NEW;
    if (this.onNewRoom !== undefined) { //task 7<<<<<<<<<<<
        this.onNewRoom(room_NEW);
    }
}
//---------------------




function main(){
    const socket = new WebSocket('ws://localhost:8000')
    socket.addEventListener('open', function (event) {
        console.log('Connected to WS Server')
    });
    
    var promise_xampper=Service.getProfile(); // 456
    promise_xampper.then(
        (result)=>{
            profile.username=result.username;
           
        },
        (error)=>{
            console.log(error);
            profile.username="lol_master_22";
        }
    )
    socket.addEventListener('message', function (event) {
       var data_extracted=event;
       //console.log(data_extracted);
       var _data_extracted=JSON.parse(data_extracted.data);
       var room_to_be_updated=lobby.getRoom(_data_extracted.roomId);
       room_to_be_updated.addMessage(_data_extracted.username,_data_extracted.text);
    });

    function refreshLobby(){
        var response_from_server=Service.getAllRooms();
        response_from_server.then(
        (result)=> {
            try
            {
                var parsed_result=JSON.parse(result);
            }
            catch(err)
            {
                console.log(err);
            }
            for(var i in parsed_result)
            {
                if(added_ids.includes(parsed_result[i]._id)==false)
                {
                    lobby.addRoom(parsed_result[i]._id,parsed_result[i].name,parsed_result[i].image,parsed_result[i].messages);   
                    added_ids.push(parsed_result[i]._id); 
                }
                    
            }
           
        },
        (error)=> {
            console.log("Error");
            //console.log(error.message)
        }
        );
    }
    refreshLobby();
    var timer=setInterval(refreshLobby,10000);// works

    window.addEventListener("popstate",renderRoute);
   // console.log("hash is  "+window.location.hash);//rm
    
    var lobby=new Lobby();//before the instantiation of lobbyView, create a Lobby object and assign it to the variable lobby
    var lobbyView=new LobbyView(lobby);
    var chatView= new ChatView(socket); // asn 3
    var profileView=new ProfileView();
    
   
    



    renderRoute(); // called it once
    function renderRoute(){
       if((window.location.hash=="")||(window.location.hash=="#/"))
        {
            //console.log("index page elemets loaded");

            var page_view = document.getElementById("page-view");
            console.log(page_view);
            emptyDOM(page_view);//page emptied now fill in
            page_view.appendChild(lobbyView.elem);
           
        }

        else if(window.location.hash.substring(0, 6)=="#/chat")
        {
           // console.log("chat elements loaded   "+window.location.hash.substring(0, 6));

            var page_view = document.getElementById("page-view");
            console.log(page_view);
            emptyDOM(page_view);//page emptied now fill in
            
            
            page_view.appendChild(chatView.elem);

            //task 8
            var room_code=window.location.hash.substring(7, 1000);
            console.log("room code is >>>>>>> "+room_code);
            var room_is=lobby.getRoom(room_code);
            chatView.setRoom(room_is);
        }

        else if(window.location.hash=="#/profile")
        {
            


            var page_view = document.getElementById("page-view");
            console.log(page_view);
            emptyDOM(page_view);//page emptied now fill in

            page_view.appendChild(profileView.elem);

        }

        else
        {
            console.log("hash not found");
        }

    }

    cpen400a.export(arguments.callee, {chatView,lobby});
 }

window.addEventListener("load",main);//task 1
