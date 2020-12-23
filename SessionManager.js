const crypto = require('crypto');

class SessionError extends Error {};

function SessionManager (){
	// default session length - you might want to
	// set this to something small during development
	const CookieMaxAgeMs = 600000;

	// keeping the session data inside a closure to keep them protected
	const sessions = {};

	// might be worth thinking about why we create these functions
	// as anonymous functions (per each instance) and not as prototype methods
	this.createSession = (response, username, maxAge = CookieMaxAgeMs) => {
		/* To be implemented */
		
				
				// Prints random bytes of generated data 
				var session_object={
					"username":username,
					"timestamp":Date.now()
				}
				
				var  _token_created=crypto.randomBytes(256).toString("hex");
	
				 if(typeof(maxAge)==typeof(undefined))
				 {
					 maxAge=10000;
				 }
				 
				 
				sessions[_token_created]=session_object;
				
				function myFunc(_token_created) {
					delete sessions[_token_created];
				}

				console.log('deleting a user in '+maxAge+'ms');
				setTimeout(myFunc, maxAge,_token_created);
				response.cookie('cpen400a-session',_token_created,{"maxAge":maxAge});

				
		  		
		  
	};

	this.deleteSession = (request) => {
		/* To be implemented */
		for(let user in sessions)
		{
			console.log(sessions[user]);
			if(sessions[user].username==request.username)
			{
				delete sessions[user];
			}
		}
		delete request.username;
		delete request.session;
		
	};

	this.middleware = (request, response, next) => {
		

		if(typeof(request.headers.cookie)==typeof(undefined))
		{
			
			err_obj= new SessionError;
			next(err_obj)
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
			 var n_2 = str.indexOf("=");
			 var pos=n_1+17;
			 var string_cookie=str.substring(pos,n);

			 if(typeof(sessions[string_cookie])==typeof(undefined))
			 	{
					
					err_obj= new SessionError;
					next(err_obj)
				}
			else
			{
					

				request.username=sessions[string_cookie].username;
				request.session=string_cookie;
				next();
			}
			
		}
		
	};

	// this function is used by the test script.
	// you can use it if you want.
	this.getUsername = (token) => ((token in sessions) ? sessions[token].username : null);
};

// SessionError class is available to other modules as "SessionManager.Error"
SessionManager.Error = SessionError;

module.exports = SessionManager;