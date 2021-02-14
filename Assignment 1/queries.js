const Pool = require('pg').Pool 
const pool = new Pool({ 
user: 'postgres', 
host: 'localhost', 
database: 'postgres', 
password: 'postgresql@2000', 
port: 5432, 
}) 


const getUsers = (request, response) => { 
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => { 
    if (error) { 
        throw error 
    } 
    response.status(200).json(results.rows) 
    }) 
} 


const getUserById = (request, response) => { 
    const id = parseInt(request.params.id) 

    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => { 
    if (error) { 
        throw error 
    } 
    response.status(200).json(results.rows) 
    }) 
} 


const createUser = (request, response) => { 
    let username = request.body.username; 
    //pool.query('INSERT INTO users (username, email) VALUES ($1, $2)', [name, email], (error, results) => { 
    pool.query('INSERT INTO users (username) VALUES ($1)', [username], (error, results) => { 
    if (error) { 
        throw error 
    } 
    response.status(201).send(`User added successfully`) 
    }) 
}


const updateUser = (request, response) => { 
    const id = parseInt(request.params.id) 
    let username = request.body.username; 
        
    pool.query( 
        'UPDATE users SET username = $1 WHERE id = $2', 
        [username, id], 
        (error, results) => { 
        if (error) { 
            throw error 
        } 
        response.status(200).send(`User modified with ID: ${id}`) 
        } 
    ) 
} 
        
        
        
const deleteUser = (request, response) => { 
    const id = parseInt(request.params.id) 
        
    pool.query('DELETE FROM users WHERE id = $1', [id], (error, results) => { 
    if (error) { 
        throw error 
    } 
    response.status(200).send(`User deleted with ID: ${id}`) 
    }) 
}

module.exports = { 
    getUsers, 
    getUserById, 
    createUser,
    updateUser, 
    deleteUser
}