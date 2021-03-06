const responseHandler = require('../../utils/catchError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title = 'untitled', year, performer, genre, duration, albumId,
      } = request.payload;
      const songId = await this._service.addSong({
        title, year, performer, genre, duration, albumId,
      });
      const response = h.response({
        status: 'success',
        message: 'Song added successfully.',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      return responseHandler(error, h);
    }
  }

  async getSongsHandler(request) {
    const { title, performer } = request.query;

    let songs;
    if (undefined !== title && undefined !== performer) {
      songs = await this._service.getSongsByTitleAndPerformer(title, performer);
    } else if (undefined !== title) {
      songs = await this._service.getSongsByTitle(title);
    } else if (undefined !== performer) {
      songs = await this._service.getSongsByPerformer(performer);
    } else {
      songs = await this._service.getSongs();
    }

    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      return responseHandler(error, h);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const {
        title, year, performer, genre, duration, albumId,
      } = request.payload;
      const { id } = request.params;
      await this._service.editSongById(id, {
        title, year, performer, genre, duration, albumId,
      });
      return {
        status: 'success',
        message: 'Song updated successfully.',
      };
    } catch (error) {
      return responseHandler(error, h);
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);
      return {
        status: 'success',
        message: 'Song deleted successfully.',
      };
    } catch (error) {
      return responseHandler(error, h);
    }
  }
}

module.exports = SongsHandler;
