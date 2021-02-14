const fs = require('fs')
const Pool = require('pg').Pool 
const pool = new Pool({ 
    user: 'postgres', 
    host: 'localhost', 
    database: 'carDB', 
    password: 'postgresql@2000', 
    port: 5432, 
}) 


const getCars = async (request, response) => { 
    const stmt = 'SELECT car.id as "carId" ,car."Name" as "carName" , make."makeName" as “makeName” , model."modelName" as “modelName” from car left join make on car.makeid = make.id left join model on car.modelid = model.id ORDER BY car.id' ;
    pool.query(stmt, async(error, result) => {
        if (error) {
            throw error;
        }
        let carDetails = result.rows
        result = await pool.query('SELECT carid ,imagename FROM carimage')
        if(result.rowCount > 0){
            let images = result.rows;
            carDetails.forEach(car => {
                let carImageDisplay = []
                images.filter(img => {
                    if(img.carid == car.carId)
                        carImageDisplay.push({image:`${request.protocol}://${request.get('host')}/images/${img.imagename}`})
                })
                car.images = carImageDisplay
            });
        }
        response.status(200).json(carDetails)
    })
} 


const getCarById = (request, response) => { 
    const id = parseInt(request.params.id) 

    pool.query('SELECT car."Name" as "carName", make."makeName" as "makeName", model."modelName" as "modelName" , carimage."imagename" as "imageName" from car left join make on car.makeid = make.id left join model on car.modelid = model.id left join carimage on car.id = carimage.carid where car.id=$1', [id], (error, results) => { 
    if (error) { 
        throw error 
    } 
    if (results.rowCount > 0)
            response.status(200).json(results.rows)
    else
            response.status(200).json({ info: 'No car with id:' + id }) 
    }) 
} 

const createCar = async (request, response) => { 
    let Name = request.body.Name;
    let makeName = request.body.makeName;
    let modelName = request.body.modelName; 
    
    if (await carExists(Name))
        response.status(200).json({ info: "Car already exists" })
    else {
        let modelId = await getCarModel(modelName)
        let makeId = await getCarMake(makeName)
        pool.query('INSERT INTO car ("Name",makeid,modelid) VALUES ($1,$2,$3) RETURNING id', [Name, makeId, modelId], (error, result) => {
            response.status(200).json(`Car registerd with ID:${result.rows[0].id}`)
        })
    } 
}


const updateCar = async (request, response) => { 
    const id = parseInt(request.params.id) 
    let Name = request.body.Name; 
    let makeName = request.body.makeName;
    let modelName = request.body.modelName;
     
    let result = await pool.query('SELECT id FROM car WHERE id=$1', [id])
    if (result.rowCount > 0) {
            let modelId = await getCarModel(modelName)
            let makeId = await getCarMake(makeName)
            pool.query('UPDATE car SET "Name"=$1, makeid=$2, modelid=$3 WHERE id=$4', [Name, makeId, modelId, id])
                .then(result => {
                    if (result.rowCount > 0)
                        response.status(200).json({ info: "Car updated successfully" })
                    else
                        response.status(200).json({ info: "Update failed" })
                })
        
    } else {
        response.status(200).json({ info: `No car with id:${id}` })
    }
} 
        
        
        
const deleteCar = (request, response) => { 
    const id = parseInt(request.params.id) 
   
    pool.query('DELETE FROM car WHERE id = $1', [id], (error, results) => { 
    if (error) { 
        throw error 
    } 
    response.status(200).send(`Car deleted with ID: ${id}`) 
    }) 
}

const addCarImage = async (request, response, next) => { 

    const id = parseInt(request.params.id); 
    if (!request.file) { 
        response.status(500); 
        return next(err); 
    } 
    
    let result = await pool.query('SELECT id FROM car WHERE id=$1', [id])
    if (result.rowCount > 0) {
        let imageName = request.file.filename
        // let date_obj = new Date();
        // let date = ("0" + date_obj.getDate()).slice(-2);
        // let month = ("0" + (date_obj.getMonth() + 1)).slice(-2);
        // let year = date_obj.getFullYear();
        // let createdDate = year.toString() + "-" + month + "-" + date;

        pool.query('INSERT INTO carimage(imagename, createddate, carid) VALUES ($1,$2,$3)', [imageName, new Date().toISOString(), id])
            .then(result => {
                response.status(200).json({ info: "Image Uploaded Successfull!" })
            })
            .catch(error => {
                fs.unlink(request.file.path,(err)=>{if(err) console.log(err)})
                response.status(200).json({ error: "Error on Server" })
                throw error
            })

    } else {
        fs.unlink(request.file.path,(err)=>{if(err) console.log(err)})
        response.status(200).json({ info: `No car with id:${id}` })
    }   
}

async function carExists(Name) {
    let result = await pool.query('SELECT car."Name" from car where LOWER(car."Name")=LOWER($1)', [Name])
    return result.rowCount > 0
}

async function getCarMake(makeName) {
    var makeId;
    result = await pool.query('Select id from make where LOWER(make."makeName")=LOWER($1)', [makeName])

    if (result.rowCount > 0)
        makeId = result.rows[0].id;
    else {
        result = await pool.query('INSERT INTO make("makeName") VALUES($1) RETURNING id', [makeName])
            .then(result => {
                makeId = result.rows[0].id;
            })
    }
    return makeId
}

async function getCarModel(modelName) {
    var modelId;
    let result = await pool.query('SELECT id,"modelName" from model where LOWER("modelName")=LOWER($1)', [modelName])
    if (result.rowCount > 0)
        modelId = result.rows[0].id;
    else {
        result = await pool.query('INSERT INTO model("modelName") VALUES($1) RETURNING id', [modelName])
            .then(result => {
                modelId = result.rows[0].id;
            })
    }
    return modelId
}

module.exports = { 
    getCars, 
    getCarById, 
    createCar,
    updateCar, 
    deleteCar,
    addCarImage
}