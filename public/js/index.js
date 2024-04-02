import { login,logout } from "./login";
import { displaymap } from "./mapbox";
import '@babel/polyfill';
import { updateme,updatepassword } from './update';
import axios from "axios";
import { signUP } from "./signup";
import { bookTour } from "./stripe";
//dom 
const maptiler = document.getElementById('map');
const loginform = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const update_name_emailBtn = document.querySelector('.form-user-data');
const passwordchangeBtn = document.querySelector('.form-user-settings');
const signUPBtn = document.querySelector('.signUp--form');
const bookbtn = document.getElementById('book-tour');


if (logoutBtn) {
    logoutBtn.addEventListener('click',logout);
};

if (maptiler){
    const locatio = JSON.parse(maptiler.dataset.locations);
    displaymap(locatio)
};

if (loginform) {
    loginform.addEventListener('submit', e => {
        e.preventDefault();
        const email=document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password);
    });
}

if (update_name_emailBtn) {
    const button2 = document.querySelector('.iadd2');
    button2.addEventListener('click', (e) => {
        e.preventDefault()
        // form datatype is necessary for photo encryption
        const form = new FormData;
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0]);
        updateme(form);
    });
};  

if (passwordchangeBtn) {
    const button=document.querySelector('.iadd')
    button.addEventListener('click',async e => {
        e.preventDefault()
        button.textContent='Updating Password...'
        const curpassword = document.getElementById('password-current').value
        const passwordnew=document.getElementById('password').value
        const passwordnewconf = document.getElementById('password-confirm').value

        await updatepassword(curpassword, passwordnew, passwordnewconf);

        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';

        button.textContent='SAVE PASSWORD'
    })
};

if (signUPBtn) {
    signUPBtn.addEventListener('submit', e => {
        e.preventDefault();

        document.querySelector('.iadd').textContent = 'Creating Account ....'
        const name = document.getElementById('Name').value;
        const email = document.getElementById('email').value;
        const role = document.getElementById('Role').value;
        // const photo = document.getElementById('Photo').value;  i will add it later
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('Confirm-password').value;
        
        signUP({ name, email, role, password, passwordConfirm })
    })
};

if (bookbtn) {
    bookbtn.addEventListener('click',(e) => {
        e.preventDefault();
        e.target.textContent=' Booking...'
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    })
}
