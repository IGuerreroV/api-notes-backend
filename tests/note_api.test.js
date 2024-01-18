const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')

const Note = require('../models/note')

beforeEach(async () => {
  // 1. Elimina todas las notas existentes en la base de datos:
  await Note.deleteMany({})

  // 2. Crea un arreglo de objetos de nota a partir de los datos iniciales:
  const noteObjects = helper.initialNotes.map(note => new Note(note))

  // 3. Crea un arreglo de promesas para guardar cada nota en la base de datos:
  const promiseArray = noteObjects.map(note => note.save())

  // 4. Espera a que todas las promesas de guardado se resuelvan:
  await Promise.all(promiseArray)
})

const api = supertest(app)

test('notes are returned as json', async () => {
  await api
    .get('/api/notes')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all notes are returned', async () => {
  const response = await api.get('/api/notes')

  expect(response.body).toHaveLength(helper.initialNotes.length)
})

test('a specific note is within the returned notes', async () => {
  const response = await api.get('/api/notes')

  const contents = response.body.map(r => r.content)
  expect(contents).toContain(
    'Browser can execute only Javascript'
  )
})

test('a valid note can be added', async () => {
  const newNote = {
    content: 'async/await simplifies making async calls',
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(200)
    .expect('Content-Type', /application\/json/)

  const notesAtEnd = await helper.notesInDb()
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)

  const contents = notesAtEnd.map(r => r.content)
  expect(contents).toContain(
    'async/await simplifies making async calls'
  )
})

test('note without content is not added', async () => {
  const newNote = {
    important: true
  }

  await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

  const notesAtEnd = await helper.notesInDb()

  expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

test('a specific note can be viewed', async () => {
  // Obtiene las notas existentes en la base de datos al inicio del test
  const notesAtStart = await helper.notesInDb()

  // Toma la primera nota para la prueba
  const noteToView = notesAtStart[0]

  // Realiza una petición GET a la API para obtener la nota específica
  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    // Verifica que la respuesta sea exitosa (código 200)
    .expect(200)
    // Verifica que el tipo de contenido sea JSON
    .expect('Content-Type', /application\/json/)

  // Procesa la nota original para compararla con la respuesta de la API
  const processedNoteToView = JSON.parse(JSON.stringify(noteToView))

  // Comprueba que la respuesta de la API coincida con la nota original
  expect(resultNote.body).toEqual(processedNoteToView)
})

test('a note can be deleted', async () => {
  // Obtiene las notas existentes en la base de datos al inicio del test
  const notesAtStart = await helper.notesInDb()

  // Toma la primera nota para eliminarla
  const noteToDelete = notesAtStart[0]

  // Realiza una petición DELETE a la API para eliminar la nota
  await api
    .delete(`/api/notes/${noteToDelete.id}`)
    // Verifica que la respuesta sea de tipo "sin contenido" (código 204)
    .expect(204)

  // Obtiene las notas existentes en la base de datos después de la eliminación
  const notesAtEnd = await helper.notesInDb()

  // Comprueba que haya una nota menos en la base de datos
  expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

  // Extrae los contenidos de las notas restantes
  const contents = notesAtEnd.map(r => r.content)

  // Comprueba que el contenido de la nota eliminada ya no esté presente
  expect(contents).not.toContain(noteToDelete.content)
})

afterAll(() => {
  mongoose.connection.close()
})
