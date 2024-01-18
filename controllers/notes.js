const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const notes = await Note.find({})
  response.json(notes)
})

notesRouter.get('/:id', async (request, response) => {
  const note = await Note.findById(request.params.id)
  if (note) {
    response.json(note)
  } else {
    response.status(404).end()
  }
})

// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0

//   return maxId + 1
// }

notesRouter.post('/', async (request, response) => {
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

  // note
  //   .save()
  //   .then(savedNote => savedNote.toJSON())
  //   .then(savedAndFormattedNote => {
  //     response.json(savedAndFormattedNote)
  //   })
  //   .catch(error => next(error))

  const savedNote = await note.save()
  response.json(savedNote)
})

notesRouter.delete('/:id', async (request, response) => {
  const { id } = request.params

  await Note.findByIdAndDelete(id)
  response.status(204).end()
})

notesRouter.put('/:id', async (request, response, next) => {
  const { id } = request.params
  const body = request.body

  const note = {
    content: body.content,
    important: body.important
  }

  const updateNote = await Note.findByIdAndUpdate(id, note, { new: true })
  response.json(updateNote)
})

module.exports = notesRouter
