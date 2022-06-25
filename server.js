const express = require("express");
const app = express();
app.use(express.json());
const { Pool } = require("pg");
let port = process.env.PORT || 3000;

//Validating email
const isEmail = (email) => {
  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return true;
  }
  console.log("You have entered an invalid email address!");
  return false;
};

const pool = new Pool({
connectionString: process.env.DATABASE_URL,
ssl: {
rejectUnauthorized: false
}
}) 
// const pool = new Pool({
//   user: "rahwaghebremichael",
//   host: "localhost",
//   database: "postgres",
//   password: "",
//   port: 5432,
// });

app.get("/hotels", function (req, res) {
  pool
    .query("SELECT * FROM hotels")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});
app.get("/customers", function (req, res) {
  pool
    .query("SELECT * FROM customers order by id ")
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});
app.post("/hotels", function (req, res) {
  const newHotelName = req.body.name;
  const newHotelRooms = req.body.rooms;
  const newHotelPostcode = req.body.postcode;

  if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
    return res
      .status(400)
      .send(
        "The number of rooms should be a positive integer. Found " + req.body
      );
  }
  pool
    .query("SELECT * FROM hotels WHERE name=$1", [newHotelName])
    .then((result) => {
      if (result.rows.length > 0) {
        return res
          .status(400)
          .send("An hotel with the same name already exists!");
      } else {
        const query =
          "INSERT INTO hotels (name, rooms, postcode) VALUES ('Intercontinental',30,'se16 5br')";
        pool
          .query(query, [newHotelName, newHotelRooms, newHotelPostcode])
          .then(() => res.send("Hotel created!"))
          .catch((error) => {
            console.error(error);
            res.status(500).json(error);
          });
      }
    });
});

app.post("/customers", function (req, res) {
  const newEmail = req.body.email;
  if (isEmail(newEmail) == false) {
    return res.status(400).send("The email should be valid" + req.body.email);
  }
  console.log("customers post");
  pool
    .query(
      "INSERT INTO customers (name, email, address, city, postcode, country) VALUES ('Haben','ama@yahoo.com','11 old street','london', 'se16 5qr','UK')"
    )
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});
//updating the email address
app.put("/customers/:id", function (req, res) {
  let id = req.params.id;

  const newEmail = req.body.email;
  if (isEmail(newEmail) == false) {
    return res.status(400).send("The email is not valid " + req.body.email);
  }
  pool
    .query("UPDATE customers SET email='j.smith.org' WHERE id=$1", [id])
    .then((result) => res.json(result.rows))
    .catch((error) => {
      console.error(error);
      res.status(500).json(error);
    });
});
//validating email address

app.listen(port, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
