//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-dominic:Test123@cluster0-yto9l.mongodb.net/todolistDB",{ useNewUrlParser: true,useUnifiedTopology: true });

//Create a new schema for the list database

const itemSchema = new mongoose.Schema({
  name :String
});
const Item = mongoose.model("Item",itemSchema);


const listSchema = new mongoose.Schema({
  name: String,
  items:[itemSchema]
});
const List  = mongoose.model("List",listSchema);

//create new documents and save them in an array called Item which is essentially the collection of the database
const item1 = new Item({
  name:"Welcome to your todolist!"
});
const item2 = new Item({
  name:"Hit the + button to add a new item."
});
const item3 = new Item({
  name:"<-- Hit this to delete an item."
});
const defaultItems = [item1,item2,item3];


app.get("/", function(req, res) {
Item.find({}, function(err,foundItems){
if (foundItems.length===0){
  Item.insertMany(defaultItems,function(err){
    if (err){
      console.log(err);
    }else{
      console.log("Successfully saved");
    }
  });
  res.redirect("/");
}else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
}



});

});

app.get("/:newlistName", function(req,res){
const newlistName = _.capitalize(req.params.newlistName);

List.findOne({name:newlistName}, function(err,foundList){
if(!err){
  if(!foundList){
//Create a new list
const list = new List({
  name:newlistName,
  items:defaultItems
});
list.save();
res.redirect("/"+newlistName);
  }else{
  //Show an existing list
  res.render("list",{
    listTitle:foundList.name,
    newListItems:foundList.items
  });
  }
}
});




});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

const item = new Item({
  name:itemName
});

if(listName === "Today"){
  item.save();
  res.redirect("/");

}else{
  List.findOne({name: listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});

app.post("/delete", function(req, res){

  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(
    checkedItemId,
function(err){
  if (err){
    console.log(err);
  }else{
    console.log("Document safely deleted");
  }
  res.redirect("/");
});
}else{
  List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listName);
    }

  });
}


});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);




app.listen(port, function() {
  console.log("Server has started  succesfully");
});
