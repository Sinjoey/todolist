

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anisingh:anisingh1908@cluster0.kyjtk5v.mongodb.net/todolistDB", { useNewUrlParser: true, useUnifiedTopology: true  });
//mongodb://127.0.0.1:27017
const itemsSchema = {
  name: String
};


const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todaylist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new Item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  Item.find().then((items) => {

    if (items.length === 0) {
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved defult items to DB");
      }).catch(function (err) {
        console.log(err);
      });
      //item.save();
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }

    // items.forEach(function(items){
    //     console.log(items);
    // });
    // setTimeout( function () {
    //     mongoose.disconnect();
    //   }, 1000);
   });


  

});



app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name: customListName}).then((foundList) => {
      if(foundList === null) {
        //create a list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //console.log("Exist");
        //show a list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
  })
  .catch((err)=>{
    console.log("Not there");
});
  
});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if(listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
  })
  .catch((err)=>{
    console.log("an error");
});
  }
  


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req, res){
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItem).then(function () {
      console.log("Successfully deleted items from  DB");
    }).catch(function (err) {
      console.log(err);
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItem}}}).then((foundList) => {
        res.redirect("/" + listName);
    })
    .catch((err)=>{
      console.log("Error in delete custom");
    });
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
