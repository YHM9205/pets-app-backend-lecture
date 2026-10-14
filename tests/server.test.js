const assert = require('node:assert/strict')
const { after, before, test } = require('node:test')
const { app, checkIfValidId } = require('../server')

let server
let baseUrl

before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve())
    })
})

function runMiddleware(id) {
    const req = { params: { id } }
    const response = {
        statusCode: 200,
        body: undefined,
        status(code) {
            this.statusCode = code
            return this
        },
        json(body) {
            this.body = body
            return this
        }
    }
    let nextCalled = false

    checkIfValidId(req, response, () => {
        nextCalled = true
    })

    return { response, nextCalled }
}

async function request(path, method = 'GET', body) {
    const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined
    })
    return {
        status: response.status,
        body: await response.json()
    }
}

test('valid MongoDB ObjectId passes to the next middleware', () => {
    const { response, nextCalled } = runMiddleware('507f1f77bcf86cd799439011')

    assert.equal(nextCalled, true)
    assert.equal(response.statusCode, 200)
    assert.equal(response.body, undefined)
})

test('invalid MongoDB ObjectId returns 400 and stops the middleware chain', () => {
    const { response, nextCalled } = runMiddleware('not-an-object-id')

    assert.equal(nextCalled, false)
    assert.equal(response.statusCode, 400)
    assert.deepEqual(response.body, { message: 'Invalid pet ID' })
})

test('rejects ObjectId-like values that are not 24-character hex strings', () => {
    for (const id of ['123456789012', '507f1f77bcf86cd79943901g', '']) {
        const { response, nextCalled } = runMiddleware(id)

        assert.equal(nextCalled, false, `expected ${JSON.stringify(id)} to be rejected`)
        assert.equal(response.statusCode, 400)
    }
})

test('GET, PUT, and DELETE pet-by-ID routes reject invalid IDs before reaching CRUD logic', async (t) => {
    for (const [method, body] of [
        ['GET', undefined],
        ['PUT', { name: 'Updated', age: 2, breed: 'Test' }],
        ['DELETE', undefined]
    ]) {
        await t.test(`${method} /pets/:id`, async () => {
            const result = await request('/pets/not-an-object-id', method, body)

            assert.equal(result.status, 400)
            assert.deepEqual(result.body, { message: 'Invalid pet ID' })
        })
    }
})

test('root route remains available without an ID parameter', async () => {
    const result = await request('/')

    assert.equal(result.status, 200)
    assert.equal(result.body, 'Pets server is running 🐾')
})
