'use strict';

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getAlbum(req, res){
    var params = req.params;
    var albumId = params.id;
    Album.findById(albumId).populate({path: 'artist'}).exec((err, album)=>{
        if(err)
        {
            res.status(500).send({message: 'Error in album petition.'});
        }
        else
        {
            if(!album)
            {
                res.status(404).send({message: 'Album not found.'});
            }
            else
            {
                res.status(200).send({album});
            }
        }
    });
    return 0
}

function saveAlbum(req, res)
{
    var album = new Album();
    var params = req.body;

    album.title = params.title;
    album.description = params.description;
    album.year = params.year;
    album.artist = params.artist;
    album.image = 'null';

    album.save((err, albumStored)=> {
        if(err)
        {
            res.status(500).send({message: 'Error saving the album.'});
        }
        else
        {
            if(!albumStored)
            {
                res.status(404).send({message: 'Error saving the artist.'});
            }
            else
            {
                res.status(200).send({album: albumStored});
            }
        }
    })

}

function getAlbums(req, res)
{
    var params = req.params;
    var artistId = params.artist;
    var page = params.page;
    var find;
    if(!artistId)
    {
        find = Album.find({}).sort('title');
    }
    else
    {
        find = Album.find({artist: artistId}).sort('year');
    }

    find.populate({path: 'artist'}).exec((err, albums) =>{
        if(err)
        {
            res.status(500).send({message: 'There are no album.'});
        }
        else
        {
            if(!albums)
            {
                res.status(404).send({message: 'There are no albums.'});
            }
            else
            {
                res.status(200).send({albums});
            }
        }
    });

}

function updateAlbum(req, res){
    var albumId = req.params.id;
    var update = req.body;

    Album.findByIdAndUpdate(albumId, update, (err, albumUpdated) =>{
        if(err)
        {
            res.status(500).send({message: 'Error editing the album.'});
        }
        else
        {
            if(!albumUpdated)
            {
                res.status(404).send({message: 'Album not updated.'});
            }
            else
            {
                res.status(200).send({album: albumUpdated});
            }
        }

    });
}

function deleteAlbum(req, res){
    var albumId = req.params.id;
    Album.findByIdAndRemove(albumId, (err, albumRemoved)=>
    {
        if(err)
        {
            res.status(500).send({message: 'Error deleting the album.'});
        }
        else
        {
            if(!albumRemoved)
            {
                res.status(404).send({message: 'Album not deleted.'});
            }
            else
            {
                Song.find({album: albumRemoved._id}).remove((err,songRemoved)=>{
                    if(err)
                    {
                        res.status(500).send({message: 'Error deleting the song.'});
                    }
                    else
                    {
                        if(!songRemoved)
                        {
                            res.status(500).send({message: 'Song not deleted.'});
                        }
                        else
                        {
                            res.status(200).send({message: 'Album deleted.', album: albumRemoved});
                        }
                    }
                });
            }
        }
    });
}



function uploadImage(req, res)
{
    console.log("UPLOADING THE IMAGE");
    
    var albumId = req.params.id;
    var file_name = 'No uploaded.';
    if(req.files)
    {
        var file_path = req.files.image.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var file_extension = file_name.split('.')[1];
        if( !file_extension == 'png' && !file_extension == 'jpg')
        {
            res.status(200).send({message: 'Extension no valid.'});
        }
        else
        {
            Album.findByIdAndUpdate(albumId, {image: file_name }, (err, albumUpdated) => {
                if(!albumUpdated)
                {
                    res.status(404).send({message: 'Unable to update album image.'});
                }
                else
                {
                    res.status(200).send({album: albumUpdated});
                }
            });
        }
    }
    else
    {
        res.status(200).send({message: 'You have not uploaded any images.'});
    }
}

function getImageFile(req,res)
{
    var imageFile = req.params.imageFile;
    var path_file = './uploads/albums/'+imageFile;
    fs.exists(path_file, function(exists){
        if( exists )
        {
            res.sendFile(path.resolve(path_file));
        }
        else
        {
            res.status(404).send({message: 'Image not found'});
        }
    });

}
module.exports = {
    getAlbum,
    saveAlbum,
    getAlbums,
    updateAlbum,
    deleteAlbum, 
    uploadImage,
    getImageFile
}