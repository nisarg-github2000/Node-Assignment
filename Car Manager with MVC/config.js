module.exports = {
    dbConnection: {
        user: "postgres",
        password: "postgresql@2000",
        host: "localhost",
        database: "carDB",
        port: 5432
    },
    server: {
        PORT: 3000,
    },
    jwtConfig: {
        algorithm: "HS256",
        secretKey: "cars@12345",
    },
    imagePath: 'http://localhost:3000/images/',
    storagePath: './public/images'

};