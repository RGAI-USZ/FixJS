function drawObstacles() {
    var index = 3;
    var canvas, context, image, width, height, x = 0, y = 0, frameSize = 16;
    var mul = 30;
    image = new Image();
    image.src = "./powerups.png";
    image.onload = function() {
        function drawObstacle(xpos, ypos) {
            width = image.width;
            height = image.height;
            canvas = document.getElementById("obstacles");
            x = index*mul;
            context = canvas.getContext("2d");
            context.drawImage(image, x, y, frameSize, frameSize, xpos*mul + 1, ypos*mul, mul, mul);
        }
        for(var i = 0; i < graph.height; i++) {
            for (var j = 0; j < graph.width; j++) {
                if(graph.nodes[i*graph.height+j] && graph.nodes[i*graph.height+j].containedEntity) {
                    if(graph.nodes[i*graph.height+j].containedEntity.type === 'obstacle') {
                        drawObstacle(j,i);
                    }
                }
            }
        }
    }
}