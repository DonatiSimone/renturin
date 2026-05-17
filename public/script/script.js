function selectCar(carName, carPrice) {
    document.getElementById('car_name').value = carName;
    document.getElementById('car_price').value = carPrice;
}

function selectFurgone(furgoneName, furgonePrice) {
    document.getElementById('furgone_name').value = furgoneName;
    document.getElementById('car_price').value = furgonePrice;
}

function selectMoto(motoName, motoPrice) {
    document.getElementById('moto_name').value = motoName;
    document.getElementById('car_price').value = motoPrice;
}

document.addEventListener("DOMContentLoaded", function() {
    let slideIndex = 1;
    showSlides(slideIndex);

    function plusSlides(n) {
        showSlides(slideIndex += n);
    }

    function currentSlide(n) {
        showSlides(slideIndex = n);
    }

    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName("mySlides");
        let dots = document.getElementsByClassName("dot");
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none";
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(" active", "");
        }
        slides[slideIndex-1].style.display = "block";
        dots[slideIndex-1].className += " active";
    }
    window.plusSlides = plusSlides;
    window.currentSlide = currentSlide;
});
