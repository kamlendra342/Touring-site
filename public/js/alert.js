

export const hidealert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
}


// type is success or error
export const showAlert = (type, msg) => {
    const markup = `<div class='alert alert--${type}'>${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hidealert,5000)
}