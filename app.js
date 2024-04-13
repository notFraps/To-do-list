const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://owolama:batterylifespan@cluster0.tcojnuc.mongodb.net/todolistDB");

const itemSchema =  {
        name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item ({
    name: "Buy Food"
});

const item2 = new Item ({
    name: "Buy Egg"
});

const item3 = new Item ({
    name: "Run 2KM"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function (req, res) {
    Item.find()
    .then(function (models) {
        if (models.length === 0) {
            Item.insertMany(defaultItems);
            res.redirect("/")
        } else {
            res.render("index", {kindof: "Today", newlistitem: models});             
        }
    })
    .catch(function (err) {
        console.log(err);
    });    
});

app.get("/:testing", function (req, res) {
    const customList = _.capitalize(req.params.testing);

    List.findOne({ name: customList}).exec()
    .then(function (model) {
        if (!model) {
            const list = new List ({
                name: customList,
                items: defaultItems
            });
            list.save();
            res.redirect("/" + customList);
        } else {
            res.render("index", {kindof: model.name, newlistitem: model.items});
        }
    })
    .catch(function (err) {
        console.log(err);
    });  
});

app.post("/delete", function (req, res) {
    const differentName = req.body.difName;
    const chbox = req.body.cbox;
    if (differentName === "Today") {
        Item.findByIdAndDelete(chbox)
        .then(function (err) {
        if (!err) {
          res.redirect("/")
        }
    })   
    } else {
        List.findOneAndUpdate({name: differentName}, {$pull: {items: {_id: chbox}}})
        .then(function () {
            res.redirect("/" + differentName)
        })
    }    

})

app.post("/", function (req, res) {
    const itemName = req.body.newlist;
    const listname = req.body.butt;
    const itemX = new Item ({
        name: itemName
    });

    if (listname === "Today") {
        itemX.save();
        res.redirect("/");    
    } else {
        List.findOne({ name: listname})
        .then(function (model) {
            model.items.push(itemX);
            model.save();
            res.redirect("/" + listname);            
        })
        .catch(function (err) {
            console.log(err);
        })
    }

    
});

 