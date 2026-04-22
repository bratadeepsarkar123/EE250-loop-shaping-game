(function() {
    let canvas;
    let bodeCanvas;

    const Game = {
        init: function() {
            canvas = document.getElementById('game-canvas');
            bodeCanvas = document.getElementById('bode-canvas');

            window.UI.init();
            window.Bode.init(bodeCanvas);

            const resize = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            };
            window.addEventListener('resize', resize);
            resize();

            Game.start();
        },

        start: function() {
            window.addEventListener('keydown', function(e) {
                if (e.code === 'Space') {
                    window.GS.paused = !window.GS.paused;
                }
            });

            function loop() {
                if (window.GS.distanceTravelled >= window.GS.nextCheckpointAt) {
                    window.GS.checkpoints.push({
                        x: window.GS.roadOffset + canvas.width + 200,
                        collected: false
                    });
                    window.GS.nextCheckpointAt += window.GS.checkpointSpacing;
                }

                if (!window.GS.paused) {
                    window.Controller.step(window.GS, canvas.height);
                    window.Events.tick(window.GS);
                }

                window.Road.draw(canvas, window.GS);
                window.UI.update(window.GS);
                window.Bode.update(window.GS);

                if (window.GS.paused) {
                    const ctx = canvas.getContext('2d');
                    ctx.font = 'bold 20px Arial';
                    ctx.fillStyle = '#fff';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                }

                requestAnimationFrame(loop);
            }

            requestAnimationFrame(loop);
        }
    };

    window.Game = Game;

    document.addEventListener('DOMContentLoaded', Game.init);
})();
