function makeBrazier(pos) {
  let age = 0;
  let frame = 0;
  let {
    getPos,
    setPos
  } = makeEntity(pos)

  function draw(ctx, lctx) {
    let [x, y] = getPos();

    lctx.drawSprite(Assets.baseLight, x, y, randInt(8));

  }

  function move() {
    let p = getPos();
    age += 1;

  }
  return {
    getPos,
    setPos,
    move,
    draw
  };
}
