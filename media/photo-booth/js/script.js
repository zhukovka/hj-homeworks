'use strict';

class App {
    constructor(app, controls, list, photoBtn) {
        this.app = app;
        this.controls = controls;
        this.imageList = list;
        this.photoBtn = photoBtn;
    }

    addVideo(stream) {
        const video = document.createElement("video");
        video.src = window.URL.createObjectURL(stream);
        video.autoplay = true;
        this.app.appendChild(video);
        this.video = video;
        video.addEventListener("canplay", e => {
            this.canvas = document.createElement("canvas");
            this.canvas.width = video.videoWidth;
            this.canvas.height = video.videoHeight;
            this.controls.classList.add("visible");
        });
    }

    takePhotoClick() {
        this.photoBtn.addEventListener("click", e => {
            this.addImageToList()
        });
    }

    //     Получаем изображение с холста и отображаем его в списке готовых фотографий.
    addImageToList() {
        const canvas = this.canvas.cloneNode(true);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.video, 0, 0);
        const image = canvas.toDataURL("image/png");
        const figure = document.createElement('figure');
//     При клике на кнопке «Скачать» сохраняем выбранное фото на диске.
        figure.innerHTML = `
                    <img src="${image}">
                    <figcaption>
                        <a href="${image}" download="snapshot.png">
                            <i class="material-icons">file_download</i>
                        </a>
                        <a class="file_upload">
                            <i class="material-icons">file_upload</i>
                        </a>
                        <a class="delete">
                            <i class="material-icons">delete</i>
                        </a>
                    </figcaption>
                `;
        //     При клике на кнопке «Удалить» удаляем фото из списка.
        figure.querySelector(".delete").addEventListener("click", e => {
            this.imageList.removeChild(figure);
        });
        figure.querySelector(".file_upload").addEventListener("click", e => {
            this.sendImage(canvas);
        });
        this.imageList.appendChild(figure)
    }

//     При клике на кнопке «Загрузить» отправляем выбранное фото на сервер.
    sendImage(canvas) {
        canvas.toBlob((blob) => {
            const formData = new FormData();
            formData.append("image", blob);
            fetch("https://neto-api.herokuapp.com/photo-booth", {
                method: "POST",
                body: formData
            }).then(res => console.log(res))
                .catch(err => console.error(err));
        });

    }

}

function handleError(err) {
    console.error(`Beda! ${err}`)
}


// Проверяем доступность необходимых API. Если их нет, показываем ошибку.
if (!window.navigator.mediaDevices || !window.URL.createObjectURL) {
    handleError("No support for media devices")
}
//     Запрашиваем доступ к веб-камере. Если доступ не предоставлен, показываем ошибку.
navigator.mediaDevices.getUserMedia({
    audio: false, video: {
        width: 1280,
        height: 720,
        frameRate: 15
    }
})
    .then(stream => {
        const app = document.querySelector(".app");
        const controls = document.querySelector(".controls");
        const list = document.querySelector(".list");
        const btn = document.getElementById("take-photo");
        //     Отображаем видео с веб-камеры.
        if (app && controls && list && btn) {
            let photoBooth = new App(app, controls, list, btn);
            photoBooth.addVideo(stream);
//     При клике на кнопке «Сделать снимок» помещаем текущий кадр видео на холст.
            photoBooth.takePhotoClick();
        }
    })
    .catch(err => {
        handleError(err)
    });