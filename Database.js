const { MongoClient, ObjectID } = require('mongodb');	// require the mongodb driver

/**
 * Uses mongodb v3.6+ - [API Documentation](http://mongodb.github.io/node-mongodb-native/3.6/api/)
 * Database wraps a mongoDB connection to provide a higher-level abstraction layer
 * for manipulating the objects in our cpen400a app.
 */
function Database(mongoUrl, dbName){
	if (!(this instanceof Database)) return new Database(mongoUrl, dbName);
	this.connected = new Promise((resolve, reject) => {
		MongoClient.connect(
			mongoUrl,
			{
				useNewUrlParser: true
			},
			(err, client) => {
				if (err) reject(err);
				else {
					console.log('[MongoClient] Connected to ' + mongoUrl + '/' + dbName);
					resolve(client.db(dbName));
				}
			}
		)
	});
	this.status = () => this.connected.then(
		db => ({ error: null, url: mongoUrl, db: dbName }),
		err => ({ error: err })
	);
}

Database.prototype.getRooms = function(){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatrooms from `db`
			 * and resolve an array of chatrooms */
			db.collection('chatrooms').find({}).toArray().then((docs) => {
				resolve(docs);
			}).catch((err) => {
				reject(err);
			});

		})
	)
}
function isHex(h) {
	var a = parseInt(h,16);
	return (a.toString(16) ===h.toLowerCase())
	}

var re = /[0-9a-f]{24}/g;// regx to see if hex


var re = /[0-9A-Fa-f]{6}/g;// regx to see if hex

Database.prototype.getRoom = function(room_id){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatroom from `db`
			 * and resolve the result */
			console.log("get room>>>");
				if(re.test(room_id))
				{
					db.collection('chatrooms').find({"_id":ObjectID(room_id)}).toArray().then((docs) => {
						if (docs === undefined || docs.length == 0) {
							db.collection('chatrooms').find({"_id":room_id}).toArray().then((docs) => {
								if (docs === undefined || docs.length == 0) {
									reject("null");
								}
								else
								{
									resolve(docs[0]);
								}
							}).catch((err) => {
								reject("null");
							});
						}
						else
						{
							resolve(docs[0]);
						}
					}).catch((err) => {
						reject("null");
					});
				}
				else
				{
					db.collection('chatrooms').find({"_id":room_id}).toArray().then((docs) => {
						if (docs === undefined || docs.length == 0) {
							// again try and find it using string,
							reject(null);
						}
						else
						{
							resolve(docs[0]);
						}
					}).catch((err) => {
						reject(null);
					});
				}

		})
	)
}


Database.prototype.getUser = function(username){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read the chatroom from `db`
			 * and resolve the result */
			console.log("get user of "+username);
			db.collection('users').find({"username":username}).toArray().then((docs) => {
				if (docs === undefined || docs.length == 0) {
					// again try and find it using string,
					resolve(null);
				}
				else
				{
					resolve(docs[0]);
				}
			}).catch((err) => {
				resolve(null);
			});
		}

		)
	)
}


Database.prototype.addRoom = function(room){
	return this.connected.then(db => 
		new Promise((resolve, reject) => {
			/* TODO: insert a room in the "chatrooms" collection in `db`
			 * and resolve the newly added room */
			console.log(room);
			if(room.name==undefined)
			{
				reject("NAME NOT DEFINED @ line 96");
			}
			else
			{
				try{
					db.collection("chatrooms").insertOne(room).then(
						(result)=>{resolve(result.ops[0])},
						(error)=>{console.log("error"+error)}
					).catch(
						(error)=>{console.log("MAX ERROR"+error)}
					)
				}
				catch (error) {
					console.log(error);
				 }
			}
			
		})
	)
}


Database.prototype.getLastConversation = function(room_id, before){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: read a conversation from `db` based on the given arguments
			 * and resolve if found */

			 if(before==undefined)
			 {
				 before=new Date().now;
			 }

			 try{
				db.collection('conversations').find({"room_id" :room_id}).toArray().then(
					(docs) => {
						if (docs === undefined) {
							resolve("null");
						}
						else
						{	
							var flag=true;
							var latest_object;
							for(let _itr in docs){
								if(docs[_itr].timestamp<before)
								{	
									if(flag)
									{
										var latest_object=docs[_itr];
										flag=false;
									}
									if(docs[_itr].timestamp>latest_object.timestamp)
									{
										latest_object=docs[_itr];
									}
								}
							}

							if(flag)
							{
								resolve("null");
							}
							else
							{
								resolve(latest_object);
							}
						}
					},
					(error)=>{
						reject("erroer 31"+error)
					}
					).catch((err) => {
						resolve("null");
					});
			 }
			 catch(error){
				 console.log("error code 44"+error);
				 resolve("null");
			 } 

		})
	)
}

Database.prototype.addConversation = function(conversation){
	return this.connected.then(db =>
		new Promise((resolve, reject) => {
			/* TODO: insert a conversation in the "conversations" collection in `db`
			 * and resolve the newly added conversation */
			if(conversation.room_id==undefined)
			{
				reject("NAME NOT DEFINED @ line id");
			}
			else if(conversation.timestamp==undefined)
			{
				reject("NAME NOT DEFINED @ line timestamp");
			}
			else if(conversation.messages==undefined)
			{
				reject("NAME NOT DEFINED @ line message");
			}
			else
			{
				try{
					db.collection("conversations").insertOne(conversation, function(err, res) {
						if (err)
						{	
							reject(err);
						}
						else
						{	
							resolve(res.ops[0]);
						}
					  })
				}
				catch (error) {
					
					console.log("ERROR AT LINE @#)");
					reject(error);
				 }
			}

			
		})
	)
}

module.exports = Database;