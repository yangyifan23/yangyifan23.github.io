//------------------------------
// 绘图工具
//------------------------------

// 重新绘制界面
function redraw() {
  drawGame();
  drawNext();
  drawScore();
  drawRows();
}
// 绘制格子
function drawGrid(brush, x, y, color) {
  brush.lineWidth = 0.0001;
  brush.fillStyle = color;
  brush.fillRect(x * DATA.canvasGridWidth, y * DATA.canvasGridHeight, DATA.canvasGridWidth, DATA.canvasGridHeight);
  brush.strokeRect(x * DATA.canvasGridWidth, y * DATA.canvasGridHeight, DATA.canvasGridWidth, DATA.canvasGridHeight);
}
// 绘制游戏画面
function drawGame() {
  if (DATA.changes.game) {
    // 清空游戏画布
    DATA.brushGame.clearRect(0, 0, DATA.canvasGame.width, DATA.canvasGame.height);
    // 绘制当前方块
    eachPieceGrid(DATA.currentPiece, DATA.currentPiece.x, DATA.currentPiece.y, DATA.currentPiece.dir, function (gridX, gridY) {
      drawGrid(DATA.brushGame, gridX, gridY, DATA.currentPiece.color);
    });
    // 绘制所有固定的格子
    for (var y = 0; y < DATA.canvasGameHeight; y++) {
      for (var x = 0; x < DATA.canvasGameWidth; x++) {
        if (getGameGrid(x, y)) {
          drawGrid(DATA.brushGame, x, y, "black");
        }
      }
    }

    DATA.changes.game = false;
  }
}
// 绘制“下一枚方块”区域
function drawNext() {
  if (DATA.changes.next) {
    // 清空画布
    DATA.brushNext.clearRect(0, 0, DATA.canvasNextLength * DATA.canvasGridWidth, DATA.canvasNextLength * DATA.canvasGridHeight);
    // 计算绘制的边距
    var padding = (DATA.canvasNextLength - DATA.nextPiece.maxWidth) / 2;
    // 绘制方块
    eachPieceGrid(DATA.nextPiece, padding, padding, DATA.nextPiece.dir, function (gridX, gridY) {
      drawGrid(DATA.brushNext, gridX, gridY, DATA.nextPiece.color);
    });

    DATA.changes.next = false;
  }
}
// 更新积分
function drawScore() {
  if (DATA.changes.score) {
    document.getElementById("score").innerHTML = ("00000" + DATA.score).slice(-5);
    DATA.changes.score = false;
  }
}
// 更新行数
function drawRows() {
  if (DATA.changes.rows) {
    document.getElementById("rows").innerHTML = DATA.rows;
    DATA.changes.rows = false;
  }
}
