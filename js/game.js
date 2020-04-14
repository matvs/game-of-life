window.addEventListener('load', (event) => {
    window.Life = {
        defaultOptions: {
            canvasId: 'canvas',
            tickNumberId: 'tickNumber'
    
        },
    
    
        ctx: null,
        canvas: null,
        size: 15,
        cols: 0,
        rows: 0,
        board: null,
        tickNumber: 0,
        tickNumberHtml: null,
        tickInterval: null,
        interval: 1000,
    
        init: function (options = {}) {
            clearInterval(this.tickInterval);
            this.onMouseDown = this.onMouseDown.bind(this);
            this.draw = this.draw.bind(this);
            options = Object.assign(this.defaultOptions, options);
            this.canvas = document.getElementById(options.canvasId);
            this.ctx = this.canvas.getContext('2d');
            this.canvas.removeEventListener('mousedown', this.onMouseDown)
            this.canvas.addEventListener("mousedown", this.onMouseDown);
            this.tickNumberHtml = document.getElementById(options.tickNumberId);
            this.tickNumberHtml.innerText = this.tickNumber;
            
            this.cols = Math.floor(this.canvas.width/this.size);
            this.rows = Math.floor(this.canvas.height/this.size);

            // const color = '#fe4a49'; // pink
            // const color = '#000000';
            const color = '#005b96'; //blue
            // const color = '#7bc043'; //green
            // const color = '#8d5524'; //brown
            this.board = new Array(this.rows).fill(0).map((v, row) =>
                 new Array(this.cols).fill(0).map((v2, col) => new Cell(row, col, false, color)));
            this.draw();

            return this;
        },
    
        start: function () {
            clearInterval(this.tickInterval);
            this.tickInterval = setInterval(() => {
                this.tick();
                this.draw();
                this.tickNumberHtml.innerText = this.tickNumber;
                this.tickNumber++;
            }, this.interval);
        },

        speedUp() {
            this.interval -= 100;
            if (this.interval < 0) {
                this.interval = 0;
            }

            this.start();
        },

        slowDown() {
            this.interval += 100;
            if (this.interval > 3000) {
                this.interval = 3000;
            }

            this.start();
        },
        
        tick() {
            const tickAction = (row, col) => {
                const currentCell = this.board[row][col];
                let neighboursCount = 0;
                const $neighbours = currentCell.getNeighbourIndex();
                let neighbour
                while(!((neighbour=$neighbours.next()).done)) {
                    const pos = neighbour.value;
                    if (pos.row >= 0 && pos.row < this.rows && pos.col >= 0 && pos.col < this.cols) {
                        if (this.board[pos.row][pos.col].alive) {
                            neighboursCount++;
                        }
                    }
              }
              currentCell.nextTickState = currentCell.alive;
              if (currentCell.alive) {
                    if (!(neighboursCount >= 2 && neighboursCount <= 3)) {
                        currentCell.kill()
                    }
              } else {
                  if (neighboursCount == 3) {
                      currentCell.bear();
                  }
              }
            }

            this.iterate(tickAction);

            const updateAction = (row, col) => {
                this.board[row][col].update();
            }

            this.iterate(updateAction);
        },

        clear() {
            this.tickNumber = 0;
            this.interval = 1000;
            clearInterval(this.tickInterval);
            const reset = (row,col) => {
                this.board[row][col].alive = false;
            }

            this.iterate(reset);
            this.draw();
        },

        draw: function() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            const drawBorders = (row, col) => {
                const x = col * this.size;
                const y = row * this.size;
                this.ctx.strokeRect(x,y, this.size, this.size);
            }
    
            // this.ctx.save();
            // // this.ctx.fillStyle = '#65737e';
            // // this.ctx.fillStyle = '#bfd6f6';
            // this.ctx.fillStyle = '#eedbdb';

            
            // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            // this.ctx.restore();

            this.iterate(drawBorders);

            const fillPixels = (row, col) => {
                this.board[row][col].draw(this.ctx, this.size);
            }

            this.iterate(fillPixels);
    
        },
     
    
        iterate: function(callback) {
            for (let row = 0; row < this.rows; ++row) {
                for (let col = 0; col < this.cols; ++col) {
                    callback(row, col);
                }
            }
        },
    
        onMouseDown: function (event) {
            event.preventDefault();
            var x = event.x;
            var y = event.y;
            x -= this.canvas.offsetLeft;
            y -= this.canvas.offsetTop;
    

            const row = Math.floor(y/(this.size));
            const col = Math.floor(x/(this.size));
            console.log(row, col)
            this.board[row][col].toogle();
            this.draw();

        
        },
    
        onMouseUp: function (event) {
            event.preventDefault();
    
        }
    }.init();
    
  });

  class Cell {
    alive;
    nextTickState;
    color;
    row;
    col;
    constructor(row, col, alive = false, color = '#000000') {
        this.alive = alive;
        this.color = color;
        this.row = row;
        this.col = col;
    }

    draw(ctx, size) {
        const x = this.col * size;
        const y = this.row * size;

        ctx.save();
        ctx.fillStyle = this.color;
        if (this.alive) {
            ctx.fillRect(x + 2, y + 2, size -4, size -4);
        }
      
        ctx.restore();
     
    }

    *getNeighbourIndex() {
        let count = 0; 
        const steps = [1, -1, 0]
        while (count < 8) {
            const stepX = steps[Math.floor(count/3)]
            const stepY = steps[count % 3];
            yield {
                row: this.row + stepY,
                col: this.col + stepX
            }
     
            count++;
        }

    }

    update() {
        this.alive = this.nextTickState;
    }

    kill() {
        this.nextTickState = false;
    }

    bear() {
        this.nextTickState = true;
    }

    toogle() {
        this.alive = !this.alive;
    }
}