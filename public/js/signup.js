import axios from "axios";
import { showAlert } from "./alert";
// data must be a object;
export const signUP = async (data) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: data
        });
        if (res.data.status == 'success') {
            showAlert('success','Account is Created')
            window.setTimeout(() => {
                location.assign('/');
            }, 1000);
        };
    } catch (err) {
        showAlert('error',err.response.data.message)
    }
};