//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const _=require("lodash");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const mongoose=require('mongoose');
const { isNull } = require("util");
const { devNull } = require("os");

main().catch(err => console.log(err));

async function main(){
   await mongoose.connect('mongodb://127.0.0.1:27017/todolistDb');
   //mongodb+srv://akshayne911:Akshay911@cluster0.qtk1zgd.mongodb.net/todolistDb
}
const itemSchema=new mongoose.Schema({name:String});
const Item=mongoose.model("Item",itemSchema);
const p1=new Item({name:"Welcome to your to do list"});
const p2=new Item({name:"Press + to add the item"});
const p3=new Item({name:"<--- To delete the item"});
const ar=[p1,p2,p3];
let rest=[];
const listschema=new mongoose.Schema({name:String,items:[itemSchema]});
const List= mongoose.model("List",listschema);

app.get("/", function(req, res) {
  Item.find().then(function(rest){
    //we added close connecction thing after we did all the additions 
    if(rest.length===0){
      Item.insertMany(ar).then(function(){
        console.log("Added the items successfully");
      }).catch(function(err){
        console.log(err);
      })
      res.redirect("/");
    }
    else{
      res.render("list", {listTitle:"Today", newlistitem:rest});
    }
  });
})

app.get("/:newg", function(req, res) {
  const customlistname =_.capitalize(req.params.newg) ;
  console.log(customlistname);
  List.findOne({ name: customlistname })
    .then(async(foundlist) => {
      if (!foundlist) {
        console.log('List does not exist in database.'); // List with the name "LT" does not exist in the database
        const list = new List({ name: customlistname, items: ar });
        await list.save();
        res.redirect("/"+customlistname);
      } else {
        console.log('List exists in database.'); // List with the name "LT" exists in the database
        res.render("list",{listTitle:foundlist.name,newlistitem:foundlist.items});
      }
    })
    .catch(err => {
      console.log(err); // Handle any error that may occur
    });
});

app.post("/", function(req, res){
  
  const itemName = req.body.newItem;
  const listName=req.body.list;
  console.log(listName,itemName)
 const item =new Item({
  name:itemName});
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({ name: listName })
    .then(async(foundlist) => {
      console.log('>>>>>>>',foundlist,listName);
        foundlist.items.push(item);
        foundlist.save();
        res.redirect("/"+listName);
    })
    .catch(err => {
      console.log(err); // Handle any error that may occur
    });
  }
});
app.post("/delete",function(req,res){
  const checkedbox=(req.body.check);
  const lName=req.body.listName;
  console.log(checkedbox);
  
  if(lName==="Today"){
    async function run() {
  
      // Delete the document by its _id
      await Item.findByIdAndRemove({_id:checkedbox});
      res.redirect("/");

    }
    run();
  }
  else{
    console.log(checkedbox);
    console.log('hef');
    console.log(lName);
async function removeDocument() {
  try {
    const doc = await List.findOneAndUpdate({ name:lName }, { $pull: { items:{_id:checkedbox}} });
    console.log( { items:{_id:checkedbox}} );
    console.log("Document removed:", doc);
    res.redirect("/"+lName);
  } catch (err) {
    console.log("Error:", err);
  }
}
removeDocument();
  }
  });
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
