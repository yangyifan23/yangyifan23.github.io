//------------------------------
// 游戏逻辑
//------------------------------

// 产生一个指定范围的随机整数
function getRandomInteger(min, max) {
  return parseInt(min + Math.random() * (max - min));
}
// 产生一枚随机的方块
function getRandomPiece() {
  // 当方块容器中的方块已经取完时，重新生成一批
  if (DATA.pieceContainer.length == 0) {
    var batch = [
      "I",
      "I",
      "I",
      "I",
      "J",
      "J",
      "J",
      "J",
      "L",
      "L",
      "L",
      "L",
      "O",
      "O",
      "O",
      "O",
      "S",
      "S",
      "S",
      "S",
      "T",
      "T",
      "T",
      "T",
      "Z",
      "Z",
      "Z",
      "Z"
    ];
    batch.forEach((type) => {
      // 获取指定类型模板
      var template = DATA.pieceTemplate[type];
      // 获取一个随机的X坐标
      var x = getRandomInteger(0, DATA.canvasGameWidth - template.maxWidth);
      // 获取一个随机的方向
      var dir = getRandomInteger(0, 4);
      // 生成方块
      DATA.pieceContainer.push({
        maxWidth: template.maxWidth,
        color: template.color,
        blocks: template.blocks,
        dir: dir,
        x: x,
        y: 0
      });
    });
  }
  // 获取一个随机数
  var random = getRandomInteger(0, DATA.pieceContainer.length - 1);
  // 向方块容器中取出该随机数位置的方块
  var piece = DATA.pieceContainer.splice(random, 1)[0];

  return piece;
}
// 初始化当前方块
function initCurrentPiece() {
  DATA.currentPiece = DATA.nextPiece || getRandomPiece();
  DATA.changes.game = true;
}
// 初始化下一枚方块
function initNextPiece() {
  DATA.nextPiece = getRandomPiece();
  DATA.changes.next = true;
}
// 获取游戏画布指定格子
function getGameGrid(x, y) {
  return DATA.gameGrids && DATA.gameGrids[x] ? DATA.gameGrids[x][y] : null;
}
// 填充游戏画布的指定格子
function fillGameGrid(x, y) {
  DATA.gameGrids[x] = DATA.gameGrids[x] || [];
  DATA.gameGrids[x][y] = 1;
  DATA.changes.game = true;
}
// 清除游戏画布的指定格子
function clearGameGrid(x, y) {
  DATA.gameGrids[x] = DATA.gameGrids[x] || [];
  DATA.gameGrids[x][y] = 0;
  DATA.changes.game = true;
}
// 增加积分
function addScore(number) {
  DATA.score += number;
  DATA.changes.score = true;
}
// 增加行数
function addRows(number) {
  DATA.rows += number;
  DATA.changes.rows = true;
  DATA.setpSize = Math.max(DATA.speed.min, DATA.speed.start - DATA.speed.decrement * DATA.rows);
}
// 遍历指定方块在指定位置、指定方向的“有效”格子
function eachPieceGrid(piece, x, y, dir, callback) {
  // 遍历方块的16个格子
  for (row = 0; row < 4; row++) {
    for (col = 0; col < 4; col++) {
      // 判断方块的有效格子
      if (piece.blocks[dir][row][col]) {
        // 格子坐标
        var gridX = x + col;
        var gridY = y + row;
        // 格子
        var gird = getGameGrid(gridX, gridY);
        // 执行回调函数
        callback(gridX, gridY, gird);
      }
    }
  }
}
// 判断指定方块 是否能移动到指定位置、改变为指定方向
function canPieceChange(piece, x, y, dir) {
  var result = true;

  // 遍历方块在指定位置的“有效”格子
  eachPieceGrid(piece, x, y, dir, function (gridX, gridY, grid) {
    // 每个有效格子都进行判断
    if (
      gridX < 0 || // 格子是否落在画布X轴左边之外
      gridX >= DATA.canvasGameWidth || // 格子是否落在画布X轴右边之外
      gridY < 0 || // 格子是否落在画布Y轴上方边之外
      gridY >= DATA.canvasGameHeight || // 格子是否落在画布Y轴下边之外
      grid // 该格子已经有被占用了
    ) {
      result = false;
    }
  });

  return result;
}
// 将当前方块固化游戏格子中
function currentPieceToGrids() {
  eachPieceGrid(DATA.currentPiece, DATA.currentPiece.x, DATA.currentPiece.y, DATA.currentPiece.dir, function (gridX, gridY, grid) {
    fillGameGrid(gridX, gridY);
  });
}
// 消灭成行的格子
function removeLines() {
  // 本次累计消灭行数
  var rows = 0;
  // 从下到上遍历
  for (var row = DATA.canvasGameHeight; row > 0; --row) {
    // 判断当前行是否填充完成
    var complete = true;
    for (var col = 0; col < DATA.canvasGameWidth; ++col) {
      // 任意一个格子没有被填充，则表示未完成
      if (!getGameGrid(col, row)) {
        complete = false;
        break;
      }
    }
    // 如果已完成
    if (complete) {
      // 清空当前行并将画布往下移动一格
      for (var r = row; r >= 0; --r) {
        for (var c = 0; c < DATA.canvasGameWidth; ++c) {
          if (r == 0) {
            clearGameGrid(c, r);
          } else {
            if (getGameGrid(c, r - 1)) {
              fillGameGrid(c, r);
            } else {
              clearGameGrid(c, r);
            }
          }
        }
      }
      // 重新检查当前行
      row = row + 1;
      // 累计消灭行数
      rows++;
    }
  }
  if (rows > 0) {
    // 添加以消灭行数
    addRows(rows);
    // 添加积分
    addScore(100 * Math.pow(2, rows - 1)); // 1: 100, 2: 200, 3: 400, 4: 800
  }
}
// 向指定方向移动当前方块
function currentPieceMove(dir) {
  // 获取当前方块的坐标作为目标位置的初始坐标
  var targetX = DATA.currentPiece.x;
  var targetY = DATA.currentPiece.y;
  // 再根据移动方向改变目标位置坐标
  switch (dir) {
    case DATA.DIR.RIGHT:
      targetX = targetX + 1;
      break;
    case DATA.DIR.LEFT:
      targetX = targetX - 1;
      break;
    case DATA.DIR.DOWN:
      targetY = targetY + 1;
      break;
  }
  // 判断方块能否移动到目标位置
  if (canPieceChange(DATA.currentPiece, targetX, targetY, DATA.currentPiece.dir)) {
    DATA.currentPiece.x = targetX;
    DATA.currentPiece.y = targetY;
    DATA.changes.game = true;

    return true;
  } else {
    // 向下移动时移动不了，说明已经到底或者有障碍物
    if (dir == DATA.DIR.DOWN) {
      // 加十分
      addScore(10);
      // 将当前方块固化游戏格子中
      currentPieceToGrids();
      // 消灭成行的格子
      removeLines();
      // 重新初始化当前方块
      initCurrentPiece();
      // 重新初始化下一个方块
      initNextPiece();
      // 清空所有玩家操作指令
      DATA.playerActions = [];
      // 如果新初始化的当前方块位置被占用，则结束游戏
      if (!canPieceChange(DATA.currentPiece, DATA.currentPiece.x, DATA.currentPiece.y, DATA.currentPiece.dir)) {
        gameOver();
      }
    }

    return false;
  }
}
// 方块变形
function currentPieceRotate() {
  var newDir = DATA.currentPiece.dir == DATA.DIR.LEFT ? DATA.DIR.UP : DATA.currentPiece.dir + 1;
  if (canPieceChange(DATA.currentPiece, DATA.currentPiece.x, DATA.currentPiece.y, newDir)) {
    DATA.currentPiece.dir = newDir;
    DATA.changes.game = true;
  }
}
// 处理玩家操作
function handlePlayerAction() {
  // 取出玩家操作队列中第一个操作
  var action = DATA.playerActions.shift();
  // 按照操作类型进行处理
  switch (action) {
    case DATA.DIR.LEFT:
      currentPieceMove(DATA.DIR.LEFT);
      break;
    case DATA.DIR.RIGHT:
      currentPieceMove(DATA.DIR.RIGHT);
      break;
    case DATA.DIR.DOWN:
      currentPieceMove(DATA.DIR.DOWN);
      break;
    case DATA.DIR.UP:
      currentPieceRotate();
      break;
  }
}
// 游戏结束
function gameOver() {
  DATA.playing = false;
  // 显示蒙层
  document.getElementById("mask").style.visibility = "visible";
  // 显示游戏解释字样
  document.getElementById("game-over").style.visibility = "visible";
  // 显示重新开始按钮
  document.getElementById("restart").style.visibility = "visible";
  // 隐藏开始游戏按钮
  document.getElementById("start").style.visibility = "hidden";
}
// 开始游戏
function play() {
  DATA.playing = true;
  // 隐藏蒙层
  document.getElementById("mask").style.visibility = "hidden";
  // 隐藏游戏解释字样
  document.getElementById("game-over").style.visibility = "hidden";
  // 隐藏重新开始按钮
  document.getElementById("restart").style.visibility = "hidden";
  // 隐藏开始游戏按钮
  document.getElementById("start").style.visibility = "hidden";
  // 初始化当前方块
  initCurrentPiece();
  // 初始化下一枚方块
  initNextPiece();
  // 重置数据
  DATA.playerActions = []; // 玩家操作指令队列
  DATA.lastDropTime = new Date().getTime(); // 上一次方块自动下落的时间（毫秒）
  DATA.rows = 0; // 已经消灭的行数
  DATA.score = 0; // 游戏得分
  DATA.setpSize = DATA.speed.start; // 当前步长，方块每次下落需要的时间长度（毫秒）
  DATA.pieceContainer = []; // 存放一批固定的方块，每次随机获取，取完之后会再次生成一批
  DATA.changes = {
    game: true, // 游戏画布 是否发生变化
    next: true, // 下一枚方块画布 是否发生变化
    score: true, // 分数 是否发生变化
    rows: true // 以消灭行数 是否发生变化
  };
  DATA.gameGrids = []; // 游戏画布格子，按照游戏画布的宽高拆分成多份格子
}
// 处理自动下落
function handleAutoDrop() {
  // 当前时间
  var now = new Date().getTime();
  // 距离上一次方块自动下落的时长（毫秒数）
  var duration = now - DATA.lastDropTime;
  // 如果距离上次方块下落时长，超过规定的步长，则执行下落
  if (duration > DATA.setpSize) {
    DATA.lastDropTime = now;
    currentPieceMove(DATA.DIR.DOWN);
  }
}
