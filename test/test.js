const async = require('async')
const should = require('chai').should()
const mongoose = require('mongoose')
const autoIncrement = require('..')
let connection

before(function (done) {
  connection = mongoose.createConnection('mongodb://127.0.0.1/mongoose-auto-increment-test')
  connection.on('error', console.error.bind(console))
  connection.once('open', function () {
    autoIncrement.initialize(connection)
    done()
  })
})

after(function (done) {
  connection.db.dropDatabase(function (err) {
    if (err) return done(err)
    connection.close(done)
  })
})

afterEach(function (done) {
  connection.model('User').collection.drop(function () {
    delete connection.models.User
    connection.model('IdentityCounter').collection.drop(done)
  })
})

describe('mongoose-auto-increment', function () {
  it('should increment the _id field on save', function (done) {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement.plugin, 'User')
    const User = connection.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    // Act
    async.series({
      user1: function (cb) {
        user1.save(cb)
      },
      user2: function (cb) {
        user2.save(cb)
      }
    }, assert)

    // Assert
    function assert (err, results) {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 0)
      results.user2[0].should.have.property('_id', 1)
      done()
    }
  })

  it('should increment the specified field instead (Test 2)', function (done) {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId' })
    const User = connection.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    // Act
    async.series({
      user1: function (cb) {
        user1.save(cb)
      },
      user2: function (cb) {
        user2.save(cb)
      }
    }, assert)

    // Assert
    function assert (err, results) {
      should.not.exist(err)
      results.user1[0].should.have.property('userId', 0)
      results.user2[0].should.have.property('userId', 1)
      done()
    }
  })

  it('should start counting at specified number (Test 3)', function (done) {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    })
    userSchema.plugin(autoIncrement.plugin, { model: 'User', startAt: 3 })
    const User = connection.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    // Act
    async.series({
      user1: function (cb) {
        user1.save(cb)
      },
      user2: function (cb) {
        user2.save(cb)
      }
    }, assert)

    // Assert
    function assert (err, results) {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 3)
      results.user2[0].should.have.property('_id', 4)
      done()
    }
  })

  it('should increment by the specified amount (Test 4)', function (done) {
    // Arrange
    const userSchema = new mongoose.Schema({
      name: String,
      dept: String
    });

    (function () {
      userSchema.plugin(autoIncrement.plugin)
    }).should.throw(Error)

    userSchema.plugin(autoIncrement.plugin, { model: 'User', incrementBy: 5 })
    const User = connection.model('User', userSchema)
    const user1 = new User({ name: 'Charlie', dept: 'Support' })
    const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

    // Act
    async.series({
      user1: function (cb) {
        user1.save(cb)
      },
      user2: function (cb) {
        user2.save(cb)
      }
    }, assert)

    // Assert
    function assert (err, results) {
      should.not.exist(err)
      results.user1[0].should.have.property('_id', 0)
      results.user2[0].should.have.property('_id', 5)
      done()
    }
  })

  describe('helper function', function () {
    it('nextCount should return the next count for the model and field (Test 5)', function (done) {
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement.plugin, 'User')
      const User = connection.model('User', userSchema)
      const user1 = new User({ name: 'Charlie', dept: 'Support' })
      const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

      // Act
      async.series({
        count1: function (cb) {
          user1.nextCount(cb)
        },
        user1: function (cb) {
          user1.save(cb)
        },
        count2: function (cb) {
          user1.nextCount(cb)
        },
        user2: function (cb) {
          user2.save(cb)
        },
        count3: function (cb) {
          user2.nextCount(cb)
        }
      }, assert)

      // Assert
      function assert (err, results) {
        should.not.exist(err)
        results.count1.should.equal(0)
        results.user1[0].should.have.property('_id', 0)
        results.count2.should.equal(1)
        results.user2[0].should.have.property('_id', 1)
        results.count3.should.equal(2)
        done()
      }
    })

    it('resetCount should cause the count to reset as if there were no documents yet.', function (done) {
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement.plugin, 'User')
      const User = connection.model('User', userSchema)
      const user = new User({ name: 'Charlie', dept: 'Support' })

      // Act
      async.series({
        user: function (cb) {
          user.save(cb)
        },
        count1: function (cb) {
          user.nextCount(cb)
        },
        reset: function (cb) {
          user.resetCount(cb)
        },
        count2: function (cb) {
          user.nextCount(cb)
        }
      }, assert)

      // Assert
      function assert (err, results) {
        should.not.exist(err)
        results.user[0].should.have.property('_id', 0)
        results.count1.should.equal(1)
        results.reset.should.equal(0)
        results.count2.should.equal(0)
        done()
      }
    })
  })
})
