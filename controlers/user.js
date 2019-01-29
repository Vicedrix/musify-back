"use strict";
var User = require("../models/user");
var bcrypt = require("bcrypt-nodejs");
var jwt = require("../services/jwt");
var fs = require("fs");
var path = require("path");

function saveUser(req, res) {
  var user = new User();

  //Guardar parámetros
  var params = req.body;

  //guardar parametros en user
  user.name = params.name;
  user.surname = params.surname;
  user.email = params.email;
  user.role = "ROLE_USER";
  user.image = "NULL";

  //Guardar en bbdd
  if (params.password) {
    bcrypt.hash(params.password, null, null, function(err, hash) {
      user.password = hash;
      if (user.name != null && user.surname != null && user.email != null) {
        user.save((err, userStored) => {
          if (err) {
            res.status(500).send({ message: "Error saving the user." });
          } else {
            if (!userStored) {
              res
                .status(404)
                .send({ message: "The user has not registered." });
            } else {
              res.status(200).send({ user: userStored });
            }
          }
        });
      } else {
        res.status(200).send({ message: "Missing fields." });
      }
    });
  } else {
    res.status(200).send({ message: "Password required." });
  }
}

function loginUser(req, res) {
  var params = req.body;

  var email = params.email;
  var password = params.password;

  User.findOne({ email: email.toLowerCase() }, (err, user) => {
    if (err) {
      res.status(500).send({ message: "Petition error." });
    } else {
      if (!user) {
        res.status(404).send({ message: "User not exist." });
      } else {
        //Comprobar la conraseña
        bcrypt.compare(password, user.password, function(err, check) {
          if (check) {
            //Devolver los datos del usuario logueado
            if (params.getHash) {
              res.status(200).send({
                token: jwt.createToken(user)
              });
            } else {
              res.status(200).send({ user });
            }
          } else {
            res.status(404).send({ message: "Loging error." });
          }
        });
      }
    }
  });
}

function updateUser(req, res) {
  var userId = req.params.id;
  var update = req.body;
  delete update.password;
  delete update.role;

  if (userId != req.user.sub) {
    res
      .status(500)
      .send({ message: "You do not have permission to update this user." });
  } else {
    User.findByIdAndUpdate(userId, update, (err, userUpdated) => {
      if (err) {
        res.status(500).send({ message: "Error updating the user." });
      } else {
        if (!userUpdated) {
          res
            .status(404)
            .send({ message: "User not updated." });
        } else {
          //res.status(200).send({user: userUpdated});
          User.findById(userId, (err, foundUser) => {
            if (err) {
              res
                .status(204)
                .send({
                  message: "User updated."
                });
            } else {
              var returnUser = foundUser;
              delete returnUser.user;
              console.log(returnUser);
              res.status(200).send({ user: returnUser });
            }
          });
        }
      }
    });
  }
}

function uploadImage(req, res) {
  var userId = req.params.id;
  var file_name = "Not uploaded.";

  if (req.files) {
    var file_path = req.files.image.path;
    var file_split = file_path.split("/");
    console.log("FILE_SPLIT" + file_split);
    var file_name = file_split[2];
    var file_extension = file_name.split(".")[1];
    console.log(file_name);
    if (!file_extension == "png" && !file_extension == "jpg") {
      res.status(200).send({ message: "Extension not valid." });
    } else {
      User.findByIdAndUpdate(
        userId,
        { image: file_name },
        (err, userUpdated) => {
          if (!userUpdated) {
            res
              .status(404)
              .send({
                message: "User image not updated."
              });
          } else {
            res.status(200).send({ user: userUpdated, image: file_name });
          }
        }
      );
    }
  } else {
    res.status(200).send({ message: "You have not uploaded any image." });
  }
}

function getImageFile(req, res) {
  var imageFile = req.params.imageFile;
  var path_file = "./uploads/users/" + imageFile;
  fs.exists(path_file, function(exists) {
    if (exists) {
      res.sendFile(path.resolve(path_file));
    } else {
      res.status(404).send({ message: "Image not found." });
    }
  });
}

module.exports = {
  saveUser,
  loginUser,
  updateUser,
  uploadImage,
  getImageFile
};
