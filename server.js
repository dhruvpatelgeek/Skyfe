//asn-5---------------------------------------
var session=require("./SessionManager.js");
let sessionManager = new session();
var crypto = require('crypto');
//---- asn-4----------------------------------
var mongoUrl = "mongodb://localhost:27017";
var mongoName = "cpen400a-messenger";

var Database = require("./Database.js");
var db = new Database(mongoUrl, mongoName);

var messageBlockSize=10;
var messages={};


// task 2 for assigment 4------------------
var gotRoomsPromise=db.getRooms();
gotRoomsPromise.then(
	(result)=>{
		//console.log(result);
		for(let _itr in result){
			messages[result[_itr]._id]= new Array();
		}
	},
	(error)=> console.log(error) // error: Error("LowValueError")
).catch(
	(error)=>{ 
		console.error(error); 
	}
 )
.finally(() =>
	{ 
		//console.log(messages);
	}
);

function isCorrectPassword(password, saltedHash) // pass correct checker
{
	console.log("password is "+password);
	var salt = saltedHash.substring(0, 20);
	var base64Hash = crypto.createHash('sha256').update(password + salt).digest('base64');

	

	if(base64Hash==saltedHash.substring(20,saltedHash.length))
		return true;
	else
		return false;
}
//--------------------------------------------
const cpen400a = require('./cpen400a-tester.js');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const express = require('express');
const broker = new WebSocket.Server({port:8000 });

function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
	  currentDate = Date.now();
	} while (currentDate - date < milliseconds);
  }



// code from https://www.youtube.com/watch?v=wV-fDdHhGqs&ab_channel=Vuka

broker.on('connection', function connection(ws,request) {
	if(typeof(request.headers.cookie)==typeof(undefined))
		{
			console.log("close connection<<<<<<<<<")
			ws.close();
		}
	else{
			var sting_to_be_parsed=request.headers.cookie;
			var str =sting_to_be_parsed;
			 var n = str.indexOf(";");
			 if(n==-1)
			 {
				 n=sting_to_be_parsed.length;
			 }
			 var n_1 = str.indexOf("cpen400a-session=");
			 var pos=n_1+17;
			 var string_cookie=str.substring(pos,n);

			 console.log(sessionManager.getUsername(string_cookie));
			 if(sessionManager.getUsername(string_cookie)==null)
			 {
				 ws.close();
			 }
			 else
			 {
					ws.on('message', function incoming(_message) {
						
					  var message=_message;
					  console.log('received: %s',message);
					  var _itr=0;
					  broker.clients.forEach(function each(client) {
						if (client !== ws && client.readyState === WebSocket.OPEN) {
							var message_parsed=JSON.parse(message);
							var message_push_obj={
								"username" : sessionManager.getUsername(string_cookie),
								"text" : message_parsed.text	
							}
							messages[message_parsed.roomId].push(message_push_obj);

							console.log("sending messanger to client" + _itr++)
							console.log("FOUND IT")
							console.log(message);
							message_to_be_sent={
								"roomId":message_parsed.roomId,
								"username":sessionManager.getUsername(string_cookie),
								"text":message_parsed.text
							}
							console.log(sessionManager.getUsername(string_cookie));
							console.log(message_to_be_sent);
							console.log(message);
							console.log("FOUND IT")
							client.send(JSON.stringify(message_to_be_sent));

							if(messages[message_parsed.roomId].length==messageBlockSize)
							{
								var convo_obj={room_id:message_parsed.roomId,
												timestamp:Date.now(),
												messages:messages[message_parsed.roomId]
											}
										
								var promise_vector=db.addConversation(convo_obj);
								promise_vector.then(
									(result)=>{
										//console.log("addConversation VVVVVVVVVVVVV")
										//console.log(result)
										messages[message_parsed.roomId]=[];
									},
									(error)=>{
										console.log("error a t 225"+error)
									}
								).catch((error)=>{
									console.log("error a t 55"+error)
								})
							
							}
						
						
						}
					  });
					});

			 }
	}	
  });


function logRequest(req, res, next){
	console.log(`${new Date()}  ${req.ip} : ${req.method} ${req.path}`);
	next();
}

const host = 'localhost';
const port = 3000;
const clientApp = path.join(__dirname, 'client');

// express app
let app = express();

app.use(express.json()) 						// to parse application/json
app.use(express.urlencoded({ extended: true })) // to parse application/x-www-form-urlencoded
//app.use(logRequest);							// logging for debug
var id_itr=1000;
// serve static files (client-side)

//app.use('/chat',sessionManager.middleware);
//app.use('/profile',sessionManager.middleware);
app.use('/app.js',sessionManager.middleware);
app.use('/index.html',sessionManager.middleware);
app.use('/index',sessionManager.middleware);
app.post('/chat',sessionManager.middleware,function (req, res) {
	var data_recived=req.body;
	if(req==null)
	{
		res.status(400);
		res.send("ERROR a request not formated properly");
	}
	else if(req.body===undefined)
	{
		res.status(400);
		res.send("ERROR b request not formated properly");
	}
	else if(data_recived.name===undefined)
	{
		res.status(400);
		res.send("ERROR c request not formated properly");
	}
	else
	{
		
		var room_obj={
			name:data_recived.name,
			image:data_recived.image
		};
	
		

		var promise_ret=db.addRoom(room_obj);
			promise_ret.then(
				(result)=>{
					messages[result._id]=[];
					console.log("PUSED ROOM VIA POST"+result._id)
					res.status(200);
					res.send(result);
				},
				(error)=>{
					console.log("POST ERROR "+error);
				}
			)
	}
  })
app.get('/chat/:room_id/messages', sessionManager.middleware,(req,res)=>{
	//console.log("get for /chat/:room_id/messages thing");
	//console.log("requestion "+req.params.room_id)
	//console.log(req.query.before);
	var promise_ret=db.getLastConversation(req.params.room_id,req.query.before);
	promise_ret.then(
	(result)=>{
		console.log(result)
		res.status(200);
		res.send(result);
	},
	(error)=>{
		console.log("error of 8909 "+error);
		res.status(404);
		res.send("error of 8909 "+error);
	}
	).catch((error)=>{
		console.log("ERROR 443"+error)
		res.status(404);
		res.send("ERROR 443"+error);
	})
})
app.get('/chat/:room_id', sessionManager.middleware,(req,res)=>{
	console.log("get for /chat/:room_id thing");
	var gotRoomsPromise=db.getRoom(req.params.room_id);
		gotRoomsPromise.then(
			(result)=>{
				res.status(200);
				res.send(result);
			},
			(error)=> 
			{
			 res.status(404)
			 res.send(error);
			} 
		)
})

app.get('/logout',sessionManager.middleware,function (req, res) {
	if(typeof(req.username)==undefined)
	{
		res.status(200);
		res.redirect('/login');
	}
	else
	{
		sessionManager.deleteSession(req);
		res.status(200);
		res.redirect('/login');
	}
	
}
)
app.get('/chat',sessionManager.middleware,function (req, res) {
	//console.log("GET HIT<<<<<<<<");
	var obj_send=[];
	var gotRoomsPromise=db.getRooms();
		gotRoomsPromise.then(
			(result)=>{
				for(let _itr in result){
					var push_obj_send={
						"_id":result[_itr]._id,
						"name":result[_itr].name,
						"image":result[_itr].image,
						"messages":messages[result[_itr]._id]
					};
					//console.log(push_obj_send);
					obj_send.push(push_obj_send);
				}
				
				res.status(200);
				res.send(obj_send);
			},
			(error)=> console.log(error) // error: Error("LowValueError")
		).catch(
			(error)=>{ 
				console.error(error); 
				res.status(404).send(error);
			}
		 )
  })


  app.get('/profile',sessionManager.middleware,function (req, res) {
    res.status(200);
    var obj_send={
        "username":req.username
    }
	console.log(obj_send);
	res.send(JSON.stringify(obj_send));
    
  })
  app.use(/^\/$/,sessionManager.middleware); 
  app.use(function (error, req, res, next) {
	if(error instanceof session.Error)
	{
		//console.log(req.headers)
		if(req.headers.accept=='application/json')
		{
			res.status(401);
			res.send(error);
		}
		else
		{
			res.status(401);
			res.redirect('/login');	
		}
	}
	else
	{
		
		res.status(500);
		res.send();
	}
	//console.log("<<<<<<<<<<<<<here");
	next();
  })

app.use('/', express.static(clientApp, { extensions: ['html'] }));
app.listen(port, () => {
	console.log(`${new Date()}  App Started. Listening on ${host}:${port}, serving ${clientApp}`);
});


app.post('/login', function (req, res) {
	var data_recived=req.body;
	if(req==null)
	{
		res.status(400);
		res.send("ERROR a request not formated properly");
	}
	else if(data_recived.username===undefined)
	{
		res.status(400);
		res.send("ERROR c request not formated properly");
	}
	else
	{
		
		var username=data_recived.username;
		var password=data_recived.password;
		console.log(data_recived);
		var promise_ret=db.getUser(username);
			promise_ret.then(
				(result)=>{
					if(result==null)
					{	
						res.status(200);
						res.redirect('/login');	
					}
					else
					{
						
						if(isCorrectPassword(password,result.password))
						{	
							res.status(200);
							sessionManager.createSession(res,username,10000000);
							res.redirect('/');	
						}
						else{
							res.status(200);
							res.redirect('/login');
						}
						
					}
				},
				(error)=>{
					console.log("POST ERROR "+error);
				}
			)
	}
  })
  

  
// your code here

//var promise_ret=db.getUser("alice");
//promise_ret.then(
//		(result)=>{
//			console.log("inserting>>>>>")
//			console.log(result)},
//		(error)=>{
//			console.log("error of "+error);
//		})

//G1rz4EWoUumO
//G2BsSjMn7ZgQiDbnp4hB204oA1aRhGhWelwA08lWg4f/kxeLcfBNaHMObjZIgeU=


//----------------------
var chatrooms=[];
var room_1={id:"22",name:"room_1",image:"assets/minecraft.jpg"};
var room_2={id:"24",name:"room_2",image:"assets/minecraft.jpg"};
var room_3={name:"room_2",image:"assets/minecraft.jpg"};
var room_test={name:"add room works",image:"assets/minecraft.jpg"};
chatrooms.push(room_1);
chatrooms.push(room_2);


//var  convo={room_id:"33",timestamp:Date.now(),messages:[]};
//var promise_ret=db.addConversation(convo);
//promise_ret.then(
//	(result)=>{
//		console.log("inserting>>>>>")
//		console.log(result)
//
//	var promise_ret=db.getLastConversation("33",Date.now());
//	promise_ret.then(
//	(result)=>{
//		console.log("got result converVVVVVVVVV")
//		console.log(result)
//	},
//	(error)=>{
//		console.log("error of "+error);
//	}
//)
//	},
//	(error)=>{
//		console.log("error of "+error);
//	}
//)







// at the very end of server.js
