import axios from "axios";
import { showAlert } from "./alert";
// const Stripe = require('stripe');
// const stripe = Stripe('pk_test_51P04PX2KJJNbJqYdEiP1Fc8otc7x3SzK9tkkGyc2e6wuGdSf2B7yO1P1dBmUWi48eCQAmixxB9xwxboh5XuAH59n00qIKDTMdC');
export const bookTour = async (tourId,response) => {
    try {
        //1 get checkout sesion from api
        const session = await axios({
            method:'POST',
            url: `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`
        });
        window.open(session.data.session.url,'_self') //jugad 
    } catch (err) {
        console.log(err ,"🔴🔴")
        showAlert('error', 'error acurs while booking tour');
    }
};