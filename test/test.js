const assert = require('assert')
const mongoose = require('mongoose')
const autoIncrement = require('..')

require('dotenv').config()

before(async function () {
  await mongoose.connect('mongodb://localhost:27017', {
    /* user: process.env.MONGO_INITDB_ROOT_USERNAME,
    pass: process.env.MONGO_INITDB_ROOT_PASSWORD, */
    autoCreate: true,
    dbName: 'test_auto_increment'
  })
  await autoIncrement.initialize(mongoose.connection)
})

after(async function () {
  await mongoose.connection.db.dropDatabase()
  await mongoose.connection.close()
})

afterEach(async function () {
  try {
    const userDeleted = await mongoose.connection.models.User?.collection.drop()
    if (userDeleted) {
      delete mongoose.connection.models.User
      identityDeleted = await mongoose.connection.models.IdentityCounter?.collection.drop()
    }
  } catch (_) {}
})

describe('mongoose-auto-increment', function () {
  it(`should increment the id field on save`, function () {
    (async function () {
      this.timeout(5000)
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })

      userSchema.plugin(autoIncrement.plugin, 'User')

      const User = mongoose.connection.model('User', userSchema)

      const user1 = await (new User({ name: 'Charlie', dept: 'Support' })).save()
      const user2 = await (new User({ name: 'Charlene', dept: 'Marketing' })).save()

      assert.strictEqual(user1.id, 0)
      assert.strictEqual(user2.id, 1)
    })()
  })

  it('should increment the specified field instead (Test 2)', function () {
    (async function () {
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'userId' })
      const User = connection.model('User', userSchema)
      const user1 = await (new User({ name: 'Charlie', dept: 'Support' })).save()
      const user2 = await (new User({ name: 'Charlene', dept: 'Marketing' })).save()

      assert.strictEqual(user1.userId, 0)
      assert.strictEqual(user2.userId, 1)
    })()
  })

  it('should start counting at specified number (Test 3)', function () {
    (async function () {
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      })
      userSchema.plugin(autoIncrement.plugin, { model: 'User', startAt: 3 })
      const User = mongoose.connection.model('User', userSchema)
      const user1 = await (new User({ name: 'Charlie', dept: 'Support' })).save()
      const user2 = await (new User({ name: 'Charlene', dept: 'Marketing' })).save()

      assert.strictEqual(user1.id, 3)
      assert.strictEqual(user2.id, 4)
    })()
  })

  it('should increment by the specified amount (Test 4)', function () {
    (async function () {
      // Arrange
      const userSchema = new mongoose.Schema({
        name: String,
        dept: String
      });

      assert.throws(() => userSchema.plugin(autoIncrement.plugin))

      /* (function () {
        userSchema.plugin(autoIncrement.plugin)
      }).should.throw(Error) */

      userSchema.plugin(autoIncrement.plugin, { model: 'User', incrementBy: 5 })
      const User = mongoose.connection.model('User', userSchema)
      const user1 = await (new User({ name: 'Charlie', dept: 'Support' })).save()
      const user2 = await (new User({ name: 'Charlene', dept: 'Marketing' })).save()

      assert.strictEqual(user1.id, 0)
      assert.strictEqual(user2.id, 5)

      /* // Act
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
        results.user1[0].should.have.property('id', 0)
        results.user2[0].should.have.property('id', 5)
        done()
      } */
    })()
  })

  describe('helper function', function () {
    it('nextCount should return the next count for the model and field (Test 5)', function () {
      (async function () {
        // Arrange
        const userSchema = new mongoose.Schema({
          name: String,
          dept: String
        })
        userSchema.plugin(autoIncrement.plugin, 'User')
        const User = mongoose.connection.model('User', userSchema)
        const user1 = new User({ name: 'Charlie', dept: 'Support' })
        const user2 = new User({ name: 'Charlene', dept: 'Marketing' })

        user1.nextCount((count) => {
          assert.strictEqual(count, 0)
        })

        await user1.save()

        assert.strictEqual(user1.id, 0)

        user2.nextCount((count) => {
          assert.strictEqual(count, 1)
        })

        await user2.save()

        assert.strictEqual(user2.id, 1)

        user2.nextCount(count => {
          assert.strictEqual(count, 2)
        })
      })()
    })

    it('resetCount should cause the count to reset as if there were no documents yet.', function () {
      (async function () {
        // Arrange
        const userSchema = new mongoose.Schema({
          name: String,
          dept: String
        })
        userSchema.plugin(autoIncrement.plugin, 'User')
        const User = mongoose.connection.model('User', userSchema)
        const user = new User({ name: 'Charlie', dept: 'Support' })

        await user.save()

        user.nextCount(count => {
          assert.strictEqual(count, 1)
        })

        user.resetCount(count => {
          assert.strictEqual(count, 0)
        })

        user.nextCount(count => {
          assert.strictEqual(count, 0)
        })
      })()
    })
  })
})

