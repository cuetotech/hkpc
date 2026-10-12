document.addEventListener("DOMContentLoaded", function() {
    var toggle = document.querySelector(".mobile-menu-toggle");
    var menu = document.getElementById("mainMenu");
    if (toggle && menu) {
        toggle.addEventListener("click", function() {
            menu.classList.toggle("open");
        });
    }
});
