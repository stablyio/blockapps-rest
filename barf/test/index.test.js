const RestStatus = require('http-status-codes')
const { rest } = require('../index')
const { assert } = require('../assert')
const util = require('../util')
const fsUtil = require('../fsUtil')

const { cwd, usc } = util

const config = fsUtil.getYaml(`${cwd}/barf/test/config.yaml`)
const password = '1234'

describe('contracts', () => {
  let admin
  const options = { config }

  before(async () => {
    const uid = util.uid()
    const username = `admin_${uid}`
    const args = { username, password }
    const { user } = await rest.createUser(args, options)
    admin = user
  })

  it('create contract - async', async () => {
    const uid = util.uid()
    const contractDef = createTestContract(uid)
    const args = {}
    const asyncOptions = { config, isAsync: true }
    const { hash } = await rest.createContract(admin, contractDef, args, asyncOptions)
    assert.isOk(util.isHash(hash), 'hash')
  })

  it('create contract - sync', async () => {
    const uid = util.uid()
    const contractDef = createTestContract(uid)
    const args = {}
    const contract = await rest.createContract(admin, contractDef, args, options)
    assert.equal(contract.name, contractDef.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
  })

  it('create contract - sync - detailed', async () => {
    const uid = util.uid()
    const contractDef = createTestContract(uid)
    const args = {}
    options.isDetailed = true
    const contract = await rest.createContract(admin, contractDef, args, options)
    assert.equal(contract.name, contractDef.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
    assert.isDefined(contract.src, 'src')
    assert.isDefined(contract.bin, 'bin')
    assert.isDefined(contract.codeHash, 'codeHash')
    assert.isDefined(contract.chainId, 'chainId')
  })

  it('create contract - sync - BAD_REQUEST', async () => {
    const uid = util.uid()
    const contractDef = createTestContractSyntaxError(uid)
    const args = {}
    await assert.restStatus(async () => {
      return await rest.createContract(admin, contractDef, args, options)
    }, RestStatus.BAD_REQUEST, /line (?=., column)/)
  })

  it('create contract - constructor args', async () => {
    const uid = util.uid()
    const contractDef = createTestContractConstructorArgs(uid)
    const args = { arg_uint: 1234 }
    const contract = await rest.createContract(admin, contractDef, usc(args), options)
    assert.equal(contract.name, contractDef.name, 'name')
    assert.isOk(util.isAddress(contract.address), 'address')
  })

  it('create contract - constructor args missing - BAD_REQUEST', async () => {
    const uid = util.uid()
    const contractDef = createTestContractConstructorArgs(uid)
    const args = {}
    await assert.restStatus(async () => {
      return await rest.createContract(admin, contractDef, args, options)
    }, RestStatus.BAD_REQUEST, /argument names don't match:/)
  })

})

describe('user', () => {
  const options = { config }

  it('get all users', async () => {
    const args = {}
    const result = await rest.getUsers(args, options)
    assert.equal(Array.isArray(result), true, 'return value is an array')
  })

  it('create user', async () => {
    const uid = util.uid()
    const username = `user_${uid}`
    const args = { username, password }
    const options = { config }
    const { address, user } = await rest.createUser(args, options)
    const isAddress = util.isAddress(address)
    assert.equal(isAddress, true, 'user is valid eth address')
    assert.equal(user.username, args.username, 'username')
    assert.equal(user.password, args.password, 'password')
    assert.equal(user.address, address, 'address')
  })

  it('get user', async () => {
    // create a new user
    const uid = util.uid()
    const username = `user_${uid}`
    const args = { username, password }
    const { user } = await rest.createUser(args, options)
    // get the user
    const args2 = { username }
    const address = await rest.getUser(args2, options)
    assert.equal(address, user.address, 'user is valid eth address')
  })
})

describe('include rest', () => {
  it('testAsync', async () => {
    const args = { a: 'b' }
    const result = await rest.testAsync(args)
    assert.deepEqual(result, args, 'test async')
  })

  it('testPromise', async () => {
    const args = { success: true }
    const result = await rest.testPromise(args)
    assert.deepEqual(result, args, 'test promise')

    args.success = false
    try {
      await rest.testPromise(args)
    } catch (err) {
      assert.deepEqual(err, args, 'test promise')
    }
  })
})

function createTestContract(uid) {
  const name = `TestContract_${uid}`
  const source = `contract ${name} { }`
  return { name, source }
}

function createTestContractSyntaxError(uid) {
  const name = `TestContract_${uid}`
  const source = `contract ${name} { zzz zzz }`
  return { name, source }
}

function createTestContractConstructorArgs(uid) {
  const name = `TestContract_${uid}`
  const source = `
contract ${name} {
  constructor(uint _arg_uint) {
  }   
}
`
  return { name, source }
}
