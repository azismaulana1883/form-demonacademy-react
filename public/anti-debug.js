(function antiDebug() {
    const threshold = 160;

    function detectDevTools() {
        const width = window.outerWidth - window.innerWidth;
        const height = window.outerHeight - window.innerHeight;
        return width > threshold || height > threshold;
    }

    function freeze() {
        // hard freeze
        setInterval(() => {
            while (true) debugger;
        }, 50);
    }

    // interval deteksi devtools
    setInterval(() => {
        if (detectDevTools()) freeze();
    }, 300);

})();
