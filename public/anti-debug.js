setTimeout(() => {

    (function antiDebug() {
        const threshold = 170; // sedikit lebih tinggi, biar gak false trigger

        function detectDevTools() {
            const w = window.outerWidth - window.innerWidth;
            const h = window.outerHeight - window.innerHeight;
            return w > threshold || h > threshold;
        }

        function freeze() {
            // anti-bypass: hentikan UI dulu
            document.body.innerHTML =
                "<h1 style='color:red;text-align:center;margin-top:40vh;font-size:28px;font-family:Arial;'>ACCESS BLOCKED</h1>";

            // hard-freeze (infinite debugger)
            setInterval(() => {
                while (true) debugger;
            }, 20);
        }

        // deteksi devtools setelah React/JS sudah load
        setInterval(() => {
            if (detectDevTools()) {
                freeze();
            }
        }, 400);

    })();

}, 2500); // delay supaya app tidak blank
