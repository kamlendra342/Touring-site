import axios from "axios";
import { showAlert } from "./alert";
import Apperror from "../../utils/apperror";

export const updateme = async (data) => {
    try {
/*         console.log(data) */
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMe',
            data
        });
        if (res.data.status == 'success') {
            showAlert('success','Data is successfuly updated')
        }
    } catch (err) {
        showAlert('error',err.response.data.message)
        
    }
}
// {
//     "passwordCur":"test1234",
//     "password":"test1234",
//     "passwordConfirm":"test1234"
// }

export const updatepassword = async (passwordCur, password, passwordConfirm) => {
    try {
        const res = await axios({
            method: 'PATCH',
            url: '/api/v1/users/updateMyPassword',
            data: {
                passwordCur,
                password,
                passwordConfirm
            },
        });
        if (res.data.status == 'success') {
            showAlert('success', 'password is successfuly changed')
        };
    } catch(err){
        showAlert('error', err.response.data.message);
    };
};