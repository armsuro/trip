const POINT_SIZE = 3;

class CityMap {
    constructor(name, points) {
        this.name = name;
        this.points = points;
        this.element = this.createCanvas();
        this.pointStatus = new Array(points.length).fill(-1);
        this.path = [];
        this.xMax = 0;
        this.yMax = 0;
        
        this.drawPoints();
        this.findCycle();
        
        // this.distances = [];
        // this.findBestRoute([this.points[0]]);
        // const shortestDistance = this.distances.sort((a, b) => a[0] - b[0])[0][1];
        // this.drawRoute(shortestDistance);

    }

    createCanvas() {
        const canvas = document.createElement('canvas');

        const max = this.points.reduce((item, max) => ({
            x: Math.max(max.x, item.x),
            y: Math.max(max.y, item.y),
        }), {x: 0, y: 0})

        canvas.setAttribute('width', max.x + POINT_SIZE);
        canvas.setAttribute('height', max.y + POINT_SIZE);

        return canvas;
    }

    getContext() {
        return this.element.getContext('2d');
    }

    drawPoints() {
        const ctx = this.getContext();

        for (let index in this.points) {
            const point = this.points[index];

            ctx.fillStyle = +index ? "#000" : "#ff2626";
            ctx.alt = `(${point.x},${point.y})`
            ctx.beginPath();
            ctx.arc(point.x, point.y, POINT_SIZE, 0, Math.PI * 2, true);
            
            ctx.fill();
        }
    }


    findCycle() {
        // Home
        let currentPoint = this.points[0];
        this.pointStatus[0] = 1;
        const path = [currentPoint];
        
        while (true) {
            const nearestPointIndex = this.findNearestUnvisitedPoint(currentPoint);
            const nearestPoint = this.points[nearestPointIndex];
            if (!nearestPoint) break;

            currentPoint = nearestPoint;
            path.push(currentPoint);
            this.pointStatus[nearestPointIndex] = 1;
        }

        this.drawRoute(path, "#00d");
    }

    findBestRoute(passedPoints, distance = 0) {
        for ( let i in this.points ) {
            if (JSON.stringify(passedPoints).includes(JSON.stringify(this.points[i]))) {
                continue;
            }
            const newDistance = distance + this.calculateDistanceBetweenTwoPoints(passedPoints.slice(-1)[0], this.points[i]);

            this.findBestRoute([...passedPoints, this.points[i]], newDistance);
        }

        if ( passedPoints.length != this.points.length ) {
            return;
        }

        this.distances.push([distance, passedPoints]);
    }

    drawRoute(path, color) {
        const length = path.length;
        this.drawLine(path[0], path[length - 1], color);

        for (let i = 0; i < length - 1; ++i) {
            this.drawLine(path[i], path[i + 1], color);
        }
    }

    findNearestUnvisitedPoint(point) {
        let shortDistance;
        let nearestPointIndex;

        for (let index in this.points) {
            const p = this.points[index];
            
            if (this.pointStatus[index] == 1) continue;
            
            const distance = this.calculateDistanceBetweenTwoPoints(p, point);
            
            if (distance && distance < shortDistance || !shortDistance) {
                shortDistance = distance;
                nearestPointIndex = index
            }
        }
        return nearestPointIndex;

    }

    calculateDistanceBetweenTwoPoints(startPoint, endPoint) {
        return Math.sqrt(Math.pow(startPoint.x - endPoint.x, 2) +
            Math.pow(startPoint.y - endPoint.y, 2))
    }

    drawLine(startPoint, endPoint, color = "#000") {
        const ctx = this.getContext();
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
    }
}

window.onload = function() {
    const tabs = document.getElementById('map-tabs');
    const mapArea = document.getElementById('map-area');

    const maps = [
        new CityMap("40 cities", points40),
        new CityMap("200 cities", points200),
        new CityMap("500 cities", points500)
    ];

    function onNavigate(e) {
        const index = e.target.getAttribute('data-index');
        
        showMap(index);
    }

    function showMap(index) {
        mapArea.innerHTML = "";
        mapArea.append(maps[index].element);
    }

    tabs.append(
        ...maps.map((item, index) => {
            const li = document.createElement("li");
            
            li.onclick = onNavigate;
            li.innerHTML = item.name;
            li.setAttribute("data-index", index);
            
            return li;
        })
    );

    showMap(0);
}
