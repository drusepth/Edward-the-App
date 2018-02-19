const accountTypes = require('../models/accountType')
const Email = require('./email.helper')
const { getUsersOverLimit } = require('./space-used.helper')

module.exports = function (app, passport, db, isAdmin) {
  const route = route => `/api/admin/${route}`

  const countUsersQuery = accountType =>
    db.knex('users').count('id as count').where('account_type', accountType).then(([{ count }]) => count)

  // Emails to all users

  app.get(route('emails/csv'), isAdmin, (req, res, next) => {
    db.knex('users').where('verified', true).select('email').then(users => {
      const emails = users.map(user => user.email).join('\n')

      res.attachment('users.csv')
      res.set('Content-Type', 'application/octet-stream')
      res.send(emails)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/delete'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).del().then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/new'), isAdmin, (req, res, next) => {
    const { content, subject } = req.body

    db.knex('all_user_emails').insert({
      content,
      subject
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('emails/pending'), isAdmin, (req, res, next) => {
    db.knex('all_user_emails').select().then(emails => {
      res.status(200).send(emails)
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/review'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).first().then(({ subject, content }) => {
      return new Email([process.env.ADMIN_EMAIL], subject,
        `${content}\n-------\nTo send, visit ${process.env.BASE_URL}/admin#/send-email/${id}`
      ).send()
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.post(route('emails/send'), isAdmin, (req, res, next) => {
    const { id } = req.body

    db.knex('all_user_emails').where('id', id).first().then(({ content, subject }) => {
      if (!content || !subject) {
        throw new Error('Email not found.')
      }

      return new Email(['all_users@edwardtheapp.com'], subject, content).send()
    }).then(() => {
      return db.knex('all_user_emails').where('id', id).del()
    }).then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  // Miscellaneous

  app.post(route('delete-unverified'), isAdmin, (req, res, next) => {
    const cutoffDate = db.knex.raw(`('now'::timestamp - '3 days'::interval)`)
    db.knex('users').where('verified', false).andWhere('created_at', '<', cutoffDate).del().then(() => {
      res.status(200).send()
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('space-overages'), isAdmin, (req, res, next) => {
    const premiumsQuery = getUsersOverLimit(accountTypes.PREMIUM.name, 21000000)
    const goldsQuery = getUsersOverLimit(accountTypes.GOLD.name, 263000000)
    Promise.all([premiumsQuery, goldsQuery]).then(([premiums, golds]) => {
      res.status(200).send({ premiums, golds })
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('total-users'), isAdmin, (req, res, next) => {
    Promise.all([
      countUsersQuery(accountTypes.DEMO.name),
      countUsersQuery(accountTypes.LIMITED.name),
      countUsersQuery(accountTypes.PREMIUM.name),
      countUsersQuery(accountTypes.GOLD.name),
      countUsersQuery(accountTypes.ADMIN.name)
    ]).then(([demo, limited, premium, gold, admin]) => {
      res.status(200).send({ demo, limited, premium, gold, admin })
    }, err => {
      res.status(500).send(err)
    })
  })

  app.get(route('unverified-users'), isAdmin, (req, res, next) => {
    db.knex('users').where('verified', false).select().limit(150).then(users => {
      res.status(200).send(users)
    }, err => {
      res.status(500).send(err)
    })
  })
}
