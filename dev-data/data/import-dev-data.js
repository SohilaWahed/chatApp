const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../Models/tourModel')

//read all vars in config file as environment vars
dotenv.config({path:'./config.env'}); 

const DB = process.env.DATABASE.replace(
    '<password>',process.env.PASSWORD
)

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(con => console.log('DB connection successful'))

const tours = JSON.parse(
   fs.readFileSync(`${__dirname}/tours-simple.json`,'utf-8')
);

const importData = async ()=>{
    try{
        await Tour.create(tours)
        console.log('Data successfully loaded')
        process.exit();
    }catch(err){
        console.log(err)   
    }
}

const deleteData = async ()=>{
    try{
        await Tour.deleteMany()
        console.log('Data successfully deleted')
        process.exit();
    }catch(err){
        console.log(err)   
    }
}

if(process.argv[2] === '--import'){
    importData();
}else if (process.argv[2] === '--delete'){
    deleteData();
}

// const testTour = new Tour({
//     name : 'Black Skirt',
//     rating: 5,
//     price: 600
// })

// testTour.save().then( doc => {
//     console.log(doc)
// }).catch(err =>{
//     console.log('Error : No saved',err)
// })
