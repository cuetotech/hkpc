document.addEventListener("DOMContentLoaded", function() {
    // Simple vanilla JS slider to replace the broken legacy jssor
    const sliderContainers = document.querySelectorAll('#slider1_container, #slider2_container');

    sliderContainers.forEach(container => {
        // Strip out the broken inline styles / absolute positioning from Jssor
        container.style.overflow = 'hidden';
        container.style.position = 'relative';

        // Find all slides (images that were part of the slider)
        const slideImgs = container.querySelectorAll('img');
        if (slideImgs.length === 0) return;

        // Clear container and build a clean track
        container.innerHTML = '';
        const track = document.createElement('div');
        track.style.display = 'flex';
        track.style.width = (slideImgs.length * 100) + '%';
        track.style.transition = 'transform 0.5s ease-in-out';

        slideImgs.forEach(img => {
            // reset styles
            img.style.transform = '';
            img.style.position = 'static';
            img.style.width = (100 / slideImgs.length) + '%';
            img.style.height = 'auto';
            track.appendChild(img);
        });

        container.appendChild(track);

        let currentSlide = 0;
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slideImgs.length;
            track.style.transform = `translateX(-${currentSlide * (100 / slideImgs.length)}%)`;
        }, 5000);
    });
});
