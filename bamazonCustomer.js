var inquirer = require("inquirer");

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the start function after the connection is made to prompt the user
    showItems();
  });

  var idInput;
  var chosenItem;
  var quantity;
  var newStock;
  

  function showItems() {

    connection.query("SELECT * FROM products",
      function(err, res) {
        if (err) throw err;
  
        console.log(res);
        // re-prompt the user for if they want to bid or post
  
        askId();
        
      });
  
  
  }


  function askId() {
    // prompt for info about the item being put up for auction
    inquirer
      .prompt([
        {
          name: "item",
          type: "input",
          message: "What is the item id of the item you would like to purchase?"
        }
      ])
      .then(function(answer) {
        idInput = parseInt(answer.item);
        // when finished prompting, insert a new item into the db with that info
        console.log(idInput);
        //if (answer.item === 'test'){
          selectItem()
        //}
       
      });
  }
  
  function selectItem() {

    connection.query("SELECT item_id FROM products",
    function (err, res) {

      for (i=0; i<res.length; i++) {
        if (idInput === res[i].item_id) {
          chosenItem = res[i];
          console.log("Good choice!")
          askQuantity();
        }
      }
    }
  )
};
  

function askQuantity() {
  // prompt for info about the item being put up for auction
  inquirer
    .prompt([
      {
        name: "quan",
        type: "input",
        message: "How many would you like to purchase?"
      }
    ])
    .then(function(answer) {
      quantity = parseInt(answer.quan);
      // when finished prompting, insert a new item into the db with that info
      console.log("You asked for this many: " + quantity);

      compareQuantity();
      //if (answer.item === 'test'){
        //selectItem()
      //}
     
    });
}

function compareQuantity() {
  connection.query('SELECT stock_quantity FROM products WHERE item_id = ?', [idInput], function (err, res) {
    newStock = res[0].stock_quantity - quantity;
    if (newStock < 0) {
      console.log("Sorry, we don't have enough inventory!");
      newStock = "";
      resumeEnd();
    }
    else if (newStock >= 0) {
      console.log("We should have enough inventory...");
      updateInventory();
    }
    else {
      console.log("uh oh, problems...")
    }
  })
}

    function updateInventory() {
      console.log("Updating all Rocky Road quantities...\n");
      var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: newStock
          },
          {
            item_id: idInput
          }
        ],
        function(err, res) {
          console.log(res.affectedRows + " products updated!\n");
          console.log("Thank you for your purchase!");
          // Call deleteProduct AFTER the UPDATE completes
          resumeEnd();
        }
      );
    
      // logs the actual query being run
      console.log(query.sql);
    }

    function resumeEnd() {

      inquirer
        .prompt([
          {
            name: "continue",
            type: "rawlist",
            message: "Would you like to purchase something else? [YES] or [NO]",
            choices: ["YES", "NO"]
      
          }
        ])
        .then(function(answer) {
          if (answer.continue.toUpperCase() === "YES") {
            showItems();
          }
          else {
            connection.end();
          }
         
        });
    };