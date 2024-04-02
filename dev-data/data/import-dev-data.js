/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const fs = require('fs');


const Review = require('../../models/reviewModel');
// const User = require('../../models/userModel');
const DB ='mongodb+srv://kamlendra:1NgS0skXc1aj3HaH@cluster0.qan6vji.mongodb.net/natours?retryWrites=true&w=majority'

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('🌟 🅓 🅐 🅣 🅐 🅑 🅐 🅢 🅔   🅒 🅞 🅝 🅝 🅔 🅒 🅣 🅔 🅓 🌟 \n');
  });
//----------------------------------------------------------------------

const rev = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'))
console.log(rev)


const hjhj = async () => {
    await Review.deleteMany();
    console.log('Deleted');         
    const cc = await Review.create(rev);

};
hjhj();




//-----------------------------------------------