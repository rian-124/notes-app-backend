class NotesHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postNoteHandler = this.postNoteHandler.bind(this);
    this.getNotesHandler = this.getNotesHandler.bind(this);
    this.getNoteByIdHandler = this.getNoteByIdHandler.bind(this);
    this.putNoteHandler = this.putNoteHandler.bind(this);
    this.deleteNoteHandler = this.deleteNoteHandler.bind(this);
  }

  async postNoteHandler(request, h) {
    this._validator.validateNotePayload(request.payload);
    const { title = 'untitled', body, tags } = request.payload;
    const { id: credentialsId } = request.auth.credentials;

    const noteId = await this._service.addNote({ title, body, tags, owner: credentialsId });

    const response = h.response({
      status: 'success',
      message: 'Catatan berhasil ditambahkan',
      data: {
        noteId,
      },
    });

    response.code(201);

    return response;
  }

  async getNotesHandler(request) {
    const { id: credentialsId } = request.auth.credentials;

    const notes = await this._service.getNotes(credentialsId);

    return {
      status: 'success',
      data: {
        notes,
      },
    };
  }

  async getNoteByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._service.verifyNoteOwner(id, credentialsId);
    const note = await this._service.getNoteById(id);

    return {
      status: 'success',
      data: {
        note,
      },
    };
  }

  async putNoteHandler(request) {
    this._validator.validateNotePayload(request.payload);
    const { id } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._service.verifyNoteOwner(id, credentialsId);
    await this._service.editNoteById(id, request.payload);

    return {
      status: 'success',
      message: 'Catatan berhasil diperbarui',
    };
  }

  async deleteNoteHandler(request) {
    const { id } = request.params;
    const { id: credentialsId } = request.auth.credentials;

    await this._service.verifyNoteOwner(id, credentialsId);
    await this._service.deleteNoteById(id);

    return {
      status: 'success',
      message: 'Catatan berhasil dihapus',
    };
  }
}

module.exports = NotesHandler;
