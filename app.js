var express               = require("express"),
    mongoose              = require("mongoose"),
    passport              = require("passport"),
    bodyParser            = require("body-parser"),
    User                  = require("./views/models/user"),
    criminal              = require("./views/models/criminal"),
    Case                  = require("./views/models/case"),
    localStrategy         = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect("mongodb+srv://user:userpassword@cluster0-u4a2y.mongodb.net/test?retryWrites=true&w=majority",{useNewUrlParser:true});

var app = express();
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
    secret:"Rusty is the best and cutest dog in the world.",
    resave: false, 
    saveUninitialized: false
}));
app.use(express.static(__dirname + "/views"));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


   //to check currentuser
//    app.use(function(req,res,next){
//     res.locals.currentUser = req.user;
//     next();
//     });

//==========
//ROUTES
//==========
 
app.get("/",function(req,res){
    res.render("index");
});
app.get("/secret",isLoggedIn,function(req,res){
   res.render("view");

});

//auth routes

//show signup form
app.get("/register",function(req,res){
    res.render("register");
});
//handling user signup
app.post("/register",function(req,res){
    req.body.username
    req.body.password
    User.register(new User({username: req.body.username}),req.body.password,function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req,res,function(){
           res.redirect("/view");         
        });
    });
});
//login routes
//render login form
app.get("/login",function(req,res){
    res.render("index");
});
//login logic
app.post("/login",passport.authenticate("local",{
    successRedirect: "/next",
    failureRedirect: "/login"
    }),function(req,res){
    
});

app.get("/next",function(req,res){
    if(req.user.username=="police"){
        res.redirect("/view");
    }
    if(req.user.username=="prison"){
        res.redirect("/pris");
    }
    if(req.user.username=="court"){
        res.redirect("/cour");
    }
});

app.get("/pris",function(req,res){
    criminal.find({},function(err,criminals){
        if(err){
            console.log(err);
        }else{
            res.render("prison",{criminals: criminals});
        }
    });
});

app.post("/pr/:id",function(req,res){
    res.render("xx",{uid:req.params.id});
    });
    
    app.post("/cr_vis",function(req,res){
        Case.find({UID:req.body.uid},function(err,casedata){
            if(err){
                console.log("Error");
            }else
            {   
                console.log(casedata);
                casedata.visitors.push(req.body.vname);
                // console.log(casedata);
                 casedata.save(casedata);
    
                 
                res.redirect("/pris");
            }
        });
    });

app.get("/cour",function(req,res){

});


app.get("/logout",function(req,res){
   req.logout();
   res.redirect("/");
});


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//create criminal profile
app.get("/view",function(req,res){
    criminal.find({},function(err,criminals){
        if(err){
            console.log(err);
        }else{
            res.render("show",{criminals: criminals});
        }
    });
});

app.get("/new",function(req,res){
   res.render("new"); 
});

app.post("/new",function(req,res){
    criminal.create(req.body.criminal,function(err,newCriminal){
        if(err){
            res.render("new");
        }else{
            res.redirect("/view");
        }
    });
});

app.post("/show",function(req,res){
            Case.find({UID:req.body.UID },function(err,newcase){
             if(err){
                 console.log("Error");
             }else
             res.render("showdetail",{cases:newcase});
            });
           
    
});

//show add case page
app.get("/newcase",function(req,res){
    res.render("newcase");
});

app.post("/newcase",function(req,res){
    Case.create(req.body.case,function(err,newcase){
        if(err){
            res.render("new");
        }else{
            console.log(newcase);

            res.redirect("/view");
        }
    });
});


app.get("/showcase/:id",function(req,res){
    Case.findById(req.params.id,function(err,casedata){
       if(err){
           console.log("Error");
       }else
       {
           res.render("showcase",{cases:casedata});
       }
    });
});

app.post("/update/:id",function(req,res){
    Case.findById(req.params.id,function(err,casedata){
        if(err){
            console.log("Error");
        }else
        {   casedata.updates.push(req.body.upd);
            // console.log(casedata);
             casedata.save(casedata);

             
            res.redirect("/showcase/"+req.params.id);
        }
    });
});

app.get("/showpub",function(req,res){
    Case.find({},function(err,foundcase){
        if(err){
            console.log(err);
        }else{
            console.log(foundcase);
            res.render("showpub",{cases: foundcase});
        }
    });
});



app.listen(3000,function(){
    console.log("Server Is Running");
});