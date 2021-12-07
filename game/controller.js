//------------------------------
// 控制器
//------------------------------
// 游戏初始化
function gameInit() {
  // 初始化下一枚方块
  initNextPiece();
  // 设置画布的逻辑大小等于它的物理大小
  DATA.canvasGame.width = DATA.canvasGame.clientWidth;
  DATA.canvasGame.height = DATA.canvasGame.clientHeight;
  DATA.canvasNext.width = DATA.canvasNext.clientWidth;
  DATA.canvasNext.height = DATA.canvasNext.clientHeight;
  // 计算游戏画布格子的像素
  DATA.canvasGridWidth = DATA.canvasGame.width / DATA.canvasGameWidth;
  DATA.canvasGridHeight = DATA.canvasGame.height / DATA.canvasGameHeight;
}
// 监听玩家的操作
function listenPlayer() {
  document.addEventListener("keydown", function (event) {
    // 游戏中状态才执行
    if (DATA.playing) {
      // 是否其他无用按键
      var otherKey = false;
      // 按照按键类型处理
      switch (event.keyCode) {
        // 向左方向键
        case 37:
          DATA.playerActions.push(DATA.DIR.LEFT);
          break;
        // 向上方向键
        case 38:
          DATA.playerActions.push(DATA.DIR.UP);
          break;
        // 向右方向键
        case 39:
          DATA.playerActions.push(DATA.DIR.RIGHT);
          break;
        // 向下方向键
        case 40:
          DATA.playerActions.push(DATA.DIR.DOWN);
          break;
        // 其他
        default:
          otherKey = true;
          break;
      }
      // 防止方向键滚动页面
      if (!otherKey) event.preventDefault();
    }
  });
}
// 游戏循环（每一帧执行一次）
function gameLoop() {
  // 如果是游戏中状态
  if (DATA.playing) {
    // 处理玩家操作（会按改变相应的数据）
    handlePlayerAction();
    // 处理自动下落（会按改变相应的数据）
    handleAutoDrop();
  }
  // 重新绘制界面（抹掉已改变内容，再根据数据重新绘制）
  redraw();
  // 设置下一帧继续处理
  requestAnimationFrame(gameLoop);
}
