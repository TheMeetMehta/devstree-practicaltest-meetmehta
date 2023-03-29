const express = require('express')
require('./db/mongoose')
const app = express()
const userRouter = require('./routers/users')
const port = process.env.PORT || 3000
app.use(express.json())
app.use(userRouter)
app.get('/', async (req, res) => {
    try {
        await task.save()
        res.status(200).send('Welcome to the task api')
    } catch (e) {
        res.status(400).send(e)
    }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))