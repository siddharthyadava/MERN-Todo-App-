const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    isCompleted: {
        type: Boolean,
        require: true,
        default: false
    },
    createdBy: {
        ref: 'users',
        type: mongoose.Schema.objectId,
    }
},{timestamps: true})

const todoModel = mongoose.model('todo', todoSchema)