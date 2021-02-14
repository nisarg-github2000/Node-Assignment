const express = require('express') 
const bodyParser = require('body-parser') 
const db = require('./queries') 
const app = express() 
const port = 3000 
const path = require('path')
const multer = require('multer'); 

let storage = multer.diskStorage({ 
    destination: (req, file, cb) => { 
        cb(null, './uploads/car_image');
    }, 
    filename: (req, file, cb) => { 
        //console.log(file); 
        var filetype = ''; 
        if(file.mimetype === 'image/gif') { 
            filetype = 'gif'; 
        } 
        if(file.mimetype === 'image/png') { 
            filetype = 'png'; 
        } 
        if(file.mimetype === 'image/jpeg') { 
            filetype = 'jpg'; 
        } 
        cb(null, 'image-' + Date.now() + '.' + filetype); 
    } 
}); 
const upload = multer({ storage: storage });

app.use(bodyParser.json()) 
app.use( 
    bodyParser.urlencoded({ 
        extended: true, 
    }) 
) 

app.get('/', (request, response) => { 
    response.json({ info: 'Node.js, Express, and Postgres API' }) 
}) 
app.get('/cars', db.getCars) 
app.get('/cars/:id', db.getCarById)
app.post('/cars', db.createCar)
app.put('/cars/:id', db.updateCar) 
app.delete('/cars/:id', db.deleteCar)
app.post('/upload/:id', upload.single('carImage'), db.addCarImage)
app.get('/images/:image',(request,response)=>{
    response.status(200).sendFile(path.resolve('./uploads/car_image/'+request.params.image))
})

app.listen(port, () => { 
    console.log(`App running on port ${port}.`) 
})