const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const { mapSongDBToModel } = require('../../utils/songs/mapper');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Failed to add Song.');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows.map(mapSongDBToModel);
  }

  async getSongsByTitleAndPerformer(title, performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE lower(title) LIKE lower($1) AND lower(performer) LIKE lower($2)',
      values: [`%${title}%`, `%${performer}%`],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapSongDBToModel);
  }

  async getSongsByTitle(title) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE lower(title) like $1',
      values: [`%${title}%`],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapSongDBToModel);
  }

  async getSongsByPerformer(performer) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE lower(performer) like $1',
      values: [`%${performer}%`],
    };

    const result = await this._pool.query(query);

    return result.rows.map(mapSongDBToModel);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Song is not found.');
    }

    return result.rows.map(mapSongDBToModel)[0];
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to update song. Id\'s not found.');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Failed to delete Song. Id\'s not found.');
    }
  }
}

module.exports = SongsService;
