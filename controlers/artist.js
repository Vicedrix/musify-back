'use strict';

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');
var color = require('dominant-color');

function getArtist(req, res) {
    var params = req.params;
    var artistId = params.id;

    Artist.findById(artistId, (err, artist) => {
        if (err) {
            res.status(400).send({
                message: 'Error searching the artist.'
            });
        } else {
            if (!artist) {
                res.status(404).send({
                    message: 'Artist not found.'
                });
            } else {
                console.log(artist);
                res.status(200).send({
                    artist: artist
                });
            }
        }
    });
}

function saveArtist(req, res) {
    var artist = new Artist();
    var params = req.body;

    artist.name = params.name;
    artist.description = params.description;
    artist.image = 'null';

    artist.save((err, artistStored) => {
        if (err) {
            res.status(500).send({
                message: 'Error saving the artist.'
            });
        } else {
            if (!artistStored) {
                res.status(404).send({
                    message: 'Error saving the artist.'
                });
            } else {
                res.status(200).send({
                    artist: artistStored
                });
            }
        }
    })

}

function getArtists(req, res) {
    var params = req.params;

    var page = params.page;
    if (!page) {
        page = 1;
    }
    var itemsPerPage = 8;
    Artist.find().sort('name').paginate(page, itemsPerPage, function (err, artists, total) {
        if (err) {
            res.status(500).send({
                message: 'Error in the petition.'
            });
        } else {
            if (!artists) {
                res.status(404).send({
                    message: 'There are no artists.'
                });
            } else {
                var numberOfPages = Math.ceil(total / itemsPerPage);
                return res.status(200).send({
                    pages: numberOfPages,
                    artists
                });
            }
        }
    });
}

function updateArtist(req, res) {
    var artistId = req.params.id;
    var update = req.body;

    Artist.findByIdAndUpdate(artistId, update, (err, artistUpdated) => {
        if (err) {
            res.status(500).send({
                message: 'Error editing the artist.'
            });
        } else {
            if (!artistUpdated) {
                res.status(404).send({
                    message: 'Artist not updated.'
                });
            } else {
                res.status(200).send({
                    artist: artistUpdated
                });
            }
        }

    });
}

function deleteArtist(req, res) {
    var artistId = req.params.id;
    Artist.findByIdAndRemove(artistId, (err, artistRemoved) => {
        if (err) {
            res.status(500).send({
                message: 'Error deleting the artist.'
            });
        } else {
            if (!artistRemoved) {
                res.status(404).send({
                    message: 'Artist not deleted.'
                });
            } else {
                Album.find({
                    artist: artistRemoved._id
                }).remove((err, albumRemoved => {
                    if (err) {
                        res.status(500).send({
                            message: 'Error deleting the albums.'
                        });
                    } else {
                        if (albumRemoved) {
                            Song.find({
                                album: albumRemoved._id
                            }).remove((err, songRemoved) => {
                                if (err) {
                                    res.status(500).send({
                                        message: 'Error deleting the songs.'
                                    });
                                } else {
                                    if (!songRemoved) {
                                        res.status(500).send({
                                            message: 'Song not deleted.'
                                        });
                                    }
                                }
                            });
                        }

                        res.status(200).send({
                            message: 'Artist deleted.',
                            artist: artistRemoved
                        });

                    }
                }));
            }
        }
    });
}



function uploadImage(req, res) {
    console.log("UPLOADING ARTIST IMAGE");
    var artistId = req.params.id;
    var file_name = 'No uploaded.';
    console.log(req.image);
    if (req.files) {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        console.log("FILE_SPLIT" + file_split);
        var file_name = file_split[2];
        var file_extension = file_name.split('.')[1];
        console.log(file_name);

        if (!file_extension == 'png' && !file_extension == 'jpg') {
            res.status(200).send({
                message: 'Extension not valid.'
            });
        } else {
            Artist.findByIdAndUpdate(artistId, {
                image: file_name
            }, (err, artistUpdated) => {
                if (!artistUpdated) {
                    res.status(404).send({
                        message: 'User image not updated.'
                    });
                } else {
                    res.status(200).send({
                        artist: artistUpdated
                    });
                }
            });
        }
    } else {
        res.status(200).send({
            message: 'You have not uploaded any images.'
        });
    }
}

function getImageFile(req, res) {
    var imageFile = req.params.imageFile;
    var path_file = './uploads/artists/' + imageFile;
    fs.exists(path_file, function (exists) {
        if (exists) {
            res.sendFile(path.resolve(path_file));
        } else {
            res.status(404).send({
                message: 'Image not found.'
            });
        }
    });

}
module.exports = {
    getArtist,
    saveArtist,
    getArtists,
    updateArtist,
    deleteArtist,
    uploadImage,
    getImageFile
}