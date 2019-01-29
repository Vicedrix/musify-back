'use strict';

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var Artist = require('../models/artist');
var Album = require('../models/album');
var Song = require('../models/song');

function getSong(req, res)
{
    var songId = req.params.id;

    Song.findById(songId).populate({path: 'album'})
}

function saveSong(req, res)
{
    var song = new Song();
    var params = req.body;

    song.numer = params.number;
    song.name = params.name;
    song.duration = params.duration;
    song.file = null;
    song.album = params.album;

    song.save((err, songStored) => {
        if(err)
        {
            res.status(500).send({message: 'The song could not be saved.', err: err});
        }
        else
        {
            if(!songStored)
            {
                res.status(404).send({message: 'The song could not be saved.'});
            }
            else
            {
                res.status(200).send({song: songStored});
            }
        }
    });
}

function getSong(req, res)
{
    var songId = req.params.id;
    Song.findById(songId).populate({path: 'album'}).exec((err, song)=>{
        if(err)
        {
            res.status(500).send({message: 'Error finding the song.'});
        }
        else
        {
            if(!song)
            {
                res.status(404).send({message: 'Song not found.'});
            }
            else
            {
                res.status(200).send({song});
            }
        }
    });
}

function getSongs(req, res)
{
    var params = req.params;
    var albumId = params.album;

    var find;
    if(!albumId)
    {
        find = Song.find({}).sort('number');
    }
    else
    {
        find = Song.find({album: albumId}).sort('number');
    }

    find.populate({
        path: 'album',
        populate: {
            path: 'artist',
            model: 'Artist'
        }
    }).exec((err, songs)=>{
        if(err)
        {
            res.status(500).send({message: 'Error finding the song.'});
        }
        else
        {
            if(!songs)
            {
                res.status(404).send({message: 'Songs not found.'});
            }
            else
            {
                res.status(200).send({songs});
            }
        }
    });
}

function deleteSong(req, res)
{
    var songId = req.params.id;

    Song.findByIdAndRemove(songId, (err,songRemoved)=>{
        if(err)
        {
            res.status(500).send({message: 'Server error.'});
        }
        else
        {
            if(!songRemoved)
            {
                res.status(404).send({message: 'Song not found.'});
            }
            else
            {
                res.status(200).send({songRemoved});
            }
        }
    });
}



function updateSong(req, res)
{
    var songId = req.params.id;
    var update = req.body;

    Song.findByIdAndUpdate(songId, update, (err, songUpdated)=>{
        if(err)
        {
            res.status(500).send({message: 'Error updating the song.'});
        }
        else
        {
            if(!songUpdated)
            {
                res.status(404).send({message: 'The song no exist.'});
            }
            else
            {
                res.status(200).send({songUpdated});
            }
        }
    });
}

function uploadFile(req, res)
{
    var songId = req.params.id;
    var file_name = 'Not uploaded.';
    if(req.files)
    {
        console.log(req.files.song.type);
        var file_path = req.files.song.path;
        var file_split = file_path.split('/');
        var file_name = file_split[2];
        var file_extension = file_name.split('.')[1];
        if( file_extension != 'mp3')
        {
            res.status(200).send({message: 'Extension not valid: ' + file_extension});
        }
        else
        {
            Song.findByIdAndUpdate(songId, {file: file_name}, (err, songUpdated) => {
                if(err)
                {
                    res.status(500).send({message: 'Server error.'});
                }
                else
                {
                    if(!songUpdated)
                    {
                        res.status(404).send({message: 'Song not updated.'});
                    }
                    else
                    {
                        res.status(200).send({album: songUpdated});
                    }
                }
                
            });
        }
    }
    else
    {
        res.status(200).send({message: 'You have not uploaded any songs.'});
    }
}

function getSongFile(req,res)
{
    var songFile = req.params.songFile;
    var path_file = './uploads/songs/'+songFile;
    console.log(songFile);
    fs.exists(path_file, function(exists){
        if( exists )
        {
            res.sendFile(path.resolve(path_file));
        }
        else
        {
            res.status(404).send({message: 'Song not found.'});
        }
    });
}

module.exports = 
{
    getSong,
    saveSong,
    getSongs,
    updateSong,
    deleteSong,
    uploadFile,
    getSongFile
}