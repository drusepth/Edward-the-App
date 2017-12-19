const difference = require('lodash/difference')

module.exports = {
  // This does not behave reliably for arrays that have duplicated elements.
  // For the purposes of this app, that's not a concern.
  containSameElements: (arr1, arr2) => {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return false
    }

    if (arr1.length !== arr2.length) {
      return false
    }

    const diff = [...difference(arr1, arr2), ...difference(arr2, arr1)]

    return diff.length === 0
  },
  getDocId: (guid, knex) => {
    return knex.raw('(SELECT id FROM documents WHERE guid = ?)', guid)
  },
  getChapId: (guid, knex) => {
    return knex.raw('(SELECT id FROM chapters WHERE guid = ?)', guid)
  },
  upsert: (knex, table, { where, insert, update, getUpdate }) => {
    if (!(knex && table && where && insert && (update || getUpdate))) {
      throw new Error('Utilities.upsert was called without all the required arguments.')
    }

    return knex(table).where(where).first().then(result => {
      if (!result) {
        return knex(table).insert(insert).returning('id').then(([id]) => id)
      }

      if (!update) {
        update = getUpdate(result)
      }

      if (update) {
        return knex(table).where(where).update(update).then(() => result.id)
      }

      return Promise.resolve(result.id)
    })
  }
}
