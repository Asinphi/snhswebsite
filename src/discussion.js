import "./style.scss";
import "./discussion.scss";


const quill = new Quill('.thread__write-reply__textbox', {
modules: {
    toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline'],
    ['image', 'code-block']
    ]
},
    placeholder: 'Write a reply :D',
    theme: 'snow'  // or 'bubble'
});

document.querySelector(".thread__write-reply__post").addEventListener("click", function() {
    const msg = quill.container.firstChild.innerHTML;
    quill.container.firstChild.innerHTML = "";
    document.querySelector('.thread__replies').innerHTML += `<span><a href='#'>${userName}</a>: ` + msg + "</span>";
});