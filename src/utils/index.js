/* eslint-disable camelcase */

const mapDBToModel = ({ id, title, body, tags, created_at, update_at }) => ({
  id,
  title,
  body,
  tags,
  createdAt: created_at,
  updateAt: update_at,
});

module.exports = { mapDBToModel };
