require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const Note = require('./models/note')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))

const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

app.use(requestLogger)

const url = process.env.MONGODB_URI

console.log('connecting to', url);

mongoose.connect(url)
.then(result => {
    console.log('connected to MongoDB');
})
.catch((error) => {
    console.log('error connecting to MongoDB', error.message);
})

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response, next) => {

    Note.findById(request.params.id).then(note => {
        if (note) {
            response.json(note)
        } else {
            response.status(404).end()
        }
    }).catch(err => next(err))
})

app.delete('/api/notes/:id', (request, response, next) => {
    const { id } = request.params

    Note.findByIdAndDelete(id).then(result => {
        response.status(204).end()
    }).catch(error => next(error))
})

// const generateId = () => {
//     const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0

//     return maxId + 1
// }

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    if (body.content === undefined) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date()
    })
    console.log(note);

    note
        .save()
        .then(savedNote => savedNote.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        })
    .catch(error => next(error))
})

app.put('/api/notes/:id', (request, response, next) => {
    const { id } = request.params
    const body = request.body

    const notaActualizada = {
        content: body.content,
        important: body.important
    }

    Note.findByIdAndUpdate(id, notaActualizada, { new: true })
    .then(updateNote => {
        response.json(updateNote)
    }).catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message);

    if(error.name === 'CastError') {
        return response.status(400).send({ error: 'id used is malformed' })
    } else if (error.name === 'ValidationError' ){
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})