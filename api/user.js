const accountTypes = require('../models/accountType')
const Email = require('./email.helper')
const modelUtil = require('../models/_util')
const request = require('request-promise-native')
const ts = modelUtil.addTimestamps
const uuid = require('uuid/v4')

// This file deals with sensitive user data. Therefore, error messages (which could contain that data)
//  are not included in any response to the front end.

module.exports = function (app, passport, db, isPremiumUser, isLoggedIn) {
  const route = route => `/api/user/${route}`

  const verifyCaptchaToken = (req) => {
    const token = req.body && req.body.captchaResponse
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject()
      }

      const postOptions = {
        method: 'POST',
        uri: 'https://www.google.com/recaptcha/api/siteverify',
        formData: {
          secret: process.env.RECAPTCHA_SECRET,
          response: token,
          remoteip: req.ip
        },
        json: true
      }

      request.post(postOptions).then((response) => {
        if (response.success) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }

  const captchaMiddleware = (req, res, next) => {
    if (req.body.email.endsWith('__TEST') && req.body.integration === true) {
      return next()
    }

    verifyCaptchaToken(req).then(() => {
      return next()
    }, () => {
      res.status(401).send('Captcha failed.')
    })
  }

  const getUserResponse = user => {
    return new Promise((resolve, reject) => {
      db.knex('users').where('id', user.id).first('account_type', 'email', 'verified').then(user => {
        const accountType = user['account_type']
        resolve({
          accountType: accountTypes[accountType],
          email: user.email,
          isPremium: isPremiumUser(accountType),
          verified: user.verified
        })
      }, err => {
        console.log(err)
        reject()
      })
    })
  }

  app.get(route('current'), isLoggedIn, (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    getUserResponse(req.user).then(response => {
      res.status(200).send(response)
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('signup'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-signup', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Signup failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send()
      })
    })(req, res, next)
  })

  app.post(route('login'), captchaMiddleware, (req, res, next) => {
    passport.authenticate('local-login', (err, user) => {
      if (err) {
        return next(err)
      }

      if (!user) {
        return res.status(401).send('Authentication failed.')
      }

      req.login(user, err => {
        if (err) {
          return next(err)
        }

        return res.status(200).send({
          isPremium: isPremiumUser(user['account_type']),
          verified: user.verified
        })
      })
    })(req, res, next)
  })

  app.post(route('demo-login'), (req, res, next) => {
    req.login(db.DemoUser, err => {
      if (err) {
        return next(err)
      }

      return res.status(200).send()
    })
  })

  app.post(route('send-verify-link'), (req, res, next) => {
    if (!req.user) {
      res.status(401).send('User not found.')
      return false
    }

    db.knex('users').where('id', req.user.id).first().then(user => {
      const key = user['verify_key']
      return new Email(
        [user.email],
        'Verify your account',
        'Thanks for signing up for an account with Edward. Use the link below to verify your email address:'
        `\n\n${process.env.BASE_URL}/auth#/verify/${encodeURIComponent(user.email)}/${key}`
      ).send()
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('verify'), (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(500).send('Email and reset key must be provided.')
      return
    }

    db.knex('users').where({
      email,
      verified: false,
      'verify_key': key
    }).first().then(user => {
      if (!user || !user['verify_key']) {
        res.status(400).send('Email address or verification key is incorrect.')
        return false
      }

      return db.knex('users').where('id', user.id).update(ts(db.knex, {
        verified: true,
        'verify_key': null
      }, true)).then(() => {
        req.login(user, err => {
          if (err) {
            console.error(err)
            res.status(500).send('An error occurred while logging in.')
            return false
          }

          return res.status(200).send()
        })
      })
    })
  })

  app.get(route('logout'), (req, res, next) => {
    req.logout()
    res.status(200).send()
  })

  app.post(route('email'), isLoggedIn, (req, res, next) => {
    const newEmail = req.body.email

    return db.knex('users').where('email', newEmail).first().then(existingUser => {
      if (existingUser) {
        res.status(500).send('This email address is unavailable.')
        return false
      }

      return (
        db.knex('users').where('id', req.user.id).update(ts(db.knex, {
          email: newEmail
        }, true))
      )
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  app.post(route('password'), isLoggedIn, (req, res, next) => {
    return modelUtil.getHash(req.body.password).then(hash => {
      return db.knex('users').where('id', req.user.id).update(ts(db.knex, {
        password: hash
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { oldAccountType, newAccountType }
  app.post(route('upgrade'), isLoggedIn, (req, res, next) => {
    const { oldAccountType, newAccountType } = req.body

    db.knex('users').where('id', req.user.id).first().then(user => {
      const typeNames = Object.values(accountTypes).map(type => type.name)
      if (!typeNames.includes(oldAccountType) || !typeNames.includes(newAccountType)) {
        throw new Error(`One of received account types is not valid. Received: ${oldAccountType}, ${newAccountType}`)
      }

      if (!user) {
        throw new Error('Current user was not found.')
      }

      if (user.account_type !== oldAccountType) {
        throw new Error(`Received oldAccountType does not match the user's actual account type.`)
      }

      return db.knex('users').where('id', req.user.id).update(ts(db.knex, {
        'account_type': newAccountType
      }, true))
    }).then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })


  // POST { email }
  app.post(route('send-reset-password-link'), (req, res, next) => {
    const email = req.body.email

    let guid
    db.knex('users').where('email', email).first().then(user => {
      if (!user) {
        throw new Error(`A user with the email address ${email} was not found.`)
      }

      guid = uuid()
      return modelUtil.getHash(guid)
    }).then(hash => {
      return db.knex('users').where('email', email).update(ts(db.knex, {
        'pass_reset_key': hash
      }, true))
    }).then(() => {
      return new Email(
        [email],
        'Reset your password',
        `A password reset has been requested for your Edward account with email ${email}.` +
        '\nIf you did not request a password reset, you may delete this email and take no further action.' +
        '\nIf you would like to reset your password, please visit the link below:' +
        `\n\n${process.env.BASE_URL}/auth#/reset/${encodeURIComponent(email)}/${guid}`
      ).send()
    })
    .then(() => {
      res.status(200).send()
    }, err => {
      console.error(err)
      res.status(500).send()
    })
  })

  // POST { email, key }
  app.post(route('authenticate-password-reset'), (req, res, next) => {
    const { email, key } = req.body

    if (!email || !key) {
      res.status(500).send('Email and reset key must be provided.')
      return
    }

    db.knex('users').where({
      email: email,
      'pass_reset_key': key
    }).first().then(user => {
      if (!user || !user['pass_reset_key']) {
        throw new Error('Email or password reset key is incorrect.')
      }

      req.login(user, err => {
        if (err) {
          console.error(err)
          res.status(500).send('Could not log in.')
          return false
        }

        db.knex('users').where('email', email).update(ts(db.knex, {
          'pass_reset_key': null
        }, true)).then(() => {
          res.status(200).send()
        }, err => {
          console.error(err)
          res.status(500).send()
        })
      })
    }).then(undefined, err => {
      console.error(err)
      res.status(500).send()
    })
  })
}
